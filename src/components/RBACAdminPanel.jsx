'use client'

import React, { useState, useEffect } from 'react'
import { PERMISSIONS, ROLE_PERMISSIONS, rbacUtils } from '../../../utils/rbac.js'

const RBACAdminPanel = () => {
  const [selectedRole, setSelectedRole] = useState('manager')
  const [rolePermissions, setRolePermissions] = useState({})
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Get current user
    if (typeof window !== 'undefined') {
      const user = {
        role: localStorage.getItem('userRole') || 'user',
        id: localStorage.getItem('userId') || '1'
      }
      setCurrentUser(user)
      
      // Initialize role permissions from the default configuration
      setRolePermissions({ ...ROLE_PERMISSIONS })
    }
  }, [])

  // Check if current user can access this admin panel
  const canAccessAdmin = () => {
    return currentUser && rbacUtils.hasPermission(currentUser.role, PERMISSIONS.USERS_ASSIGN_ROLES)
  }

  const handlePermissionToggle = (role, permission) => {
    setRolePermissions(prev => {
      const currentPermissions = prev[role] || []
      const hasPermission = currentPermissions.includes(permission)
      
      const updatedPermissions = hasPermission
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission]
      
      return {
        ...prev,
        [role]: updatedPermissions
      }
    })
  }

  const saveRolePermissions = () => {
    // In a real application, this would make an API call to save permissions
    console.log('Saving role permissions:', rolePermissions)
    alert(`Role permissions for ${selectedRole} have been updated!\n\nNote: In a production environment, this would be saved to the database.`)
  }

  const getPermissionsByCategory = () => {
    const categories = {}
    
    Object.entries(PERMISSIONS).forEach(([key, permission]) => {
      const [category] = permission.split(':')
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push({ key, permission })
    })
    
    return categories
  }

  if (!currentUser) {
    return <div className="p-4">Loading...</div>
  }

  if (!canAccessAdmin()) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">
            You don't have permission to access the RBAC Admin Panel.
            <br />
            Required permission: {PERMISSIONS.USERS_ASSIGN_ROLES}
          </p>
          <p className="text-sm text-red-500 mt-2">
            Current role: <span className="font-mono">{currentUser.role}</span>
          </p>
        </div>
      </div>
    )
  }

  const categories = getPermissionsByCategory()
  const currentRolePermissions = rolePermissions[selectedRole] || []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">RBAC Admin Panel</h1>
        <p className="text-gray-600">
          Configure role-based permissions for different user types
        </p>
      </div>

      {/* Role Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Role to Configure:
        </label>
        <div className="flex gap-2">
          {['manager', 'staff', 'user'].map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRole === role
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
              <span className="ml-1 text-xs">
                ({currentRolePermissions.length} permissions)
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Permission Categories */}
      <div className="space-y-6">
        {Object.entries(categories).map(([category, permissions]) => (
          <div key={category} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
              {category} Permissions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissions.map(({ key, permission }) => {
                const isChecked = currentRolePermissions.includes(permission)
                const [, action] = permission.split(':')
                
                return (
                  <label
                    key={permission}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePermissionToggle(selectedRole, permission)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {action.replace('_', ' ')}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveRolePermissions}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Save Role Permissions
        </button>
      </div>

      {/* Current Role Summary */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Current Configuration Summary
        </h3>
        <div className="text-sm text-gray-600">
          <p>
            <span className="font-medium">Role:</span> {selectedRole}
          </p>
          <p>
            <span className="font-medium">Total Permissions:</span> {currentRolePermissions.length}
          </p>
          <p className="mt-2">
            <span className="font-medium">Note:</span> Admin role always has full access to all permissions.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RBACAdminPanel

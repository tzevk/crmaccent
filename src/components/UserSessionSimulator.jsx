// Simple user session simulator for testing RBAC
'use client'

import React, { useState, useEffect } from 'react'
import { rbacUtils } from '../utils/rbac.js'

const UserSessionSimulator = () => {
  const [currentRole, setCurrentRole] = useState('user')
  const [userId, setUserId] = useState('1')

  useEffect(() => {
    // Initialize from localStorage or default to 'user'
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('userRole') || 'user'
      const savedUserId = localStorage.getItem('userId') || '1'
      setCurrentRole(savedRole)
      setUserId(savedUserId)
    }
  }, [])

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole)
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', newRole)
      // Simulate different user IDs for different roles
      const roleUserMap = {
        admin: '1',
        manager: '2', 
        staff: '3',
        user: '4'
      }
      const newUserId = roleUserMap[newRole] || '4'
      setUserId(newUserId)
      localStorage.setItem('userId', newUserId)
      
      // Refresh the page to update navigation
      window.location.reload()
    }
  }

  const getUserPermissions = () => {
    return rbacUtils.getRolePermissions(currentRole)
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border-2 border-purple-500 z-50">
      <h3 className="font-semibold text-sm mb-2">🔐 RBAC Simulator</h3>
      
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Current Role:
        </label>
        <select 
          value={currentRole} 
          onChange={(e) => handleRoleChange(e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
        >
          <option value="admin">Admin (Full Access)</option>
          <option value="manager">Manager (Most Access)</option>
          <option value="staff">Staff (Limited Access)</option>
          <option value="user">User (Basic Access)</option>
        </select>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-600">
          <span className="font-medium">User ID:</span> {userId}
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-medium">Permissions:</span> {getUserPermissions().length}
        </p>
      </div>

      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
        <p>💡 Change roles to see different navigation items and access levels</p>
      </div>
    </div>
  )
}

export default UserSessionSimulator

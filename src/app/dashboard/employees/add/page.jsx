"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/navigation/Navbar';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar,
  Building, Briefcase, Save, X, Plus, Trash, FileText, Banknote
} from 'lucide-react';

export default function AddEmployeePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    profile_image: '',
    department: '',
    designation: '',
    reporting_manager_id: '',
    join_date: '',
    employment_status: 'active',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    salary: '',
    employee_code: '',
  });

  const [statutory, setStatutory] = useState({
    pf_master: { pf_number: '', pf_uan: '', pf_mode: '' },
    pt: { state: '', registration_no: '' },
    tds: { pan: '', pan_category: '' },
    mlwf: { registration_no: '' },
    esic: { esic_number: '' },
  });

  const [bank, setBank] = useState({
    bank_name: '',
    account_number: '',
    ifsc: '',
    branch: '',
    account_type: '',
  });

  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);

  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    if (isAuthenticated !== 'true' || !userData) {
      router.push('/');
      return;
    }

    fetchDropdownData();
  }, [router]);

  const fetchDropdownData = async () => {
    try {
      const deptResp = await fetch('/api/employees/departments');
      if (deptResp.ok) {
        const d = await deptResp.json();
        setDepartments(d.departments || []);
      }

      const desigResp = await fetch('/api/employees/designations');
      if (desigResp.ok) {
        const d = await desigResp.json();
        setDesignations(d.designations || []);
      }

      const mgrResp = await fetch('/api/employees?role=manager&limit=100');
      if (mgrResp.ok) {
        const m = await mgrResp.json();
        setManagers(m.employees || []);
      }
    } catch (err) {
      console.error('Dropdown fetch error', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatutoryChange = (group, field, value) => {
    setStatutory(prev => ({ ...prev, [group]: { ...prev[group], [field]: value } }));
  };

  const handleBankChange = (field, value) => {
    setBank(prev => ({ ...prev, [field]: value }));
  };

  const addEducation = () => setEducation(prev => [...prev, { degree: '', institution: '', start_year: '', end_year: '', description: '' }]);
  const updateEducation = (i, field, value) => setEducation(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  const removeEducation = (i) => setEducation(prev => prev.filter((_, idx) => idx !== i));

  const addExperience = () => setExperience(prev => [...prev, { company: '', position: '', start_date: '', end_date: '', description: '' }]);
  const updateExperience = (i, field, value) => setExperience(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  const removeExperience = (i) => setExperience(prev => prev.filter((_, idx) => idx !== i));

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map(f => ({ name: f.name, size: f.size, file: f }));
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const removeDocument = (index) => setDocuments(prev => prev.filter((_, i) => i !== index));

  const handleProfileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // For now store name; server should accept multipart upload in future
    setFormData(prev => ({ ...prev, profile_image: file.name }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        statutory,
        bank,
        education,
        experience,
        documents: documents.map(d => ({ name: d.name, size: d.size })),
      };

      const resp = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (resp.ok) {
        setSuccess('Employee added successfully');
        setTimeout(() => router.push('/dashboard/employees'), 1200);
      } else {
        setError(data.message || 'Failed to add employee');
      }
    } catch (err) {
      console.error(err);
      setError('Error adding employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <Link href="/dashboard/employees" className="text-gray-600 hover:text-gray-800 mr-4">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-2xl font-bold">Add Employee</h1>
            </div>
            <p className="text-gray-600">Create a new employee record</p>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex overflow-x-auto">
                {[
                  { id: 'personal', label: 'Personal Info', icon: User },
                  { id: 'employment', label: 'Employment', icon: Briefcase },
                  { id: 'statutory', label: 'Statutory', icon: FileText },
                  { id: 'education', label: 'Education', icon: Calendar },
                  { id: 'experience', label: 'Experience', icon: Building },
                  { id: 'documents', label: 'Documents/Bank', icon: Banknote },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <tab.icon size={16} className="mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'personal' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input name="first_name" required value={formData.first_name} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input name="last_name" required value={formData.last_name} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea name="address" rows={3} value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="px-3 py-2 border rounded" />
                    <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="px-3 py-2 border rounded" />
                    <input type="text" name="postal_code" placeholder="Postal Code" value={formData.postal_code} onChange={handleChange} className="px-3 py-2 border rounded" />
                    <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className="px-3 py-2 border rounded" />
                  </div>
                </div>
              )}

              {activeTab === 'employment' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                        <option value="">Select Department</option>
                        {departments.map((d,i) => <option key={i} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                      <select name="designation" value={formData.designation} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                        <option value="">Select Designation</option>
                        {designations.map((d,i) => <option key={i} value={d.title}>{d.title}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
                      <select name="reporting_manager_id" value={formData.reporting_manager_id} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                        <option value="">Select Manager</option>
                        {managers.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                      <input type="date" name="join_date" value={formData.join_date} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                      <select name="employment_status" value={formData.employment_status} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                        <option value="resigned">Resigned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salary (INR)</label>
                      <input name="salary" value={formData.salary} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                      <input name="employee_code" value={formData.employee_code} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'statutory' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Statutory Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PF Number</label>
                      <input value={statutory.pf_master.pf_number} onChange={(e) => handleStatutoryChange('pf_master', 'pf_number', e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PF UAN</label>
                      <input value={statutory.pf_master.pf_uan} onChange={(e) => handleStatutoryChange('pf_master', 'pf_uan', e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PT State</label>
                      <input value={statutory.pt.state} onChange={(e) => handleStatutoryChange('pt', 'state', e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
                      <input value={statutory.tds.pan} onChange={(e) => handleStatutoryChange('tds', 'pan', e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Education</h3>
                    <button type="button" onClick={addEducation} className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center hover:bg-blue-700"><Plus size={16} className="mr-1"/>Add Education</button>
                  </div>

                  {education.map((edu, idx) => (
                    <div key={idx} className="border p-4 rounded relative">
                      <button type="button" onClick={() => removeEducation(idx)} className="absolute top-2 right-2 text-red-600"><Trash size={16} /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} className="px-3 py-2 border rounded" />
                        <input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(idx, 'institution', e.target.value)} className="px-3 py-2 border rounded" />
                        <input type="number" placeholder="Start Year" value={edu.start_year} onChange={(e) => updateEducation(idx, 'start_year', e.target.value)} className="px-3 py-2 border rounded" />
                        <input type="number" placeholder="End Year" value={edu.end_year} onChange={(e) => updateEducation(idx, 'end_year', e.target.value)} className="px-3 py-2 border rounded" />
                      </div>
                      <textarea placeholder="Description" rows={2} value={edu.description} onChange={(e) => updateEducation(idx, 'description', e.target.value)} className="w-full mt-3 px-3 py-2 border rounded" />
                    </div>
                  ))}

                  {education.length === 0 && <p className="text-gray-500 text-center py-4">No education records added yet.</p>}
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                    <button type="button" onClick={addExperience} className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center hover:bg-blue-700"><Plus size={16} className="mr-1"/>Add Experience</button>
                  </div>

                  {experience.map((exp, idx) => (
                    <div key={idx} className="border p-4 rounded relative">
                      <button type="button" onClick={() => removeExperience(idx)} className="absolute top-2 right-2 text-red-600"><Trash size={16} /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} className="px-3 py-2 border rounded" />
                        <input placeholder="Position" value={exp.position} onChange={(e) => updateExperience(idx, 'position', e.target.value)} className="px-3 py-2 border rounded" />
                        <input type="date" value={exp.start_date} onChange={(e) => updateExperience(idx, 'start_date', e.target.value)} className="px-3 py-2 border rounded" />
                        <input type="date" value={exp.end_date} onChange={(e) => updateExperience(idx, 'end_date', e.target.value)} className="px-3 py-2 border rounded" />
                      </div>
                      <textarea placeholder="Description" rows={2} value={exp.description} onChange={(e) => updateExperience(idx, 'description', e.target.value)} className="w-full mt-3 px-3 py-2 border rounded" />
                    </div>
                  ))}

                  {experience.length === 0 && <p className="text-gray-500 text-center py-4">No work experience added yet.</p>}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Documents & Bank Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                      <input type="file" accept="image/*" onChange={handleProfileUpload} className="w-full" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Documents</label>
                      <input type="file" multiple onChange={handleDocumentUpload} className="w-full" />
                      <div className="mt-2 space-y-1">
                        {documents.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                            <div className="text-sm">{doc.name} <span className="text-xs text-gray-500">({Math.round(doc.size/1024)} KB)</span></div>
                            <button type="button" onClick={() => removeDocument(i)} className="text-red-600">Remove</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Bank Name" value={bank.bank_name} onChange={(e) => handleBankChange('bank_name', e.target.value)} className="px-3 py-2 border rounded" />
                    <input placeholder="Account Number" value={bank.account_number} onChange={(e) => handleBankChange('account_number', e.target.value)} className="px-3 py-2 border rounded" />
                    <input placeholder="IFSC" value={bank.ifsc} onChange={(e) => handleBankChange('ifsc', e.target.value)} className="px-3 py-2 border rounded" />
                    <input placeholder="Branch" value={bank.branch} onChange={(e) => handleBankChange('branch', e.target.value)} className="px-3 py-2 border rounded" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <Link href="/dashboard/employees" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"><X size={16} className="mr-1"/>Cancel</Link>

              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center">
                {saving ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Saving...</>) : (<><Save size={16} className="mr-1"/>Save Employee</>)}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

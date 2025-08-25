"use client";

import { useState, useEffect } from "react";
import "./EmployeeForm.css";

export default function EmployeeForm({ employee, onSubmit, onCancel }) {
  const [activeTab, setActiveTab] = useState("personal");
  
  // Helper function to ensure no null values in form data
  const initializeFormData = () => ({
    // Personal Information
    username: "",
    emailPassword: "",
    firstName: "",
    lastName: "",
    gender: "Male",
    empType: "Permanent",
    department: "",
    pfNo: "",
    dob: "",
    maritalStatus: "Single",
    presentAddress: "",
    city: "",
    pin: "",
    state: "",
    country: "India",
    phone: "",
    mobile: "",
    email: "",
    
    // Qualification
    qualification: "",
    institute: "",
    passingYear: "",
    
    // Work Experience
    workExperience: "",
    
    // Leave Structure
    leaveStructure: "",
    
    // Statutory Information (moved to personal as checkboxes)
    bonus: false,
    pf: false,
    mlwf: false,
    pt: false,
    esic: false,
    tds: false,
    
    // Employment Details
    employeeStatus: "Working",
    role: "",
    joiningDate: "",
    permanentAddress: "",
    
    // Salary Structure
    basicSalary: "",
    da: "",
    hra: "",
    conveyanceAllowance: "",
    otherAllowance: "",
    
    // Statutory Percentages
    bonusAmount: "",
    pfAmount: "",
    mlwfPercentage: "7",
    ptAmount: "",
    esicPercentage: "7",
    tdsPercentage: "",
    
    // Salary Periods
    salaryPeriods: []
  });

  const [formData, setFormData] = useState(initializeFormData());

  const [newSalaryPeriod, setNewSalaryPeriod] = useState({
    startDate: "",
    endDate: "",
    basicSalary: "",
    da: "",
    hra: "",
    conveyanceAllowance: "",
    otherAllowance: "",
    bonusAmount: "",
    pfAmount: "",
    mlwfPercentage: "7",
    ptAmount: "",
    esicPercentage: "7",
    tdsPercentage: ""
  });

  useEffect(() => {
    if (employee) {
      // Start with clean form data and merge employee data, converting null to empty strings
      const baseData = initializeFormData();
      const cleanedEmployee = {};
      
      Object.keys(employee).forEach(key => {
        if (employee[key] === null || employee[key] === undefined) {
          cleanedEmployee[key] = baseData[key] !== undefined ? baseData[key] : '';
        } else {
          cleanedEmployee[key] = employee[key];
        }
      });
      
      setFormData({
        ...baseData,
        ...cleanedEmployee,
        salaryPeriods: employee.salaryPeriods || []
      });
    } else {
      // Reset to clean form data when no employee
      setFormData(initializeFormData());
    }
  }, [employee]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSalaryPeriodChange = (e) => {
    const { name, value } = e.target;
    setNewSalaryPeriod(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSalaryPeriod = () => {
    if (newSalaryPeriod.startDate && newSalaryPeriod.endDate) {
      setFormData(prev => ({
        ...prev,
        salaryPeriods: [...prev.salaryPeriods, { ...newSalaryPeriod, id: Date.now() }]
      }));
      setNewSalaryPeriod({
        startDate: "",
        endDate: "",
        basicSalary: "",
        da: "",
        hra: "",
        conveyanceAllowance: "",
        otherAllowance: "",
        bonusAmount: "",
        pfAmount: "",
        mlwfPercentage: "7",
        ptAmount: "",
        esicPercentage: "7",
        tdsPercentage: ""
      });
    }
  };

  const removeSalaryPeriod = (id) => {
    setFormData(prev => ({
      ...prev,
      salaryPeriods: prev.salaryPeriods.filter(period => period.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const calculateGrossSalary = (period = formData) => {
    const basic = parseFloat(period.basicSalary) || 0;
    const da = parseFloat(period.da) || 0;
    const hra = parseFloat(period.hra) || 0;
    const conveyance = parseFloat(period.conveyanceAllowance) || 0;
    const other = parseFloat(period.otherAllowance) || 0;
    return basic + da + hra + conveyance + other;
  };

  const calculateDeductions = (period = formData) => {
    const pf = parseFloat(period.pfAmount) || 0;
    const mlwf = parseFloat(period.mlwfPercentage) || 0;
    const pt = parseFloat(period.ptAmount) || 0;
    const esic = parseFloat(period.esicPercentage) || 0;
    const tds = parseFloat(period.tdsPercentage) || 0;
    const gross = calculateGrossSalary(period);
    
    return pf + (gross * mlwf / 100) + pt + (gross * esic / 100) + (gross * tds / 100);
  };

  const calculateNetSalary = (period = formData) => {
    return calculateGrossSalary(period) - calculateDeductions(period);
  };

  const tabs = [
    { id: "personal", label: "Personal Information" },
    { id: "qualification", label: "Academic Qualification" },
    { id: "experience", label: "Work Experience" },
    { id: "leave", label: "Leave Structure" },
    { id: "salary", label: "Salary Structure" }
  ];

  return (
    <div className="employee-form-container">
      {/* Floating Save Button */}
      <div className="floating-save-buttons">
        <button
          type="submit"
          onClick={handleSubmit}
          className="btn btn-primary"
        >
          💾 {employee ? "Update" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          ❌ Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        {/* Tab Navigation */}
        <div className="form-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`form-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Personal Information Tab */}
        {activeTab === "personal" && (
          <div className="tab-content">
            <h3 className="section-title">Personal Information</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email Password</label>
                <input
                  type="password"
                  name="emailPassword"
                  value={formData.emailPassword}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Employee Type</label>
                <select
                  name="empType"
                  value={formData.empType}
                  onChange={handleInputChange}
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>PF No.</label>
                <input
                  type="text"
                  name="pfNo"
                  value={formData.pfNo}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Employee Status</label>
                <select
                  name="employeeStatus"
                  value={formData.employeeStatus}
                  onChange={handleInputChange}
                >
                  <option value="Working">Working</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-section">
              <h4>Contact Information</h4>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Present Address</label>
                  <textarea
                    name="presentAddress"
                    value={formData.presentAddress}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>PIN</label>
                  <input
                    type="text"
                    name="pin"
                    value={formData.pin}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Mobile</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h4>Statutory Information</h4>
              <div className="checkbox-grid">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="bonus"
                    checked={formData.bonus}
                    onChange={handleInputChange}
                  />
                  <span>Bonus</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="pf"
                    checked={formData.pf}
                    onChange={handleInputChange}
                  />
                  <span>PF (Provident Fund)</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="mlwf"
                    checked={formData.mlwf}
                    onChange={handleInputChange}
                  />
                  <span>MLWF</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="pt"
                    checked={formData.pt}
                    onChange={handleInputChange}
                  />
                  <span>PT (Professional Tax)</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="esic"
                    checked={formData.esic}
                    onChange={handleInputChange}
                  />
                  <span>ESIC</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="tds"
                    checked={formData.tds}
                    onChange={handleInputChange}
                  />
                  <span>TDS</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Academic Qualification Tab */}
        {activeTab === "qualification" && (
          <div className="tab-content">
            <h3 className="section-title">Academic Qualification</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Institute</label>
                <input
                  type="text"
                  name="institute"
                  value={formData.institute}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Passing Year</label>
                <input
                  type="number"
                  name="passingYear"
                  value={formData.passingYear}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Work Experience Tab */}
        {activeTab === "experience" && (
          <div className="tab-content">
            <h3 className="section-title">Work Experience</h3>
            <div className="form-group full-width">
              <label>Work Experience</label>
              <textarea
                name="workExperience"
                value={formData.workExperience}
                onChange={handleInputChange}
                rows="6"
                placeholder="Enter previous work experience details..."
              />
            </div>
          </div>
        )}

        {/* Leave Structure Tab */}
        {activeTab === "leave" && (
          <div className="tab-content">
            <h3 className="section-title">Leave Structure</h3>
            <div className="form-group full-width">
              <label>Leave Structure</label>
              <textarea
                name="leaveStructure"
                value={formData.leaveStructure}
                onChange={handleInputChange}
                rows="6"
                placeholder="Enter leave structure details..."
              />
            </div>
          </div>
        )}

        {/* Salary Structure Tab */}
        {activeTab === "salary" && (
          <div className="tab-content">
            <h3 className="section-title">Current Salary Structure</h3>
            
            <div className="salary-section">
              <h4>Basic Salary Components</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Basic Salary</label>
                  <input
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleInputChange}
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>DA (Dearness Allowance)</label>
                  <input
                    type="number"
                    name="da"
                    value={formData.da}
                    onChange={handleInputChange}
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>HRA (House Rent Allowance)</label>
                  <input
                    type="number"
                    name="hra"
                    value={formData.hra}
                    onChange={handleInputChange}
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>Conveyance Allowance</label>
                  <input
                    type="number"
                    name="conveyanceAllowance"
                    value={formData.conveyanceAllowance}
                    onChange={handleInputChange}
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>Other Allowance</label>
                  <input
                    type="number"
                    name="otherAllowance"
                    value={formData.otherAllowance}
                    onChange={handleInputChange}
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            <div className="salary-section">
              <h4>Statutory Deductions</h4>
              <div className="form-grid">
                {formData.bonus && (
                  <div className="form-group">
                    <label>Bonus Amount</label>
                    <input
                      type="number"
                      name="bonusAmount"
                      value={formData.bonusAmount}
                      onChange={handleInputChange}
                      step="0.01"
                    />
                  </div>
                )}
                
                {formData.pf && (
                  <div className="form-group">
                    <label>PF Amount</label>
                    <input
                      type="number"
                      name="pfAmount"
                      value={formData.pfAmount}
                      onChange={handleInputChange}
                      step="0.01"
                    />
                  </div>
                )}
                
                {formData.mlwf && (
                  <div className="form-group">
                    <label>MLWF %</label>
                    <input
                      type="number"
                      name="mlwfPercentage"
                      value={formData.mlwfPercentage}
                      onChange={handleInputChange}
                      step="0.01"
                      max="100"
                    />
                  </div>
                )}
                
                {formData.pt && (
                  <div className="form-group">
                    <label>PT Amount</label>
                    <input
                      type="number"
                      name="ptAmount"
                      value={formData.ptAmount}
                      onChange={handleInputChange}
                      step="0.01"
                    />
                  </div>
                )}
                
                {formData.esic && (
                  <div className="form-group">
                    <label>ESIC %</label>
                    <input
                      type="number"
                      name="esicPercentage"
                      value={formData.esicPercentage}
                      onChange={handleInputChange}
                      step="0.01"
                      max="100"
                    />
                  </div>
                )}
                
                {formData.tds && (
                  <div className="form-group">
                    <label>TDS %</label>
                    <input
                      type="number"
                      name="tdsPercentage"
                      value={formData.tdsPercentage}
                      onChange={handleInputChange}
                      step="0.01"
                      max="100"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Salary Calculation Summary */}
            <div className="salary-summary">
              <h4>Salary Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Gross Salary:</span>
                  <span>₹{calculateGrossSalary().toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Total Deductions:</span>
                  <span>₹{calculateDeductions().toFixed(2)}</span>
                </div>
                <div className="summary-item total">
                  <span>Net Salary:</span>
                  <span>₹{calculateNetSalary().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Salary Periods */}
            <div className="salary-periods-section">
              <h4>Salary Periods History</h4>
              
              {/* Add New Period */}
              <div className="add-period-form">
                <h5>Add New Salary Period</h5>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={newSalaryPeriod.startDate}
                      onChange={handleSalaryPeriodChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={newSalaryPeriod.endDate}
                      onChange={handleSalaryPeriodChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Basic Salary</label>
                    <input
                      type="number"
                      name="basicSalary"
                      value={newSalaryPeriod.basicSalary}
                      onChange={handleSalaryPeriodChange}
                      step="0.01"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>DA</label>
                    <input
                      type="number"
                      name="da"
                      value={newSalaryPeriod.da}
                      onChange={handleSalaryPeriodChange}
                      step="0.01"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>HRA</label>
                    <input
                      type="number"
                      name="hra"
                      value={newSalaryPeriod.hra}
                      onChange={handleSalaryPeriodChange}
                      step="0.01"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Conveyance</label>
                    <input
                      type="number"
                      name="conveyanceAllowance"
                      value={newSalaryPeriod.conveyanceAllowance}
                      onChange={handleSalaryPeriodChange}
                      step="0.01"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={addSalaryPeriod}
                  className="btn btn-secondary"
                >
                  Add Period
                </button>
              </div>
              
              {/* Existing Periods */}
              {formData.salaryPeriods.length > 0 && (
                <div className="periods-list">
                  <h5>Salary History</h5>
                  {formData.salaryPeriods.map(period => (
                    <div key={period.id} className="period-card">
                      <div className="period-header">
                        <span>{period.startDate} to {period.endDate}</span>
                        <button
                          type="button"
                          onClick={() => removeSalaryPeriod(period.id)}
                          className="btn btn-danger small"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="period-details">
                        <span>Gross: ₹{calculateGrossSalary(period).toFixed(2)}</span>
                        <span>Net: ₹{calculateNetSalary(period).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            ❌ Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {employee ? "✅ Update Employee" : "✅ Save Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

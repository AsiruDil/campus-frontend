import React, { useState, useEffect } from 'react';
import { X, MapPin, Building2, Calendar, DollarSign, Briefcase, GraduationCap, FileText } from 'lucide-react';

const VacancyModal = ({ isOpen, onClose, onSubmit, editingVacancy, isViewMode = false }) => {
  const initialData = {
    jobRole: '',
    location: 'Main Campus', // Default value from dropdown
    faculty: 'Science',      // Default value from dropdown
    department: '',
    jobDescription: '',
    jobResponsibilities: '',
    jobQualifications: '',
    jobType: 'Full-time',
    salary: '',
    deadline: '',
    isAvailable: true
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (editingVacancy) {
      setFormData({
        ...editingVacancy,
        deadline: editingVacancy.deadline ? new Date(editingVacancy.deadline).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData(initialData);
    }
  }, [editingVacancy, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Auto-generate Job ID if creating new (Format: JOB + Timestamp)
    // This prevents backend errors since we removed the input field
    const submissionData = { 
        ...formData, 
        jobId: editingVacancy ? editingVacancy.jobId : `JOB-${Date.now()}`,
        salary: Number(formData.salary) 
    };
    
    onSubmit(submissionData);
  };

  if (!isOpen) return null;

  // --- RENDER VIEW MODE (Read-Only) ---
  if (isViewMode) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={24} />
              </button>
              
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-3">
                  {/* Removed Job ID display here to keep it clean, or you can keep it if needed */}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${formData.isAvailable ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                    {formData.isAvailable ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">{formData.jobRole}</h2>
                <div className="flex flex-wrap gap-4 text-blue-100 text-sm mt-1">
                  <span className="flex items-center gap-1"><Building2 size={16} /> {formData.faculty} • {formData.department}</span>
                  <span className="flex items-center gap-1"><MapPin size={16} /> {formData.location}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 bg-gray-50/50 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-gray-500 text-xs uppercase font-semibold mb-1 flex items-center gap-1"><Briefcase size={14} /> Job Type</div>
                  <div className="font-semibold text-gray-800">{formData.jobType}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-gray-500 text-xs uppercase font-semibold mb-1 flex items-center gap-1"><DollarSign size={14} /> Salary</div>
                  <div className="font-semibold text-gray-800">{formData.salary ? `LKR ${formData.salary.toLocaleString()}` : 'Negotiable'}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-gray-500 text-xs uppercase font-semibold mb-1 flex items-center gap-1"><Calendar size={14} /> Deadline</div>
                  <div className="font-semibold text-red-600">{formData.deadline || 'No Deadline'}</div>
                </div>
              </div>

              <div className="space-y-6">
                <Section title="Description" icon={<FileText size={18} />} content={formData.jobDescription} />
                <Section title="Responsibilities" icon={<Briefcase size={18} />} content={formData.jobResponsibilities} />
                <Section title="Qualifications" icon={<GraduationCap size={18} />} content={formData.jobQualifications} />
              </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-end">
              <button onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER FORM MODE (Edit/Create) ---
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        
        {/* Modal Card */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white rounded-t-xl z-10">
            <h2 className="text-xl font-bold text-gray-800">
              {editingVacancy ? 'Edit Job Vacancy' : 'Create New Job'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* REMOVED JOB ID INPUT */}
              
              <InputGroup label="Job Role" name="jobRole" value={formData.jobRole} onChange={handleChange} required />
              
              {/* LOCATION DROPDOWN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                <select 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                    <option value="Main Campus">Main Campus</option>
                    <option value="Kaburupitiya">Kaburupitiya</option>
                    <option value="Hapugala">Hapugala</option>
                    <option value="Karapitiya">Karapitiya</option>
                </select>
              </div>

              {/* FACULTY DROPDOWN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Faculty</label>
                <select 
                    name="faculty" 
                    value={formData.faculty} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                    <option value="Science">Science</option>
                    <option value="Management">Management</option>
                    <option value="Art">Art</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Technology">Technology</option>
                    <option value="Fisheries and Marine Science">Fisheries and Marine Science</option>
                </select>
              </div>

              <InputGroup label="Department" name="department" value={formData.department} onChange={handleChange} required />
              
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Type</label>
              <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>

            {/* SALARY INPUT (Arrows Hidden) */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Salary</label>
                <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Amount"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
            </div>

            <InputGroup label="Deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} required />
            </div>

            <TextAreaGroup label="Description" name="jobDescription" value={formData.jobDescription} onChange={handleChange} />
            <TextAreaGroup label="Responsibilities" name="jobResponsibilities" value={formData.jobResponsibilities} onChange={handleChange} />
            <TextAreaGroup label="Qualifications" name="jobQualifications" value={formData.jobQualifications} onChange={handleChange} />

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm hover:shadow transition-all">
                {editingVacancy ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const Section = ({ title, icon, content }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
    <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2 border-b pb-2">
      <span className="text-blue-600">{icon}</span> {title}
    </h3>
    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
      {content || "No details provided."}
    </p>
  </div>
);

const InputGroup = ({ label, name, value, onChange, type = "text", disabled = false, required = false, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
      className={`w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
    />
  </div>
);

const TextAreaGroup = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows="3"
      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
    ></textarea>
  </div>
);

export default VacancyModal;
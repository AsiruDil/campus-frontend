import React, { useState, useEffect } from 'react';
import { Edit2, Eye, EyeOff, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import VacancyModal from '../../components/admin/VacancyMOdal';
import api from '../../api/axios'; 

const ManageVacancies = () => {
  const [allVacancies, setAllVacancies] = useState([]); 
  const [filteredVacancies, setFilteredVacancies] = useState([]); 
  const [displayVacancies, setDisplayVacancies] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const token =localStorage.getItem('token')
  // --- Fetch Logic (Silent Refresh) ---
  const fetchAllVacancies = async (showLoading = true) => {
    if (showLoading) setLoading(true); 
    try {
       const response = await api.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs`, {
  headers: { Authorization: `Bearer ${token}` }
});
      let vacancies = Array.isArray(response.data) ? response.data : [];
      
      // Sort: Active first, then by Date
      vacancies.sort((a, b) => {
        if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1; 
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      
      setAllVacancies(vacancies);
      setFilteredVacancies(vacancies);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllVacancies(true); 
  }, []);

  // --- UPDATED Search & Filter Logic ---
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    
    const results = allVacancies.filter(vacancy => {
      // Updated Search Criteria: Role, Faculty, Dept, Type
      const matchesSearch = 
        (vacancy.jobRole && vacancy.jobRole.toLowerCase().includes(term)) ||
        (vacancy.faculty && vacancy.faculty.toLowerCase().includes(term)) ||
        (vacancy.department && vacancy.department.toLowerCase().includes(term)) ||
        (vacancy.jobType && vacancy.jobType.toLowerCase().includes(term));

      const matchesType = filterType === 'All' || vacancy.jobType === filterType;

      return matchesSearch && matchesType;
    });

    setFilteredVacancies(results);
    if (currentPage > Math.ceil(results.length / itemsPerPage)) {
        setCurrentPage(1);
    }
  }, [searchTerm, filterType, allVacancies]);

  // --- Pagination Logic ---
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayVacancies(filteredVacancies.slice(startIndex, endIndex));
  }, [currentPage, filteredVacancies]);

  const totalPages = Math.ceil(filteredVacancies.length / itemsPerPage);

  // --- Handlers ---
  const handleCreateOrUpdate = async (formData) => {
    if (isViewMode) return; 

    try {
      if (editingVacancy) {
        await api.put(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/${editingVacancy.jobId}`, formData);
      } else {
        await api.post(`${import.meta.env.VITE_BACKEND_URL}/api/jobs`, formData);
      }
      
      setIsModalOpen(false);
      setEditingVacancy(null);
      await fetchAllVacancies(false); 
      
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Failed to save. Ensure Job ID is unique.");
    }
  };

  // --- Optimistic Status Toggle ---
  const toggleStatus = async (e, jobId, currentStatus) => {
    e.stopPropagation(); 
    
    const newStatus = !currentStatus;

    const updateList = (list) => list.map(job => 
        job.jobId === jobId ? { ...job, isAvailable: newStatus } : job
    );
    setAllVacancies(prev => updateList(prev));

    try {
      await api.patch(`/job/${jobId}`, { isAvailable: newStatus });
    } catch (error) {
      console.error("Error toggling status:", error);
      setAllVacancies(prev => list.map(job => 
        job.jobId === jobId ? { ...job, isAvailable: currentStatus } : job
      ));
    }
  };

  const openAddModal = () => {
    setEditingVacancy(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (e, vacancy) => {
    e.stopPropagation(); 
    setEditingVacancy(vacancy);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleRowClick = (vacancy) => {
    setEditingVacancy(vacancy);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const getBadgeStyle = (type) => {
    switch (type) {
        case 'Full-time': return 'bg-blue-100 text-blue-700';
        case 'Part-time': return 'bg-green-100 text-green-700';
        case 'Temporary': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- Render ---

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 flex-none">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Job Vacancies</h1>
        <button 
          onClick={openAddModal}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Job
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 flex-none">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                // Updated Placeholder Text
                placeholder="Search by Role, Faculty, Dept..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg text-sm transition-all outline-none"
            />
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
            {['All', 'Full-time', 'Part-time', 'Temporary'].map((type) => (
                <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        filterType === type 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {type}
                </button>
            ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
        
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-5 text-sm font-bold text-gray-700 uppercase tracking-wider">Job Role</th>
                <th className="p-5 text-sm font-bold text-gray-700 uppercase tracking-wider">Faculty / Dept</th>
                <th className="p-5 text-sm font-bold text-gray-700 uppercase tracking-wider">Job Type</th>
                <th className="p-5 text-sm font-bold text-gray-700 uppercase tracking-wider">Deadline</th>
                <th className="p-5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center">Status</th>
                <th className="p-5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading jobs...</td></tr>
              ) : displayVacancies.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No jobs found.</td></tr>
              ) : (
                displayVacancies.map((vacancy) => (
                  <tr 
                    key={vacancy._id} 
                    onClick={() => handleRowClick(vacancy)} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    {/* Job Role & ID */}
                    <td className="p-5">
                        <div className="font-bold text-gray-900">{vacancy.jobRole}</div>
                        <div className="text-xs text-gray-400 mt-0.5 font-mono">#{vacancy.jobId}</div>
                    </td>

                    {/* Faculty */}
                    <td className="p-5">
                        <div className="text-sm font-medium text-gray-700">{vacancy.faculty}</div>
                        <div className="text-xs text-gray-500">{vacancy.department}</div>
                    </td>

                    {/* Job Type Badge */}
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeStyle(vacancy.jobType)}`}>
                        {vacancy.jobType}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-5 text-sm text-gray-600 font-medium">
                      {vacancy.deadline 
                        ? new Date(vacancy.deadline).toISOString().split('T')[0] 
                        : 'N/A'
                      }
                    </td>

                    {/* Status Toggle */}
                    <td className="p-5 text-center">
                      <button
                        onClick={(e) => toggleStatus(e, vacancy.jobId, vacancy.isAvailable)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border w-20 ${
                          vacancy.isAvailable 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {vacancy.isAvailable ? 'Active' : 'Hidden'}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-5 flex justify-center gap-2">
                      <button 
                        onClick={(e) => openEditModal(e, vacancy)} 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white flex-none">
          <span className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, filteredVacancies.length)}</span> of <span className="text-gray-900 font-bold">{filteredVacancies.length}</span> jobs
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            {[...Array(totalPages || 1)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === i + 1 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <VacancyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateOrUpdate}
        editingVacancy={editingVacancy}
        isViewMode={isViewMode} 
      />
    </div>
  );
};

export default ManageVacancies;
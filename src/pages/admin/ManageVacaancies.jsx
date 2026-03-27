import React, { useState, useEffect } from 'react';
import { Edit2, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import VacancyModal from '../../components/admin/VacancyMOdal';
import api from '../../api/axios'; 
import { toast } from 'react-hot-toast';

const ManageVacancies = () => {
  const [allVacancies, setAllVacancies] = useState([]); 
  const [filteredVacancies, setFilteredVacancies] = useState([]); 
  const [displayVacancies, setDisplayVacancies] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // --- 1. Fetch Logic (Using relative path only) ---
  const fetchAllVacancies = async (showLoading = true) => {
    if (showLoading) setLoading(true); 
    try {
      // ✅ Fixed: Used relative path since baseURL is in api.js
      const response = await api.get('/api/jobs');
      let vacancies = Array.isArray(response.data) ? response.data : [];
      
      vacancies.sort((a, b) => (a.isAvailable !== b.isAvailable ? (a.isAvailable ? -1 : 1) : new Date(b.updatedAt) - new Date(a.updatedAt)));
      setAllVacancies(vacancies);
    } catch (error) { 
      console.error("Fetch Error:", error.response?.data || error.message); 
    } finally { 
      if (showLoading) setLoading(false); 
    }
  };

  useEffect(() => { fetchAllVacancies(true); }, []);

  // --- Search & Filter Logic ---
  useEffect(() => {
    const results = allVacancies.filter(v => {
      const matchesSearch = [v.jobRole, v.faculty, v.department, v.jobType].some(val => val?.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch && (filterType === 'All' || v.jobType === filterType);
    });
    setFilteredVacancies(results);
    setCurrentPage(1);
  }, [searchTerm, filterType, allVacancies]);

  useEffect(() => {
    setDisplayVacancies(filteredVacancies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
  }, [currentPage, filteredVacancies]);

  // --- 2. Create or Update Logic ---
  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingVacancy) {
        // ✅ Fixed: Used relative path
        await api.put(`/api/jobs/${editingVacancy.jobId}`, formData);
        toast?.success("Job updated successfully");
      } else {
        // ✅ Fixed: Used relative path
        await api.post(`/api/jobs`, formData); 
        toast?.success("Job created successfully");
      }
      setIsModalOpen(false);
      await fetchAllVacancies(false);
    } catch (error) {
      console.error("Submission Error:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Could not connect to the server.";
      alert(`Error: ${errorMsg}`);
    }
  };

  // --- 3. Toggle Status Logic ---
  const toggleStatus = async (e, jobId, currentStatus) => {
    e.stopPropagation();
    const newStatus = !currentStatus;
    
    // Optimistic UI update
    setAllVacancies(prev => prev.map(j => j.jobId === jobId ? { ...j, isAvailable: newStatus } : j));
    
    try { 
      // ✅ Fixed: Used relative path
      await api.patch(`/api/jobs/${jobId}`, { isAvailable: newStatus }); 
    } catch (error) { 
      console.error("Toggle Error:", error.response?.data || error.message);
      fetchAllVacancies(false); // Revert on failure
    }
  };

  return (
    <div className="flex flex-col h-full font-sans pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Job Vacancies</h1>
        <button onClick={() => { setEditingVacancy(null); setIsViewMode(false); setIsModalOpen(true); }} className="w-full md:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2"><Plus size={20} /> Add Job</button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {['All', 'Full-time', 'Part-time', 'Temporary'].map((type) => (
            <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${filterType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>{type}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-white border-b sticky top-0">
              <tr>
                <th className="p-5 text-sm font-bold text-gray-700">Job Role</th>
                <th className="p-5 text-sm font-bold text-gray-700">Faculty / Dept</th>
                <th className="p-5 text-sm font-bold text-gray-700">Job Type</th>
                <th className="p-5 text-sm font-bold text-gray-700">Deadline</th>
                <th className="p-5 text-sm font-bold text-gray-700 text-center">Status</th>
                <th className="p-5 text-sm font-bold text-gray-700 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayVacancies.map((v) => (
                <tr key={v._id} onClick={() => { setEditingVacancy(v); setIsViewMode(true); setIsModalOpen(true); }} className="hover:bg-gray-50 cursor-pointer">
                  <td className="p-5"><div>{v.jobRole}</div><div className="text-xs text-gray-400">#{v.jobId}</div></td>
                  <td className="p-5"><div className="text-sm font-medium">{v.faculty}</div><div className="text-xs text-gray-500">{v.department}</div></td>
                  <td className="p-5"><span className={`px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700`}>{v.jobType}</span></td>
                  <td className="p-5 text-sm">{v.deadline ? v.deadline.split('T')[0] : 'N/A'}</td>
                  <td className="p-5 text-center"><button onClick={(e) => toggleStatus(e, v.jobId, v.isAvailable)} className={`px-3 py-1 rounded-full text-xs font-medium border w-20 ${v.isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-50'}`}>{v.isAvailable ? 'Active' : 'Hidden'}</button></td>
                  <td className="p-5 text-center"><button onClick={(e) => { e.stopPropagation(); setEditingVacancy(v); setIsViewMode(false); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-5 border-t flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <span className="text-sm text-gray-500">Showing {displayVacancies.length} of {filteredVacancies.length} jobs</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 border rounded-lg disabled:opacity-50"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= Math.ceil(filteredVacancies.length / itemsPerPage)} className="p-2 border rounded-lg disabled:opacity-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      <VacancyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateOrUpdate} editingVacancy={editingVacancy} isViewMode={isViewMode} />
    </div>
  );
};

export default ManageVacancies;
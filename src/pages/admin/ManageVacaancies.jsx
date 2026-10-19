import { useState, useEffect, useMemo } from 'react';
import { Edit2, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import VacancyModal from '../../components/admin/VacancyMOdal';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const ManageVacancies = () => {
  const [allVacancies, setAllVacancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [pendingJob, setPendingJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // --- 1. Fetch Logic (Using relative path only) ---
  const fetchAllVacancies = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // ✅ Fixed: Used relative path since baseURL is in api.js
      setError('');
      const response = await api.get('/api/jobs');
      let vacancies = Array.isArray(response.data) ? response.data : [];

      vacancies.sort((a, b) => (a.isAvailable !== b.isAvailable ? (a.isAvailable ? -1 : 1) : new Date(b.updatedAt) - new Date(a.updatedAt)));
      setAllVacancies(vacancies);
    } catch (error) {
      console.error("Fetch Error:", error.response?.data || error.message);
      setError("Unable to load vacancies. Please try again.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => { fetchAllVacancies(true); }, []);

  const vacancyStatus = v => !v.isAvailable ? 'hidden' : v.deadline && new Date(v.deadline) <= new Date() ? 'expired' : 'open';
  const filteredVacancies = useMemo(() => allVacancies.filter(v => {
    const matchesSearch = [v.jobRole, v.faculty, v.department, v.jobType, v.jobId].some(value => value?.toLowerCase().includes(searchTerm.trim().toLowerCase()));
    const status = !v.isAvailable ? 'hidden' : v.deadline && new Date(v.deadline) <= new Date() ? 'expired' : 'open';
    return matchesSearch && (filterType === 'All' || v.jobType === filterType) && (statusFilter === 'all' || status === statusFilter);
  }), [allVacancies, searchTerm, filterType, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredVacancies.length / itemsPerPage));
  const page = Math.min(currentPage, pageCount);
  const displayVacancies = filteredVacancies.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
    setPendingJob(jobId);

    // Optimistic UI update
    setAllVacancies(prev => prev.map(j => j.jobId === jobId ? { ...j, isAvailable: newStatus } : j));

    try {
      // ✅ Fixed: Used relative path
      await api.patch(`/api/jobs/${jobId}`, { isAvailable: newStatus });
    } catch (error) {
      console.error("Toggle Error:", error.response?.data || error.message);
      toast.error("Could not update visibility. Please try again.");
      await fetchAllVacancies(false);
    } finally { setPendingJob(null); }
  };

  return (
    <div className="admin-workspace">
      <header className="admin-page-heading"><div><span className="admin-eyebrow">RECRUITMENT</span><h1>Manage Job Vacancies</h1><p>Publish opportunities, keep deadlines up to date, and control visibility.</p></div><div className="admin-row-actions"><button className="admin-action" onClick={() => fetchAllVacancies(true)} disabled={loading}>Refresh</button><button className="admin-action primary" onClick={() => { setEditingVacancy(null); setIsViewMode(false); setIsModalOpen(true); }}><Plus size={18}/> Add Job</button></div></header>
      <div className="admin-stats">
        <div><span>Total vacancies</span><strong>{allVacancies.length}</strong><small>Across all faculties</small></div>
        <div><span>Open for applications</span><strong>{allVacancies.filter(v => vacancyStatus(v) === 'open').length}</strong><small>Visible with an open deadline</small></div>
        <div><span>Hidden vacancies</span><strong>{allVacancies.filter(v => vacancyStatus(v) === 'hidden').length}</strong><small>Not visible to applicants</small></div>
        <div><span>Deadline passed</span><strong>{allVacancies.filter(v => vacancyStatus(v) === 'expired').length}</strong><small>Review deadlines to reopen</small></div>
      </div>
      <section className="admin-panel" aria-label="Vacancy directory">
        <div className="admin-panel-heading"><div><h2>All vacancies</h2><p>Select a job title to preview the full vacancy.</p></div><span className="admin-count">{filteredVacancies.length} results</span></div>
        <div className="admin-toolbar"><label className="admin-search"><Search size={20}/><input aria-label="Search vacancies" placeholder="Search job title, faculty, department, or ID" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}/></label><label className="admin-select">Vacancy status<select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}><option value="all">All statuses</option><option value="open">Open</option><option value="hidden">Hidden</option><option value="expired">Deadline passed</option></select></label></div>
        <div className="admin-filter-row"><div className="admin-tabs" aria-label="Filter by job type">{[...new Set(['All', 'Full-time', 'Part-time', 'Temporary', ...allVacancies.map(v => v.jobType).filter(Boolean)])].map(type => <button key={type} aria-pressed={filterType === type} className={filterType === type ? 'selected' : ''} onClick={() => { setFilterType(type); setCurrentPage(1); }}>{type === 'All' ? 'All job types' : type}</button>)}</div>{(searchTerm || filterType !== 'All' || statusFilter !== 'all') && <button className="admin-reset" onClick={() => { setSearchTerm(''); setFilterType('All'); setStatusFilter('all'); setCurrentPage(1); }}>Clear filters</button>}</div>
        {error ? <div className="admin-empty" role="alert"><h3>{error}</h3><button className="admin-action" onClick={() => fetchAllVacancies(true)}>Try again</button></div> : loading ? <div className="admin-empty" role="status">Loading vacancies...</div> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Job opportunity</th><th>Faculty / Department</th><th>Job type</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {displayVacancies.map(v => <tr key={v._id || v.jobId}>
            <td><button className="admin-name" onClick={() => { setEditingVacancy(v); setIsViewMode(true); setIsModalOpen(true); }}>{v.jobRole}</button><small>{v.jobId}</small></td>
            <td><span className="admin-cell-title">{v.faculty || 'Not specified'}</span><small>{v.department || 'Not specified'}</small></td>
            <td><span className="admin-badge blue">{v.jobType || 'Not specified'}</span></td>
            <td>{v.deadline ? new Date(v.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No deadline'}<small>{v.deadline ? new Date(v.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</small></td>
            <td><span className={`admin-badge ${vacancyStatus(v) === 'open' ? 'positive' : vacancyStatus(v) === 'expired' ? 'warning' : 'muted'}`}><span className="admin-status-dot"/>{vacancyStatus(v) === 'open' ? 'Open' : vacancyStatus(v) === 'expired' ? 'Deadline passed' : 'Hidden'}</span></td>
            <td><div className="admin-row-actions"><button aria-label={`Edit ${v.jobRole}`} className="admin-action" onClick={() => { setEditingVacancy(v); setIsViewMode(false); setIsModalOpen(true); }}><Edit2 size={15}/> Edit</button><button className="admin-action" aria-label={`${v.isAvailable ? 'Hide' : 'Show'} ${v.jobRole}`} disabled={pendingJob === v.jobId} onClick={e => toggleStatus(e, v.jobId, v.isAvailable)}>{pendingJob === v.jobId ? 'Updating...' : v.isAvailable ? 'Hide' : 'Show'}</button></div></td>
          </tr>)}
        </tbody></table>{!displayVacancies.length && <div className="admin-empty"><Search size={28}/><h3>{allVacancies.length ? 'No matching vacancies' : 'Your next hire starts here'}</h3><p>{allVacancies.length ? 'Try a different search or clear your filters.' : 'Add a job to start accepting applications.'}</p>{!allVacancies.length && <button className="admin-action primary" onClick={() => { setEditingVacancy(null); setIsViewMode(false); setIsModalOpen(true); }}><Plus size={17}/> Add Job</button>}</div>}</div>}
        <div className="admin-pagination vacancy-pagination"><span>{filteredVacancies.length ? `Showing ${(page - 1) * itemsPerPage + 1} to ${Math.min(page * itemsPerPage, filteredVacancies.length)} of ${filteredVacancies.length} vacancies` : 'No vacancies to show'}</span><div className="admin-row-actions"><button aria-label="Previous page" className="admin-action" onClick={() => setCurrentPage(page - 1)} disabled={page === 1}><ChevronLeft size={17}/></button><span>Page {page} of {pageCount}</span><button aria-label="Next page" className="admin-action" onClick={() => setCurrentPage(page + 1)} disabled={page === pageCount}><ChevronRight size={17}/></button></div></div>
      </section>
      <VacancyModal key={`${editingVacancy?._id || "new"}-${isModalOpen}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateOrUpdate} editingVacancy={editingVacancy} isViewMode={isViewMode} vacancies={allVacancies} />
    </div>
  );
};

export default ManageVacancies;

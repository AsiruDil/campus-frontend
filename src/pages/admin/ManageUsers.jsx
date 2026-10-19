import { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';

import api from '../../api/axios';
import Pagination from '../../components/admin/Pagination';
import UserEditModal from '../../components/admin/UserEditMOdal';
import UserDetailsModal from '../../components/admin/UserDeatailsModal';
import {jwtDecode} from "jwt-decode";

const getRoleBadgeStyle = (role) => {
  switch (role?.toLowerCase()) {
    case 'superadmin': return 'bg-blue-100 text-blue-700 font-bold';
    case 'admin': return 'bg-purple-100 text-purple-700 font-bold';
    case 'user': return 'bg-green-100 text-green-700 font-bold';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All Roles');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [userToView, setUserToView] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const itemsPerPage = 8;

  const fetchUsers = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true);

      // We still need the token here just to decode the email,
      // but we don't need to pass it into the API call manually!
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      const currentAdminEmail = decoded.email;

      // 2. 👇 Much cleaner URL, no headers needed!
      setError('');
      const response = await api.get('/api/users');

      const data = Array.isArray(response.data) ? response.data : [];
      setUsers(data.filter(user => user.email !== currentAdminEmail));
    } catch (error) {
      console.error(error);
      setError('Unable to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(true); }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const name = user.userName || "";
      const email = user.email || "";
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
      const targetRole = filterRole === 'Super Admin' ? 'superadmin' : filterRole.toLowerCase();
      const matchesRole = filterRole === 'All Roles' || user.role === targetRole;
      return matchesSearch && matchesRole && (statusFilter === 'all' || (statusFilter === 'blocked' ? user.isBlocked : !user.isBlocked));
    });
  }, [users, searchTerm, filterRole, statusFilter]);

  const handleSaveRole = async (userName, changes) => {
    try {

      // 3. 👇 Cleaner URL, headers removed
      await api.put(`/api/users/${userName}`, changes);

      await fetchUsers(false);
      setIsEditModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update user role");
    }
  };

  const handleToggleBlock = async (e, userName) => {
    e.stopPropagation();
    setPendingUser(userName);
    try {
      // 4. 👇 Cleaner URL, headers removed
      await api.put(`/api/users/toggle-block/${userName}`);

      await fetchUsers(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update block status.");
    } finally { setPendingUser(null); }
  };

  const page = Math.min(currentPage, Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage)));
  const currentUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="admin-workspace">
      <header className="admin-page-heading"><div><span className="admin-eyebrow">PEOPLE & ACCESS</span><h1>Manage Users</h1><p>Find people, review their profiles, and manage account access.</p></div><button className="admin-action" onClick={() => fetchUsers(true)} disabled={loading}>Refresh users</button></header>
      <div className="admin-stats">
        <div><span>Total users</span><strong>{users.length}</strong><small>Excluding your account</small></div>
        <div><span>Active accounts</span><strong>{users.filter(u => !u.isBlocked).length}</strong><small>Access enabled</small></div>
        <div><span>Administrators</span><strong>{users.filter(u => ['admin', 'superadmin'].includes(u.role)).length}</strong><small>Admin and super admin roles</small></div>
        <div><span>Blocked accounts</span><strong>{users.filter(u => u.isBlocked).length}</strong><small>Access restricted</small></div>
      </div>
      <section className="admin-panel" aria-label="User directory">
        <div className="admin-panel-heading"><div><h2>User directory</h2><p>Review account details or update permissions.</p></div><span className="admin-count">{filteredUsers.length} results</span></div>
        <div className="admin-toolbar">
          <label className="admin-search"><FiSearch size={20}/><input aria-label="Search users" placeholder="Search by name or email" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}/></label>
          <label className="admin-select">Account status<select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}><option value="all">All accounts</option><option value="active">Active accounts</option><option value="blocked">Blocked accounts</option></select></label>
        </div>
        <div className="admin-filter-row"><div className="admin-tabs" aria-label="Filter by role">{['All Roles', 'Super Admin', 'Admin', 'User'].map(role => <button key={role} aria-pressed={filterRole === role} className={filterRole === role ? 'selected' : ''} onClick={() => { setFilterRole(role); setCurrentPage(1); }}>{role}</button>)}</div>{(searchTerm || filterRole !== 'All Roles' || statusFilter !== 'all') && <button className="admin-reset" onClick={() => { setSearchTerm(''); setFilterRole('All Roles'); setStatusFilter('all'); setCurrentPage(1); }}>Clear filters</button>}</div>
        {error ? <div className="admin-empty" role="alert"><h3>{error}</h3><button className="admin-action" onClick={() => fetchUsers(true)}>Try again</button></div> : loading ? <div className="admin-empty" role="status">Loading user directory...</div> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>User</th><th>Role</th><th>Account status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
          {currentUsers.map(user => <tr key={user._id || user.userName}>
            <td><div className="admin-person"><span className="admin-avatar">{(user.userName || '?').slice(0, 2).toUpperCase()}</span><div><button className="admin-name" onClick={() => { setUserToView(user); setIsViewModalOpen(true); }}>{user.userName}</button><small>{user.email}</small></div></div></td>
            <td><span className={`admin-badge ${getRoleBadgeStyle(user.role)}`}>{user.role === 'superadmin' ? 'Super Admin' : user.role}</span></td>
            <td><span className={`admin-badge ${user.isBlocked ? 'muted' : 'positive'}`}><span className="admin-status-dot"/>{user.isBlocked ? 'Blocked' : 'Active'}</span></td>
            <td>{user.date ? new Date(user.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not recorded'}</td>
            <td><div className="admin-row-actions"><button aria-label={`Edit access for ${user.userName}`} className="admin-action" onClick={() => { setUserToEdit(user); setIsEditModalOpen(true); }}><FiEdit2/> Edit access</button><button disabled={pendingUser === user.userName} aria-label={`${user.isBlocked ? 'Unblock' : 'Block'} ${user.userName}`} className={`admin-action ${user.isBlocked ? '' : 'danger'}`} onClick={e => handleToggleBlock(e, user.userName)}>{user.isBlocked ? <FiUnlock/> : <FiLock/>}{pendingUser === user.userName ? 'Updating...' : user.isBlocked ? 'Unblock' : 'Block'}</button></div></td>
          </tr>)}
        </tbody></table>{!currentUsers.length && <div className="admin-empty"><FiSearch size={28}/><h3>No users found</h3><p>Try another name, email, or filter.</p></div>}</div>}
        <div className="admin-pagination"><Pagination totalItems={filteredUsers.length} itemsPerPage={itemsPerPage} currentPage={page} onPageChange={setCurrentPage} showingStart={(page - 1) * itemsPerPage + 1} showingEnd={Math.min(page * itemsPerPage, filteredUsers.length)} /></div>
      </section>

      <UserEditModal key={`${userToEdit?._id}-${isEditModalOpen}`} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={userToEdit} onSave={handleSaveRole} />
      <UserDetailsModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} user={userToView} />
    </div>
  );
};

export default ManageUsers;

import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';

import api from '../../api/axios'; 
import Pagination from '../../components/admin/Pagination';
import UserEditModal from '../../components/admin/UserEditMOdal';
import UserDetailsModal from '../../components/admin/UserDeatailsModal';
import {jwtDecode} from "jwt-decode";

const getRoleBadgeStyle = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin': return 'bg-blue-100 text-blue-700 font-bold';
    case 'madam': return 'bg-purple-100 text-purple-700 font-bold';
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
  const itemsPerPage = 4;

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
      const response = await api.get('/api/users');
      
      const data = Array.isArray(response.data) ? response.data : [];
      setUsers(data.filter(user => user.email !== currentAdminEmail)); 
    } catch (error) { 
      console.error(error); 
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
      const targetRole = filterRole === 'Moderator' ? 'madam' : filterRole.toLowerCase();
      const matchesRole = filterRole === 'All Roles' || user.role === targetRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const handleSaveRole = async (userName, newRole) => {
    try {
      const roleToSend = newRole === 'Moderator' ? 'madam' : newRole;
      
      // 3. 👇 Cleaner URL, headers removed
      await api.put(`/api/users/${userName}`, { role: roleToSend });
      
      await fetchUsers(false); 
      setIsEditModalOpen(false);
    } catch (error) { 
      alert("Failed to update user role"); 
    }
  };

  const handleToggleBlock = async (e, userName) => {
    e.stopPropagation();
    try {
      // 4. 👇 Cleaner URL, headers removed
      await api.put(`/api/users/toggle-block/${userName}`);
      
      fetchUsers(false);
    } catch (error) { 
      alert("Failed to update block status."); 
    }
  };

  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="text-center p-20 font-bold">Loading Data...</div>;

  return (
    <div className="pb-32"> 
      <h1 className="text-3xl font-extrabold text-textDark mb-8">Manage Users</h1>
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-textGray" size={20} />
            <input type="text" placeholder="Search..." className="w-full bg-gray-100 pl-12 pr-4 py-3 rounded-xl outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {['All Roles', 'Admin', 'Moderator', 'User'].map((role) => (
              <button key={role} onClick={() => setFilterRole(role)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${filterRole === role ? 'bg-accent text-white' : 'text-textGray'}`}>{role}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-6 text-xs font-bold text-textGray uppercase">User Name</th>
                <th className="p-6 text-xs font-bold text-textGray uppercase">Email</th>
                <th className="p-6 text-xs font-bold text-textGray uppercase">Role</th>
                <th className="p-6 text-xs font-bold text-textGray uppercase">Date</th>
                <th className="p-6 text-xs font-bold text-textGray uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setUserToView(user); setIsViewModalOpen(true); }}>
                  <td className="p-6 font-bold">{user.userName}</td>
                  <td className="p-6 text-textGray">{user.email}</td>
                  <td className="p-6"><span className={`px-4 py-1.5 rounded-full text-xs uppercase ${getRoleBadgeStyle(user.role)}`}>{user.role === 'madam' ? 'Moderator' : user.role}</span></td>
                  <td className="p-6 text-textGray">{user.date ? new Date(user.date).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-6"><div className="flex justify-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setUserToEdit(user); setIsEditModalOpen(true); }} className="p-2 bg-gray-50 rounded-lg"><FiEdit2 size={18} /></button>
                    <button onClick={(e) => handleToggleBlock(e, user.userName)} className={`p-2 rounded-lg flex items-center gap-1 text-[10px] font-bold uppercase ${user.isBlocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {user.isBlocked ? <FiUnlock size={14} /> : <FiLock size={14} />} {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-0 lg:left-64 bg-white p-6 border-t z-40">
        <Pagination totalItems={filteredUsers.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} showingStart={(currentPage - 1) * itemsPerPage + 1} showingEnd={Math.min(currentPage * itemsPerPage, filteredUsers.length)} />
      </div>

      <UserEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={userToEdit} onSave={handleSaveRole} />
      <UserDetailsModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} user={userToView} />
    </div>
  );
};

export default ManageUsers;
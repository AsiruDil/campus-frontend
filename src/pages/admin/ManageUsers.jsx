import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';
import axios from 'axios';
import Pagination from '../../components/admin/Pagination';
import UserEditModal from '../../components/admin/UserEditMOdal';
import UserDetailsModal from '../../components/admin/UserDeatailsModal';
import {jwtDecode} from "jwt-decode";

const getRoleBadgeStyle = (role) => {
  // Mapping 'madam' to 'moderator' styles for the UI
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
      const token = localStorage.getItem('token'); 

      if (!token) {
      console.error("No token found");
      return;
    }
      const decoded = jwtDecode(token);
      const currentAdminEmail = decoded.email;

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // NEW UPDATION: Backend 'getAllUsers' now returns a direct array
      const data = Array.isArray(response.data) ? response.data : [];
      
      const otherUsers = data.filter(user => user.email !== currentAdminEmail);
      setUsers(otherUsers); 
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const name = user.userName || "";
      const email = user.email || "";
      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const targetRole = filterRole === 'Moderator' ? 'madam' : filterRole.toLowerCase();
      const matchesRole = filterRole === 'All Roles' || user.role === targetRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  const handleSaveRole = async (userName, newRole) => {
    try {
      const token = localStorage.getItem('token');
      // UI uses 'Moderator', Backend requires 'madam'
      const roleToSend = newRole === 'Moderator' ? 'madam' : newRole;

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userName}`, 
        { role: roleToSend }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUsers(false); 
      setIsEditModalOpen(false);
    }catch (error) {
  // Show backend error message if available, otherwise show generic
  const msg = error.response?.data?.message || error.message;
  alert(`Failed to update user role: ${msg}`);
  console.log(error.response); // optional, for full backend response
}
  };

  const handleToggleBlock = async (e, userName) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/toggle-block/${userName}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(false);
    } catch (error) {
      alert("Failed to update block status.");
    }
  };

  const handleViewDetails = (user) => {
    setUserToView(user);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (e, user) => {
    e.stopPropagation();
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <div className="text-center p-20 font-bold">Loading Data...</div>;

  return (
    <div className="pb-32"> 
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-textDark">Manage Users</h1>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-2xl">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-textGray" size={20} />
            <input
              type="text"
              placeholder="Search by username or email..."
              className="w-full bg-gray-100 pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['All Roles', 'Admin', 'Moderator', 'User'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filterRole === role ? 'bg-primary text-white shadow-sm' : 'text-textGray'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-6 text-xs font-bold text-textGray uppercase">User Name</th>
              <th className="p-6 text-xs font-bold text-textGray uppercase">Email</th>
              <th className="p-6 text-xs font-bold text-textGray uppercase">Role</th>
              <th className="p-6 text-xs font-bold text-textGray uppercase">Date Registered</th>
              <th className="p-6 text-xs font-bold text-textGray uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentUsers.map((user) => (
              <tr 
                key={user._id} 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewDetails(user)} 
              >
                <td className="p-6 font-bold text-textDark">{user.userName}</td>
                <td className="p-6 text-textGray font-medium">{user.email}</td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-full text-xs uppercase ${getRoleBadgeStyle(user.role)}`}>
                    {user.role === 'madam' ? 'Moderator' : user.role}
                  </span>
                </td>
                <td className="p-6 text-textGray font-medium">
                  {user.date ? new Date(user.date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="p-6 text-center">
                   <div className="flex justify-center gap-2">
                      <button 
                        onClick={(e) => handleEditClick(e, user)} 
                        className="text-textGray hover:text-primary transition-colors p-2 bg-gray-50 rounded-lg relative z-10"
                      >
                        <FiEdit2 size={18} />
                      </button>

                      <button 
                        onClick={(e) => handleToggleBlock(e, user.userName)}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-1 font-bold text-[10px] uppercase ${
                          user.isBlocked 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        } relative z-10`}
                      >
                        {user.isBlocked ? <FiUnlock size={14} /> : <FiLock size={14} />}
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fixed bottom-0 right-0 left-64 bg-gray-50 p-6 border-t border-gray-200 z-40">
        <Pagination 
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          showingStart={filteredUsers.length === 0 ? 0 : indexOfFirstItem + 1}
          showingEnd={Math.min(indexOfLastItem, filteredUsers.length)}
        />
      </div>

      <UserEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userToEdit}
        onSave={handleSaveRole}
      />

      <UserDetailsModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        user={userToView} 
      />
    </div>
  );
};

export default ManageUsers;
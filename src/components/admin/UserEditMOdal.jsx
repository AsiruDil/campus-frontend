import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const UserEditModal = ({ isOpen, onClose, user, onSave }) => {
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.userName, selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-full mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-textDark">Edit User Role</h3>
          <button onClick={onClose} className="text-textGray hover:text-textDark">
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="mb-4 text-textGray text-sm">
            Changing role for: <br/>
            <span className="font-bold text-textDark text-base">{user.userName}</span> 
            <span className="block text-xs text-textGray">({user.email})</span>
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-textGray">Select Role</label>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 font-medium"
            >
              {/* Using lowercase to match standard DB values, or Admin/Employer as you prefer */}
              <option value="user">User</option>
              <option value="madam">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md font-medium text-textGray hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-blue-600 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
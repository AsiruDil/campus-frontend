// src/pages/Madam.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderMadam from './headerMadam';

// ==========================================
// 1. MAIN PAGE COMPONENT
// ==========================================
export default function Madam() {
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 4;

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/apply`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // --- NEW SORTING LOGIC ADDED HERE ---
        // Sort by date descending (Latest first)
        const sortedData = response.data.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        // Map Backend Data to Frontend Structure
        const mappedUsers = sortedData.map(user => ({
          name: user.userName || user.firstName, 
          email: user.email,
          post: capitalizeFirstLetter(user.jobRole), // using jobRole
          rawRole: user.jobRole, 
          date: new Date(user.date).toISOString().split('T')[0],
          cv: user.cv
        }));

        setApplicants(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch applicants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const capitalizeFirstLetter = (string) => {
    if (!string) return "User";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // --- FILTER LOGIC (Search Only) ---
  const filteredUsers = applicants.filter(user => {
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // --- PAGINATION LOGIC ---
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
        <HeaderMadam/>

      <main className="max-w-7xl mx-auto mt-20 p-8">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Applicant Overview</h1>
            <p className="text-gray-500 text-md">
              {isLoading ? "Loading data..." : `Reviewing ${filteredUsers.length} applicants`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Search Bar Component */}
          <SearchBar onSearch={(val) => {
             setSearchQuery(val);
             setCurrentPage(1); // Reset to page 1 on search
          }} />
          
          {/* User Table Component */}
          {isLoading ? (
            <div className="p-10 text-center text-gray-500">Loading users from database...</div>
          ) : currentUsers.length > 0 ? (
            <UserTable users={currentUsers} />
          ) : (
            <div className="p-10 text-center text-gray-500">No applicants found.</div>
          )}
          
          {/* Pagination Controls */}
          <div className="p-6 flex justify-between items-center bg-white border-t border-gray-50">
            <p className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
              >Previous</button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages || totalPages === 0}
              >Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ==========================================
// 2. SEARCH BAR COMPONENT (Formerly FilterBar)
// ==========================================
function SearchBar({ onSearch }) {
  return (
    <div className="p-6 bg-white border-b border-gray-50 relative">
      <div className="flex gap-4">
        {/* Search Input Only */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. USER TABLE COMPONENT
// ==========================================
function UserTable({ users }) {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          <th className="p-4 text-xs font-bold text-gray-400 uppercase">User Name</th>
          <th className="p-4 text-xs font-bold text-gray-400 uppercase">Email</th>
          <th className="p-4 text-xs font-bold text-gray-400 uppercase">Requested Post</th>
          <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-50">
        {users.map((user,index) => (
          <tr key={index} className="hover:bg-blue-50/30">
            <td className="p-4 font-medium">
              {user.name} 
            </td>
            <td className="p-4 text-gray-500">
              {user.email}
            </td>
            <td className="p-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold 
                ${user.post === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                  user.post === 'Madam' ? 'bg-pink-100 text-pink-700' : 
                  'bg-amber-100 text-amber-700'}`}>
                {user.post}
              </span>
            </td>
            <td className="p-4 text-center">
              {user.cv ? (
                <a
                  href={user.cv}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  Preview CV ↗
                </a>
              ) : (
                <span className="text-gray-300 text-sm">No CV</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
// src/pages/Madam.jsx
import { useState, useEffect } from 'react';
// 1. 👇 Swapped axios for your custom api instance
import api from '../../api/axios'; 
import HeaderMadam from './headerMadam';
import { FiMail, FiX } from 'react-icons/fi'; 

export default function Madam() {
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 4;

  // --- CHANGED: Use selectedRows instead of selectedEmails ---
  const [selectedRows, setSelectedRows] = useState([]); 
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // 2. 👇 Cleaner GET request without manual headers or long URLs
        const response = await api.get(`/api/apply`);

        // Sort by date descending (Latest first)
        const sortedData = response.data.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        // Map Backend Data
        const mappedUsers = sortedData.map((user, index) => ({
          id: user._id || `${user.email}-${index}`, // ✅ ADDED UNIQUE ID for independent selection
          name: user.userName || user.firstName, 
          email: user.email,
          post: capitalizeFirstLetter(user.jobRole), 
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

  // --- CHANGED: Checkbox Logic (Works by Row ID now) ---
  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = currentUsers.map(u => u.id);
      const newSelections = [...new Set([...selectedRows, ...pageIds])];
      setSelectedRows(newSelections);
    } else {
      const pageIds = currentUsers.map(u => u.id);
      setSelectedRows(selectedRows.filter(id => !pageIds.includes(id)));
    }
  };

  const isAllCurrentPageSelected = currentUsers.length > 0 && currentUsers.every(u => selectedRows.includes(u.id));

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      alert("Please enter both a subject and a message.");
      return;
    }
    
    // ✅ Extract unique emails from the specific rows you selected
    const uniqueEmailsToSend = [...new Set(
      applicants
        .filter(app => selectedRows.includes(app.id))
        .map(app => app.email)
    )];

    setIsSending(true);
    try {
      // 3. 👇 Cleaner POST request!
      await api.post(`/api/users/send-email`, {
        emails: uniqueEmailsToSend, // Send the unique emails
        subject: emailSubject,
        message: emailMessage
      });

      alert("Emails sent successfully!");
      setIsEmailModalOpen(false);
      setSelectedRows([]); // Clear selections after success
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      console.error(error);
      alert("Failed to send emails.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] relative">
        <HeaderMadam/>

      <main className="max-w-7xl mx-auto mt-20 p-4 sm:p-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Applicant Overview</h1>
            <p className="text-gray-500 text-md">
              {isLoading ? "Loading data..." : `Reviewing ${filteredUsers.length} applications`}
            </p>
          </div>
          
          {/* Send Email Button */}
          {selectedRows.length > 0 && (
            <button 
              onClick={() => setIsEmailModalOpen(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <FiMail size={18} />
              Send Email ({selectedRows.length})
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Search Bar Component */}
          <SearchBar onSearch={(val) => {
             setSearchQuery(val);
             setCurrentPage(1); 
          }} />
          
          {/* User Table Component */}
          {isLoading ? (
            <div className="p-10 text-center text-gray-500">Loading users from database...</div>
          ) : currentUsers.length > 0 ? (
            <UserTable 
              users={currentUsers} 
              selectedRows={selectedRows}
              handleSelectRow={handleSelectRow}
              handleSelectAll={handleSelectAll}
              isAllSelected={isAllCurrentPageSelected}
            />
          ) : (
            <div className="p-10 text-center text-gray-500">No applicants found.</div>
          )}
          
          {/* Pagination Controls */}
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border-t border-gray-50">
            <p className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</p>
            <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed w-full sm:w-auto"
                disabled={currentPage === 1}
              >Previous</button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed w-full sm:w-auto"
                disabled={currentPage === totalPages || totalPages === 0}
              >Next</button>
            </div>
          </div>
        </div>
      </main>

      {/* Email Compose Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center font-popins p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-4 sm:p-6 relative">
            <button 
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <FiX size={24} />
            </button>
            
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FiMail className="text-blue-600" /> Compose Email
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Sending to <span className="font-bold text-blue-600">{
                [...new Set(applicants.filter(app => selectedRows.includes(app.id)).map(app => app.email))].length
              }</span> applicant(s) based on your selection.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g., Job Application Status..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                <textarea 
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Type your message here. The applicants will receive this directly."
                  rows="6"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={isSending}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                {isSending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchBar({ onSearch }) {
  return (
    <div className="p-4 sm:p-6 bg-white border-b border-gray-50 relative">
      <div className="flex gap-4">
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

function UserTable({ users, selectedRows, handleSelectRow, handleSelectAll, isAllSelected }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left whitespace-nowrap">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase">User Name</th>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase">Email</th>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase">Requested Post</th>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Actions</th>
            
            <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">
              <input 
                type="checkbox" 
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 cursor-pointer accent-blue-600"
              />
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {users.map((user) => (
            <tr key={user.id} className={`hover:bg-blue-50/30 ${selectedRows.includes(user.id) ? 'bg-blue-50/50' : ''}`}>
              <td className="p-4 font-medium">{user.name}</td>
              <td className="p-4 text-gray-500">{user.email}</td>
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
              
              <td className="p-4 text-center">
                <input 
                  type="checkbox" 
                  checked={selectedRows.includes(user.id)}
                  onChange={() => handleSelectRow(user.id)}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
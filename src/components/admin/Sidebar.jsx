import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiUsers, FiBriefcase, FiX, FiCamera, FiSave, FiLogOut } from 'react-icons/fi';
import Modal from 'react-modal';
import { supabase } from "../../util/supabase"

import api from '../../api/axios'; 
import toast, { Toaster } from 'react-hot-toast';
import { jwtDecode } from "jwt-decode"; 

Modal.setAppElement('#root');

const SidebarItem = ({ to, icon: Icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
        // 👇 CHANGED HERE: Added standard Tailwind background/text colors for the active state
        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = ({ isMobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState('/profile.png');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "", idNumber: "", age: "-", sex: "-", birthday: "" });
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) { setIsLoading(false); return; }
        const decoded = jwtDecode(token);
        const userName = decoded.userName || decoded.sub;
        
        const response = await api.get(`/api/users/${userName}`);
        
        if (response.data) {
          const user = response.data;
          setUserData({ name: user.userName || '', email: user.email || '', idNumber: user.id || '', age: user.age || '-', sex: user.gender || '-', birthday: user.birthday || '' });
          if (user.img) setProfileImage(user.img);
        }
      } catch (error) { 
        console.error("Error fetching profile data:", error); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchUserData();
  }, [token]);

  const handleIdChange = (e) => {
    const nic = e.target.value;
    let age = "-"; let sex = "-"; let birthday = "";
    if (nic.length === 10 || nic.length === 12) {
      let year = ""; let dayText = 0;
      if (nic.length === 10) { year = "19" + nic.substr(0, 2); dayText = parseInt(nic.substr(2, 3)); }
      else { year = nic.substr(0, 4); dayText = parseInt(nic.substr(4, 3)); }
      if (dayText > 500) { sex = "Female"; dayText -= 500; } else { sex = "Male"; }
      dayText -= 1;
      const birthYear = parseInt(year);
      const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const isLeapYear = (birthYear % 4 === 0 && birthYear % 100 !== 0) || birthYear % 400 === 0;
      if (isLeapYear) daysInMonths[1] = 29;
      let month = 0; let day = dayText;
      for (let i = 0; i < daysInMonths.length; i++) {
        if (day >= daysInMonths[i]) { day -= daysInMonths[i]; month++; } else break;
      }
      birthday = `${birthYear}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const today = new Date();
      age = today.getFullYear() - birthYear;
      if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day + 1)) age--;
    }
    setUserData((prev) => ({ ...prev, idNumber: nic, age, sex, birthday }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) { setPreviewImage(URL.createObjectURL(file)); setSelectedFile(file); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving changes...");
    try {
      let finalImageUrl = profileImage;
      if (selectedFile) {
        if (profileImage && profileImage.includes("supabase")) {
          const oldFileName = profileImage.split("/profiles/")[1]?.split("?")[0];
          if (oldFileName) await supabase.storage.from("im").remove([`profiles/${oldFileName}`]);
        }
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("im").upload(filePath, selectedFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("im").getPublicUrl(filePath);
        finalImageUrl = `${data.publicUrl}?t=${Date.now()}`;
      }
      
      const updateUser = { id: userData.idNumber, age: userData.age !== '-' ? userData.age : null, gender: userData.sex !== '-' ? userData.sex : null, birthday: userData.birthday || null, img: finalImageUrl };
      
      await api.put(`/api/users/${userData.name}`, updateUser);
      
      setProfileImage(finalImageUrl); setPreviewImage(null); setSelectedFile(null); setIsModalOpen(false);
      toast.success("Profile updated successfully ✅", { id: toastId });
    } catch (error) { 
      toast.error("Failed to update profile ❌", { id: toastId }); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleLogout = () => { if(window.confirm("Are you sure you want to logout?")) { localStorage.removeItem("token"); navigate("/"); } };

  return (
    <>
      <Toaster position="top-right" />
      <div className={`w-64 lg:mt-0 sm:mt-15 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-40 transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div onClick={() => setIsModalOpen(true)} className="p-6 flex items-center gap-4 mb-6 hover:bg-gray-50 transition-all cursor-pointer">
          <img src={previewImage || profileImage} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" alt="Admin" onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Admin"; }} />
          <div className="overflow-hidden">
            <h3 className="font-bold text-textDark truncate">{userData.name || "Admin"}</h3>
            <p className="text-[10px] text-textGray truncate">{userData.email || "admin@gmail.com"}</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <div onClick={() => setMobileOpen(false)}>
            <SidebarItem to="/admin/users" icon={FiUsers} label="Manage Users" isActive={location.pathname.includes('/admin/users')} />
          </div>
          <div onClick={() => setMobileOpen(false)}>
            <SidebarItem to="/admin/vacancies" icon={FiBriefcase} label="Manage Job Vacancies" isActive={location.pathname.includes('/admin/vacancies')} />
          </div>
        </nav>

        {/* LOGOUT BUTTON AT THE BOTTOM */}
        <div className="p-4 border-t border-gray-50 mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors font-medium text-red-500 cursor-pointer"
          >
            <FiLogOut className='lg:mb-0 sm:mb-25' size={20} />
            <span className='lg:mb-0 sm:mb-25'>Logout</span>
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="md:max-w-2xl lg:w-[30%] w-[90%] mx-auto mt-20 bg-white rounded-2xl shadow-2xl outline-none overflow-hidden relative z-[70]" overlayClassName="fixed inset-0 bg-black/60 flex justify-center items-start z-[60]">
        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-20 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition"><FiX size={24} /></button>
        <div className="relative">
          <div className="h-16 bg-blue-50"></div>
          <div className="px-6 pb-6">
            <div className="relative -mt-12 mb-4 flex justify-center items-center">
              <div className="relative">
                <img src={previewImage || profileImage} className="w-[80px] h-[80px] rounded-full object-cover border-4 border-white shadow-md" alt="Profile" />
                <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg border-2 border-white transform hover:scale-110"><FiCamera size={14} /></button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
            </div>
            <h2 className="text-2xl text-center font-bold text-gray-800 mb-1">{userData.name}</h2>
            <p className="text-gray-500 text-center text-sm mb-6">{userData.email}</p>
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <label className="text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input type="text" value={userData.idNumber} onChange={handleIdChange} className="w-full max-w-[260px] text-center px-2 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-center gap-4">
                <div className="w-[180px] text-center bg-gray-50 p-3 rounded-lg border">
                  <span className="block text-xs font-semibold text-gray-500">BIRTHDAY</span>
                  <input type="date" value={userData.birthday} onChange={(e) => setUserData({ ...userData, birthday: e.target.value })} className="w-full bg-transparent text-center font-medium" />
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <div className="w-[100px] text-center bg-gray-50 p-3 rounded-lg border">
                  <span className="block text-xs font-semibold text-gray-500">AGE</span>
                  <span className="text-lg font-medium">{userData.age}</span>
                </div>
                <div className="w-[100px] text-center bg-gray-50 p-3 rounded-lg border">
                  <span className="block text-xs font-semibold text-gray-500">GENDER</span>
                  <span className="text-lg font-medium">{userData.sex}</span>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3 pt-4 border-t">
              <button onClick={handleSave} disabled={isSaving} className="w-full max-w-[250px] flex items-center justify-center gap-2 bg-blue-500 text-white py-2.5 rounded-lg font-medium disabled:opacity-70"><FiSave /> {isSaving ? 'Saving...' : 'Save Changes'}</button>
              <button onClick={handleLogout} className="w-full max-w-[250px] flex items-center justify-center gap-2 bg-red-50 text-red-500 border border-red-200 py-2.5 rounded-lg font-medium"><FiLogOut /> Logout</button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
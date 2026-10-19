import { uploadProfilePhoto } from "../../util/uploadProfilePhoto";
import { profileImageUrl, useDefaultProfileImage } from "../../util/profileImage";
import ProfileModal from "../ProfileModal";
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiUsers, FiBriefcase, FiX, FiCamera, FiSave, FiLogOut } from 'react-icons/fi';
import Modal from 'react-modal';

import api from '../../api/axios';
import toast from 'react-hot-toast';
import { jwtDecode } from "jwt-decode";

Modal.setAppElement('#root');

const SidebarItem = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
        // 👇 CHANGED HERE: Added standard Tailwind background/text colors for the active state
        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {React.createElement(icon, { size: 20 })}
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
  const [, setIsLoading] = useState(true);
  const [, setIsSaving] = useState(false);
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
          if (user.img) setProfileImage(profileImageUrl(user.img));
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
      if (selectedFile) finalImageUrl = await uploadProfilePhoto(selectedFile);

      const updateUser = { id: userData.idNumber, age: userData.age !== '-' ? userData.age : null, gender: userData.sex !== '-' ? userData.sex : null, birthday: userData.birthday || null, img: finalImageUrl.includes("/api/users/avatar/") ? new URL(finalImageUrl, window.location.origin).pathname : finalImageUrl };

      await api.put(`/api/users/${userData.name}`, updateUser);

      setProfileImage(finalImageUrl); setPreviewImage(null); setSelectedFile(null); setIsModalOpen(false);
      toast.success("Profile updated successfully ✅", { id: toastId });
    } catch {
      toast.error("Failed to update profile ❌", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => { if(window.confirm("Are you sure you want to logout?")) { localStorage.removeItem("token"); navigate("/"); } };

  return (
    <>
      <div className={`w-64 lg:mt-0 sm:mt-15 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-40 transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div role="button" tabIndex={0} aria-label="Open profile" onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setIsModalOpen(true); } }} onClick={() => setIsModalOpen(true)} className="p-6 flex items-center gap-4 mb-6 hover:bg-gray-50 transition-all cursor-pointer">
          <img src={previewImage || profileImage} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" alt="Admin" onError={useDefaultProfileImage} />
          <div className="overflow-hidden">
            <h3 className="font-bold text-textDark truncate">{userData.name || "Super Admin"}</h3>
            <p className="text-[10px] text-textGray truncate">{userData.email || "admin@gmail.com"}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div onClick={() => setMobileOpen(false)}>
            <SidebarItem to="/super-admin/users" icon={FiUsers} label="Manage Users" isActive={location.pathname.includes('/super-admin/users')} />
          </div>
          <div onClick={() => setMobileOpen(false)}>
            <SidebarItem to="/super-admin/vacancies" icon={FiBriefcase} label="Manage Job Vacancies" isActive={location.pathname.includes('/super-admin/vacancies')} />
          </div>
          <div onClick={() => setMobileOpen(false)}>
            <SidebarItem to="/super-admin/applications" icon={FiUsers} label="Applications" isActive={location.pathname.includes('/super-admin/applications')} />
          </div>
          <div onClick={() => setMobileOpen(false)}>
            <SidebarItem to="/super-admin/activity-logs" icon={FiUsers} label="Activity Log" isActive={location.pathname.includes('/super-admin/activity-logs')} />
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

      <ProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userData={userData} setUserData={setUserData} image={previewImage || profileImage} onImageChange={handleImageUpload} fileInputRef={fileInputRef} onIdChange={handleIdChange} onSave={handleSave} onLogout={handleLogout} role="Super Admin"/>
    </>
  );
};

export default Sidebar;

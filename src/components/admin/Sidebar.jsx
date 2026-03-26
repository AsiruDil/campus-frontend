import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiUsers, FiBriefcase, FiX, FiCamera, FiSave, FiLogOut } from 'react-icons/fi';
import Modal from 'react-modal';
import { supabase } from "../../util/supabase"
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { jwtDecode } from "jwt-decode"; 

// Important for accessibility
Modal.setAppElement('#root');

const SidebarItem = ({ to, icon: Icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
        isActive ? 'bg-sidebarActive ' : 'text-textGray hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- MODAL & FORM STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState('https://api.dicebear.com/9.x/adventurer/svg?seed=Admin');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    idNumber: "",
    age: "-",
    sex: "-",
    birthday: "",
  });

  const token = localStorage.getItem('token');

  // --- SUPABASE CONNECTION ---

  // --- 1. FETCH USER DATA ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) {
          setIsLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const userName = decoded.userName || decoded.sub;

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${userName}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data) {
          const user = response.data;
          setUserData({
            name: user.userName || '',
            email: user.email || '',
            idNumber: user.id || '',
            age: user.age || '-',
            sex: user.gender || '-',
            birthday: user.birthday || '',
          });

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

  // --- 2. NIC LOGIC ---
  const handleIdChange = (e) => {
    const nic = e.target.value;
    let age = "-";
    let sex = "-";
    let birthday = "";

    if (nic.length === 10 || nic.length === 12) {
      let year = "";
      let dayText = 0;

      if (nic.length === 10) {
        year = "19" + nic.substr(0, 2);
        dayText = parseInt(nic.substr(2, 3));
      } else {
        year = nic.substr(0, 4);
        dayText = parseInt(nic.substr(4, 3));
      }

      if (dayText > 500) {
        sex = "Female";
        dayText -= 500;
      } else {
        sex = "Male";
      }

      dayText -= 1;
      const birthYear = parseInt(year);
      const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const isLeapYear = (birthYear % 4 === 0 && birthYear % 100 !== 0) || birthYear % 400 === 0;

      if (isLeapYear) daysInMonths[1] = 29;

      let month = 0;
      let day = dayText;

      for (let i = 0; i < daysInMonths.length; i++) {
        if (day >= daysInMonths[i]) {
          day -= daysInMonths[i];
          month++;
        } else {
          break;
        }
      }

      birthday = `${birthYear}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const today = new Date();
      age = today.getFullYear() - birthYear;
      if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day + 1)) {
        age--;
      }
    }

    setUserData((prev) => ({
      ...prev,
      idNumber: nic,
      age: age,
      sex: sex,
      birthday: birthday,
    }));
  };

  // --- 3. IMAGE UPLOAD ---
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // --- 4. SAVE & LOGOUT ---
  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving changes...");

    try {
      let finalImageUrl = profileImage;

      if (selectedFile) {
        if (profileImage && profileImage.includes("supabase") && !profileImage.startsWith("blob:")) {
          const oldFileName = profileImage.split("/profiles/")[1].split("?")[0];
          await supabase.storage.from("im").remove([`profiles/${oldFileName}`]);
        }

        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("im").upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("im").getPublicUrl(filePath);
        finalImageUrl = `${data.publicUrl}?t=${Date.now()}`;
      }

      const updateUser = {
        id: userData.idNumber,
        age: userData.age !== '-' ? userData.age : null,
        gender: userData.sex !== '-' ? userData.sex : null,
        birthday: userData.birthday || null,
        img: finalImageUrl,
      };

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${userData.name}`,
        updateUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status !== 200) throw new Error("MongoDB update failed");

      setProfileImage(finalImageUrl);
      setPreviewImage(null);
      setSelectedFile(null);
      setIsModalOpen(false);

      toast.success("Profile updated successfully ✅", { id: toastId });
    } catch (error) {
      console.error("Profile save error:", error);
      toast.error("Failed to update profile ❌", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-40">
        
        {/* --- TRIGGER: Profile Header Area --- */}
        <div 
          onClick={() => setIsModalOpen(true)} 
          className="p-6 flex items-center gap-4 mb-6 hover:bg-gray-50 transition-all cursor-pointer"
        >
          <img
            src={previewImage || profileImage}
            alt="Admin"
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 hover:border-primary transition-colors"
            onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Admin"; }}
          />
          <div className="overflow-hidden">
            <h3 className="font-bold text-textDark truncate">{userData.name || "Admin"}</h3>
            <p className="text-[10px] text-textGray truncate">{userData.email || "admin@gmail.com"}</p>
          </div>
        </div>

        {/* --- NAVIGATION LINKS --- */}
        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem
            to="/admin/users"
            icon={FiUsers}
            label="Manage Users"
            isActive={location.pathname.includes('/admin/users')}
          />
          <SidebarItem
            to="/admin/vacancies"
            icon={FiBriefcase}
            label="Manage Job Vacancies"
            isActive={location.pathname.includes('/admin/vacancies')}
          />
        </nav>
      </div>

      {/* --- PROFILE MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="md:max-w-2xl lg:w-[30%] lg:mr-45 md:mr-20 sm:w-[50%] md:w-[50%] mx-auto mt-20 bg-white rounded-2xl shadow-2xl outline-none font-popins overflow-hidden relative z-[70]"
        overlayClassName="fixed inset-0 bg-black/60 flex justify-end items-start z-[60]"
      >
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 z-20 text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition"
        >
          <FiX size={24} />
        </button>

        <div className="relative">
          <div className="h-16 bg-blue-50"></div>

          <div className="px-6 pb-6 md:px-8">
            <div className="relative -mt-12 mb-4 flex justify-center items-center">
              <div className="relative group">
                <div className="border-4 border-white rounded-full bg-white p-1 shadow-md">
                  <img
                    src={previewImage || profileImage}
                    className="w-[80px] h-[80px] rounded-full object-cover"
                    alt="Profile"
                  />
                </div>

                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white transition-all transform hover:scale-110"
                  title="Change Profile Photo"
                >
                  <FiCamera size={14} />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <h2 className="text-2xl text-center font-bold text-gray-800 mb-1">
              {userData.name || 'Admin'}
            </h2>
            <p className="text-gray-500 text-center text-sm mb-6">
              {userData.email}
            </p>

            <div className="space-y-4">
              <div className="flex flex-col justify-center items-center">
                <label className="block text-sm font-medium text-center text-gray-700 mb-1">
                  ID Number
                </label>
                <input
                  type="text"
                  value={userData.idNumber}
                  onChange={handleIdChange}
                  placeholder="Enter NIC (e.g., 123456789V)"
                  className="w-[260px] text-center px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="flex justify-center items-center gap-4">
                <div className="w-[200px] text-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">BirthDay</span>
                  <input
                    type="date"
                    value={userData.birthday}
                    onChange={(e) => setUserData({ ...userData, birthday: e.target.value })}
                    className="w-full bg-transparent text-center text-lg font-medium text-gray-800 outline-none focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-center items-center gap-4">
                <div className="w-[100px] text-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Age</span>
                  <span className="text-lg font-medium text-gray-800">{userData.age || "-"}</span>
                </div>
                <div className="w-[100px] text-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Gender</span>
                  <span className="text-lg font-medium text-gray-800">{userData.sex || "-"}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 w-[50%] flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition shadow-sm hover:shadow-md disabled:opacity-70"
              >
                <FiSave /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 w-[50%] flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 py-2.5 rounded-lg font-medium transition"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
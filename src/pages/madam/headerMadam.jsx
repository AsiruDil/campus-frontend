import { uploadProfilePhoto } from "../../util/uploadProfilePhoto";
import { profileImageUrl, useDefaultProfileImage } from "../../util/profileImage";
import ProfileModal from "../../components/ProfileModal";
// src/components/HeaderMadam.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiLogOut, FiSave, FiX, FiCamera } from "react-icons/fi";
// 1. 👇 Swapped axios for your custom api instance (Adjust path if needed)
import api from "../../api/axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

Modal.setAppElement("#root");

export default function HeaderMadam() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // State
  const [profileImage, setProfileImage] = useState("/profile.png");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [, setIsloading] = useState(true);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    idNumber: "",
    age: "",
    sex: "",
    birthday: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) {
          setIsloading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const userNameFromToken = decoded.userName;

        // 2. 👇 Cleaner GET request without manual headers or long URLs
        const response = await api.get(`/api/users/${userNameFromToken}`);

        if (response.data) {
          const user = response.data;
          setUserData({
            name: user.userName,
            email: user.email,
            idNumber: user.id || "",
            age: user.age || "",
            sex: user.gender || "",
            birthday: user.birthday || "",
          });

          if (user.img) {
            setProfileImage(profileImageUrl(user.img));
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsloading(false);
      }
    };

    fetchUserData();
  }, [token]);

  // Logic to calculate Age and Sex from Sri Lankan NIC
  const handleIdChange = (e) => {
    const nic = e.target.value;
    let age = ""; let sex = ""; let birthday = "";

    if (nic.length === 10 || nic.length === 12) {
      let year = ""; let dayText = 0;
      if (nic.length === 10) {
        year = "19" + nic.substr(0, 2);
        dayText = parseInt(nic.substr(2, 3));
      } else {
        year = nic.substr(0, 4);
        dayText = parseInt(nic.substr(4, 3));
      }
      if (dayText > 500) { sex = "Female"; dayText -= 500; } else { sex = "Male"; }
      dayText -= 1;
      const birthYear = parseInt(year);
      const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if ((birthYear % 4 === 0 && birthYear % 100 !== 0) || birthYear % 400 === 0) daysInMonths[1] = 29;
      let month = 0; let day = dayText;
      for (let i = 0; i < daysInMonths.length; i++) {
        if (day >= daysInMonths[i]) { day -= daysInMonths[i]; month++; } else break;
      }
      birthday = `${birthYear}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const today = new Date(); age = today.getFullYear() - birthYear;
      if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day + 1)) age--;
    }

    setUserData((prev) => ({ ...prev, idNumber: nic, age, sex, birthday }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };



  async function handleSave() {
    try {
      let finalImageUrl = profileImage;

      if (selectedFile) finalImageUrl = await uploadProfilePhoto(selectedFile);

      const updatePayload = {
        id: userData.idNumber,
        age: userData.age,
        gender: userData.sex,
        birthday: userData.birthday,
        img: finalImageUrl.includes("/api/users/avatar/") ? new URL(finalImageUrl, window.location.origin).pathname : finalImageUrl,
      };

      // 3. 👇 Cleaner PUT request!
      const response = await api.put(`/api/users/${userData.name}`, updatePayload);

      if (response.status === 200) {
        setProfileImage(finalImageUrl);
        setPreviewImage(null);
        setSelectedFile(null);
        setIsModalOpen(false);
        toast.success("Profile updated successfully ✅");
      }
    } catch (error) {
      console.error("Profile save error:", error);
      toast.error("Failed to update profile ❌");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType"); // Good practice to remove this as well
    navigate("/");
  };

  return (
    <>
      <ProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userData={userData} setUserData={setUserData} image={previewImage || profileImage} onImageChange={handleImageUpload} fileInputRef={fileInputRef} onIdChange={handleIdChange} onSave={handleSave} onLogout={handleLogout} role="Admin"/>

      <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-lg font-popins">
        <div className="max-w-7xl mx-auto h-[80px] flex items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <div onClick={() => navigate("/admin")} className="flex items-center gap-2 cursor-pointer">
              <img src="/logo.png" className="h-[45px] md:h-[55px]" alt="Logo" />
              <div className="flex flex-col leading-tight text-left">
                <span className="font-bold text-sm md:text-lg whitespace-nowrap">University of Ruhuna</span>
                <span className="font-bold text-sm md:text-lg">Job <span className="text-accent">Finder</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div role="button" tabIndex={0} aria-label="Open profile" onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setIsModalOpen(true); } }} onClick={() => setIsModalOpen(true)} className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition">
              <img src={profileImage} onError={useDefaultProfileImage} className="w-full h-full rounded-full bg-amber-700 object-cover" alt="Profile" />
            </div>

            <div role="button" tabIndex={0} aria-label="Open profile" onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setIsModalOpen(true); } }} onClick={() => setIsModalOpen(true)} className="hidden md:flex flex-col items-start justify-center cursor-pointer group">
              <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-blue-500 transition">Admin</span>
              <div className="flex items-center gap-1">
                <span className="text-xs md:text-sm font-black text-gray-800 group-hover:text-blue-600 transition max-w-[150px] truncate">{userData.name || "Admin"}</span>
                <span className="animate-pulse text-xs md:text-sm">👋</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

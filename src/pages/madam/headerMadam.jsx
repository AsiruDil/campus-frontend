// src/components/HeaderMadam.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiLogOut, FiSave, FiX, FiCamera } from "react-icons/fi";
import { supabase } from "../../util/supabase"
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

Modal.setAppElement("#root");



export default function HeaderMadam() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // State
  const [profileImage, setProfileImage] = useState("profile.png");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsloading] = useState(true);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    idNumber: "",
    age: "",
    sex: "",
    birthday: "",
  });

  const token = localStorage.getItem("token");

  // ✅ MODIFICATION 2: Dependency array එක [token] ලෙස වෙනස් කර ඇත (Infinite loop වැලැක්වීමට)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) {
          setIsloading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const userNameFromToken = decoded.userName;

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userNameFromToken}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
            setProfileImage(user.img);
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

  const triggerFileInput = () => fileInputRef.current.click();

  // ✅ MODIFICATION 3: handleSave function එක නිවැරදි කර ඇත
  async function handleSave() {
    try {
      let finalImageUrl = profileImage;

      if (selectedFile) {
        // පැරණි image එක delete කිරීමේ කොටස
        if (profileImage && profileImage.includes("supabase") && !profileImage.startsWith("blob:")) {
          const oldFileName = profileImage.split("/profiles/")[1]?.split("?")[0];
          if (oldFileName) {
            await supabase.storage.from("im").remove([`profiles/${oldFileName}`]);
          }
        }

        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("im").upload(filePath, selectedFile);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("im").getPublicUrl(filePath);
        finalImageUrl = `${data.publicUrl}?t=${Date.now()}`;
      }

      const updatePayload = {
        id: userData.idNumber,
        age: userData.age,
        gender: userData.sex,
        birthday: userData.birthday,
        img: finalImageUrl,
      };

      // 🔴 Backend එකට userName එක param එකක් ලෙස යැවීම
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${userData.name}`, 
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
    navigate("/");
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="md:max-w-2xl lg:w-[30%] lg:mr-45 md:mr-20 sm:w-[50%] md:w-[50%] mx-auto mt-20 bg-primary rounded-2xl shadow-2xl outline-none font-popins overflow-hidden relative"
        overlayClassName="fixed inset-0 bg-black/60 flex justify-end items-start z-[60]"
      >
        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-20 text-gray-500 hover:text-red-500 bg-white/50 hover:bg-white rounded-full p-2 transition">
          <FiX size={24} />
        </button>

        <div className="relative">
          <div className="h-15 "></div>
          <div className="px-6 pb-6 md:px-8">
            <div className="relative -mt-12 mb-4 flex justify-center items-center">
              <div className="relative group">
                <div className="border-4 border-accent rounded-full bg-white p-1 shadow-md">
                  <img src={previewImage || profileImage} className="w-[80px] h-[80px] rounded-full object-cover" alt="Profile" />
                </div>
                <button onClick={triggerFileInput} className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white transition-all transform hover:scale-110">
                  <FiCamera size={14} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
            </div>

            <h2 className="text-2xl text-center font-bold text-gray-800 mb-1">{userData.name}</h2>
            <p className="text-gray-500 text-center text-sm mb-6">{userData.email}</p>

            <div className="space-y-4">
              <div className="flex flex-col justify-center items-center">
                <label className="block text-sm font-medium text-center text-gray-700 mb-1">ID Number</label>
                <input type="text" value={userData.idNumber} onChange={handleIdChange} placeholder="Enter NIC" className="w-[260px] text-center px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none transition" />
              </div>

              <div className="flex justify-center items-center gap-4">
                <div className="w-[200px] text-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">BirthDay</span>
                  <input type="date" value={userData.birthday} onChange={(e) => setUserData({ ...userData, birthday: e.target.value })} className="w-full bg-transparent text-center text-lg font-medium text-gray-800 outline-none cursor-pointer" />
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
              <button onClick={handleSave} className="flex-1 w-[50%] flex items-center justify-center gap-2 bg-blue-500 hover:bg-accent text-white py-2.5 rounded-lg font-medium transition shadow-sm hover:shadow-md">
                <FiSave /> Save Changes
              </button>
              <button onClick={handleLogout} className="flex-1 w-[50%] flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 py-2.5 rounded-lg font-medium transition">
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-lg font-popins">
        <div className="max-w-7xl mx-auto h-[80px] flex items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <div onClick={() => navigate("/madam")} className="flex items-center gap-2 cursor-pointer">
              <img src="/logo.png" className="h-[45px] md:h-[55px]" alt="Logo" />
              <div className="flex flex-col leading-tight text-left">
                <span className="font-bold text-sm md:text-lg whitespace-nowrap">University of Ruhuna</span>
                <span className="font-bold text-sm md:text-lg">Job <span className="text-accent">Finder</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div onClick={() => setIsModalOpen(true)} className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition">
              <img src={profileImage} className="w-full h-full rounded-full bg-amber-700 object-cover" alt="Profile" />
            </div>

            <div onClick={() => setIsModalOpen(true)} className="hidden md:flex flex-col items-start justify-center cursor-pointer group">
              <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-blue-500 transition">Moderator</span>
              <div className="flex items-center gap-1">
                <span className="text-xs md:text-sm font-black text-gray-800 group-hover:text-blue-600 transition max-w-[150px] truncate">{userData.name || "Madam"}</span>
                <span className="animate-pulse text-xs md:text-sm">👋</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
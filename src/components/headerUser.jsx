import { uploadProfilePhoto } from "../util/uploadProfilePhoto";
import { profileImageUrl, useDefaultProfileImage } from "../util/profileImage";
import ProfileModal from "./ProfileModal";
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import Modal from "react-modal"
import { IoMdNotificationsOutline } from "react-icons/io"
import { FiMenu, FiLogOut, FiSave, FiX, FiCamera } from "react-icons/fi"

import api from "../api/axios"
import toast from "react-hot-toast"
import { jwtDecode } from "jwt-decode"

Modal.setAppElement("#root")

export default function HeaderUser() {
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);

  const handleNotifClick = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }

    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  const fileInputRef = useRef(null)
  const [profileImage, setProfileImage] = useState("/profile.png")
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [, setIsloading] = useState(true)

  const [userData, setUserData] = useState({
    name: "", email: "", idNumber: "", age: "", sex: "", birthday: ""
  })

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) { setIsloading(false); return; }
        const decoded = jwtDecode(token);
        const userName = decoded.userName;
        const userEmail = decoded.email;

        const response = await api.get(`/api/users/${userName}`);

        if (response.data) {
          const user = response.data;
          setUserData({
            name: user.userName, email: user.email, idNumber: user.id, age: user.age, sex: user.gender, birthday: user.birthday
          });
          if (user.img) setProfileImage(profileImageUrl(user.img));
        }

        const notifRes = await api.get(`/api/users/history/${userEmail}`);

        if (notifRes.data) {
          setNotifications(notifRes.data);
          setUnreadCount(notifRes.data.length);
        }
        setIsloading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsloading(false);
      }
    };
    fetchUserData();
  }, [token]);

  const handleIdChange = (e) => {
    const nic = e.target.value
    let age = ""; let sex = ""; let birthday = "";
    if (nic.length === 10 || nic.length === 12) {
      let year = ""; let dayText = 0;
      if (nic.length === 10) { year = "19" + nic.substr(0, 2); dayText = parseInt(nic.substr(2, 3)); }
      else { year = nic.substr(0, 4); dayText = parseInt(nic.substr(4, 3)); }
      if (dayText > 500) { sex = "Female"; dayText -= 500; } else { sex = "Male"; }
      dayText -= 1;
      const birthYear = parseInt(year);
      const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if ((birthYear % 4 === 0 && birthYear % 100 !== 0) || birthYear % 400 === 0) daysInMonths[1] = 29;
      let month = 0; let day = dayText;
      for (let i = 0; i < daysInMonths.length; i++) { if (day >= daysInMonths[i]) { day -= daysInMonths[i]; month++; } else break; }
      birthday = `${birthYear}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const today = new Date(); age = today.getFullYear() - birthYear;
      if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day + 1)) age--;
    }
    setUserData((prev) => ({ ...prev, idNumber: nic, age, sex, birthday }))
  }

  const handleImageUpload = event => {
    const file = event.target.files[0];
    if (file) { setSelectedFile(file); setPreviewImage(URL.createObjectURL(file)); }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  async function handleSave() {
    try {
      let finalImageUrl = profileImage
      if (selectedFile) finalImageUrl = await uploadProfilePhoto(selectedFile);
      const updateUser = { id: userData.idNumber, age: userData.age, gender: userData.sex, birthday: userData.birthday, img: finalImageUrl.includes("/api/users/avatar/") ? new URL(finalImageUrl, window.location.origin).pathname : finalImageUrl }
      await api.put(`/api/users/${userData.name}`, updateUser);
      setProfileImage(finalImageUrl); setPreviewImage(null); setIsModalOpen(false); setSelectedFile(null);
      window.dispatchEvent(new Event('profile-updated'));
      toast.success("Profile updated successfully ✅");
    } catch {
      toast.error("Failed to update profile ❌");
    }
  }

  useEffect(() => {
    const open = () => setIsModalOpen(true);
    window.addEventListener('open-profile', open);
    return () => window.removeEventListener('open-profile', open);
  }, []);

  return (
    <>
      <ProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userData={userData} setUserData={setUserData} image={previewImage || profileImage} onImageChange={handleImageUpload} fileInputRef={fileInputRef} onIdChange={handleIdChange} onSave={handleSave} onLogout={handleLogout} role="User"/>

      <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-lg font-popins">
        <div className="max-w-7xl mx-auto h-[80px] flex items-center justify-between px-4 relative">

          <div className="flex md:hidden order-1">
            {/* Opens the drawer */}
            <button onClick={() => setIsOpen(true)} className="text-2xl text-black p-2 -ml-2"><FiMenu /></button>
          </div>

          <div onClick={() => navigate("/home/")} className="flex items-center gap-2 cursor-pointer absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 md:order-1">
            <img src="/logo.png" className="h-[45px] md:h-[55px]" alt="Logo" />
            <div className="flex flex-col leading-tight text-center md:text-left">
              <span className="font-bold text-sm md:text-lg whitespace-nowrap">University of Ruhuna</span>
              <span className="font-bold text-sm md:text-lg">Job <span className="text-accent">Finder</span></span>
            </div>
          </div>

          <nav className="hidden md:flex gap-6 font-medium absolute left-1/2 transform -translate-x-1/2">
            <Link to="/home" className="hover:text-accent transition">Home</Link>
            <Link to="/home/about" className="hover:text-accent transition">About Us</Link>
            <Link to="/home/contact" className="hover:text-accent transition">Contact Us</Link>
            {/* <Link to="/home/contact" className="text-green-500 hover:text-green-600">My applications</Link> */}
          </nav>

          <div className="flex items-center gap-4 md:order-3 order-3">
            <div className="relative" ref={notifRef}>
              <button onClick={handleNotifClick} className="text-2xl cursor-pointer hover:text-accent transition relative mt-2">
                <IoMdNotificationsOutline />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 w-2.5 h-2.5 rounded-full border border-white"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-700 text-sm">Notifications</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n._id} className="p-4 border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors text-left">
                          <h4 className="text-sm font-bold text-gray-800">{n.subject}</h4>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div role="button" tabIndex={0} aria-label="Open profile" onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setIsModalOpen(true); } }} onClick={() => setIsModalOpen(true)} className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition">
              <img src={profileImage} onError={useDefaultProfileImage} className="w-full h-full rounded-full bg-amber-700 object-cover" alt="Profile" />
            </div>

            <div role="button" tabIndex={0} aria-label="Open profile" onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setIsModalOpen(true); } }} onClick={() => setIsModalOpen(true)} className="hidden md:flex flex-col items-start justify-center cursor-pointer group">
              <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Welcome Back</span>
              <div className="flex items-center gap-1">
                <span className="text-xs md:text-sm font-black text-gray-800 group-hover:text-blue-600 transition-colors max-w-[150px] truncate">{userData.name || "User"}</span>
                <span className="animate-pulse text-xs md:text-sm">👋</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE DRAWER IMPLEMENTATION --- */}
      {/* Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[70] md:hidden transition-transform duration-300 shadow-2xl ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-[80px] flex items-center justify-between px-6 border-b border-gray-50">
          <span className="font-bold text-lg">Menu</span>
          <button onClick={() => setIsOpen(false)} className="text-2xl text-gray-400"><FiX /></button>
        </div>

        <div className="flex flex-col gap-2 p-6 font-medium">
          <Link to="/home" onClick={() => setIsOpen(false)} className="p-4 rounded-xl hover:bg-gray-50">Home</Link>
          <Link to="/home/about" onClick={() => setIsOpen(false)} className="p-4 rounded-xl hover:bg-gray-50">About Us</Link>
          <Link to="/home/contact" onClick={() => setIsOpen(false)} className="p-4 rounded-xl hover:bg-gray-50">Contact Us</Link>
          {/* <Link to="/home/contact" onClick={() => setIsOpen(false)} className="p-4 rounded-xl hover:bg-gray-50 text-green-500">My Applications</Link> */}

          <div className="mt-auto pt-6">
             <button
              onClick={() => { localStorage.removeItem("token"); navigate("/"); }}
              className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-500 py-4 rounded-xl font-bold"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

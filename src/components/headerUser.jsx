import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react" 
import Modal from "react-modal"
import { IoMdNotificationsOutline } from "react-icons/io"
import { FiMenu, FiLogOut, FiSave, FiX, FiCamera } from "react-icons/fi" 
import { supabase } from "../util/supabase"

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
  const [profileImage, setProfileImage] = useState("profile.png")
  const [selectedFile, setSelectedFile] = useState(null) 
  const [previewImage, setPreviewImage] = useState(null)
  const [isLoading, setIsloading] = useState(true)
  
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
          if (user.img) setProfileImage(user.img);
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

  async function handleSave() {
    try {
      let finalImageUrl = profileImage 
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("im").upload(filePath, selectedFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("im").getPublicUrl(filePath);
        finalImageUrl = `${data.publicUrl}?t=${Date.now()}`;
      }
      const updateUser = { id: userData.idNumber, age: userData.age, gender: userData.sex, birthday: userData.birthday, img: finalImageUrl }
      await api.put(`/api/users/${userData.name}`, updateUser);
      setProfileImage(finalImageUrl); setPreviewImage(null); setIsModalOpen(false);
      toast.success("Profile updated successfully ✅");
    } catch (error) { 
      toast.error("Failed to update profile ❌"); 
    }
  }

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="md:max-w-2xl lg:w-[30%] lg:mr-45 md:mr-20 sm:w-[50%] md:w-[50%] mx-auto mt-20 bg-primary rounded-2xl shadow-2xl outline-none font-popins overflow-hidden relative z-[60]" 
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
                <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white transition-all transform hover:scale-110">
                    <FiCamera size={14} />
                </button>
                <input type="file" ref={fileInputRef} onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) { setPreviewImage(URL.createObjectURL(file)); setSelectedFile(file); }
                }} accept="image/*" className="hidden" />
              </div>
            </div>

            <h2 className="text-2xl text-center font-bold text-gray-800 mb-1">{userData.name}</h2>
            <p className="text-gray-500 text-center text-sm mb-6">{userData.email}</p>

            <div className="space-y-4">
              <div className="flex flex-col justify-center items-center" >
                <label className="block text-sm font-medium text-center text-gray-700 mb-1">ID Number</label>
                <input type="text" value={userData.idNumber} onChange={handleIdChange} placeholder="Enter NIC" className="w-[260px] text-center px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none transition " />
              </div>

              <div className="flex justify-center items-center gap-4 ">
                <div className="w-[200px] text-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">BirthDay</span>
                  <input type="date" value={userData.birthday} onChange={(e) => setUserData({ ...userData, birthday: e.target.value })} className="w-full bg-transparent text-center text-lg font-medium text-gray-800 outline-none cursor-pointer" />
                </div>
              </div>

              <div className="flex justify-center items-center gap-4 ">
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
              <button onClick={() => { localStorage.removeItem("token"); navigate("/"); }} className="flex-1 w-[50%] flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 py-2.5 rounded-lg font-medium transition">
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      </Modal>

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
            <Link to="/home/contact" className="text-green-500 hover:text-green-600">My applications</Link>
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

            <div onClick={() => setIsModalOpen(true)} className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition">
              <img src={profileImage} className="w-full h-full rounded-full bg-amber-700 object-cover" alt="Profile" />
            </div>

            <div onClick={() => setIsModalOpen(true)} className="hidden md:flex flex-col items-start justify-center cursor-pointer group">
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
          <Link to="/home/contact" onClick={() => setIsOpen(false)} className="p-4 rounded-xl hover:bg-gray-50 text-green-500">My Applications</Link>
          
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
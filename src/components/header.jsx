import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Modal from "react-modal"
import toast from "react-hot-toast"
import { FcGoogle } from "react-icons/fc"
import axios from "axios"

Modal.setAppElement("#root")

export default function Header({
  isModalOpen,
  setIsModalOpen,
  isLogin,
  setIsLogin
}) {
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isVerifyEmail, setIsVerifyEmail] = useState(false)
  const [verificationType, setVerificationType] = useState("")

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    loginId: "", 
    password: "",
    confirmPassword: "",
    otp: "" 
  })

  // ✅ NEW: Effect to handle Google Auth Token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const type = urlParams.get("type");

    if (token) {
      // Save the token correctly in Local Storage
      localStorage.setItem("token", token);
      toast.success("Login successful with Google");

      // Clean the URL by removing the token from the address bar
      window.history.replaceState({}, document.title, "/");

      // Redirect based on user role
      if (type === "admin") navigate("/admin");
      else if (type === "madam") navigate("/madam");
      else navigate("/home");
      
      setIsModalOpen(false);
    }
  }, [navigate, setIsModalOpen]);

  useEffect(() => {
    setIsForgotPassword(false)
    setIsVerifyEmail(false)
  }, [isModalOpen, isLogin])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsDrawerOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const getPasswordStrength = (password) => {
    if (!password) return { label: "", color: "" };
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (password.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial) return { label: "Strong 💪", color: "text-green-500" };
    if (password.length >= 6 && (hasUpper || hasLower || hasNumber)) return { label: "Medium 😐", color: "text-yellow-500" };
    return { label: "Weak ⚠️", color: "text-red-500" };
  }

  const handleGoogleAuth = () => {
    window.location.href = import.meta.env.VITE_BACKEND_URL + "/api/users/auth/google";
  }

  async function handleLogin() {
    if (!form.loginId || !form.password) { toast.error("Username or Email and Password are required"); return; }
    try {
      const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/login", { password: form.password, email: form.loginId, userName: form.loginId })
      toast.success("Login successful");
      localStorage.setItem("token", res.data.token);
      if (res.data.type == "admin") navigate("/admin");
      else if (res.data.type == "madam") navigate('/madam');
      else navigate('/home');
      setIsModalOpen(false);
    } catch (e) { toast.error(e.response?.data?.message || "Login failed"); }
  }

  async function handleRegister() {
    if (!form.firstName || !form.lastName || !form.username || !form.email || !form.password || !form.confirmPassword) { toast.error("All fields are required"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    try {
      await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/", { firstName: form.firstName, lastName: form.lastName, userName: form.username, email: form.email, password: form.password })
      toast.success("Registration successful. Please verify your email.");
      setVerificationType("register"); setIsVerifyEmail(true); 
    } catch (e) { toast.error(e.response?.data?.message || "Registration failed"); }
  }

  async function handleForgotPasswordReq() {
    if (!form.email) return toast.error("Please enter your email")
    try {
      await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/forgot-password", { email: form.email })
      toast.success("OTP sent to your email!"); setVerificationType("reset"); setIsVerifyEmail(true);
    } catch (e) { toast.error(e.response?.data?.message || "Failed to send OTP"); }
  }

  async function handleVerifyOtp() {
    if (!form.otp) return toast.error("Please enter the OTP")
    try {
      if (verificationType === "register") {
        await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/verify-email", { email: form.email, otp: form.otp })
        toast.success("Email verified! You can now login."); setIsVerifyEmail(false); setIsLogin(true);
      } else if (verificationType === "reset") {
        if (!form.password || !form.confirmPassword) return toast.error("Please enter and confirm your new password");
        if (form.password !== form.confirmPassword) return toast.error("Passwords do not match");
        await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/reset-password", { email: form.email, otp: form.otp, newPassword: form.password })
        toast.success("Password reset successfully! Please login."); setIsVerifyEmail(false); setIsForgotPassword(false); setIsLogin(true);
      }
    } catch (e) { toast.error(e.response?.data?.message || "Verification failed"); }
  }

  const strength = getPasswordStrength(form.password);

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="max-w-md w-[95%] mx-auto bg-white rounded-3xl shadow-2xl outline-none overflow-hidden max-h-[90vh] flex flex-col relative z-[100]"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[99]"
      >
        <div className="p-6 md:p-10 font-popins overflow-y-auto scrollbar-hide w-full">
          <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              {isVerifyEmail ? "Verify Email ✉️" : isForgotPassword ? "Reset Password 🔒" : isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {isVerifyEmail ? "Enter the OTP sent to your email" : isForgotPassword ? "We'll send you an OTP to reset your password" : isLogin ? "Login to continue" : "Join us and build your career"}
            </p>
          </div>

          {!isForgotPassword && !isVerifyEmail && (
            <>
              <button onClick={handleGoogleAuth} className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-2xl hover:bg-gray-50 transition mb-6 font-medium text-gray-700 shadow-sm">
                <FcGoogle size={22} /> Continue with Google
              </button>
              <div className="flex items-center gap-4 mb-6">
                <hr className="flex-1 border-gray-100" />
                <span className="text-gray-300 text-xs font-bold">OR</span>
                <hr className="flex-1 border-gray-100" />
              </div>
            </>
          )}

          <div className="space-y-4">
            {isVerifyEmail && (
              <>
                <input name="otp" placeholder="Enter 6-digit OTP" onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-center tracking-widest text-lg focus:ring-2 focus:ring-accent/20 outline-none" />
                {verificationType === "reset" && (
                  <div className="space-y-4 mt-4">
                    {form.password && <p className={`text-xs font-bold ${strength.color} mb-[-12px] ml-1`}>Strength: {strength.label}</p>}
                    <input type="password" name="password" placeholder="New Password" onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-accent/20" />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-accent/20" />
                  </div>
                )}
                <button onClick={handleVerifyOtp} className="w-full mt-4 py-4 bg-accent text-white rounded-2xl font-bold hover:shadow-lg transition active:scale-95 shadow-accent/30 shadow-md">
                  {verificationType === "reset" ? "Reset Password" : "Verify Account"}
                </button>
              </>
            )}

            {isForgotPassword && !isVerifyEmail && (
              <>
                <input type="email" name="email" placeholder="Registered email" onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-accent/20" />
                <button onClick={handleForgotPasswordReq} className="w-full py-4 bg-accent text-white rounded-2xl font-bold hover:shadow-lg transition shadow-accent/30 shadow-md">Send OTP</button>
                <p className="text-center mt-2 text-sm text-gray-500 cursor-pointer hover:text-accent font-medium" onClick={() => setIsForgotPassword(false)}>Back to Login</p>
              </>
            )}

            {!isForgotPassword && !isVerifyEmail && (
              <>
                {!isLogin && (
                  <>
                    <div className="flex gap-3">
                      <input name="firstName" placeholder="First Name" onChange={handleChange} className="w-1/2 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-accent/20" />
                      <input name="lastName" placeholder="Last Name" onChange={handleChange} className="w-1/2 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-accent/20" />
                    </div>
                    <input name="username" placeholder="Username" onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-accent/20" />
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-accent/20" />
                  </>
                )}
                {isLogin && <input name="loginId" placeholder="Username or Email" onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-accent/20" />}
                
                {!isLogin && form.password && <p className={`text-xs font-bold ${strength.color} mb-[-12px] ml-1`}>Strength: {strength.label}</p>}
                <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-accent/20" />
                
                {!isLogin && <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-accent/20" />}
                
                {isLogin && (
                  <div className="flex justify-end w-full">
                    <span onClick={() => setIsForgotPassword(true)} className="text-xs text-accent font-bold cursor-pointer hover:underline">Forgot Password?</span>
                  </div>
                )}
                <button onClick={isLogin ? handleLogin : handleRegister} className="w-full mt-4 py-4 bg-accent text-white rounded-2xl font-bold hover:shadow-lg transition shadow-accent/30 shadow-md active:scale-95">{isLogin ? "Login" : "Register"}</button>
              </>
            )}
          </div>

          {!isVerifyEmail && !isForgotPassword && (
            <p className="text-center mt-8 text-sm text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span onClick={() => setIsLogin(!isLogin)} className="text-accent font-bold cursor-pointer ml-1 hover:underline underline-offset-4">{isLogin ? "Register" : "Login"}</span>
            </p>
          )}
        </div>
      </Modal>

      <header className="fixed top-0 left-0 w-full z-40 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto h-[80px] flex items-center justify-between px-4">
          <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
            <img src="/logo.png" className="h-[55px]" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg">University of Ruhuna</span>
              <span className="font-bold text-lg text-gray-800">Job <span className="text-accent">Finder</span></span>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 font-popins font-medium">
            <Link to="/" className="hover:text-accent transition">Home</Link>
            <Link to="/about" className="hover:text-accent transition">About Us</Link>
            <Link to="/contact" className="hover:text-accent transition">Contact Us</Link>
            <Link onClick={() => { setIsLogin(false); setIsModalOpen(true); }} className="text-green-500 cursor-pointer font-bold">Get Started</Link>
          </nav>
          <div className="hidden md:flex gap-3">
            <button onClick={() => { setIsLogin(true); setIsModalOpen(true); }} className="px-6 py-2.5 rounded-full border border-accent text-accent font-bold hover:bg-accent hover:text-white transition">Login</button>
            <button onClick={() => { setIsLogin(false); setIsModalOpen(true); }} className="px-6 py-2.5 rounded-full bg-accent text-white font-bold hover:shadow-lg transition active:scale-95">Register</button>
          </div>
          <button onClick={() => setIsDrawerOpen(true)} className="md:hidden flex flex-col gap-1.5 p-2">
            <span className="h-[2.5px] w-6 bg-gray-800 rounded-full" />
            <span className="h-[2.5px] w-6 bg-gray-800 rounded-full" />
            <span className="h-[2.5px] w-6 bg-gray-800 rounded-full" />
          </button>
        </div>
      </header>

      {isDrawerOpen && <div onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30" />}
      <aside className={`fixed top-0 right-0 h-full w-[280px] bg-white z-40 transition-transform duration-300 shadow-2xl ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-[80px] flex items-center justify-between px-6 border-b border-gray-50">
          <h2 className="font-bold text-xl">Menu</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="text-2xl text-gray-400">✕</button>
        </div>
        <div className="flex flex-col gap-2 p-6 font-popins">
          <Link to="/" onClick={() => setIsDrawerOpen(false)} className="p-4 rounded-xl hover:bg-gray-50 font-medium">Home</Link>
          <Link to="/about" onClick={() => setIsDrawerOpen(false)} className="p-4 rounded-xl hover:bg-gray-50 font-medium">About Us</Link>
          <Link to="/contact" onClick={() => setIsDrawerOpen(false)} className="p-4 rounded-xl hover:bg-gray-50 font-medium">Contact Us</Link>
          <div className="flex flex-col gap-3 mt-6">
            <button onClick={() => { setIsLogin(true); setIsModalOpen(true); setIsDrawerOpen(false); }} className="w-full py-3.5 rounded-2xl border border-accent text-accent font-bold">Login</button>
            <button onClick={() => { setIsLogin(false); setIsModalOpen(true); setIsDrawerOpen(false); }} className="w-full py-3.5 rounded-2xl bg-accent text-white font-bold">Register</button>
          </div>
        </div>
      </aside>
    </>
  )
}
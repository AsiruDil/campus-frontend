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
  
  // --- NEW STATES FOR OTP & FORGOT PASSWORD ---
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isVerifyEmail, setIsVerifyEmail] = useState(false)
  const [verificationType, setVerificationType] = useState("") // "register" or "reset"

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

  // Reset views when modal closes or switches between login/register
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

  // --- STRONG PASSWORD VALIDATOR ---
  const isStrongPassword = (password) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  }

  // --- GOOGLE LOGIN AUTH ---
  const handleGoogleAuth = () => {
    // Redirects to your backend Google OAuth route
    window.location.href = import.meta.env.VITE_BACKEND_URL + "/api/users/auth/google";
  }

  async function handleLogin() {
    if (!form.loginId || !form.password) {
      toast.error("Username or Email and Password are required")
      return
    }
    try {
      const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/login", {
        password: form.password,
        email: form.loginId,
        userName: form.loginId
      })
      toast.success("Login successful")
      localStorage.setItem("token", res.data.token)

      if (res.data.type == "admin") {
        navigate("/admin")
      } else if (res.data.type == "madam") {
        navigate('/madam')
      } else {
        navigate('/home')
      }
      setIsModalOpen(false)
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed")
    }
  }

  async function handleRegister() {
    if (
      !form.firstName || !form.lastName || !form.username ||
      !form.email || !form.password || !form.confirmPassword
    ) {
      toast.error("All fields are required")
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    // CHECK PASSWORD STRENGTH
    if (!isStrongPassword(form.password)) {
      toast.error("Password must be at least 8 chars long and include an uppercase, lowercase, number, and special character.")
      return
    }

    try {
      await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/users/",
        {
          firstName: form.firstName,
          lastName: form.lastName,
          userName: form.username,
          email: form.email,
          password: form.password // sending the verified strong password
        }
      )
      toast.success("Registration successful. Please verify your email.")
      setVerificationType("register")
      setIsVerifyEmail(true) 
    } catch (e) {
      toast.error(e.response?.data?.message || "Registration failed")
    }
  }

  async function handleForgotPasswordReq() {
    if (!form.email) return toast.error("Please enter your email")
    try {
      await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/forgot-password", { email: form.email })
      toast.success("OTP sent to your email!")
      setVerificationType("reset")
      setIsVerifyEmail(true)
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send OTP")
    }
  }

  async function handleVerifyOtp() {
    if (!form.otp) return toast.error("Please enter the OTP")
    try {
      if (verificationType === "register") {
        // Verify New Account
        await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/verify-email", { email: form.email, otp: form.otp })
        toast.success("Email verified! You can now login.")
        setIsVerifyEmail(false)
        setIsLogin(true)
      } else if (verificationType === "reset") {
        
        // CHECK IF FIELDS ARE FILLED
        if (!form.password || !form.confirmPassword) {
            return toast.error("Please enter and confirm your new password")
        }

        // CHECK IF PASSWORDS MATCH
        if (form.password !== form.confirmPassword) {
            return toast.error("Passwords do not match")
        }

        // CHECK PASSWORD STRENGTH FOR RESET
        if (!isStrongPassword(form.password)) {
            toast.error("Password must be at least 8 chars long and include an uppercase, lowercase, number, and special character.")
            return
        }

        // Reset Password
        await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/reset-password", { 
          email: form.email, 
          otp: form.otp, 
          newPassword: form.password 
        })
        toast.success("Password reset successfully! Please login.")
        setIsVerifyEmail(false)
        setIsForgotPassword(false)
        setIsLogin(true)
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Verification failed")
    }
  }

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="max-w-md w-[95%] mx-auto mt-24 bg-white rounded-2xl shadow-2xl outline-none"
        overlayClassName="fixed inset-0 bg-black/40 flex justify-center items-start z-50"
      >
        <div className="p-6 md:p-8 font-popins">

          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold">
              {isVerifyEmail ? "Verify Email ✉️" : isForgotPassword ? "Reset Password 🔒" : isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
            </h2>
            <p className="text-gray-500 mt-2">
              {isVerifyEmail ? "Enter the OTP sent to your email" : isForgotPassword ? "We'll send you an OTP to reset your password" : isLogin ? "Login to continue" : "Join us and build your career"}
            </p>
          </div>

          {/* Hide social login during verification/forgot password flows */}
          {!isForgotPassword && !isVerifyEmail && (
            <>
              <button 
                onClick={handleGoogleAuth} 
                className="w-full flex items-center justify-center gap-3 border py-3 rounded-xl hover:bg-gray-50 transition mb-6"
              >
                <FcGoogle size={22} />
                Continue with Google
              </button>
              <div className="flex items-center gap-4 mb-6">
                <hr className="flex-1" />
                <span className="text-gray-400 text-sm">OR</span>
                <hr className="flex-1" />
              </div>
            </>
          )}

          <div className="space-y-4">
            
            {/* --- VERIFY OTP VIEW --- */}
            {isVerifyEmail && (
              <>
                <input
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 text-center tracking-widest text-lg"
                />
                {verificationType === "reset" && (
                  <div className="space-y-4 mt-4">
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter New Password"
                      onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-3"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-3"
                    />
                  </div>
                )}
                <button onClick={handleVerifyOtp} className="w-full mt-4 py-3 bg-accent text-white rounded-xl font-bold hover:scale-[1.02] transition">
                  {verificationType === "reset" ? "Reset Password" : "Verify Account"}
                </button>
              </>
            )}

            {/* --- FORGOT PASSWORD VIEW --- */}
            {isForgotPassword && !isVerifyEmail && (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your registered email"
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                />
                <button onClick={handleForgotPasswordReq} className="w-full py-3 bg-accent text-white rounded-xl font-bold hover:scale-[1.02] transition">
                  Send OTP
                </button>
                <p className="text-center mt-2 text-sm text-gray-500 cursor-pointer hover:text-accent" onClick={() => setIsForgotPassword(false)}>
                  Back to Login
                </p>
              </>
            )}

            {/* --- NORMAL LOGIN/REGISTER VIEW --- */}
            {!isForgotPassword && !isVerifyEmail && (
              <>
                {!isLogin && (
                  <>
                    <div className="flex gap-3">
                      <input name="firstName" placeholder="First Name" onChange={handleChange} className="w-1/2 border rounded-lg px-4 py-3" />
                      <input name="lastName" placeholder="Last Name" onChange={handleChange} className="w-1/2 border rounded-lg px-4 py-3" />
                    </div>
                    <input name="username" placeholder="Username" onChange={handleChange} className="w-full border rounded-lg px-4 py-3" />
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full border rounded-lg px-4 py-3 " />
                  </>
                )}

                {isLogin && (
                  <input name="loginId" placeholder="Username or Email" onChange={handleChange} className="w-full border rounded-lg px-4 py-3" />
                )}

                <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full border rounded-lg px-4 py-3" />

                {!isLogin && (
                  <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} className="w-full border rounded-lg px-4 py-3" />
                )}

                {isLogin && (
                  <div className="flex justify-end w-full">
                    <span onClick={() => setIsForgotPassword(true)} className="text-sm text-accent font-medium cursor-pointer hover:underline">
                      Forgot Password?
                    </span>
                  </div>
                )}

                <button
                  onClick={isLogin ? handleLogin : handleRegister}
                  className="w-full mt-4 py-3 bg-accent text-white rounded-xl font-bold hover:scale-[1.02] transition"
                >
                  {isLogin ? "Login" : "Register"}
                </button>
              </>
            )}
          </div>

          {/* Footer Toggler */}
          {!isVerifyEmail && !isForgotPassword && (
            <p className="text-center mt-6 text-sm text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span onClick={() => setIsLogin(!isLogin)} className="text-accent font-semibold cursor-pointer ml-1 hover:underline">
                {isLogin ? "Register" : "Login"}
              </span>
            </p>
          )}

        </div>
      </Modal>

      {/* ================= HEADER (No Changes) ================= */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto h-[80px] flex items-center justify-between px-4">
          <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
            <img src="/logo.png" className="h-[55px]" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg">University of Ruhuna</span>
              <span className="font-bold text-lg">
                Job <span className="text-accent">Finder</span>
              </span>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 font-popins font-medium">
            <Link to="/" className="hover:text-accent">Home</Link>
            <Link to="/about" className="hover:text-accent">About Us</Link>
            <Link to="/contact" className="hover:text-accent">Contact Us</Link>
            <Link onClick={() => { setIsLogin(false); setIsModalOpen(true); }} className="text-green-500 cursor-pointer">Get Started</Link>
          </nav>
          <div className="hidden md:flex gap-3">
            <button onClick={() => { setIsLogin(true); setIsModalOpen(true); }} className="px-4 py-2 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition">
              Login
            </button>
            <button onClick={() => { setIsLogin(false); setIsModalOpen(true); }} className="px-4 py-2 rounded-full bg-accent text-white">
              Register
            </button>
          </div>
          <button onClick={() => setIsDrawerOpen(true)} className="md:hidden flex flex-col gap-1">
            <span className="h-[3px] w-6 bg-black" />
            <span className="h-[3px] w-6 bg-black" />
            <span className="h-[3px] w-6 bg-black" />
          </button>
        </div>
      </header>

      {isDrawerOpen && <div onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/10 z-30" />}

      <aside className={`fixed top-0 right-0 h-full w-[280px] bg-white z-40 transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-[80px] flex items-center justify-between px-4 shadow">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="text-2xl">✕</button>
        </div>
        <div className="flex flex-col gap-3 p-4 font-popins">
          <Link to="/" onClick={() => setIsDrawerOpen(false)} className="p-3 rounded-lg hover:bg-gray-100 text-center">Home</Link>
          <Link to="/about" onClick={() => setIsDrawerOpen(false)} className="p-3 rounded-lg hover:bg-gray-100 text-center">About Us</Link>
          <Link to="/contact" onClick={() => setIsDrawerOpen(false)} className="p-3 rounded-lg hover:bg-gray-100 text-center">Contact Us</Link>
          <Link onClick={() => { setIsDrawerOpen(false); setIsLogin(false); setIsModalOpen(true); }} className="p-3 rounded-lg hover:bg-gray-100 text-center cursor-pointer">Get Started</Link>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { setIsLogin(true); setIsModalOpen(true); setIsDrawerOpen(false); }} className="w-1/2 py-2 rounded-full border border-accent text-accent">
              Login
            </button>
            <button onClick={() => { setIsLogin(false); setIsModalOpen(true); setIsDrawerOpen(false); }} className="w-1/2 py-2 rounded-full bg-accent text-white">
              Register
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
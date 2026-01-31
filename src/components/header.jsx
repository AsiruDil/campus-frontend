

// // new one

// import { Link, useNavigate } from "react-router-dom"
// import { useEffect, useState } from "react"
// import Modal from "react-modal"
// Modal.setAppElement("#root")


// export default function Header() {
//   const navigate = useNavigate()
//   const [isOpen, setIsOpen] = useState(false)
//   const[isModalOpen,setIsModalOpen]=useState(false)

//   useEffect(() => {
//   const handleResize = () => {
//     if (window.innerWidth >= 768) setIsOpen(false)
//   }
//   window.addEventListener("resize", handleResize)
//   return () => window.removeEventListener("resize", handleResize)
// }, [])


//   return (
//     <>
//     <Modal
//      isOpen={isModalOpen}
//             onRequestClose={() => setIsModalOpen(false)}
//             className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow-lg outline-none"
//             overlayClassName="fixed inset-0 bg-black/40 flex justify-center items-start"
//           >

//     </Modal>
//       {/* Header */}
//       <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-lg">
//         <div className="max-w-7xl mx-auto h-[80px] flex items-center justify-between px-4">

//           {/* Logo */}
//           <div
//             onClick={() => navigate("/")}
//             className="flex items-center gap-2 cursor-pointer"
//           >
//             <img src="/logo.png" className="h-[55px]" />
//             <div className=" sm:flex-col flex  flex-col font-popins leading-tight">
//               <span className=" font-bold text-lg">University of Ruhuna</span>
//               <span className="font-bold text-lg">
//                 Job <span className="text-accent">Finder</span>
//               </span>
//             </div>
//           </div>

//           {/* Desktop Menu */}
//           <nav className="hidden md:flex gap-6 font-popins font-medium">
//             <Link to="/" className="hover:text-accent transition">Home</Link>
//             <Link to="/about"  className="hover:text-accent transition">About Us</Link>
//             <Link to="/contact" className="hover:text-accent transition">Contact Us</Link>
//             <Link to="/signup" className="text-green-500 hover:text-green-600">
//               Get Started
//             </Link>
//           </nav>

//           {/* Desktop Buttons */}
//           <div className="hidden md:flex gap-3 font-popins">
//             <button className="px-4 py-2 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition cursor-pointer">
//               Login
//             </button>
//             <button className="px-4 py-2 rounded-full bg-accent text-white cursor-pointer">
//               Register
//             </button>
//           </div>

//           {/* Hamburger (Right Side) */}
//           <button
//             onClick={() => setIsOpen(true)}
//             className="md:hidden  flex flex-col gap-1"
//           >
//             <span className="h-[3px] w-6 bg-black" />
//             <span className="h-[3px] w-6 bg-black" />
//             <span className="h-[3px] w-6 bg-black" />
//           </button>
//         </div>
//       </header>

//       {/* Dark Overlay */}
//       {isOpen && (
//         <div
//           onClick={() => setIsOpen(false)}
//           className="fixed inset-0 bg-black/10 z-40"
//         />
//       )}

//       {/* Right Side Drawer */}
//       <aside
//         className={`fixed top-0 right-0 h-full w-[280px] bg-white z-50 transform transition-transform duration-300
//         ${isOpen ? "translate-x-1" : "translate-x-full"}`}
//       >
//         {/* Drawer Header */}
//         <div className="h-[80px] flex items-center justify-between px-4 shadow">
//           <h2 className="font-bold text-lg font-popins">Menu</h2>
//           <button
//             onClick={() => setIsOpen(false)}
//             className="text-2xl"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Menu Items */}
//         <div className="flex flex-col gap-3 p-4 font-popins">
//           {[
//             "Home",
//             "About Us",
//             "Contact Us",
//             "Get Started",
//           ].map((item) => (
//             <Link
//               key={item}
//               onClick={() => setIsOpen(false)}
//               className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition"
//             >
//             {/* <span className="text-gray-400 ">⬅️</span> */}
//             <span className="flex justify-end hover:text-accent transition">{item}</span>
              
//             </Link>
//           ))}

//           {/* Auth Buttons */}
//           <div className="flex gap-2 mt-4">
//             <button onClick={()=>{
//               setIsModalOpen(true)
//             }}className="w-1/2 py-2 rounded-full border border-accent text-accent">
//               Login
//             </button>
//             <button className="w-1/2 py-2 rounded-full bg-accent text-white">
//               Register
//             </button>
//           </div>
//         </div>
//       </aside>
//     </>
//   )
// }

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


 

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

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

  async function  handleLogin () {

    if (!form.loginId || !form.password) {
      toast.error("Username or Email and Password are required")
      return
    }
    try{
       const res=await axios.post(import.meta.env.VITE_BACKEND_URL+"/api/users/login",{
          password:form.password,
          email:form.loginId,
          userName:form.loginId

       })
        toast.success("Login successful")
       
        localStorage.setItem("token",res.data.token)
      
        if(res.data.type=="admin"){
          navigate("/admin")
        }else if (res.data.type=="madam"){
          navigate('/madam')

        }else{
            navigate('/home')
        }
        setIsModalOpen(false)
    }catch(e){
         toast.error(e.response.data.message)
    }
   
    
  }

  async function handleRegister () {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      toast.error("All fields are required")
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    try{
     const response= await axios.post(
      import.meta.env.VITE_BACKEND_URL+"/api/users/",
      {
          firstName:form.firstName,
          lastName:form.lastName,
          userName:form.username,
          email:form.email,
          password:form.confirmPassword

      }
     )
    toast.success("Registration successfull")
     setIsLogin(true)
    
   
    }catch(e){
        toast.error(e.response?.data?.message || "Registration failed")
    }

  
  }

  return (
    <>
      {/* ================= AUTH MODAL ================= */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="max-w-md w-[95%] mx-auto mt-24 bg-white rounded-2xl shadow-2xl outline-none"
        overlayClassName="fixed inset-0 bg-black/40 flex justify-center items-start z-50"
      >
        <div className="p-6 md:p-8 font-popins">

          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold">
              {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
            </h2>
            <p className="text-gray-500 mt-2">
              {isLogin ? "Login to continue" : "Join us and build your career"}
            </p>
          </div>

          <button className="w-full flex items-center justify-center gap-3 border py-3 rounded-xl hover:bg-gray-50 transition mb-6">
            <FcGoogle size={22} />
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <hr className="flex-1" />
            <span className="text-gray-400 text-sm">OR</span>
            <hr className="flex-1" />
          </div>

          <div className="space-y-4">

            {/* REGISTER ONLY */}
            {!isLogin && (
              <>
                <div className="flex gap-3">
                  <input
                    name="firstName"
                    placeholder="First Name"
                    onChange={handleChange}
                    className="w-1/2 border rounded-lg px-4 py-3"
                  />
                  <input
                    name="lastName"
                    placeholder="Last Name"
                    onChange={handleChange}
                    className="w-1/2 border rounded-lg px-4 py-3"
                  />
                </div>

                <input
                  name="username"
                  placeholder="Username"
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 "
                />
              </>
            )}

            {/* LOGIN ONLY */}
            {isLogin && (
              <input
                name="loginId"
                placeholder="Username or Email"
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />

            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />
            )}
          </div>

          <button
            onClick={isLogin ? handleLogin : handleRegister}
            className="w-full mt-4 py-3 bg-accent text-white rounded-xl font-bold hover:scale-[1.02] transition"
          >
            {isLogin ? "Login" : "Register"}
          </button>

          <p className="text-center mt-2 text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent font-semibold cursor-pointer ml-1"
            >
              {isLogin ? "Register" : "Login"}
            </span>
          </p>
        </div>
      </Modal>

      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto h-[80px] flex items-center justify-between px-4">

          {/* Logo */}
          <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
            <img src="/logo.png" className="h-[55px]" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg">University of Ruhuna</span>
              <span className="font-bold text-lg">
                Job <span className="text-accent">Finder</span>
              </span>
            </div>
          </div>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex gap-6 font-popins font-medium">
            <Link to="/" className="hover:text-accent">Home</Link>
            <Link to="/about" className="hover:text-accent">About Us</Link>
            <Link to="/contact" className="hover:text-accent">Contact Us</Link>
            <Link  onClick={() => {
                setIsLogin(false)
                setIsModalOpen(true)
              }}className="text-green-500">Get Started</Link>
          </nav>

          {/* DESKTOP AUTH */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => {
                setIsLogin(true)
                setIsModalOpen(true)
              }}
              className="px-4 py-2 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition"
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setIsModalOpen(true)
              }}
              className="px-4 py-2 rounded-full bg-accent text-white"
            >
              Register
            </button>
          </div>

          {/* HAMBURGER */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden flex flex-col gap-1"
          >
            <span className="h-[3px] w-6 bg-black" />
            <span className="h-[3px] w-6 bg-black" />
            <span className="h-[3px] w-6 bg-black" />
          </button>
        </div>
      </header>

      {/* OVERLAY */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-black/10 z-30"
        />
      )}

      {/* DRAWER */}
      <aside
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-40 transition-transform duration-300
        ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-[80px] flex items-center justify-between px-4 shadow">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="text-2xl">✕</button>
        </div>

        <div className="flex flex-col gap-3 p-4 font-popins">
          <Link to="/" onClick={() => setIsDrawerOpen(false)} className="p-3 rounded-lg hover:bg-gray-100 text-center">Home</Link>
          <Link to="/about" onClick={() => setIsDrawerOpen(false)} className="p-3 rounded-lg hover:bg-gray-100 text-center">About Us</Link>
          <Link to="/contact" onClick={() => setIsDrawerOpen(false)} className="p-3 rounded-lg hover:bg-gray-100 text-center">Contact Us</Link>
          <Link to="/signup" onClick={() => {setIsDrawerOpen(false)
             
                setIsLogin(false)
                setIsModalOpen(true)
             
          }} className="p-3 rounded-lg hover:bg-gray-100 text-center">Get Started</Link>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setIsLogin(true)
                setIsModalOpen(true)
                setIsDrawerOpen(false)
              }}
              className="w-1/2 py-2 rounded-full border border-accent text-accent"
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setIsModalOpen(true)
                setIsDrawerOpen(false)
              }}
              className="w-1/2 py-2 rounded-full bg-accent text-white"
            >
              Register
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

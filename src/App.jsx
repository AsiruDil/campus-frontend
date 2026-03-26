import './App.css'
import { BrowserRouter, Route, Routes, useSearchParams, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

import HomePage from './pages/home'
import HomeSerect from './pages/user/homescretePage'
import MadamPage from './pages/madam/madamPage'
import AdminPage from './pages/admin/adminPage'
import ProtectedRoute from './util/protectedRouute' 
import NotFound from './pages/notFound'

function AuthHandler() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get("token")
    const type = searchParams.get("type")
    const error = searchParams.get("error")

    if (error === "blocked") {
      toast.error("Your account is blocked. Please contact support.")
      setSearchParams({})
    } else if (token) {
      localStorage.setItem("token", token)
      toast.success("Logged in with Google!")
      setSearchParams({})
      if (type === "admin") navigate("/admin")
      else if (type === "madam") navigate("/madam")
      else navigate("/home")
    }
  }, [searchParams, navigate, setSearchParams])

  return null;
}

function App() {
  return (
   <BrowserRouter>
    <div>
      <Toaster position='top-right'/>
      <AuthHandler /> 
      
          <Routes>
            {/* 1. Root Path: Use 'index' or exact path without '*' */}
            <Route path="/" element={<HomePage/>}/>

            {/* 2. User Dashboard: Matches /home and all sub-paths like /home/profile */}
            <Route path="/home/*" element={
              <ProtectedRoute allowedRoles={["user"]}>
                <HomeSerect/>
              </ProtectedRoute>
            }/>

            {/* 3. Admin Dashboard: Matches /admin and sub-paths */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage/>
              </ProtectedRoute>
            }/>

            {/* 4. Madam Dashboard: Matches /madam and sub-paths */}
            <Route path="/madam/*" element={
              <ProtectedRoute allowedRoles={["madam"]}>
                <MadamPage/>
              </ProtectedRoute>
            }/>

            {/* 5. Catch-All: This MUST be the last route */}
            <Route path="*" element={<NotFound/>} />
          </Routes>
     </div>
   </BrowserRouter>
  )
}

export default App
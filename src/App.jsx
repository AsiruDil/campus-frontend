import './App.css'
import { BrowserRouter, Route, Routes, useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

import HomePage from './pages/home'
import HomeSerect from './pages/user/homescretePage'
import MadamPage from './pages/madam/madamPage'
import AdminPage from './pages/admin/adminPage'
import ProtectedRoute from './util/protectedRouute' 
import NotFound from './pages/notFound'


const SmartRedirect = () => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  
  if (!token) {
    return <NotFound />; 
  }

  if (userType === "admin") return <Navigate to="/admin" replace />;
  if (userType === "madam") return <Navigate to="/madam" replace />;
  
 
  return <Navigate to="/home" replace />;
};


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
      localStorage.setItem("userType", type || "user") 
      
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
          
            <Route path="/*" element={<HomePage/>}/>


            {/* 2. User Dashboard */}
            <Route path="/home/*" element={
              <ProtectedRoute allowedRoles={["user"]}>
                <HomeSerect/>
              </ProtectedRoute>
            }/>

            {/* 3. Admin Dashboard */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage/>
              </ProtectedRoute>
            }/>

            {/* 4. Madam Dashboard */}
            <Route path="/madam/*" element={
              <ProtectedRoute allowedRoles={["madam"]}>
                <MadamPage/>
              </ProtectedRoute>
            }/>

            {/* 5. Catch-All: Now uses the SmartRedirect to prevent 404s for logged-in users */}
            <Route path="*" element={<SmartRedirect />} />
          </Routes>
     </div>
   </BrowserRouter>
  )
}

export default App
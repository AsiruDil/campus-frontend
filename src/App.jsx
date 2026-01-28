import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/home'
import HomeSerect from './pages/user/homescretePage'
import MadamPage from './pages/madam/madamPage'
import AdminPage from './pages/admin/adminPage'

function App() {


  return (
   <BrowserRouter>
    <div>
      <Toaster position='top-right'/>
          <Routes>
            <Route path="/*" element={<HomePage/>}/>
            <Route path="/home" element={<HomeSerect/>}/>
            <Route path="/admin" element={<AdminPage/>}/>
            <Route path="/madam" element={<MadamPage/>}/>
          </Routes>
     </div>
   </BrowserRouter>
     
    
  )
}

export default App

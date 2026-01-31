import { Route, Routes } from "react-router-dom";
import Footer from "../components/footer";
import Header from "../components/header";
import Home from "../components/homePage";
import About from "./about";
import Contact from "./contact";
import { useState } from "react";


export default function HomePage(){
    const [isModalOpen,setIsModalOpen]=useState(false)
    const [isLogin, setIsLogin] = useState(true)


      const openRegisterModal = () => {
    setIsLogin(false)
    setIsModalOpen(true)
    }

    return(
        <div className="w-full h-screen flex flex-col">
            <div className="w-full h-[80px]">
            <Header
             isModalOpen={isModalOpen}
             setIsModalOpen={setIsModalOpen}
             isLogin={isLogin}
            setIsLogin={setIsLogin}
            />
            </div>
            <div className="w-full h-[calc(maxh-80px)] ">
                <Routes >
                    <Route path="/" element={<Home openRegisterModal={openRegisterModal}/>}/>
                    <Route path="/about" element={<About/>}/>
                   <Route path="/contact" element={<Contact/>}/>
                </Routes>
            </div>
            <Footer/>
        </div>
    )
}
import { Route, Routes } from "react-router-dom";
import HeaderUser from "../../components/headerUser";
import JobView from "./jobView";
import JobDetailsPage from "./JobDetails";
import ApplyForm from "./applyForm";
import Footer from "../../components/footer";
import Contact from "./contact";
import AboutPage from "./about";
import Madam from "../madam/madamPage";


export default function HomeSerect(){
    return(
        <div className="w-full h-screen  flex flex-col">
            <div className="w-full h-[80px] bg-red-300 flex">
                <HeaderUser/>
            </div>
            <div className="w-full flex-1" >
                <Routes>
                    <Route path="/" element={<JobView/>}/>
                    <Route path="/jobDetails/:id" element={<JobDetailsPage/>}/>
                    <Route path="/apply" element={<ApplyForm/>}/>
                    <Route path="/contact" element={<Contact/>}/>
                    <Route path="/about" element={<AboutPage/>}/>
                    <Route path="/madam" element={<Madam/>}/>
                    
                   
                </Routes>
            </div>
           <div className="w-full h-[100px]">

            <Footer/>
           </div>
            
            
        </div>
    )
}
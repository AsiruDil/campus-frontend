import { Route, Routes } from "react-router-dom";
import HeaderUser from "../../components/headerUser";
import JobView from "./jobView";


export default function HomeSerect(){
    return(
        <div className="w-full h-screen  flex flex-col">
            <div className="w-full h-[80px] bg-red-300 flex">
                <HeaderUser/>
            </div>
            <div className="w-full h-[calc(100%-80px)] bg-red-500" >
                <Routes>
                    <Route path="/" element={<JobView/>}/>
                   
                </Routes>
            </div>
            
            
        </div>
    )
}
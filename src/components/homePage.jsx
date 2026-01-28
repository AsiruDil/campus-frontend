import { useEffect, useState } from "react";
import { BiSolidShoppingBags, BiWorld, BiTimeFive } from "react-icons/bi";
import { FaSearch, FaBuilding, FaUserCheck } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import JobCardGetStared from "./jobCardGetStared";
import { Link } from "react-router-dom";

export default function Home({openRegisterModal}) {
  const [show, setShow] = useState(false);

  // Mock Data
  const jobs = [
    { id: 1, type: "Full Time", name: "Frontend Developer", image: "https://picsum.photos/id/10/200/300" },
    { id: 2, type: "Part Time", name: "Backend Developer", image: "https://picsum.photos/id/11/200/300" },
    { id: 3, type: "Remote", name: "UI/UX Designer", image: "https://picsum.photos/id/12/200/300" },
    { id: 4, type: "Internship", name: "Software Intern", image: "https://picsum.photos/id/13/200/300" },
    { id: 5, type: "Contract", name: "Mobile Developer", image: "https://picsum.photos/id/14/200/300" },
    { id: 6, type: "Full Time", name: "DevOps Engineer", image: "https://picsum.photos/id/15/200/300" }
  ];

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <div className="w-full bg-gray-50 overflow-x-hidden font-popins">
      
      {/* ================= HERO SECTION ================= */}
      <div className="relative w-full min-h-[780px] flex items-center bg-white">
        
        {/* Background Decorative Blob (Optional visual flair) */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-blue-50 to-white hidden md:block z-0 clip-path-slant" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 flex flex-col md:flex-row items-center gap-12">
          
          {/* TEXT CONTENT */}
          <div className="  w-full mb-10 md:w-1/2 pt-10 md:pt-0 mt-35 text-center md:text-left ">
            
            {/* Badge
            <div className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-accent text-sm font-semibold mb-6
                transition-all duration-1000 ease-out
                ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
            `}>
              
             
            </div> */}

            <h1 className={`
                text-4xl md:text-6xl font-extrabold text-gray-900 leading-[1.2] mb-6  
                transition-all duration-[1500ms] ease-out 
                ${show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[-50px]"}
            `}>
              Secure Your <span className="text-accent">Career Path.</span> <br />
              You're Worth It.
            </h1>

            <p className={`
                text-gray-500 text-lg mb-8 max-w-lg mx-auto md:mx-0
                transition-all duration-[1500ms] ease-out delay-200
                ${show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[-50px]"}
            `}>
              Discover thousands of remote and on-site opportunities. 
              Join a community of ambitious professionals today.
            </p>
              <button onClick={openRegisterModal} className={`bg-accent text-white px-10 py-4  rounded-full font-bold  shadow-xl shadow-accent/20 hover:scale-105 transition-transform 
                   transition-all duration-[1500ms] ease-out delay-50 cursor-pointer
                ${show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[-70px]"}
                `}>
              Get Started 
            </button>
          

          
          </div>

          {/* IMAGE CONTENT */}
          <div className="w-full md:w-1/2 flex justify-center relative">
            <div className="relative w-full max-w-[500px]">
              {/* Decorative Circle Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-accent/10 rounded-full blur-3xl -z-10" />
              
              <img
                className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                src="/jobfinders.png"
                alt="Job Seeker"
              />

              {/* Floating Cards (Decorative) */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden md:flex items-center gap-3 animate-bounce duration-[3000ms]">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <FaUserCheck />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Success</p>
                  <p className="font-bold text-sm text-gray-800">Job Secured!</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>


    


      {/* ================= JOB LISTING SECTION ================= */}
      <div className="max-w-7xl mx-auto py-20 px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
           <div className="max-w-2xl">
              <span className="text-accent font-bold uppercase tracking-wider text-sm">Discover Jobs</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                Explore the Latest <br/> Career Opportunities
              </h2>
              <p className="text-gray-500 mt-4">
                Hand-picked jobs from the best companies. Find the role that fits your life.
              </p>
           </div>
           
           <button onClick={openRegisterModal} className="hidden md:flex items-center gap-2 text-accent font-semibold hover:text-accent/80 transition">
              See all categories <FaArrowRightLong />
           </button>
        </div>

        {/* Filter Tabs (Visual Only) */}
        <div className="flex justify-center items-center mb-2">
          <button className="px-6 py-2 bg-accent text-white rounded-full shadow-lg shadow-accent/30 transition-transform hover:-translate-y-1 flex items-center gap-2 "><BiSolidShoppingBags/>Resent Jobs</button>

        
        </div>

        {/* Cards Grid */}
        <Link onClick={
          openRegisterModal
        }>
        <div className="flex items-center justify-center">
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="group transform transition-all duration-300 hover:-translate-y-2"
            >
              {/* Wrapping the card to add extra hover effects via 'group' if needed */}
              <JobCardGetStared job={job} />
            </div>
          ))}
        </div>
        </div>
        </Link>

        {/* Mobile View More Button */}
        <div className="mt-12 flex justify-center ">
           <button onClick={openRegisterModal} className="w-full py-4 border lg:w-[40%] border-gray-300 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 cursor-pointer ">
             Browse All Jobs
           </button>
        </div>

      </div>

      {/* ================= CTA BOTTOM ================= */}
      <div className="w-full bg-blue-50 py-20 px-6">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to take the next step?
            </h2>
            <p className="text-gray-600 mb-8">
              Join millions of users who trust us to manage their career path.
            </p>
            <button onClick={openRegisterModal} className="bg-accent text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-accent/20 hover:scale-105 transition-transform cursor-pointer">
              Join Now 
            </button>
         </div>
      </div>

    </div>
  );
}
// }



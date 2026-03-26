import { useNavigate } from "react-router-dom";
import { FiHome, FiSearch, FiAlertCircle } from "react-icons/fi";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-white font-popins px-4 overflow-hidden">
      
      {/* Background Decoration Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl animate-pulse"></div>

      {/* Main Content Container */}
      <div className="relative flex flex-col items-center text-center max-w-lg">
        
        {/* Animated 404 Header */}
        <div className="relative">
          <h1 className="text-[120px] md:text-[180px] font-black text-gray-100 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center translate-y-4">
             <FiAlertCircle className="text-accent text-6xl md:text-8xl animate-bounce" />
          </div>
        </div>

        {/* Text Section */}
        <div className="mt-4 space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Lost in the Career Path?
          </h2>
          <p className="text-gray-500 text-sm md:text-base px-6">
            The page you are looking for doesn't exist or has been moved. 
            Don't let this stop your journey to the perfect job.
          </p>
        </div>

        {/* Interactive Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl shadow-lg hover:shadow-accent/30 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <FiHome className="text-xl" />
            Go Back Home
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-300"
          >
            Go to Previous Page
          </button>
        </div>

        {/* Extra Navigation help */}
        <div className="mt-12">
            <p className="text-xs text-gray-400 flex items-center gap-2">
                <FiSearch /> Try searching for jobs directly from our homepage.
            </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 flex flex-col items-center opacity-40">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
          University of Ruhuna
        </span>
        <span className="text-xs font-medium text-gray-400">
          Job Finder Portal
        </span>
      </div>
    </div>
  );
}
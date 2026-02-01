import  { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiChevronLeft, 
  FiMapPin, 
  FiBriefcase, 
  FiClock, 
  FiDollarSign, 
  FiShare2, 
  FiMail,
  FiArrowRight,
  FiCalendar,
  FiAlertCircle
} from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";

const JobDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Assumes route is /job/:id
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. SCROLL TO TOP ON LOAD ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        
        // FIXED: Used ${id} instead of {id}
        const response = await fetch(`${backendUrl}/api/jobs/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!response.ok) throw new Error('Failed to fetch job details');
        
        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError(err.message);
        console.error(err);
        // Fallback for demo purposes if backend isn't running
        setJob(mockJobData); 
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // --- 3. SHARE FUNCTIONALITY ---
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.jobRole,
          text: `Check out this position for ${job.jobRole} at ${job.department}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for desktop/unsupported browsers
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // --- HELPER: TEXT TO LIST ---
  const renderList = (text) => {
    if (!text) return null;
    const items = text.split(/\n|•/).filter(item => item.trim().length > 0);
    return (
      <ul className="space-y-3 text-gray-600">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
            <span className="leading-relaxed">{item.trim()}</span>
          </li>
        ))}
      </ul>
    );
  };

  // --- HELPER: FORMAT DATE ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-popins">
        <BiLoaderAlt className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading position details...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-popins">
        <FiAlertCircle className="text-red-500 mb-4" size={40} />
        <h2 className="text-xl font-bold text-gray-900">Job not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-bold hover:underline">
          Return to Home
        </button>
      </div>
    );
  }

  const isExpired = new Date(job.deadline) < new Date();
  const canApply = job.isAvailable && !isExpired;

  return (
    <div className="mt-15 min-h-screen bg-gray-50 font-popins pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-100 py-8 shadow-sm">
        <div className="container mx-auto px-6">
          <button 
            onClick={() => navigate('/home/')}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <FiChevronLeft /> Back to Job Board
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{job.jobRole}</h1>
              <div className="flex flex-wrap gap-2 mt-3 text-gray-500 font-medium text-sm md:text-base">
                 <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {job.department}
                 </span>
                 <span className="flex items-center gap-1">
                    • {job.faculty}
                 </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleShare} 
                className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all" 
                title="Share"
              >
                <FiShare2 size={20} />
              </button>
              
              {canApply ? (
                <button 
                  onClick={() => navigate('/home/apply', { state: { jobTitle: job.jobRole, jobId: job.jobId } })}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  Apply Now <FiArrowRight />
                </button>
              ) : (
                <button disabled className="px-8 py-3 bg-gray-300 text-gray-500 font-bold rounded-xl cursor-not-allowed flex items-center gap-2">
                  {isExpired ? "Deadline Passed" : "Position Closed"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- MAIN CONTENT (Left) --- */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
              
              {/* Description */}
              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.jobDescription}
                </p>
              </section>

              {/* Responsibilities */}
              {job.jobResponsibilities && (
                <section className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Responsibilities
                  </h2>
                  {renderList(job.jobResponsibilities)}
                </section>
              )}

              {/* Qualifications */}
              {job.jobQualifications && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Qualifications
                  </h2>
                  {renderList(job.jobQualifications)}
                </section>
              )}
            </div>
          </div>

          {/* --- SIDEBAR INFO (Right) --- */}
          <aside className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">Job Overview</h3>
              
              <div className="space-y-6">
                
                {/* Location */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <FiMapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm font-bold text-gray-800">{job.location}</p>
                  </div>
                </div>

                {/* Job Type */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                    <FiBriefcase size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Job Type</p>
                    <p className="text-sm font-bold text-gray-800">{job.jobType || "Not Specified"}</p>
                  </div>
                </div>

                {/* Salary */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                    <FiDollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Salary</p>
                    <p className="text-sm font-bold text-gray-800">
                      {job.salary ? `Rs. ${job.salary.toLocaleString()}` : "Negotiable"}
                    </p>
                  </div>
                </div>

                {/* Post Date */}
                 <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center shrink-0">
                    <FiCalendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Posted On</p>
                    <p className="text-sm font-bold text-gray-800">{formatDate(job.postDate)}</p>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isExpired ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                    <FiClock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
                    <p className={`text-sm font-bold ${isExpired ? 'text-red-600' : 'text-gray-800'}`}>
                      {formatDate(job.deadline)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50">
                <a href={`mailto:hr@university.edu?subject=Inquiry: ${job.jobRole}`} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                  <FiMail /> Contact Department
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

// Fallback data just in case fetch fails while you test
const mockJobData = {
  jobId: "JOB-001",
  jobRole: "UX/UI Designer (Mock Data)",
  location: "Main Campus, Building A",
  faculty: "Faculty of Computing",
  department: "IT Services",
  jobDescription: "This is a fallback view because the backend connection failed. The role involves creating user-centered designs.",
  jobResponsibilities: "Conduct user research\nCreate wireframes and prototypes\nCollaborate with developers",
  jobQualifications: "BSc in Design or CS\nProficiency in Figma\n3 years experience",
  postDate: new Date().toISOString(),
  deadline: new Date(Date.now() + 864000000).toISOString(), // 10 days from now
  jobType: "Full-time",
  salary: 150000,
  isAvailable: true
};

export default JobDetailsPage;
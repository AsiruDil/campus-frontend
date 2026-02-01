import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiUploadCloud, FiCheckCircle, FiSend, FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { createClient } from '@supabase/supabase-js';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Supabase Configuration
const SUPABASE_URL = "https://qdmjewlitryupfhszcna.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbWpld2xpdHJ5dXBmaHN6Y25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzM5OTAsImV4cCI6MjA4NTM0OTk5MH0.2gaqSG-h9cEWvC_U337wp9bZSMUvQ_UJ6tNC4nCDsgc";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ApplyForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Received from: navigate('/home/apply', { state: { jobTitle: job.jobRole, jobId: job.jobId } })
  const { jobId, jobTitle } = location.state || {};

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
  });

  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // State for extracted token data
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!jobId) {
      toast.error("No job selected. Redirecting...");
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    const token = localStorage.getItem('token'); 
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // 1. Get Username
        setUserName(decoded.userName || decoded.username || decoded.name || '');

        // 2. Auto-fill Form
        setFormData(prev => ({
          ...prev,
          firstName: decoded.firstName || '',
          lastName: decoded.lastName || '',
          email: decoded.email || '',
        }));

      } catch (err) {
        console.error(err);
        toast.error("Session expired. Please log in again.");
      }
    } else {
      toast.error("Please log in to apply.");
    }
  }, [jobId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
      toast.success(`Selected: ${e.target.files[0].name}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      return toast.error("User not authenticated.");
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Uploading CV...");

    try {
      // 1. Upload CV to Supabase Bucket "cv"
      const fileExt = cvFile.name.split('.').pop();
      // REMOVED userId from filename, using timestamp for uniqueness
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cv')
        .upload(fileName, cvFile);

      if (uploadError) throw new Error("CV upload failed.");

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cv')
        .getPublicUrl(fileName);

      toast.loading("Submitting application...", { id: loadingToast });

      // 3. Post to Backend
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/apply/`, 
        {
          jobId: jobId,
          cv: publicUrl, 
          mobileNumber: formData.mobileNumber,
          userName: userName || `${formData.firstName} ${formData.lastName}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Application submitted successfully!", { id: loadingToast });
      setIsSubmitted(true);
      
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.message || "Something went wrong";
      toast.error(message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-popins">
        <Toaster />
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-white text-center">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">All Set!</h2>
          <p className="text-gray-500 mt-3 mb-8 font-medium">
            Your application for <b>{jobTitle}</b> has been sent.
          </p>
          <button onClick={() => navigate('/home/')} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-20 font-popins">
      <Toaster position="top-center" reverseOrder={false} />
      <main className="max-w-2xl mx-auto px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <FiChevronLeft size={18} /> Back
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-white">
          <div className="bg-blue-600 p-10 text-white">
            <h1 className="text-3xl font-extrabold">Apply Now</h1>
            <p className="text-blue-100 mt-1 font-medium italic">Position: {jobTitle || "Loading..."}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                <input
                  name="firstName" required value={formData.firstName}
                  onChange={handleInputChange} type="text"
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  name="lastName" required value={formData.lastName}
                  onChange={handleInputChange} type="text"
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <input
                name="email" required value={formData.email}
                onChange={handleInputChange} type="email"
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mobile</label>
              <input
                name="mobileNumber" required value={formData.mobileNumber}
                onChange={handleInputChange} type="tel"
                placeholder="+94 ..."
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">CV (PDF)</label>
              <div className="relative">
                <input type="file" id="cv-upload" className="hidden" accept=".pdf" onChange={handleFileChange} required />
                <label 
                  htmlFor="cv-upload"
                  className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer group block ${
                    cvFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'
                  }`}
                >
                  <FiUploadCloud className={`mx-auto mb-3 ${cvFile ? 'text-green-500' : 'text-gray-300 group-hover:text-blue-500'}`} size={40} />
                  <p className="text-sm font-bold text-gray-700">{cvFile ? cvFile.name : "Upload your CV"}</p>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !jobId}
              className="w-full bg-blue-600 text-white font-extrabold py-5 rounded-2xl hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <BiLoaderAlt className="animate-spin" /> : <><FiSend /> Submit Application</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ApplyForm;
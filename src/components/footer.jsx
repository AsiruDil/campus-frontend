import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      
      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        
        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Job<span className="text-accent">Finder</span>
          </h2>
          <p className="text-sm leading-relaxed">
            Find your dream job with confidence.  
            Explore remote, part-time, and full-time opportunities worldwide.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-accent cursor-pointer">Home</li>
            <li className="hover:text-accent cursor-pointer">Jobs</li>
            <li className="hover:text-accent cursor-pointer">Companies</li>
            <li className="hover:text-accent cursor-pointer">About Us</li>
          </ul>
        </div>

        {/* RESOURCES */}
        <div>
          <h3 className="text-white font-semibold mb-4">Resources</h3>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-accent cursor-pointer">Help Center</li>
            <li className="hover:text-accent cursor-pointer">Career Tips</li>
            <li className="hover:text-accent cursor-pointer">Privacy Policy</li>
            <li className="hover:text-accent cursor-pointer">Terms & Conditions</li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div>
          <h3 className="text-white font-semibold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <a className="p-3 bg-gray-800 rounded-full hover:bg-accent transition">
              <FaFacebookF />
            </a>
            <a className="p-3 bg-gray-800 rounded-full hover:bg-accent transition">
              <FaTwitter />
            </a>
            <a className="p-3 bg-gray-800 rounded-full hover:bg-accent transition">
              <FaLinkedinIn />
            </a>
            <a className="p-3 bg-gray-800 rounded-full hover:bg-accent transition">
              <FaInstagram />
            </a>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>
            © {new Date().getFullYear()} JobFinder. All rights reserved.
          </p>
          <p className="text-gray-400">
            Designed with ❤️ for job seekers
          </p>
        </div>
      </div>

    </footer>
  );
}

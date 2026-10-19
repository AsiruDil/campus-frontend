import { Link } from 'react-router-dom';
import { ArrowUpRight, GraduationCap } from 'lucide-react';
export default function Footer({ basePath = '' }) {
  const homePath = basePath || '/';
  return <footer className="career-footer"><div className="career-container footer-main"><Link to={homePath} className="footer-brand"><GraduationCap size={29} /><span>Job<span className="text-accent">Finder</span><small>UNIVERSITY OF RUHUNA</small></span></Link><p>Meaningful work.<br />A brighter future, together.</p><nav aria-label="Footer navigation"><Link to={homePath}>Home</Link><Link to={`${basePath}/about`}>About us</Link><Link to={`${basePath}/contact`}>Get in touch <ArrowUpRight size={15} /></Link></nav></div><div className="career-container footer-bottom"><span>© {new Date().getFullYear()} University of Ruhuna · JobFinder</span><span>Find your place. Make your mark.</span></div></footer>;
}
import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowRight, Search, MapPin, BriefcaseBusiness, GraduationCap, ShieldCheck, FileCheck2, MailCheck, Check, CalendarDays } from 'lucide-react';
import api from '../api/axios';

const steps = [
  { icon: <MailCheck size={25} />, title: 'Make it official', text: 'Create your account and verify your email to get started.' },
  { icon: <Search size={25} />, title: 'Find your fit', text: 'Explore vacancies by role, faculty, and department.' },
  { icon: <FileCheck2 size={25} />, title: 'Put yourself forward', text: 'Prepare your CV and supporting documents, then apply online.' },
];

export default function Home({ openRegisterModal }) {
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api.get('/api/jobs', { signal: controller.signal }).then(({ data }) => {
      setJobs(Array.isArray(data) ? data : []);
      setStatus('ready');
    }).catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, [retry]);
  const available = jobs.filter(job => job.isAvailable !== false && (!job.deadline || new Date(job.deadline) > new Date()));
  const latestJobs = available
    .sort((a, b) => {
      const dateDifference = (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
      return dateDifference || String(b.jobId || '').localeCompare(String(a.jobId || ''), undefined, { numeric: true });
    })
    .slice(0, 5);
  const dateLabel = value => value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'See vacancy details';
  return (
    <div className="career-page">
      <section className="career-hero">
        <div className="career-container hero-grid">
          <div className="hero-copy">
            <span className="career-eyebrow"><span className="status-dot" /> YOUR NEXT CHAPTER STARTS HERE</span>
            <h1>Great minds.<br />New beginnings.<br /><span>Your next role.</span></h1>
            <p>Bring your curiosity. Share your knowledge. Find your place at the University of Ruhuna.</p>
            <div className="hero-actions">
              <a className="career-button primary" href="#opportunities">Explore opportunities <ArrowUpRight size={19} /></a>
              <a className="career-text-link" href="#how-it-works">How to apply <ArrowRight size={17} /></a>
            </div>
            <div className="hero-reassurance"><ShieldCheck size={18} /><span>One account. A simpler way to apply.</span></div>
          </div>
          <div className="hero-art">
            <div className="hero-image-panel"><img src="/jobfinders.png" alt="Professionals ready for their next career opportunity" /></div>
            <div className="hero-note note-top"><span className="note-icon"><GraduationCap size={23} /></span><div><strong>A place to grow</strong><span>Teaching. Research. Impact.</span></div></div>
            <div className="hero-note note-bottom"><span className="note-check"><Check size={19} /></span><div><strong>Your future looks bright.</strong><span>Take the first step today.</span></div><ArrowUpRight size={19} /></div>
            <span className="art-spark spark-one" aria-hidden="true">+</span><span className="art-spark spark-two" aria-hidden="true">+</span>
          </div>
        </div>
      </section>
      <div className="career-container"><div className="career-values"><div><GraduationCap /><span>University of Ruhuna<strong>A community of possibility</strong></span></div><div><BriefcaseBusiness /><span>Meaningful opportunities<strong>Find work with purpose</strong></span></div><div><ShieldCheck /><span>Apply with confidence<strong>A clear, guided process</strong></span></div></div></div>
      <section id="opportunities" className="career-container opportunities-section">
        <div className="section-heading"><div><span className="career-eyebrow">FIND YOUR PLACE</span><h2>Good things are ahead.</h2><p>Explore our latest five open roles and find the opportunity that feels like you.</p></div><span className="vacancy-count">{status === 'ready' ? `${latestJobs.length} latest ${latestJobs.length === 1 ? 'opportunity' : 'opportunities'}` : 'University careers'}<span className="status-dot" /></span></div>
        <div className="vacancy-grid" aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'loading' ? <div className="vacancy-empty">Loading opportunities…</div> : status === 'error' ? <div className="vacancy-empty"><BriefcaseBusiness size={28} /><h3>We couldn’t load opportunities.</h3><p>Please try again in a moment.</p><button className="career-button secondary" onClick={() => { setStatus('loading'); setRetry(value => value + 1); }}>Try again</button></div> : latestJobs.length === 0 ? <div className="vacancy-empty"><Search size={28} /><h3>Your next opportunity is on its way.</h3><p>Check back for new university vacancies.</p></div> : latestJobs.map(job => <article className="career-job" key={job.jobId || job._id}>
            <div className="job-top"><span className="job-emblem"><GraduationCap size={24} /></span><span className="job-type">{job.jobType || 'University vacancy'}</span></div>
            <p className="job-faculty">{job.faculty || 'University of Ruhuna'}</p><h3>{job.jobRole}</h3><p className="job-department">{job.department || 'University of Ruhuna'}</p>
            <div className="job-meta"><span><MapPin size={15} />{job.location || 'University of Ruhuna'}</span><span><CalendarDays size={15} />Closes {dateLabel(job.deadline)}</span></div>
            <div className="job-bottom"><button onClick={openRegisterModal} aria-label={`Create an account to view ${job.jobRole}`}>View opportunity <ArrowUpRight size={18} /></button></div>
          </article>)}
        </div>
        <p className="vacancy-hint"><ShieldCheck size={15} /> Create an account to view full details and submit your application.</p>
      </section>
      <section id="how-it-works" className="career-process"><div className="career-container"><div className="section-heading"><div><span className="career-eyebrow">A LITTLE PREPARATION. A BIG NEXT STEP.</span><h2>Your next move, made simple.</h2></div><p>From your first look to your application,<br className="desktop-break" /> we’ll help you get there.</p></div><div className="process-grid">{steps.map(({ icon, title, text }, index) => <article key={title}><div className="process-top"><span className="process-icon">{icon}</span><span className="step-number">0{index + 1}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <section className="career-container"><div className="career-cta"><div><span className="career-eyebrow">MAKE ROOM FOR WHAT’S NEXT</span><h2>A new chapter.<br />A world of possibility.</h2><p>Your experience could make a difference here.</p></div><button className="career-button primary" onClick={openRegisterModal}>Create your account <ArrowUpRight size={20} /></button><GraduationCap className="cta-watermark" aria-hidden="true" /></div></section>
    </div>
  );
}
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ContainerScroll } from '../components/ui/container-scroll-animation'
import ScrollExpand from '../components/ui/ScrollExpand'
import TractionOrbit from '../components/ui/TractionOrbit'
import LandingProductDemo from '../components/ui/LandingProductDemo'
import {
  MarkIcon, ArrowIcon, PlayIcon, RoleIcon, WaveIcon, OrbIcon,
  EvalIcon, ShieldIcon, ReportIcon, ResumeIcon, BoltIcon, QuoteIcon,
  ClockIcon, CheckIcon, ChatIcon,
} from '../components/ui/icons'

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'vishwesh.penkar25@aiml.sce.edu.in'
const PROJECT_URL = 'https://github.com/vishweshpenkar06/AI-Interviewer'
const contactInput = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,.14)',
  background: 'rgba(255,255,255,.05)',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
}

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white" style={{ overflowX: 'clip' }}>
      {/* Background Video */}
      <video
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
        autoPlay muted loop playsInline
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4" type="video/mp4" />
      </video>

      {/* Vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,.03), transparent 24%, transparent 82%, rgba(0,0,0,.05)), radial-gradient(ellipse at 44% 54%, transparent 30%, rgba(0,0,0,.055) 100%)'
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(245,158,11,.4)' }}>
            <img src="/logo.jpeg" alt="AI Interviewer" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AI Interviewer</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">How it Works</a>
          <a href="#roles" className="text-sm text-white/70 hover:text-white transition-colors">Job Roles</a>
          <a href="#team" className="text-sm text-white/70 hover:text-white transition-colors">Team</a>
          <a href="#contact" className="text-sm text-white/70 hover:text-white transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors">Sign In</Link>
          <Link
            to="/register"
            className="cta-solid px-5 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Start Free
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/80 mb-6 border border-white/10">
              AI-Powered Interview Preparation
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            Ace Your Next
            <br />
            <span className="text-white/60">Interview with AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg text-white/75 max-w-xl leading-relaxed mb-10"
          >
            Practice with an AI interviewer that asks real questions, evaluates your
            answers, and gives you detailed feedback — all before the actual interview.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              to="/register"
              className="cta-solid group flex items-center gap-3 px-7 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all"
            >
              Start Practicing Free
              <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="group flex items-center gap-3 px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/10 hover:bg-white/15 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <PlayIcon className="w-5 h-5" />
              </div>
              See How It Works
            </Link>
          </motion.div>
        </div>

        {/* Demo Card */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute right-8 bottom-32 w-64 hidden lg:block"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-amber-900/50 to-orange-900/50 flex items-center justify-center">
              <div className="text-center p-4">
                <OrbIcon className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-white/60">AI Interview Simulation</p>
              </div>
            </div>
            <button className="w-full py-2.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-lg border border-white/10 hover:bg-white/15 transition-all">
              Try Demo
            </button>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full"
        >
        <TractionOrbit
          title="Traction"
          subtitle="Since launch"
          items={[
            { value: '20+', label: 'Job roles', icon: RoleIcon },
            { value: '3,400+', label: 'Interview questions', icon: ChatIcon },
            { value: '95%', label: 'User satisfaction', icon: CheckIcon },
            { value: '24/7', label: 'Available anytime', icon: ClockIcon },
            { value: '<60s', label: 'To the first question', icon: BoltIcon },
          ]}
        />
        </motion.div>
      </div>

      {/* Product scroll showcase */}
      <section className="relative z-10">
        <ContainerScroll
          titleComponent={
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/40 mb-4">The scoring engine</p>
              <h2 className="text-4xl md:text-6xl font-semibold text-white leading-[1.05]" style={{ textShadow: '0 2px 24px rgba(0,0,0,.9)' }}>
                See exactly how an answer is scored.
                <br />
                <span className="text-white/45">Evidence, not vibes.</span>
              </h2>
              <p className="mt-5 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,.7)', textShadow: '0 1px 14px rgba(0,0,0,.9)' }}>
                Five criteria, weights computed in code, and quotes verified against your own words.
              </p>
            </div>
          }
        >
          <LandingProductDemo />
        </ContainerScroll>
      </section>

      {/* Full-bleed scroll expand */}
      <section className="relative z-10">
        <ScrollExpand
          src="/robot-human-handshake.png"
          alt="A human and a robot shaking hands"
          title="Every session, scored."
          scrollHint="Scroll to open the studio"
          useWindowScroll
          mediaZoom={1.05}
          overlayScrim={0.5}
        >
          <h2 className="text-3xl md:text-5xl font-semibold text-white mb-4">
            A studio, not a form.
          </h2>
          <p className="text-white/65 max-w-xl text-base md:text-lg">
            Pick a role, answer in text or voice, and get a report that shows the rubric, the quotes and the next drill.
          </p>
          <Link
            to="/register"
            className="mt-7 inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all"
          >
            Start Practicing Free <ArrowIcon className="w-4 h-4" />
          </Link>
        </ScrollExpand>
      </section>

      {/* How It Works */}
      <div id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
          style={{
            maxWidth: '760px',
            margin: '0 auto 4rem',
            padding: '20px 24px',
            borderRadius: '24px',
            backgroundImage: 'linear-gradient(145deg, rgba(12,12,14,.62), rgba(12,12,14,.38))',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ textShadow: '0 2px 18px rgba(0,0,0,.9)' }}>How It Works</h2>
          <p className="max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,.72)', textShadow: '0 1px 12px rgba(0,0,0,.9)' }}>
            Three simple steps to boost your interview confidence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Choose Your Role', desc: 'Select from 20+ job roles — Frontend, Backend, DevOps, Data Science, and more.' },
            { step: '02', title: 'Practice Interview', desc: 'Answer AI-generated questions via text or voice. Get real-time feedback on your responses.' },
            { step: '03', title: 'Get Detailed Report', desc: 'Receive a comprehensive evaluation with scores, strengths, weaknesses, and sample answers.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative p-6 rounded-2xl"
              style={{
                backgroundImage: 'linear-gradient(145deg, rgba(20,18,16,.82), rgba(7,10,12,.66))',
                backdropFilter: 'blur(26px) saturate(140%)',
                WebkitBackdropFilter: 'blur(26px) saturate(140%)',
                border: '1px solid rgba(255,255,255,.14)',
                boxShadow: '0 14px 40px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.07)',
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl font-bold font-mono" style={{ color: '#fbbf24' }}>{item.step}</span>
                <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(251,191,36,.55), transparent)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,.68)' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ textShadow: '0 2px 18px rgba(0,0,0,.9)' }}>Everything You Need</h2>
          <p className="max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,.72)', textShadow: '0 1px 12px rgba(0,0,0,.9)' }}>
            Built with AI to give you the most realistic interview experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: EvalIcon, tint: '#fbbf24', title: 'AI-Powered Evaluation', desc: 'Multi-agent scoring: technical accuracy, communication clarity, and behavioral fit.' },
            { icon: WaveIcon, tint: '#fb7185', title: 'Voice & Text Input', desc: 'Practice speaking your answers or typing — just like a real interview.' },
            { icon: OrbIcon, tint: '#7dd3fc', title: 'Digital Avatar', desc: 'Interactive AI interviewer with animated responses and lip sync.' },
            { icon: ShieldIcon, tint: '#5eead4', title: 'Interview Proctoring', desc: 'Face detection, gaze tracking, and integrity monitoring for realistic practice.' },
            { icon: ReportIcon, tint: '#fda4af', title: 'Performance Reports', desc: 'Detailed analytics with radar charts, category scores, and improvement tips.' },
            { icon: RoleIcon, tint: '#fdba74', title: '20+ Job Roles', desc: 'Pre-built question banks for Frontend, Backend, DevOps, Data Science, and more.' },
            { icon: ResumeIcon, tint: '#fcd34d', title: 'Resume Analysis', desc: 'Upload your resume for personalized questions based on your experience.' },
            { icon: BoltIcon, tint: '#f97316', title: 'Instant Feedback', desc: 'Get AI feedback on each answer before moving to the next question.' },
            { icon: QuoteIcon, tint: '#e7c6a3', title: 'Sample Answers', desc: 'Learn from expert-crafted sample responses for every question.' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-5 bg-black/55 backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-black/50 transition-all"
            >
              <div className="feature-icon" style={{ '--fi': feature.tint }}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">{feature.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ textShadow: '0 2px 18px rgba(0,0,0,.9)' }}>What we hold ourselves to</h2>
          <p className="max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,.72)', textShadow: '0 1px 12px rgba(0,0,0,.9)' }}>
            Five principles behind every question, score and report.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[
            { icon: CheckIcon, title: 'Trust', desc: 'Every score comes from the rubric and is checked against your own words. A quote that is not in your answer is flagged, never invented.' },
            { icon: ChatIcon, title: 'Simplicity', desc: 'One clear score, five criteria and the exact quote behind each. Nothing to decode before you can improve.' },
            { icon: ShieldIcon, title: 'Privacy', desc: 'Camera checks are optional and run in your browser. Nothing is uploaded, and proctoring stays off until you opt in.' },
            { icon: EvalIcon, title: 'Fairness', desc: 'The same rubric for every answer and every session, so progress reflects your work, not the mood of the room.' },
            { icon: OrbIcon, title: 'Innovation', desc: 'Adaptive follow-ups, coding rounds and voice answers in one studio. Practise the interview you will actually get.' },
          ].map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="value-card"
            >
              <span className="value-medallion"><value.icon className="w-6 h-6" /></span>
              <h3 className="text-base font-semibold mb-2">{value.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.68)' }}>{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Problem */}
      <div className="relative z-10 max-w-5xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center problem-intro"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ textShadow: '0 2px 18px rgba(0,0,0,.9)' }}>The Problem We Solve</h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,.72)', textShadow: '0 1px 12px rgba(0,0,0,.9)' }}>
            Most preparation gives you more questions, not better feedback. You rehearse alone, get a vague
            “good answer”, and only discover the weak criterion in the real round. AI Interviewer turns rehearsal
            into evidence: what was asked, what you said, how it scored, and what to fix next.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          {[
            { icon: RoleIcon, title: 'Forty applications, one story', desc: 'The same rehearsed answer stops working when the role changes.' },
            { icon: ClockIcon, title: 'A timed screen at 11pm', desc: 'No one to check your structure, edge cases or trade-offs.' },
            { icon: ChatIcon, title: 'A behavioural round alone', desc: 'You cannot tell whether the story actually landed.' },
            { icon: ReportIcon, title: '“Be more specific”', desc: 'Feedback with no quote, no criterion and no next step.' },
          ].map((item) => (
            <div key={item.title} className="problem-card">
              <span className="problem-icon"><item.icon className="w-5 h-5" /></span>
              <div>
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="problem-callout">
          <p className="text-sm font-semibold flex items-center justify-center gap-2" style={{ color: '#fde68a' }}>
            <ShieldIcon className="w-4 h-4" /> That is the gap AI Interviewer fills.
          </p>
          <p className="text-xs md:text-sm leading-relaxed mt-2" style={{ color: 'rgba(255,255,255,.7)' }}>
            A studio that asks role-specific questions, scores the five criteria, quotes your own words and hands you
            the next drill — so the real interview is the second time you have done it.
          </p>
        </div>
      </div>

      {/* Job Roles */}
      <div id="roles" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Covering Every Role</h2>
          <p className="text-white/50 max-w-lg mx-auto">
            Specialized questions for 20+ engineering and tech roles.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3">
          {[
            'Frontend Developer', 'Backend Developer', 'Full Stack', 'Java Developer',
            'Python Developer', 'AI/ML Engineer', 'DevOps Engineer', 'Data Engineer',
            'Data Scientist', 'Data Analyst', 'Cloud Architect', 'Mobile Developer',
            'QA Engineer', 'System Design', 'Cybersecurity', 'Product Manager',
            'UI/UX Designer', 'SRE', 'Blockchain', 'Game Developer'
          ].map((role) => (
            <span
              key={role}
              className="px-4 py-2 bg-black/35 backdrop-blur-md border border-white/10 rounded-full text-sm text-white/80 hover:bg-black/50 hover:text-white transition-all cursor-default"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Team */}
      <div id="team" className="relative z-10 max-w-6xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[.2em] mb-4" style={{ color: '#fbbf24' }}>The team</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Three builders. One honest score.</h2>
          <p className="text-white/60 max-w-xl mx-auto">
            We built the interviewer we wished we had — evidence, not vibes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 max-w-5xl mx-auto">
          {[
            { name: 'Eshan Khilare', role: 'Co-Founder & AI Engineer', image: '/team/eshan-khilare.jpg', focus: 'center 18%' },
            { name: 'Abhijit Kapure', role: 'Co-Founder & Full-Stack Engineer', image: '/team/abhijit-kapure.jpg', focus: 'center 18%' },
            { name: 'Vishwesh Penkar', role: 'Co-Founder & Product Designer', image: '/team/vishwesh-penkar.jpg', focus: 'center 22%' },
          ].map((member, i) => (
            <motion.article
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(24,22,20,.62), rgba(5,12,14,.72))',
                border: '1px solid rgba(255,255,255,.14)',
                backdropFilter: 'blur(18px) saturate(130%)',
                WebkitBackdropFilter: 'blur(18px) saturate(130%)',
                boxShadow: '0 24px 50px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.08)',
              }}
            >
              <div className="pt-5 flex justify-center">
                <span className="block w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,.22)' }} />
              </div>
              <div className="p-4">
                <div className="aspect-[4/5] overflow-hidden rounded-xl" style={{ background: 'rgba(0,0,0,.25)' }}>
                  <img
                    src={member.image}
                    alt={`${member.name}, ${member.role}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{ objectPosition: member.focus }}
                  />
                </div>
                <h3 className="mt-5 text-sm font-bold uppercase tracking-[.14em]" style={{ color: '#fff' }}>{member.name}</h3>
                <p className="mt-1.5 text-xs" style={{ color: 'rgba(255,255,255,.55)' }}>{member.role}</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Regarding ${member.name}`)}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[.14em]"
                  style={{ color: '#fbbf24' }}
                >
                  <ChatIcon className="w-3.5 h-3.5" /> Contact
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div id="contact" className="relative z-10 max-w-6xl mx-auto px-8 py-24">
        <div
          className="grid lg:grid-cols-[1.15fr_.85fr] rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(24,22,20,.80), rgba(5,12,14,.86))',
            border: '1px solid rgba(255,255,255,.14)',
            backdropFilter: 'blur(18px) saturate(130%)',
            WebkitBackdropFilter: 'blur(18px) saturate(130%)',
            boxShadow: '0 24px 60px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.08)',
          }}
        >
          <form
            className="p-8 md:p-10"
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              const subject = `Project enquiry from ${data.get('name')}`
              const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || '-'}\n\n${data.get('message')}`
              window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[.18em]" style={{ color: '#fbbf24' }}>Contact us</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold" style={{ color: '#fff' }}>Tell us what you need.</h2>
            <p className="mt-3 text-sm max-w-md" style={{ color: 'rgba(255,255,255,.6)' }}>
              Product questions, feedback or a collaboration idea. Send a note and the team will get back to you.
            </p>

            <div className="mt-7 grid sm:grid-cols-2 gap-3">
              <input name="name" required placeholder="Name" className="contact-input" style={contactInput} />
              <input name="email" type="email" required placeholder="Email" className="contact-input" style={contactInput} />
            </div>
            <input name="phone" placeholder="Phone (optional)" className="contact-input mt-3" style={contactInput} />
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Share your question, feedback or suggestion..."
              className="contact-input mt-3 resize-y"
              style={contactInput}
            />
            <button
              type="submit"
              className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: '#fff', color: '#111' }}
            >
              Send message <ArrowIcon className="w-4 h-4" />
            </button>
            <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>
              This opens your email app with the message ready to send.
            </p>
          </form>

          <aside className="p-8 md:p-10" style={{ background: 'rgba(255,255,255,.025)', borderLeft: '1px solid rgba(255,255,255,.08)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-[.18em]" style={{ color: '#fbbf24' }}>Contact info</h3>
            <div className="mt-5 space-y-4 text-sm" style={{ color: 'rgba(255,255,255,.6)' }}>
              <div>
                <p className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.4)' }}>Email</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium hover:underline" style={{ color: '#fff' }}>
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.4)' }}>Project</p>
                <a href={PROJECT_URL} target="_blank" rel="noreferrer" className="font-medium hover:underline" style={{ color: '#fff' }}>
                  GitHub repository
                </a>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.4)' }}>Response time</p>
                <p>1-2 business days</p>
              </div>
              <p className="pt-4 text-xs leading-relaxed" style={{ borderTop: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.4)' }}>
                Reporting a scoring problem? Include the interview ID from your report so we can inspect the stored evaluation.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center p-12 rounded-3xl"
          style={{
            backgroundImage: 'linear-gradient(145deg, rgba(10,9,8,.93), rgba(3,5,7,.90))',
            backdropFilter: 'blur(40px) saturate(140%)',
            WebkitBackdropFilter: 'blur(40px) saturate(140%)',
            border: '1px solid rgba(255,255,255,.18)',
            boxShadow: '0 24px 70px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.09)',
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ textShadow: '0 2px 18px rgba(0,0,0,.95)' }}>Ready to ace your next interview?</h2>
          <p className="mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,.86)', textShadow: '0 1px 12px rgba(0,0,0,.9)' }}>
            Start practicing with AI-powered feedback today. Free to get started.
          </p>
          <Link
            to="/register"
            className="cta-solid inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all"
          >
            Start Practicing Free
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <p className="text-sm text-white/40">2026 AI Interviewer. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-white/40 hover:text-white/70">Privacy</Link>
            <Link to="/terms" className="text-sm text-white/40 hover:text-white/70">Terms</Link>
            <Link to="/cookies" className="text-sm text-white/40 hover:text-white/70">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing

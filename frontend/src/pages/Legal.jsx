import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

const UPDATED = '27 October 2026'
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'vishwesh.penkar25@aiml.sce.edu.in'
const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || ''

const H2 = ({ children }) => (
  <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: '#fff' }}>{children}</h2>
)
const P = ({ children }) => (
  <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,.62)' }}>{children}</p>
)
const UL = ({ children }) => (
  <ul className="list-disc pl-5 space-y-1.5 text-sm mb-3" style={{ color: 'rgba(255,255,255,.62)' }}>{children}</ul>
)

const LegalShell = ({ title, intro, children }) => (
  <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
    <header className="border-b" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
      <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>AI</span>
          <span className="font-bold text-white">Interviewer</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,.45)' }}>
          <ArrowLeft className="h-4 w-4" /> Back to app
        </Link>
      </div>
    </header>

    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 badge-primary">
        <ShieldCheck className="h-3.5 w-3.5" /> Legal
      </div>
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#fff' }}>{title}</h1>
      <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,.45)' }}>Last updated: {UPDATED}</p>
      <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,.55)' }}>{intro}</p>
      {children}

      <div className="mt-10 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.1)' }}>
        <h2 className="text-sm font-semibold mb-2" style={{ color: '#fff' }}>Contact</h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,.55)' }}>
          Email:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#a5b4fc' }}>{CONTACT_EMAIL}</a>
          {CONTACT_PHONE ? (
            <>
              <br />Phone: <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} style={{ color: '#a5b4fc' }}>{CONTACT_PHONE}</a>
            </>
          ) : null}
          <br />Project: <a href="https://github.com/vishweshpenkar06/AI-Interviewer" target="_blank" rel="noreferrer" style={{ color: '#a5b4fc' }}>github.com/vishweshpenkar06/AI-Interviewer</a>
        </p>
      </div>

      <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{ color: 'rgba(255,255,255,.45)' }}>
        <Link to="/privacy" className="hover:opacity-80">Privacy Policy</Link>
        <Link to="/terms" className="hover:opacity-80">Terms of Service</Link>
        <Link to="/cookies" className="hover:opacity-80">Cookie Policy</Link>
      </nav>
      <p className="mt-6 text-xs" style={{ color: 'rgba(255,255,255,.3)' }}>
        This is a practice tool, not legal advice. The project is a student/hackathon build; have counsel review these pages before commercial use.
      </p>
    </main>
  </div>
)

export const Privacy = () => (
  <LegalShell
    title="Privacy Policy"
    intro="This policy explains what the AI Interviewer collects, why, who processes it, and how you can remove it. It covers the web app, the API and the AI service."
  >
    <H2>1. Who we are</H2>
    <P>AI Interviewer is an interview-practice application operated by the project maintainer. The contact details are at the bottom of this page.</P>

    <H2>2. What we collect</H2>
    <UL>
      <li><strong>Account data:</strong> full name, email address, phone number if you provide one, and a hashed password. If you sign in with Google, we receive your verified email and display name.</li>
      <li><strong>Résumé data:</strong> the file or text you upload and the skills, experience and summary extracted from it.</li>
      <li><strong>Interview data:</strong> questions asked, your answers and transcripts, evaluation scores, feedback and reports.</li>
      <li><strong>Optional proctoring:</strong> when you enable it, face/presence checks run in your browser. Camera frames are not uploaded by us; only derived signals (for example, presence or tab switches) are used in the session.</li>
      <li><strong>Technical data:</strong> IP address, request timestamps and error logs used for security, rate limiting and debugging.</li>
    </UL>

    <H2>3. Why we use it</H2>
    <UL>
      <li>Create and secure your account, and sign you in.</li>
      <li>Generate role-specific questions and evaluate your answers against the rubric.</li>
      <li>Produce your report, practice plan and PDF export.</li>
      <li>Prevent abuse, investigate errors and keep the service available.</li>
    </UL>

    <H2>4. AI and third-party processors</H2>
    <P>Answers are sent to Google Gemini for evaluation. Code is executed through Judge0. Speech can be synthesized with edge-tts; if Deepgram is configured, audio is sent there for transcription. These providers process the data to return the result and are governed by their own terms and privacy policies.</P>
    <P>We do not sell your personal data, use it for advertising, or use your answers to train our own models.</P>

    <H2>5. Storage and security</H2>
    <P>Passwords are hashed with BCrypt. Sessions use a signed JWT stored in your browser&apos;s local storage. Traffic is served over HTTPS in production. Data is stored in the configured MySQL-compatible database; the local demo uses an in-memory database that is wiped on restart.</P>

    <H2>6. Retention and deletion</H2>
    <P>Account, résumé and interview data are kept until you delete them. You can delete your account from Profile → Security → Delete Account, which removes the account and its related records. Server logs are kept for a short operational period. Backup copies may persist briefly before rotation.</P>

    <H2>7. Your rights</H2>
    <UL>
      <li>Access, correct or delete your personal data.</li>
      <li>Export your report or ask for a copy of your data.</li>
      <li>Object to processing or withdraw consent for optional features such as proctoring.</li>
      <li>Lodge a complaint with your local data-protection authority.</li>
    </UL>

    <H2>8. Children</H2>
    <P>The service is intended for people aged 16 and over. Do not create an account if you are younger.</P>

    <H2>9. Changes</H2>
    <P>We may update this policy as the product changes. The date at the top shows the latest revision; material changes will be announced in the app.</P>
  </LegalShell>
)

export const Terms = () => (
  <LegalShell
    title="Terms of Service"
    intro="These terms govern your use of AI Interviewer. By creating an account or using the app, you agree to them."
  >
    <H2>1. The service</H2>
    <P>AI Interviewer is an interview-practice tool. It generates questions, evaluates answers with an AI model and produces a practice report. It is not a hiring decision, a certification, or a substitute for professional advice.</P>

    <H2>2. Accounts</H2>
    <UL>
      <li>Provide accurate account information and keep your password secure.</li>
      <li>You are responsible for activity under your account.</li>
      <li>Phone numbers are used as a login identifier and are not SMS-verified yet. Do not use a number you do not control.</li>
      <li>We may suspend accounts that abuse the service or break these terms.</li>
    </UL>

    <H2>3. Acceptable use</H2>
    <UL>
      <li>Do not attempt to access another user&apos;s data, bypass authentication, or disrupt the service.</li>
      <li>Do not scrape, reverse engineer or resell the service without permission.</li>
      <li>Do not upload unlawful content or content that infringes someone else&apos;s rights.</li>
      <li>Do not use the service to make automated hiring decisions about other people.</li>
    </UL>

    <H2>4. Your content</H2>
    <P>You keep ownership of your résumé, answers and other content. You grant us a limited licence to store and process it to provide the service (question generation, evaluation, reports and support).</P>

    <H2>5. AI output</H2>
    <P>Scores, feedback and sample answers are generated automatically and can be wrong, incomplete or biased. Treat them as practice guidance, not as a factual assessment of your ability. The rubric and evidence checks reduce errors but do not eliminate them.</P>

    <H2>6. Availability and free tier</H2>
    <P>The service is provided as-is. Free deployments may sleep, rate-limit requests or use a fallback evaluator when an AI provider is unavailable. We do not guarantee uninterrupted access or a specific score.</P>

    <H2>7. Termination</H2>
    <P>You can delete your account at any time. We may suspend or terminate access for abuse, security risk or violation of these terms.</P>

    <H2>8. Liability</H2>
    <P>To the maximum extent permitted by law, we are not liable for indirect or consequential loss, lost opportunities, or decisions made on the basis of an AI-generated score. Nothing in these terms limits liability that cannot be limited by law.</P>

    <H2>9. Changes and governing law</H2>
    <P>We may update these terms; the date above shows the latest revision. These terms are governed by the laws applicable at the operator&apos;s place of business, without affecting mandatory consumer protections.</P>
  </LegalShell>
)

export const Cookies = () => (
  <LegalShell
    title="Cookie Policy"
    intro="AI Interviewer uses browser storage to keep you signed in. It does not use advertising or cross-site tracking cookies."
  >
    <H2>1. What we store</H2>
    <UL>
      <li><strong>token</strong> (local storage): your signed-in session, so you do not have to log in on every page.</li>
      <li><strong>user</strong> (local storage): your name, email and role for the header and greeting.</li>
      <li><strong>ui-version</strong> (local storage): whether you chose the classic or studio interface.</li>
      <li><strong>g_state</strong> (cookie, Google sign-in only): a short-lived, HttpOnly value that protects the OAuth callback against cross-site request forgery. It expires after 10 minutes.</li>
    </UL>

    <H2>2. What we do not use</H2>
    <P>No advertising cookies, no cross-site trackers, no session-replay scripts and no analytics cookies are set by the app. The background video is loaded from a CDN and the host may keep standard request logs.</P>

    <H2>3. Third parties</H2>
    <P>If you sign in with Google, Google sets its own cookies on its domain during the consent flow. Code execution (Judge0), speech synthesis (edge-tts) and AI evaluation (Google Gemini) happen server-side and do not set cookies in your browser.</P>

    <H2>4. Managing storage</H2>
    <P>You can clear site data in your browser settings, or sign out from the app. Clearing the token logs you out; clearing the other keys resets preferences. Blocking local storage will prevent sign-in.</P>

    <H2>5. Changes</H2>
    <P>If analytics or advertising are added later, this policy and the consent flow will be updated before they are enabled.</P>
  </LegalShell>
)

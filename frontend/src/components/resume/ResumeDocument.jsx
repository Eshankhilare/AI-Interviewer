import './ResumeDocument.css'

const contactParts = (draft) => [
  draft.email, draft.phone, draft.location, draft.linkedin, draft.github,
].filter(Boolean)

const Experience = ({ items, className = '' }) => (
  <div className={`rs-experience ${className}`}>
    {items.map((item, index) => (
      <div className="rs-exp" key={`${item.company}-${index}`}>
        <div className="rs-exp-head">
          <span className="rs-exp-title">{item.title || 'Role'}</span>
          {item.period && <span className="rs-exp-period">{item.period}</span>}
        </div>
        {item.company && <div className="rs-exp-company">{item.company}</div>}
        {item.bullets.length > 0 && (
          <ul>{item.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}</ul>
        )}
      </div>
    ))}
  </div>
)

const Education = ({ items }) => (
  <div className="rs-education">
    {items.map((item, index) => (
      <div className="rs-edu" key={`${item.school}-${index}`}>
        <div className="rs-edu-degree">{item.degree}</div>
        <div className="rs-edu-school">
          {[item.school, item.period].filter(Boolean).join(' · ')}
        </div>
      </div>
    ))}
  </div>
)

const Skills = ({ items, dark = false }) => (
  <div className={`rs-skills${dark ? ' rs-skills-dark' : ''}`}>
    {items.map((skill) => <span key={skill}>{skill}</span>)}
  </div>
)

const Projects = ({ items }) => (
  <div className="rs-projects">
    {items.map((item, index) => (
      <div className="rs-project" key={`${item.name}-${index}`}>
        <strong>{item.name}</strong>
        <span>{item.detail}</span>
      </div>
    ))}
  </div>
)

const Section = ({ title, children, className = '' }) => (
  <section className={`rs-section ${className}`}>
    <h2>{title}</h2>
    {children}
  </section>
)

const Classic = ({ resume, draft }) => (
  <article className="rs rs-print rs-classic">
    <header className="rs-classic-head">
      <h1>{draft.fullName || 'Your Name'}</h1>
      <p className="rs-role">{draft.role || 'Target role'}</p>
      <p className="rs-contact">{contactParts(draft).join('  •  ')}</p>
    </header>
    <Section title="Summary"><p className="rs-summary">{resume.summary}</p></Section>
    {resume.experience.length > 0 && (
      <Section title="Experience"><Experience items={resume.experience} /></Section>
    )}
    {resume.education.length > 0 && (
      <Section title="Education"><Education items={resume.education} /></Section>
    )}
    {resume.skills.length > 0 && (
      <Section title="Skills"><p className="rs-skill-line">{resume.skills.join(' · ')}</p></Section>
    )}
    {resume.projects.length > 0 && (
      <Section title="Projects"><Projects items={resume.projects} /></Section>
    )}
  </article>
)

const Modern = ({ resume, draft }) => (
  <article className="rs rs-print rs-modern">
    <header className="rs-modern-head">
      <div>
        <h1>{draft.fullName || 'Your Name'}</h1>
        <p className="rs-role">{draft.role || 'Target role'}</p>
      </div>
      <p className="rs-contact">{contactParts(draft).join('\n')}</p>
    </header>
    <div className="rs-modern-body">
      <main>
        <Section title="Profile"><p className="rs-summary">{resume.summary}</p></Section>
        {resume.experience.length > 0 && (
          <Section title="Experience"><Experience items={resume.experience} /></Section>
        )}
        {resume.projects.length > 0 && (
          <Section title="Projects"><Projects items={resume.projects} /></Section>
        )}
      </main>
      <aside>
        {resume.skills.length > 0 && (
          <Section title="Skills"><Skills items={resume.skills} /></Section>
        )}
        {resume.education.length > 0 && (
          <Section title="Education"><Education items={resume.education} /></Section>
        )}
      </aside>
    </div>
  </article>
)

const Minimal = ({ resume, draft }) => (
  <article className="rs rs-print rs-minimal">
    <header>
      <h1>{draft.fullName || 'Your Name'}</h1>
      <p className="rs-role">{draft.role || 'Target role'}</p>
      <p className="rs-contact">{contactParts(draft).join('   /   ')}</p>
    </header>
    <Section title="Profile"><p className="rs-summary">{resume.summary}</p></Section>
    {resume.experience.length > 0 && (
      <Section title="Experience"><Experience items={resume.experience} /></Section>
    )}
    {resume.education.length > 0 && (
      <Section title="Education"><Education items={resume.education} /></Section>
    )}
    {resume.skills.length > 0 && (
      <Section title="Skills"><p className="rs-skill-line">{resume.skills.join('  /  ')}</p></Section>
    )}
    {resume.projects.length > 0 && (
      <Section title="Selected projects"><Projects items={resume.projects} /></Section>
    )}
  </article>
)

const Sidebar = ({ resume, draft }) => (
  <article className="rs rs-print rs-sidebar">
    <aside className="rs-side">
      <h1>{draft.fullName || 'Your Name'}</h1>
      <p className="rs-role">{draft.role || 'Target role'}</p>
      <div className="rs-side-block">
        <h2>Contact</h2>
        {contactParts(draft).map((part) => <p key={part}>{part}</p>)}
      </div>
      {resume.skills.length > 0 && (
        <div className="rs-side-block">
          <h2>Skills</h2>
          <Skills items={resume.skills} dark />
        </div>
      )}
      {resume.education.length > 0 && (
        <div className="rs-side-block">
          <h2>Education</h2>
          <Education items={resume.education} />
        </div>
      )}
    </aside>
    <main className="rs-side-main">
      <Section title="Profile"><p className="rs-summary">{resume.summary}</p></Section>
      {resume.experience.length > 0 && (
        <Section title="Experience"><Experience items={resume.experience} /></Section>
      )}
      {resume.projects.length > 0 && (
        <Section title="Projects"><Projects items={resume.projects} /></Section>
      )}
    </main>
  </article>
)

const Technical = ({ resume, draft }) => (
  <article className="rs rs-print rs-technical">
    <header>
      <div>
        <h1>{draft.fullName || 'Your Name'}</h1>
        <p className="rs-role">{draft.role || 'Target role'}</p>
      </div>
      <p className="rs-contact">{contactParts(draft).join(' · ')}</p>
    </header>
    <Section title="Summary"><p className="rs-summary">{resume.summary}</p></Section>
    {resume.skills.length > 0 && (
      <Section title="Stack"><Skills items={resume.skills} /></Section>
    )}
    {resume.experience.length > 0 && (
      <Section title="Experience"><Experience items={resume.experience} /></Section>
    )}
    {resume.projects.length > 0 && (
      <Section title="Projects"><Projects items={resume.projects} /></Section>
    )}
    {resume.education.length > 0 && (
      <Section title="Education"><Education items={resume.education} /></Section>
    )}
  </article>
)

const TEMPLATES = { classic: Classic, modern: Modern, minimal: Minimal, sidebar: Sidebar, technical: Technical }

const ResumeDocument = ({ resume, draft, template = 'classic' }) => {
  const Component = TEMPLATES[template] || Classic
  return <Component resume={resume} draft={draft} />
}

export default ResumeDocument

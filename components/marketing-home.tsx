import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Find work that fits",
    description: "Explore opportunities by role, skills, location, and work style, with clear details to help you decide where to apply.",
    tag: "DISCOVER",
  },
  {
    number: "02",
    title: "Make your experience count",
    description: "Build a stronger resume and present your skills with tools designed to make your next application more focused.",
    tag: "PREPARE",
  },
  {
    number: "03",
    title: "Keep your search moving",
    description: "Track applications, save promising roles, and keep your next step visible instead of losing everything in scattered tabs.",
    tag: "ORGANISE",
  },
];

const steps = [
  ["01", "Set your direction", "Add your skills, experience, and the roles you want to explore."],
  ["02", "Explore your options", "Compare opportunities and find roles that line up with your goals."],
  ["03", "Move with purpose", "Prepare your applications and keep track of what happens next."],
];

export default function MarketingHome() {
  return (
    <main className="marketing-home">
      <header className="marketing-nav">
        <Link className="marketing-brand" href="/" aria-label="JobCraft home">
          <span className="marketing-brand-mark" aria-hidden="true">J</span>
          <span>JobCraft<span className="marketing-brand-period">.</span></span>
        </Link>
        <nav className="marketing-nav-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <Link href="/jobs">Explore jobs</Link>
        </nav>
        <div className="marketing-nav-actions">
          <Link className="marketing-sign-in" href="/dashboard?auth=login">Sign in</Link>
          <Link className="marketing-button marketing-button-small" href="/dashboard?auth=signup">Get started <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <div className="marketing-kicker"><span className="marketing-live-dot" /> YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>Make your next<br />career move <em>count.</em></h1>
          <p className="marketing-hero-description">
            Find opportunities, put your experience forward, and organise your job search in one clear workspace.
            Your career is bigger than a single job board.
          </p>
          <div className="marketing-hero-actions">
            <Link className="marketing-button" href="/dashboard?auth=signup">Build your career path <span aria-hidden="true">↗</span></Link>
            <Link className="marketing-button-quiet" href="/jobs">Explore opportunities <span aria-hidden="true">→</span></Link>
          </div>
          <div className="marketing-proof">
            <div className="marketing-proof-avatars" aria-hidden="true"><span>J</span><span>C</span><span>+</span></div>
            <p><strong>A more thoughtful job search</strong><br /><span>Discover. Prepare. Keep moving.</span></p>
          </div>
        </div>

        <div className="marketing-hero-visual" aria-label="Illustration of a career workspace">
          <div className="marketing-orbit marketing-orbit-one" />
          <div className="marketing-orbit marketing-orbit-two" />
          <div className="marketing-visual-label"><span className="marketing-live-dot" /> YOUR CAREER WORKSPACE</div>
          <div className="marketing-preview-card marketing-preview-main">
            <div className="marketing-preview-top"><span className="marketing-preview-icon">✳</span><span className="marketing-preview-status">YOUR NEXT STEP</span><span className="marketing-preview-more">···</span></div>
            <p className="marketing-preview-overline">CAREER MOMENTUM</p>
            <h2>Small steps.<br /><em>Real progress.</em></h2>
            <div className="marketing-progress-meta"><span>Profile strength</span><strong>Keep building</strong></div>
            <div className="marketing-progress-track"><span /></div>
            <div className="marketing-preview-footer"><span className="marketing-check">✓</span><span>Skills and experience, all in one place</span></div>
          </div>
          <div className="marketing-floating-card marketing-floating-match">
            <span className="marketing-floating-symbol">↗</span><div><strong>Find your fit</strong><small>Explore roles that match your goals</small></div>
          </div>
          <div className="marketing-floating-card marketing-floating-plan">
            <span className="marketing-plan-icon">✦</span><div><strong>Your search, organised</strong><small>Applications · Resumes · Next steps</small></div>
          </div>
          <span className="marketing-decoration marketing-decoration-one">✳</span>
          <span className="marketing-decoration marketing-decoration-two">✦</span>
        </div>
      </section>

      <section className="marketing-trust-strip" aria-label="Platform principles">
        <span>BUILT FOR YOUR NEXT MOVE</span>
        <div><i>✳</i> Career tools in one place</div>
        <div><i>↗</i> Opportunities across locations</div>
        <div><i>◷</i> Your search, clearly tracked</div>
      </section>

      <section className="marketing-section marketing-features" id="features">
        <div className="marketing-section-heading">
          <div><p className="marketing-kicker">A BETTER WAY FORWARD</p><h2>Your career deserves<br /><em>more than guesswork.</em></h2></div>
          <p>Less juggling tabs. More clarity about what to do next. JobCraft brings the useful parts of your job search together in one place.</p>
        </div>
        <div className="marketing-feature-grid">
          {features.map((feature) => (
            <article className="marketing-feature-card" key={feature.number}>
              <div className="marketing-feature-top"><span>{feature.number}</span><span className="marketing-feature-arrow">↗</span></div>
              <p className="marketing-feature-tag">{feature.tag}</p>
              <h3>{feature.title}</h3>
              <p className="marketing-feature-description">{feature.description}</p>
              <Link href={feature.number === "01" ? "/jobs" : "/dashboard"}>Explore feature <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-how" id="how-it-works">
        <div className="marketing-how-intro"><p className="marketing-kicker">CLEAR STEPS. YOUR PACE.</p><h2>Move from searching<br />to <em>moving forward.</em></h2><p>A job search can feel like a hundred open tabs. Start with one clear next step instead.</p><Link className="marketing-button marketing-button-light" href="/dashboard?auth=signup">Start with JobCraft <span aria-hidden="true">↗</span></Link></div>
        <div className="marketing-steps">
          {steps.map(([number, title, description]) => <article className="marketing-step" key={number}><span className="marketing-step-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div><span className="marketing-step-arrow" aria-hidden="true">↗</span></article>)}
        </div>
        <span className="marketing-how-decoration" aria-hidden="true">✳</span>
      </section>

      <section className="marketing-final-cta">
        <div><p className="marketing-kicker">YOUR NEXT CHAPTER</p><h2>Make room for<br /><em>what comes next.</em></h2><p>Bring your job search, career tools, and next steps together.</p></div>
        <Link className="marketing-button" href="/dashboard?auth=signup">Get started with JobCraft <span aria-hidden="true">↗</span></Link>
      </section>

      <footer className="marketing-footer">
        <Link className="marketing-brand" href="/"><span className="marketing-brand-mark" aria-hidden="true">J</span><span>JobCraft<span className="marketing-brand-period">.</span></span></Link>
        <p>Built to help you take your next career step.</p>
        <div><Link href="/jobs">Jobs</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/dashboard?auth=login">Sign in</Link></div>
        <span className="marketing-copyright">© {new Date().getFullYear()} JobCraft</span>
      </footer>
    </main>
  );
}

import Link from "next/link";
import { FadeInObserver } from "./fade-in-observer";
import { FaqSection } from "./faq-section";
import {
  IconArrow,
  IconCheck,
  IconDumbbell,
  IconGrid,
  IconMic,
  IconStethoscope,
  IconText,
  IconUser,
  IconVideo,
  LogoMark,
} from "./icons";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

export function LandingPage() {
  return (
    <>
      <div className="ambient" aria-hidden="true">
        <div className="ambient-grid" />
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      <header className="nav-shell backdrop-blur-sm">
        <nav className="nav" aria-label="Main navigation">
          <div className="nav-inner">
            <Link href="/" className="nav-logo" aria-label="Video Platform home">
              <div className="nav-logo-mark">
                <LogoMark />
              </div>
              <span className="nav-logo-text">Video Platform</span>
            </Link>

            <ul className="nav-links">
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
              <li>
                <a href="#exercises">Exercises</a>
              </li>
              <li>
                <a href="#programs">Programs</a>
              </li>
              <li>
                <a href="#pdf">PDF Export</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>

            <div className="nav-right">
              <ThemeToggle />
              <MobileNav />
              <Link href="/login" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-mesh" aria-hidden="true" />

          <div className="container hero-inner">
            <div className="hero-badge fade-in">
              <span className="hero-badge-dot" />
              <span>For movement professionals</span>
            </div>

            <h1 className="hero-headline fade-in">
              Your videos.
              <br />
              <span className="gradient">Built into programs.</span>
            </h1>

            <p className="hero-sub fade-in">
              Upload demonstrations, prescribe sets and reps, and deliver video
              programs with auto-generated PDFs.
            </p>

            <div className="hero-ctas fade-in">
              <Link href="/login" className="btn btn-primary">
                Build a Program
                <IconArrow className="btn-icon" />
              </Link>
              <a href="#how-it-works" className="btn btn-outline">
                See How It Works
              </a>
            </div>
          </div>
        </section>

        {/* Social proof strip */}
        <div className="logo-strip">
          <div className="container logo-strip-inner">
            <span className="logo-strip-label">Trusted by movement professionals</span>
            <div className="logo-strip-items">
              <span className="logo-strip-item">Physiotherapy clinics</span>
              <span className="logo-strip-item">Sports rehab</span>
              <span className="logo-strip-item">S&amp;C coaches</span>
              <span className="logo-strip-item">Athletic trainers</span>
              <span className="logo-strip-item">Personal training studios</span>
            </div>
          </div>
        </div>

        {/* How it works */}
        <section id="how-it-works">
          <div className="container">
            <div className="section-header section-header--center fade-in">
              <span className="eyebrow">How It Works</span>
              <h2>From your camera to a complete program.</h2>
              <p>
                Everything is managed through an administration panel. Build your
                exercise library first, then assemble programs — each with its own
                prescription and order.
              </p>
            </div>

            <div className="workflow-grid">
              <div className="workflow-card fade-in">
                <div className="workflow-num">1</div>
                <h3>Upload exercises</h3>
                <p>
                  Record 3–5 repetitions per movement. Add a text description, an
                  audio description, and pick up to four thumbnail frames from the
                  video for use in PDFs and previews.
                </p>
              </div>

              <div className="workflow-card fade-in">
                <div className="workflow-num">2</div>
                <h3>Build a program</h3>
                <p>
                  Select exercises in your preferred order. For each one, define
                  repetitions by count or duration, configure multiple sets, and
                  assign weights per set when needed.
                </p>
              </div>

              <div className="workflow-card fade-in">
                <div className="workflow-num">3</div>
                <h3>Deliver to the user</h3>
                <p>
                  The finished program plays as a video sequence. A PDF is generated
                  automatically — thumbnails, descriptions, and rep details included.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Exercise library */}
        <section id="exercises">
          <div className="container">
            <div className="feature-split">
              <div className="feature-split-content">
                <div className="section-header fade-in">
                  <span className="eyebrow">Exercise Library</span>
                  <h2>Every exercise is yours — video, audio, and text.</h2>
                  <p>
                    There is one playback approach: the user watches your uploaded
                    demonstration. No alternate modes — just your real footage,
                    described the way you want it.
                  </p>
                </div>

                <div className="upload-steps">
                  <div className="upload-step fade-in">
                    <div className="step-icon">
                      <IconVideo />
                    </div>
                    <div className="step-body">
                      <h4>Demonstration video</h4>
                      <p>
                        Upload a clip showing 3–5 full repetitions. Start and end
                        in a natural resting position when possible, and keep the
                        real tempo of the movement.
                      </p>
                    </div>
                  </div>

                  <div className="upload-step fade-in">
                    <div className="step-icon">
                      <IconMic />
                    </div>
                    <div className="step-body">
                      <h4>Audio description</h4>
                      <p>
                        Record spoken coaching cues, breathing reminders, or
                        technique notes. Audio plays alongside the video in the
                        program.
                      </p>
                    </div>
                  </div>

                  <div className="upload-step fade-in">
                    <div className="step-icon">
                      <IconText />
                    </div>
                    <div className="step-body">
                      <h4>Text description</h4>
                      <p>
                        Write clear written instructions — setup, key points, common
                        mistakes, or modifications. Shown in the player and included
                        in the PDF.
                      </p>
                    </div>
                  </div>

                  <div className="upload-step fade-in">
                    <div className="step-icon">
                      <IconGrid />
                    </div>
                    <div className="step-body">
                      <h4>Up to 4 thumbnails</h4>
                      <p>
                        Scrub through the video and select up to four frames to save
                        as thumbnails. These appear in program previews and the
                        generated PDF.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="glass-card fade-in"
                aria-label="Example exercise content card"
              >
                <div className="meta-header">Exercise — Goblet Squat</div>

                <div className="thumbnail-strip" aria-hidden="true">
                  <div className="thumb-cell">Start</div>
                  <div className="thumb-cell">Mid ↓</div>
                  <div className="thumb-cell">Bottom</div>
                  <div className="thumb-cell">Top</div>
                </div>

                <div className="meta-row">
                  <span className="meta-key">Video</span>
                  <span className="meta-val">4 reps · 18 s</span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">Audio</span>
                  <span className="meta-val accent">Uploaded</span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">Text description</span>
                  <span className="meta-val accent">Uploaded</span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">Thumbnails saved</span>
                  <span className="meta-val">4 of 4</span>
                </div>

                <div className="playback-indicator">
                  <div className="pi-dot" aria-hidden="true" />
                  Single demonstration playback — original video, no editing
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Program builder */}
        <section id="programs">
          <div className="container">
            <div className="feature-split feature-split--reverse">
              <div className="feature-split-content">
                <div className="section-header fade-in">
                  <span className="eyebrow">Program Builder</span>
                  <h2>Order, prescribe, and fine-tune every exercise.</h2>
                  <p>
                    Programs are assembled in the administration panel. Drag exercises
                    into sequence, then configure how each one should be performed.
                  </p>
                </div>

                <ul className="feature-list fade-in">
                  <li>
                    <span className="feature-check">
                      <IconCheck />
                    </span>
                    Select exercises in any order
                  </li>
                  <li>
                    <span className="feature-check">
                      <IconCheck />
                    </span>
                    Prescribe reps or hold time per exercise
                  </li>
                  <li>
                    <span className="feature-check">
                      <IconCheck />
                    </span>
                    Define multiple sets with different targets per set
                  </li>
                  <li>
                    <span className="feature-check">
                      <IconCheck />
                    </span>
                    Assign weight per set — e.g. 15 kg × 20, 20 kg × 15, 25 kg × 10
                  </li>
                  <li>
                    <span className="feature-check">
                      <IconCheck />
                    </span>
                    Manage everything from one admin panel
                  </li>
                </ul>
              </div>

              <div
                className="glass-card fade-in"
                aria-label="Example program prescription"
              >
                <div className="meta-header">Program exercise — Barbell Row</div>

                <div className="program-order">
                  <span className="order-badge">Exercise 2 of 5</span>
                </div>

                <table className="sets-table">
                  <thead>
                    <tr>
                      <th>Set</th>
                      <th>Weight</th>
                      <th>Reps</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>15 kg</td>
                      <td>20</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>20 kg</td>
                      <td>15</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>25 kg</td>
                      <td>10</td>
                    </tr>
                  </tbody>
                </table>

                <div className="meta-row" style={{ marginTop: "16px" }}>
                  <span className="meta-key">Alternative format</span>
                  <span className="meta-val">3 sets · 30 / 25 / 20 reps</span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">Time-based option</span>
                  <span className="meta-val">45 s hold per set</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PDF export */}
        <section id="pdf" aria-labelledby="pdf-heading">
          <div className="container">
            <div className="pdf-showcase fade-in">
              <div className="pdf-showcase-grid">
                <div className="pdf-showcase-content">
                  <span className="eyebrow">PDF Export</span>
                  <blockquote id="pdf-heading">
                    Every program ships with a{" "}
                    <strong>printable PDF</strong> — thumbnails, text descriptions,
                    and rep details — for users who want a reference off-screen.
                  </blockquote>

                  <div className="pdf-attrs">
                    <div>
                      <span className="pdf-attr-num">4</span>
                      <span className="pdf-attr-label">
                        Thumbnails available per exercise
                      </span>
                    </div>
                    <div>
                      <span className="pdf-attr-num">Auto</span>
                      <span className="pdf-attr-label">
                        Generated when a program is saved
                      </span>
                    </div>
                    <div>
                      <span className="pdf-attr-num">+ Video</span>
                      <span className="pdf-attr-label">
                        Bundled with the video program
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pdf-preview" aria-hidden="true">
                  <div className="pdf-page">
                    <div className="pdf-page-header">Week 1 — Lower Body</div>
                    <div className="pdf-exercise">
                      <div className="pdf-thumb-row">
                        <div className="pdf-thumb" />
                        <div className="pdf-thumb" />
                        <div className="pdf-thumb" />
                      </div>
                      <div className="pdf-exercise-title">1. Goblet Squat</div>
                      <div className="pdf-exercise-meta">3 sets · 12 / 10 / 8 reps</div>
                      <div className="pdf-exercise-desc">
                        Keep chest upright. Sit back and down, knees tracking over toes.
                      </div>
                    </div>
                    <div className="pdf-exercise">
                      <div className="pdf-thumb-row">
                        <div className="pdf-thumb" />
                        <div className="pdf-thumb" />
                      </div>
                      <div className="pdf-exercise-title">2. Barbell Row</div>
                      <div className="pdf-exercise-meta">
                        15 kg × 20 · 20 kg × 15 · 25 kg × 10
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audience */}
        <section id="audience">
          <div className="container">
            <div className="section-header section-header--center fade-in">
              <span className="eyebrow">Who It&apos;s For</span>
              <h2>Built for people who prescribe movement.</h2>
            </div>

            <div className="audience-grid">
              <div className="audience-card fade-in">
                <div className="audience-icon-wrap">
                  <IconStethoscope />
                </div>
                <h4>Physiotherapists &amp; Clinicians</h4>
                <p>
                  Build a library of your own demonstrations. Prescribe exact sets,
                  reps, and weights per patient program — with a PDF they can take
                  home.
                </p>
              </div>

              <div className="audience-card fade-in">
                <div className="audience-icon-wrap">
                  <IconDumbbell />
                </div>
                <h4>Trainers &amp; Coaches</h4>
                <p>
                  Upload coaching videos once, reuse them across programs. Progressive
                  loading, rep schemes, and exercise order — all configurable from
                  the admin panel.
                </p>
              </div>

              <div className="audience-card fade-in">
                <div className="audience-icon-wrap">
                  <IconUser />
                </div>
                <h4>Program Users</h4>
                <p>
                  Follow the video program exercise by exercise. Prefer paper?
                  Download the included PDF with thumbnails and written instructions
                  for every movement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials">
          <div className="container">
            <div className="section-header section-header--center fade-in">
              <span className="eyebrow">What Professionals Say</span>
              <h2>Designed with clinicians and coaches in mind.</h2>
            </div>

            <div className="testimonials-grid">
              <div className="testimonial-card fade-in">
                <p className="testimonial-quote">
                  &ldquo;Finally a platform that treats exercise prescription seriously.
                  My patients get my actual demonstrations — not stock footage — with
                  the exact sets and reps I prescribe.&rdquo;
                </p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">SR</div>
                  <div>
                    <span className="testimonial-name">Dr. Sarah Reid</span>
                    <span className="testimonial-role">Sports Physiotherapist</span>
                  </div>
                </div>
              </div>

              <div className="testimonial-card fade-in">
                <p className="testimonial-quote">
                  &ldquo;I upload once and reuse exercises across dozens of programs.
                  The PDF export alone saves me hours every week — my athletes love
                  having something they can reference in the gym.&rdquo;
                </p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">MK</div>
                  <div>
                    <span className="testimonial-name">Marcus Klein</span>
                    <span className="testimonial-role">S&amp;C Coach</span>
                  </div>
                </div>
              </div>

              <div className="testimonial-card fade-in">
                <p className="testimonial-quote">
                  &ldquo;The admin panel keeps everything in one place. Video, audio cues,
                  written instructions, thumbnails — it&apos;s exactly how we already
                  think about programming movement.&rdquo;
                </p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">AL</div>
                  <div>
                    <span className="testimonial-name">Anna Liu</span>
                    <span className="testimonial-role">Rehab Clinic Director</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="container">
            <div className="section-header section-header--center fade-in">
              <span className="eyebrow">FAQ</span>
              <h2>Common questions</h2>
            </div>
            <FaqSection />
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="cta-section">
          <div className="container">
            <div className="cta-panel fade-in">
              <div className="cta-content">
                <h2>Ready to prescribe movement your way?</h2>
                <p>
                  Join movement professionals building personalised video programs
                  with auto-generated PDFs — from their own demonstrations.
                </p>
                <Link href="/login" className="btn btn-primary">
                  Request early access
                  <IconArrow className="btn-icon" />
                </Link>
                <p className="cta-note">
                  Administration panel and program builder coming soon.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="nav-logo-mark">
                <LogoMark />
              </div>
              <span className="footer-copy">
                © 2025 Video Platform. Your videos, your programs.
              </span>
            </div>
            <ul className="footer-links">
              <li>
                <a href="#">Privacy</a>
              </li>
              <li>
                <a href="#">Terms</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      <FadeInObserver />
    </>
  );
}

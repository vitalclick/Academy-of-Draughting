export function AboutBody() {
  return (
    <section className="section section-light" data-screen-label="02 About · Manifesto">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label">
              <span className="bar" />
              SECTION 02 / WHY WE EXIST
            </span>
            <h2 className="sec-head-title">
              We don&apos;t do motivation posters.
              <br />
              <em style={{ color: 'var(--blue-500)', fontStyle: 'italic', fontWeight: 400 }}>
                We do drawings.
              </em>
            </h2>
          </div>
          <p className="sec-head-sub">
            In 1981 South Africa needed draughtspeople who could walk into a drawing office and
            contribute on day one. That&apos;s still the standard. Everything we do — and
            everything we don&apos;t do — flows from that.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-prose">
            <p>
              <strong>The Academy was founded as a specialist institution.</strong> Not a university
              with a drafting department. Not a general TVET college that teaches &quot;design&quot;.
              A specialist school for one craft: technical drawing, done to the standard that
              engineering, architectural and manufacturing offices require.
            </p>
            <p>
              That focus changed our entire model. <strong>Smaller cohorts.</strong> Instructors
              who still take on drawing-office contracts. Software that&apos;s actually used on
              real projects. Coursework framed around live engineering vocabulary, not academic
              abstraction. Output graded against drawing-office standards — title blocks, layer
              discipline, dimensioning conventions, the lot.
            </p>
            <p>
              In 2026 we added an intelligence layer — <strong>AIDA</strong>, our admissions
              assistant, plus a career intelligence dashboard that tracks live South African
              salary and demand data. None of it replaces the craft. All of it makes the path to
              the craft faster, clearer, and matched to your situation.
            </p>
            <p>
              We don&apos;t promise motivation. We promise{' '}
              <strong>a portfolio that looks like the work employers do</strong>, and the
              discipline to keep producing that work after you leave us. That&apos;s the contract.
            </p>
          </div>

          <div className="about-side">
            <div className="about-fact">
              <span className="about-fact-k">FOUNDING PROMISE</span>
              <div className="about-fact-v">Drawing-office ready · day 1</div>
              <p className="about-fact-d">
                Coursework is built backwards from the standards South African drawing offices
                demand on first-week deliverables.
              </p>
            </div>
            <div className="about-fact">
              <span className="about-fact-k">FACULTY MODEL</span>
              <div className="about-fact-v">100% industry-active</div>
              <p className="about-fact-d">
                Every instructor still takes on real drawing-office contracts. No tenure-track
                theorists. No motivational speakers.
              </p>
            </div>
            <div className="about-fact">
              <span className="about-fact-k">COHORT SIZE</span>
              <div className="about-fact-v">≤ 24 students</div>
              <p className="about-fact-d">
                Capped per intake. Per-student instructor time stays high so portfolio reviews are
                real.
              </p>
            </div>
            <div className="about-fact">
              <span className="about-fact-k">SOFTWARE STANCE</span>
              <div className="about-fact-v">Native, not abstract</div>
              <p className="about-fact-d">
                AutoCAD, Revit and Inventor as they&apos;re configured in production environments —
                not vendor demos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

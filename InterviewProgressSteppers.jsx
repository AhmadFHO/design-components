import { useState, useEffect, useRef } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Compass,
  TrendingUp,
  Rocket,
  ClipboardCheck,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
   InterviewProgressSteppers.jsx
   Five stepper / progress-tracker variants for an agentic interview agent.
   - Toggle switches the whole page between Neutral and FromHereOn branding.
   - Each stepper is fully self-contained: pass `steps`, `current`, `setCurrent`.
   - Completed steps are clickable (jump back). Future steps are locked.
   - Smooth transitions on bars, fills, circles, and label colours.
   - ARIA: role="list", aria-current="step", role="progressbar".
   ────────────────────────────────────────────────────────────────────────── */

const STEPS = [
  { label: "Your idea", description: "Tell us your concept", Icon: Lightbulb },
  { label: "The context", description: "Why does it matter", Icon: Compass },
  { label: "The upside", description: "What are the benefits", Icon: TrendingUp },
  { label: "Next steps", description: "Make it real", Icon: Rocket },
  { label: "Review", description: "Final check", Icon: ClipboardCheck },
];

/* ────────────────────────────────────────────────────────────
   Shared shell: title, body slot, Back / Next footer.
   ──────────────────────────────────────────────────────────── */
const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function StepperShell({ title, kicker, current, setCurrent, total, children }) {
  const isFirst = current === 0;
  const isLast = current === total - 1;
  const [burst, setBurst] = useState(false);
  const prevCurrent = useRef(current);

  useEffect(() => {
    if (current === total - 1 && prevCurrent.current < total - 1) {
      setBurst(true);
      const t = setTimeout(() => setBurst(false), 1000);
      prevCurrent.current = current;
      return () => clearTimeout(t);
    }
    prevCurrent.current = current;
  }, [current, total]);

  return (
    <section className="ips-card" aria-labelledby={`ttl-${title}`}>
      <header className="ips-card-head">
        <div>
          <p className="ips-kicker">{kicker}</p>
          <h3 id={`ttl-${title}`} className="ips-card-title">{title}</h3>
        </div>
        <span className="ips-counter" aria-live="polite">
          Step <strong>{current + 1}</strong> of {total}
        </span>
      </header>

      <div className="ips-card-body">{children}</div>

      <footer className="ips-card-foot" data-burst={burst || undefined}>
        <button
          type="button"
          className="ips-btn ips-btn-ghost"
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={isFirst}
          aria-label="Go to previous step"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Back</span>
        </button>
        <span className="ips-done-wrap">
          {burst && (
            <span className="ips-burst" aria-hidden="true">
              {SPARK_ANGLES.map((angle, i) => (
                <span
                  key={i}
                  className="ips-spark"
                  style={{ "--angle": `${angle}deg`, "--i": i }}
                />
              ))}
            </span>
          )}
          <button
            type="button"
            className={`ips-btn ips-btn-primary${burst ? " ips-btn-done-burst" : ""}`}
            onClick={() => setCurrent(Math.min(total - 1, current + 1))}
            disabled={isLast}
            aria-label="Go to next step"
          >
            <span>{isLast ? "Done" : "Next step"}</span>
            {!isLast && <ChevronRight size={16} aria-hidden="true" />}
          </button>
        </span>
      </footer>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Variant 1 — Classic numbered circles + connectors
   (Inspired by your first reference)
   ──────────────────────────────────────────────────────────── */
function ClassicNumberedStepper({ steps, current, setCurrent }) {
  return (
    <ol className="v1-list" role="list" aria-label="Interview progress">
      {steps.map((step, i) => {
        const status = i < current ? "complete" : i === current ? "active" : "pending";
        const clickable = i <= current;
        const isLast = i === steps.length - 1;
        return (
          <li key={i} className={`v1-item v1-${status}`}>
            <button
              type="button"
              className="v1-step-btn"
              onClick={() => clickable && setCurrent(i)}
              disabled={!clickable}
              aria-current={status === "active" ? "step" : undefined}
              aria-label={`${step.label}${
                status === "complete" ? " (completed, click to revisit)" : ""
              }`}
            >
              <span className="v1-circle" aria-hidden="true">
                {status === "complete" ? <Check size={16} strokeWidth={3} /> : i + 1}
              </span>
              <span className="v1-label">{step.label}</span>
            </button>
            {!isLast && <span className="v1-line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

/* ────────────────────────────────────────────────────────────
   Variant 2 — Minimal dot + thick progress bar
   (Inspired by your second reference)
   ──────────────────────────────────────────────────────────── */
function MinimalDotStepper({ steps, current, setCurrent }) {
  const total = steps.length;
  const pct = total > 1 ? (current / (total - 1)) * 100 : 0;

  return (
    <div className="v2-wrap">
      <div
        className="v2-track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-valuetext={`Step ${current + 1}: ${steps[current].label}`}
      >
        <div className="v2-fill" style={{ width: `${pct}%` }} />
        {steps.map((_, i) => (
          <span
            key={i}
            className={`v2-dot ${i === current ? "v2-dot-current" : ""} ${
              i < current ? "v2-dot-done" : ""
            }`}
            style={{ left: `${(i / (total - 1)) * 100}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="v2-labels">
        {steps.map((step, i) => {
          const clickable = i <= current;
          const isCurrent = i === current;
          return (
            <button
              type="button"
              key={i}
              className={`v2-label ${isCurrent ? "v2-label-active" : ""} ${
                i > current ? "v2-label-future" : ""
              }`}
              style={{ left: `${(i / (total - 1)) * 100}%` }}
              onClick={() => clickable && setCurrent(i)}
              disabled={!clickable}
              aria-current={isCurrent ? "step" : undefined}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Variant 3 — Segmented progress bar (one segment per step)
   ──────────────────────────────────────────────────────────── */
function SegmentedStepper({ steps, current, setCurrent }) {
  return (
    <div className="v3-wrap">
      <div
        className="v3-segments"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
      >
        {steps.map((step, i) => {
          const status = i < current ? "complete" : i === current ? "active" : "pending";
          const clickable = i <= current;
          return (
            <button
              type="button"
              key={i}
              className={`v3-seg v3-${status}`}
              onClick={() => clickable && setCurrent(i)}
              disabled={!clickable}
              aria-current={status === "active" ? "step" : undefined}
              aria-label={`${i + 1}. ${step.label}`}
            >
              <span className="v3-seg-bar" aria-hidden="true" />
              <span className="v3-seg-meta">
                <span className="v3-seg-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="v3-seg-label">{step.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Variant 4 — Circular ring + current step focus
   (Compact, focal — great for chat / single-question UIs)
   ──────────────────────────────────────────────────────────── */
function CircularRingStepper({ steps, current, setCurrent }) {
  const total = steps.length;
  const pct = ((current + 1) / total) * 100;
  const SIZE = 96;
  const STROKE = 8;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;
  const Icon = steps[current].Icon;
  const gradId = "v4-grad";

  return (
    <div className="v4-wrap">
      <div className="v4-main">
        <div
          className="v4-ring"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={current + 1}
          aria-valuetext={`Step ${current + 1} of ${total}: ${steps[current].label}`}
          style={{ width: SIZE, height: SIZE }}
        >
          <svg width={SIZE} height={SIZE} aria-hidden="true">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--c-accent-2)" />
                <stop offset="100%" stopColor="var(--c-accent)" />
              </linearGradient>
            </defs>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="var(--c-track)"
              strokeWidth={STROKE}
            />
            <circle
              className="v4-ring-progress"
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </svg>
          <div className="v4-ring-num">
            <span className="v4-ring-current">{current + 1}</span>
          </div>
        </div>

        <div className="v4-info">
          <span className="v4-info-kicker">
            <span className="v4-info-icon" aria-hidden="true">
              <Icon size={12} strokeWidth={2.5} />
            </span>
            Currently on
          </span>
          <h4 className="v4-info-label">{steps[current].label}</h4>
          <p className="v4-info-desc">{steps[current].description}</p>
        </div>
      </div>

      <div className="v4-ticks" role="list" aria-label="Step indicators">
        {steps.map((step, i) => {
          const status = i < current ? "complete" : i === current ? "active" : "pending";
          const clickable = i <= current;
          return (
            <button
              key={i}
              type="button"
              role="listitem"
              className={`v4-tick v4-tick-${status}`}
              onClick={() => clickable && setCurrent(i)}
              disabled={!clickable}
              aria-current={status === "active" ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${step.label}`}
              title={step.label}
            >
              <span className="v4-tick-bar" aria-hidden="true" />
              <span className="v4-tick-label">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Variant 6 — Pill / chip steps with icons (full-width row)
   ──────────────────────────────────────────────────────────── */
function PillIconStepper({ steps, current, setCurrent }) {
  return (
    <div className="v6-wrap" role="list" aria-label="Interview progress">
      {steps.map((step, i) => {
        const status = i < current ? "complete" : i === current ? "active" : "pending";
        const clickable = i <= current;
        const Icon = step.Icon;
        return (
          <button
            type="button"
            key={i}
            role="listitem"
            className={`v6-pill v6-${status}`}
            onClick={() => clickable && setCurrent(i)}
            disabled={!clickable}
            aria-current={status === "active" ? "step" : undefined}
          >
            <span className="v6-icon" aria-hidden="true">
              {status === "complete" ? (
                <Check size={14} strokeWidth={3} />
              ) : (
                <Icon size={14} strokeWidth={2.25} />
              )}
            </span>
            <span className="v6-text">
              <span className="v6-num">0{i + 1}</span>
              <span className="v6-label">{step.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Variant 5 — Vertical timeline (great for chat / Q&A flows)
   ──────────────────────────────────────────────────────────── */
function VerticalTimelineStepper({ steps, current, setCurrent }) {
  return (
    <ol className="v5-list" role="list" aria-label="Interview progress">
      {steps.map((step, i) => {
        const status = i < current ? "complete" : i === current ? "active" : "pending";
        const clickable = i <= current;
        const isLast = i === steps.length - 1;
        return (
          <li key={i} className={`v5-item v5-${status}`}>
            <button
              type="button"
              className="v5-step-btn"
              onClick={() => clickable && setCurrent(i)}
              disabled={!clickable}
              aria-current={status === "active" ? "step" : undefined}
            >
              <span className="v5-rail" aria-hidden="true">
                <span className="v5-node">
                  {status === "complete" ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <span className="v5-node-num">{i + 1}</span>
                  )}
                </span>
                {!isLast && <span className="v5-connector" />}
              </span>
              <span className="v5-content">
                <span className="v5-label">{step.label}</span>
                <span className="v5-desc">{step.description}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* ────────────────────────────────────────────────────────────
   Main demo: brand toggle + 5 stepper cards
   ──────────────────────────────────────────────────────────── */
export default function App() {
  const [brand, setBrand] = useState("fho"); // "fho" | "neutral"
  const [c1, s1] = useState(2);
  const [c2, s2] = useState(0);
  const [c3, s3] = useState(3);
  const [c4, s4] = useState(2);
  const [c5, s5] = useState(2);
  const [c6, s6] = useState(1);

  return (
    <>
      <style>{CSS}</style>
      <div className="ips-root" data-brand={brand}>
        <header className="ips-page-head">
          <div>
            <p className="ips-kicker">Design system / Components</p>
            <h1 className="ips-page-title">Progress steppers</h1>
            <p className="ips-page-sub">
              Six working variants for the agentic interview agent. Click a
              completed step to jump back, or use Back / Next.
            </p>
          </div>
          <div
            className="ips-toggle"
            role="radiogroup"
            aria-label="Brand theme"
          >
            <button
              type="button"
              role="radio"
              aria-checked={brand === "neutral"}
              className={`ips-toggle-btn ${brand === "neutral" ? "is-on" : ""}`}
              onClick={() => setBrand("neutral")}
            >
              Neutral
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={brand === "fho"}
              className={`ips-toggle-btn ${brand === "fho" ? "is-on" : ""}`}
              onClick={() => setBrand("fho")}
            >
              FromHereOn
            </button>
          </div>
        </header>

        <div className="ips-grid">
          <StepperShell
            title="01 — Classic numbered"
            kicker="Variant 01"
            current={c1}
            setCurrent={s1}
            total={STEPS.length}
          >
            <ClassicNumberedStepper steps={STEPS} current={c1} setCurrent={s1} />
          </StepperShell>

          <StepperShell
            title="02 — Minimal dot + bar"
            kicker="Variant 02"
            current={c2}
            setCurrent={s2}
            total={STEPS.length}
          >
            <MinimalDotStepper steps={STEPS} current={c2} setCurrent={s2} />
          </StepperShell>

          <StepperShell
            title="03 — Segmented bar"
            kicker="Variant 03"
            current={c3}
            setCurrent={s3}
            total={STEPS.length}
          >
            <SegmentedStepper steps={STEPS} current={c3} setCurrent={s3} />
          </StepperShell>

          <StepperShell
            title="04 — Circular ring"
            kicker="Variant 04"
            current={c4}
            setCurrent={s4}
            total={STEPS.length}
          >
            <CircularRingStepper steps={STEPS} current={c4} setCurrent={s4} />
          </StepperShell>

          <StepperShell
            title="05 — Vertical timeline"
            kicker="Variant 05"
            current={c5}
            setCurrent={s5}
            total={STEPS.length}
          >
            <VerticalTimelineStepper steps={STEPS} current={c5} setCurrent={s5} />
          </StepperShell>

          <StepperShell
            title="06 — Pill icons"
            kicker="Variant 06"
            current={c6}
            setCurrent={s6}
            total={STEPS.length}
          >
            <PillIconStepper steps={STEPS} current={c6} setCurrent={s6} />
          </StepperShell>
        </div>

        <footer className="ips-page-foot">
          <span className="ips-accent-strip" aria-hidden="true" />
          <p>
            Reusable components — drop each variant into your codebase and
            theme via the CSS variables on <code>.ips-root[data-brand]</code>.
          </p>
        </footer>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Stylesheet — themed via [data-brand]
   FHO uses Montserrat (web fallback for commercial Gotham) + Domine.
   ────────────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Domine:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');

/* ── Theme tokens ────────────────────────────────────────── */
.ips-root[data-brand="neutral"] {
  --c-bg:        #F7F7F8;
  --c-surface:   #FFFFFF;
  --c-text:      #111827;
  --c-text-mute: #6B7280;
  --c-border:    #E5E7EB;
  --c-track:     #E5E7EB;
  --c-accent:    #111827;
  --c-accent-2:  #374151;
  --c-on-accent: #FFFFFF;
  --c-success:   #111827;
  --c-focus:     #2563EB;
  --gradient:    linear-gradient(135deg, #111827 0%, #374151 100%);
  --font-body:   'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-head:   'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --shadow-sm:   0 1px 2px rgba(17,24,39,0.05);
  --shadow-md:   0 4px 14px rgba(17,24,39,0.08);
  --radius:      10px;
}

.ips-root[data-brand="fho"] {
  --c-bg:        #FAFAFB;
  --c-surface:   #FFFFFF;
  --c-text:      #0A0A2E;
  --c-text-mute: #6E6E83;
  --c-border:    #E4E4EC;
  --c-track:     #EFEFEF;
  --c-accent:    #E81752;
  --c-accent-2:  #EB5E96;
  --c-on-accent: #FFFFFF;
  --c-success:   #E81752;
  --c-focus:     #E81752;
  --gradient:    linear-gradient(135deg, #EB5E96 0%, #E81752 50%, #F7B817 100%);
  --font-body:   'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-head:   'Domine', Georgia, 'Times New Roman', serif;
  --shadow-sm:   0 1px 2px rgba(10,10,46,0.05);
  --shadow-md:   0 4px 14px rgba(10,10,46,0.08);
  --radius:      10px;
}

/* ── Reset & root ────────────────────────────────────────── */
.ips-root, .ips-root *, .ips-root *::before, .ips-root *::after {
  box-sizing: border-box;
}
.ips-root {
  min-height: 100vh;
  padding: 40px 28px 64px;
  background: var(--c-bg);
  color: var(--c-text);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  transition: background-color 220ms ease, color 220ms ease;
}
.ips-root button { font-family: inherit; cursor: pointer; }
.ips-root button:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
  border-radius: 6px;
}
.ips-root button:disabled { cursor: not-allowed; }

/* ── Page header & toggle ───────────────────────────────── */
.ips-page-head {
  max-width: 1200px;
  margin: 0 auto 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}
.ips-kicker {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-text-mute);
  margin-bottom: 6px;
}
.ips-page-title {
  font-family: var(--font-head);
  font-size: 36px;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin: 0 0 6px;
  color: var(--c-text);
}
.ips-page-sub {
  font-size: 14px;
  color: var(--c-text-mute);
  max-width: 560px;
  margin: 0;
}
.ips-toggle {
  display: inline-flex;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  padding: 4px;
  box-shadow: var(--shadow-sm);
}
.ips-toggle-btn {
  border: 0;
  background: transparent;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-mute);
  transition: background-color 220ms ease, color 220ms ease;
}
.ips-toggle-btn.is-on {
  background: var(--c-accent);
  color: var(--c-on-accent);
}

/* ── Card shell ─────────────────────────────────────────── */
.ips-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 960px) {
  .ips-grid { grid-template-columns: 1fr 1fr; }
  .ips-grid > section:nth-child(5),
  .ips-grid > section:nth-child(6) { grid-column: 1 / -1; }
}
.ips-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 220ms ease, border-color 220ms ease, background-color 220ms ease;
}
.ips-card:hover { box-shadow: var(--shadow-md); }
.ips-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px 12px;
}
.ips-card-title {
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: var(--c-text);
  letter-spacing: -0.01em;
}
.ips-counter {
  font-size: 12px;
  color: var(--c-text-mute);
  white-space: nowrap;
  padding-top: 18px;
}
.ips-counter strong { color: var(--c-text); font-weight: 700; }
.ips-card-body {
  padding: 28px 24px;
  flex: 1;
  display: flex;
  align-items: center;
}
.ips-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--c-border);
  background: color-mix(in srgb, var(--c-bg) 35%, transparent);
}

/* ── Buttons ────────────────────────────────────────────── */
.ips-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 600;
  transition: background-color 180ms ease, color 180ms ease, border-color 180ms ease, opacity 180ms ease, transform 100ms ease;
}
.ips-btn:active:not(:disabled) { transform: translateY(1px); }
.ips-btn-ghost {
  background: transparent;
  color: var(--c-text);
  border-color: var(--c-border);
}
.ips-btn-ghost:hover:not(:disabled) { background: var(--c-bg); }
.ips-btn-primary {
  background: var(--c-accent);
  color: var(--c-on-accent);
  border-color: var(--c-accent);
}
.ips-btn-primary:hover:not(:disabled) { background: var(--c-accent-2); border-color: var(--c-accent-2); }
.ips-btn:disabled { opacity: 0.45; }

/* ────────────────────────────────────────────────────────────
   Variant 1 — Classic numbered
   ──────────────────────────────────────────────────────────── */
.v1-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 0;
}
.v1-item {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
  min-width: 0;
}
.v1-item:last-child { flex: 0 0 auto; }
.v1-step-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 0;
  padding: 4px;
  min-width: 80px;
}
.v1-circle {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--c-surface);
  color: var(--c-text-mute);
  border: 2px solid var(--c-border);
  font-weight: 600;
  font-size: 14px;
  transition: background-color 260ms ease, color 260ms ease, border-color 260ms ease, transform 260ms ease;
}
.v1-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-mute);
  text-align: center;
  transition: color 260ms ease;
  max-width: 100px;
}
.v1-line {
  flex: 1;
  height: 2px;
  background: var(--c-track);
  margin: 0 -2px;
  position: relative;
  top: -10px;
  border-radius: 999px;
  transition: background-color 360ms ease;
}
.v1-active .v1-circle {
  background: var(--c-accent);
  border-color: var(--c-accent);
  color: var(--c-on-accent);
  transform: scale(1.06);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-accent) 18%, transparent);
}
.v1-active .v1-label { color: var(--c-accent); font-weight: 700; }
.v1-complete .v1-circle {
  background: var(--c-accent);
  border-color: var(--c-accent);
  color: var(--c-on-accent);
}
.v1-complete .v1-label { color: var(--c-text); }
.v1-complete + .v1-item .v1-line,
.v1-complete .v1-line { background: var(--c-accent); }
.v1-step-btn:hover:not(:disabled) .v1-circle {
  border-color: var(--c-accent);
}

/* ────────────────────────────────────────────────────────────
   Variant 2 — Minimal dot + bar
   ──────────────────────────────────────────────────────────── */
.v2-wrap {
  width: 100%;
  padding: 8px 12px 32px;
  position: relative;
}
.v2-track {
  position: relative;
  height: 6px;
  background: var(--c-track);
  border-radius: 999px;
  margin: 22px 0 12px;
}
.v2-fill {
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  background: var(--gradient);
  border-radius: 999px;
  transition: width 420ms cubic-bezier(.2,.7,.2,1);
}
.v2-dot {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--c-surface);
  border: 2px solid var(--c-track);
  transform: translate(-50%, -50%);
  transition: background-color 260ms ease, border-color 260ms ease, box-shadow 260ms ease, transform 260ms ease;
}
.v2-dot-done { background: var(--c-accent); border-color: var(--c-accent); }
.v2-dot-current {
  background: var(--c-accent);
  border-color: var(--c-accent);
  width: 14px;
  height: 14px;
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--c-accent) 18%, transparent);
}
.v2-labels {
  position: relative;
  height: 36px;
  margin-top: 10px;
}
.v2-label {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  background: transparent;
  border: 0;
  padding: 4px 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-mute);
  white-space: nowrap;
  transition: color 240ms ease, font-weight 240ms ease;
}
.v2-label:hover:not(:disabled) { color: var(--c-text); }
.v2-label-active { color: var(--c-accent); font-weight: 700; }
.v2-label-future { opacity: 0.6; }

/* ────────────────────────────────────────────────────────────
   Variant 3 — Segmented bar
   ──────────────────────────────────────────────────────────── */
.v3-wrap { width: 100%; }
.v3-segments {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.v3-seg {
  background: transparent;
  border: 0;
  padding: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.v3-seg-bar {
  display: block;
  height: 6px;
  border-radius: 999px;
  background: var(--c-track);
  transition: background 380ms ease, transform 260ms ease;
}
.v3-seg-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.v3-seg-num {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-text-mute);
  transition: color 240ms ease;
}
.v3-seg-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  transition: color 240ms ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.v3-complete .v3-seg-bar { background: var(--c-accent); }
.v3-active .v3-seg-bar { background: var(--gradient); transform: scaleY(1.4); }
.v3-active .v3-seg-num { color: var(--c-accent); }
.v3-pending .v3-seg-num,
.v3-pending .v3-seg-label { color: var(--c-text-mute); opacity: 0.7; }
.v3-seg:hover:not(:disabled) .v3-seg-bar { background: color-mix(in srgb, var(--c-accent) 60%, var(--c-track)); }

/* ────────────────────────────────────────────────────────────
   Variant 4 — Circular ring + current step
   ──────────────────────────────────────────────────────────── */
.v4-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.v4-main {
  display: flex;
  align-items: center;
  gap: 18px;
}
.v4-ring {
  position: relative;
  flex-shrink: 0;
  display: inline-grid;
  place-items: center;
}
.v4-ring svg { display: block; }
.v4-ring-progress {
  transition: stroke-dashoffset 520ms cubic-bezier(.2,.7,.2,1);
}
.v4-ring-num {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: var(--font-head);
  color: var(--c-text);
  pointer-events: none;
}
.v4-ring-current {
  font-size: 32px;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.v4-info { min-width: 0; flex: 1; }
.v4-info-kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-text-mute);
  margin-bottom: 6px;
}
.v4-info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--c-accent);
  color: var(--c-on-accent);
}
.v4-info-label {
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 2px;
  color: var(--c-text);
  letter-spacing: -0.01em;
}
.v4-info-desc {
  font-size: 13px;
  color: var(--c-text-mute);
  margin: 0;
}
.v4-ticks {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
.v4-tick {
  background: transparent;
  border: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  min-width: 0;
}
.v4-tick-bar {
  height: 4px;
  border-radius: 999px;
  background: var(--c-track);
  transition: background-color 320ms ease, transform 220ms ease;
}
.v4-tick-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-text-mute);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 220ms ease;
}
.v4-tick-complete .v4-tick-bar { background: var(--c-accent); }
.v4-tick-complete .v4-tick-label { color: var(--c-text); }
.v4-tick-active .v4-tick-bar { background: var(--gradient); transform: scaleY(1.6); }
.v4-tick-active .v4-tick-label { color: var(--c-accent); font-weight: 700; }
.v4-tick:hover:not(:disabled) .v4-tick-bar {
  background: color-mix(in srgb, var(--c-accent) 60%, var(--c-track));
}

/* ────────────────────────────────────────────────────────────
   Variant 6 — Pill / chip with icons (full-width row)
   ──────────────────────────────────────────────────────────── */
.v6-wrap {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}
.v6-wrap::-webkit-scrollbar { height: 6px; }
.v6-wrap::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 999px; }
.v6-pill {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 8px 8px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  color: var(--c-text-mute);
  white-space: nowrap;
  transition: background-color 220ms ease, color 220ms ease, border-color 220ms ease, transform 180ms ease, box-shadow 220ms ease;
}
.v6-pill:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.v6-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--c-bg);
  color: var(--c-text-mute);
  flex-shrink: 0;
  transition: background-color 220ms ease, color 220ms ease;
}
.v6-text {
  display: inline-flex;
  flex-direction: column;
  line-height: 1.1;
  text-align: left;
}
.v6-num {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--c-text-mute);
  margin-bottom: 2px;
}
.v6-label {
  font-size: 13px;
  font-weight: 600;
  color: inherit;
  white-space: nowrap;
}
.v6-active {
  background: var(--c-accent);
  color: var(--c-on-accent);
  border-color: var(--c-accent);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--c-accent) 28%, transparent);
}
.v6-active .v6-icon { background: rgba(255,255,255,0.18); color: var(--c-on-accent); }
.v6-active .v6-num { color: rgba(255,255,255,0.75); }
.v6-complete { color: var(--c-text); border-color: color-mix(in srgb, var(--c-accent) 35%, var(--c-border)); }
.v6-complete .v6-icon { background: var(--c-accent); color: var(--c-on-accent); }
.v6-pending { opacity: 0.65; }

/* ────────────────────────────────────────────────────────────
   Variant 5 — Vertical timeline
   ──────────────────────────────────────────────────────────── */
.v5-list {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.v5-item { padding: 0; }
.v5-step-btn {
  width: 100%;
  background: transparent;
  border: 0;
  padding: 8px 0;
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 14px;
  text-align: left;
  border-radius: 8px;
  transition: background-color 180ms ease;
}
.v5-step-btn:hover:not(:disabled) { background: var(--c-bg); }
.v5-rail {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 36px;
}
.v5-node {
  position: relative;
  z-index: 1;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: var(--c-surface);
  border: 2px solid var(--c-border);
  color: var(--c-text-mute);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 280ms ease, border-color 280ms ease, color 280ms ease, box-shadow 280ms ease, transform 280ms ease;
}
.v5-node-num { font-size: 12px; font-weight: 700; }
.v5-connector {
  flex: 1;
  width: 2px;
  background: var(--c-track);
  margin-top: 2px;
  min-height: 24px;
  transition: background-color 360ms ease;
}
.v5-content { padding: 2px 0 14px; }
.v5-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
  transition: color 240ms ease;
}
.v5-desc {
  display: block;
  font-size: 12px;
  color: var(--c-text-mute);
  margin-top: 2px;
}
.v5-active .v5-node {
  background: var(--c-accent);
  border-color: var(--c-accent);
  color: var(--c-on-accent);
  transform: scale(1.06);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-accent) 18%, transparent);
}
.v5-active .v5-label { color: var(--c-accent); }
.v5-complete .v5-node {
  background: var(--c-accent);
  border-color: var(--c-accent);
  color: var(--c-on-accent);
}
.v5-complete .v5-connector { background: var(--c-accent); }
.v5-pending .v5-label { color: var(--c-text-mute); }

/* ── Page footer / accent strip ─────────────────────────── */
.ips-page-foot {
  max-width: 1200px;
  margin: 40px auto 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ips-accent-strip {
  height: 4px;
  border-radius: 999px;
  background: var(--gradient);
}
.ips-page-foot p {
  font-size: 12px;
  color: var(--c-text-mute);
  margin: 0;
}
.ips-page-foot code {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 11px;
}

/* ── Completion burst ───────────────────────────────────── */
.ips-done-wrap {
  position: relative;
  display: inline-flex;
}
.ips-burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: grid;
  place-items: center;
}
.ips-spark {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--c-accent);
  animation: spark-fly 0.7s cubic-bezier(.2,.8,.3,1) forwards;
  animation-delay: calc(var(--i) * 18ms);
}
.ips-spark:nth-child(2n)   { background: var(--c-accent-2); width: 4px; height: 4px; }
.ips-spark:nth-child(3n)   { background: color-mix(in srgb, var(--c-accent) 60%, #fff); }
.ips-spark:nth-child(4n)   { width: 3px; height: 3px; }
@keyframes spark-fly {
  0%   { transform: rotate(var(--angle)) translateY(0)    scale(1);   opacity: 1; }
  60%  { opacity: 1; }
  100% { transform: rotate(var(--angle)) translateY(-28px) scale(0);  opacity: 0; }
}
.ips-btn-done-burst {
  animation: done-pop 0.5s cubic-bezier(.2,.8,.3,1);
}
@keyframes done-pop {
  0%   { transform: scale(1); }
  35%  { transform: scale(1.08); box-shadow: 0 0 0 6px color-mix(in srgb, var(--c-accent) 22%, transparent); }
  100% { transform: scale(1); box-shadow: none; }
}

/* ── Reduced motion ─────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .ips-root *, .ips-root *::before, .ips-root *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }
}
`;

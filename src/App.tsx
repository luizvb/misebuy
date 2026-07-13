import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, Check, DownloadSimple, ShieldCheck, Sparkle, X } from "@phosphor-icons/react";
import { parseCsv, planToCsv, type PurchasePlan } from "./core/compare";
import { sampleNeeds, sampleOffers } from "./core/sample";
import { localPreviewProvider } from "./core/provider";

type ViewState = "empty" | "loading" | "success" | "error";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function track(name: string, detail?: Record<string, number | string>) {
  const events = JSON.parse(sessionStorage.getItem("misebuy_events") ?? "[]") as unknown[];
  sessionStorage.setItem("misebuy_events", JSON.stringify([...events.slice(-19), { name, detail, at: Date.now() }]));
}

function Mark() {
  return <img className="mark" src="/logo.svg" alt="" width="40" height="40" />;
}

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Result({ plan, onReset }: { plan: PurchasePlan; onReset: () => void }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className="result" initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="result-summary">
        <div><span>Buying plan</span><strong>{money.format(plan.total)}</strong></div>
        <div><span>Versus current list</span><strong className="accent">Save {money.format(plan.savings)}</strong></div>
        <button className="icon-button" onClick={onReset} aria-label="Clear comparison"><X size={18} /></button>
      </div>
      <div className="supplier-groups">
        {Object.entries(plan.bySupplier).map(([supplier, lines]) => (
          <section className="supplier" key={supplier}>
            <h3>{supplier}</h3>
            {lines.map((line) => (
              <div className="plan-line" key={line.item}>
                <div><strong>{line.item}</strong><span>{line.packs} packs for {line.quantity} {line.unit}</span></div>
                <b>{money.format(line.lineTotal)}</b>
              </div>
            ))}
          </section>
        ))}
      </div>
      {plan.warnings.length > 0 && <p className="warning">Review needed: {plan.warnings.join(" ")}</p>}
      <div className="result-actions">
        <button className="button primary" onClick={() => { download("misebuy-plan.csv", planToCsv(plan)); track("plan_exported", { lines: plan.lines.length }); }}>
          <DownloadSimple size={19} /> Export plan
        </button>
        <a className="button secondary" href="#pricing">Save weekly history</a>
      </div>
      <p className="privacy-note"><ShieldCheck size={17} /> Guest data stays in this tab. No order is placed automatically.</p>
    </motion.div>
  );
}

export default function App() {
  const [csv, setCsv] = useState("");
  const [state, setState] = useState<ViewState>("empty");
  const [plan, setPlan] = useState<PurchasePlan | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [intentSent, setIntentSent] = useState(false);
  const reduce = useReducedMotion();

  const rowCount = useMemo(() => Math.max(0, csv.trim().split(/\r?\n/).filter(Boolean).length - 1), [csv]);

  async function compare(input = csv) {
    setState("loading");
    setError("");
    const started = performance.now();
    try {
      const offers = parseCsv(input);
      await new Promise((resolve) => setTimeout(resolve, reduce ? 80 : 520));
      const nextPlan = await localPreviewProvider.compare(offers, sampleNeeds);
      setPlan(nextPlan);
      setState("success");
      track("aha_completed", { ttv_ms: Math.round(performance.now() - started), lines: nextPlan.lines.length });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The list could not be compared.");
      setState("error");
      track("comparison_error");
    }
  }

  function loadSample() {
    setCsv(sampleOffers);
    track("sample_loaded");
    void compare(sampleOffers);
  }

  function reset() {
    setCsv("");
    setPlan(null);
    setState("empty");
    setError("");
    sessionStorage.removeItem("misebuy_events");
  }

  return (
    <div className="page-shell">
      <header className="nav">
        <a className="brand" href="#top"><Mark /><span>MiseBuy</span></a>
        <nav aria-label="Primary navigation">
          <a href="#how">How it works</a><a href="#pricing">Pricing</a><a className="nav-cta" href="#workspace">Compare a list</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Restaurant buying, prepared</p>
            <h1>Compare the order before you place it.</h1>
            <p className="hero-lede">Turn mixed supplier lists into one ready-to-buy plan. Try the sample without an account.</p>
            <div className="hero-actions"><a className="button primary" href="#workspace">Try the sample <ArrowDown size={18} /></a><a className="text-link" href="#how">See the workflow</a></div>
          </div>
          <figure className="hero-image">
            <img src="/assets/receiving-compare.webp" srcSet="/assets/receiving-compare-720.webp 720w, /assets/receiving-compare.webp 1600w" sizes="(max-width: 900px) 100vw, 55vw" alt="Chef-operator comparing supplier lists in a restaurant receiving area" width="1600" height="1000" fetchPriority="high" decoding="async" />
          </figure>
        </section>

        <section className="signal-strip" aria-label="Market context">
          <p>Built for a year when restaurant costs remain elevated and comparison is becoming an AI-native behavior.</p>
          <div><a href="https://restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/elevated-costs-continue-to-pressure-restaurant-profitability/" target="_blank" rel="noreferrer">Restaurant costs</a><a href="https://openai.com/index/powering-product-discovery-in-chatgpt/" target="_blank" rel="noreferrer">Shopping behavior</a></div>
        </section>

        <section className="workspace-section" id="workspace">
          <div className="workspace-heading"><h2>Your first plan, before signup.</h2><p>Use synthetic sample data or paste a CSV. The preview engine runs in your browser.</p></div>
          <div className="workspace">
            <div className="input-panel">
              <div className="input-meta"><label htmlFor="supplier-csv">Supplier offers</label><span>{rowCount}/100 rows</span></div>
              <textarea id="supplier-csv" value={csv} onChange={(event) => setCsv(event.target.value)} placeholder="supplier,item,pack_size,unit,pack_price" spellCheck={false} aria-describedby="csv-help" />
              <p id="csv-help">Accepted units: kg, l, each. Guest mode does not upload this content.</p>
              <div className="input-actions"><button className="button primary" onClick={() => void compare()} disabled={state === "loading" || !csv.trim()}>Compare list <ArrowRight size={18} /></button><button className="button secondary" onClick={loadSample} disabled={state === "loading"}>Load sample</button></div>
            </div>
            <div className="output-panel" aria-live="polite">
              <AnimatePresence mode="wait">
                {state === "empty" && <motion.div className="empty-state" key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Sparkle size={28} /><h3>Your buying plan appears here.</h3><p>We match equivalent items, account for pack sizes, and group the winning lines by supplier.</p></motion.div>}
                {state === "loading" && <motion.div className="loading-state" key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="skeleton wide" /><div className="skeleton" /><div className="skeleton short" /><p>Comparing pack costs and aliases...</p></motion.div>}
                {state === "error" && <motion.div className="error-state" key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><X size={28} /><h3>Check the list format.</h3><p>{error}</p><button className="button secondary" onClick={loadSample}>Use sample instead</button></motion.div>}
                {state === "success" && plan && <Result key="result" plan={plan} onReset={reset} />}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section className="story" id="how">
          <img src="/assets/receiving-check.webp" alt="Chef-operator checking a produce delivery against an order list" width="1200" height="900" loading="lazy" />
          <div><h2>One decision before the truck leaves.</h2><p>Supplier naming is inconsistent. Pack sizes hide the true comparison. MiseBuy turns the weekly mess into a plan you can review.</p><div className="steps"><div><b>Paste</b><span>Two or more supplier lists</span></div><div><b>Review</b><span>Matched items and pack math</span></div><div><b>Export</b><span>A separate list for each supplier</span></div></div></div>
        </section>

        <section className="feature-grid">
          <article className="feature feature-large"><h2>Useful without a migration project.</h2><p>Start with the files you already receive. No POS integration is required for the first plan.</p></article>
          <article className="feature tomato"><Check size={28} /><h3>Human review stays in control</h3><p>Low-confidence matches are flagged. Orders are never placed automatically.</p></article>
          <article className="feature"><h3>History becomes the moat</h3><p>Paid plans will preserve aliases, preferred substitutions, and weekly price drift.</p></article>
          <article className="feature steel"><h3>Local-first guest mode</h3><p>The sample comparison runs on-device. Clear the tab and the guest session is gone.</p></article>
        </section>

        {plan && <section className="pricing" id="pricing">
          <div><h2>Keep the plan free. Pay for the memory.</h2><p>Pricing appears after value because the first comparison should prove the workflow.</p></div>
          <div className="plans"><article><h3>Guest</h3><strong>$0</strong><p>12 needed items, local session, CSV export.</p></article><article className="paid"><h3>Weekly</h3><strong>$29<span>/mo</span></strong><p>Price history, 4 suppliers, saved aliases and drift alerts.</p><form onSubmit={(event) => { event.preventDefault(); if (email) { setIntentSent(true); track("upgrade_intent"); } }}><label htmlFor="email">Work email</label><div><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="chef@restaurant.com" /><button className="button primary" type="submit">Join preview</button></div>{intentSent && <p className="form-success">Intent saved locally for this preview.</p>}</form></article></div>
        </section>}

        <section className="faq"><h2>Before you compare</h2><details><summary>Does MiseBuy guarantee the lowest market price?</summary><p>No. It compares the supplier lists you provide and shows the pack math. Availability, quality, terms, and substitutions still require operator judgment.</p></details><details><summary>Does guest mode send supplier pricing to a server?</summary><p>No. This preview runs the comparison locally in the browser and stores only anonymous event names in the current tab.</p></details><details><summary>Where is the AI?</summary><p>The production design supports a schema-bound matching provider. This public preview uses the deterministic local provider until a live model, rate limit, and cost gate are configured.</p></details></section>
      </main>

      <footer><a className="brand" href="#top"><Mark /><span>MiseBuy</span></a><p>Compare the order before you place it.</p><a href="https://github.com/luizvb/misebuy">Source</a></footer>
    </div>
  );
}

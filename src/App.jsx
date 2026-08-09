import { Suspense, lazy, useEffect } from "react";

import ErrorBoundary from "./components/ErrorBoundary";
import SceneBackdrop from "./components/canvas/SceneBackdrop";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SocialLinks from "./components/SocialLinks";
import { ToastProvider, useToast } from "./components/toast/ToastContext";
import { registerToast } from "./components/toast/toast";

const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const Experience = lazy(() => import("./components/Experience"));
const Notes = lazy(() => import("./components/Notes"));
const Tech = lazy(() => import("./components/Tech"));
const Works = lazy(() => import("./components/Works"));

function ToastRegistrar() {
  const { showToast } = useToast();
  registerToast(showToast);
  return null;
}

// Every section below the hero is lazily imported, which quietly broke deep links: open
// /#projects and the browser looks for that id while the chunk is still in flight, finds
// nothing, and stays at the top with no indication anything was meant to happen. Anyone
// sharing a link to a specific section hit this. So retry across a few frames until the
// target actually exists in the document.
const HashScroll = () => {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return undefined;

    let raf = 0;
    let frames = 0;

    const attempt = () => {
      const target = document.getElementById(id);
      if (target) {
        // Explicitly instant: `scroll-behavior: smooth` is set globally, and animating
        // the initial jump from the top of a page the visitor never saw looks like a bug.
        target.scrollIntoView({ behavior: "instant", block: "start" });
        return;
      }
      // ~1s at 60fps, then give up rather than poll forever.
      if (frames++ < 60) raf = requestAnimationFrame(attempt);
    };

    raf = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
};

// Shown if a section chunk fails to load or throws. A recruiter hitting a network
// blip should still land on something they can act on rather than a blank column.
const SectionsFallback = () => (
  <section className="mx-auto max-w-7xl px-6 py-24 sm:px-16">
    <h2 className="text-[28px] font-black text-white">This section didn&apos;t load</h2>
    <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-secondary">
      Something went wrong fetching part of this page — a refresh usually sorts it. In the
      meantime, my code and contact details are right here.
    </p>
    <SocialLinks className="mt-6" />
  </section>
);

// Reserves roughly a screen of height while the section chunks arrive, so the footer
// does not render high up the page and then get shoved down — the fallback used to be
// null, which made that jump a guaranteed layout shift on every cold load.
const SectionsSkeleton = () => (
  <div aria-hidden="true" className="mx-auto max-w-7xl px-6 py-24 sm:px-16">
    <div className="h-4 w-32 rounded bg-white/[0.06]" />
    <div className="mt-6 h-12 w-72 rounded bg-white/[0.05]" />
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-56 rounded-2xl bg-white/[0.035]" />
      ))}
    </div>
  </div>
);

const App = () => {
  return (
    <>
      <ToastProvider>
        <ToastRegistrar />
        <HashScroll />
        <div className="relative z-0">
          {/* Background layer. Owns the WebGL capability gate, so the 3D scene is
              strictly additive: the page below renders and works whether or not it
              ever appears. */}
          <SceneBackdrop />

          {/* First thing in the tab order: a keyboard or screen-reader user should not
              have to walk the whole nav to reach the content. Hidden until focused. */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#151030] focus:px-4 focus:py-3 focus:text-[14px] focus:font-bold focus:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#22d3ee]"
          >
            Skip to content
          </a>

          <Navbar />

          <main id="main">
            <Hero />

            {/* Order is the recruiter's reading order, not the order these were built.
                Projects used to sit fifth, behind four content-free service cards, the
                experience timeline and the tech grid — past the point a 45-second visit
                ever reaches. Proof of work now comes straight after the introduction,
                then the engineering depth, then the track record. */}
            <ErrorBoundary label="sections" fallback={<SectionsFallback />}>
              <Suspense fallback={<SectionsSkeleton />}>
                <About />
                <Works />
                <Notes />
                <Experience />
                <Tech />
              </Suspense>
            </ErrorBoundary>

            <div className="relative z-0">
              <ErrorBoundary label="contact" fallback={null}>
                <Suspense fallback={null}>
                  <Contact />
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>

          <Footer />
        </div>
      </ToastProvider>
    </>
  );
};

export default App;

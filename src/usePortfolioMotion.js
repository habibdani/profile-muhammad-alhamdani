import { useEffect, useState } from "react";

export function usePortfolioMotion() {
  const [active, setActive] = useState("");
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const elements = [
      ...document.querySelectorAll(
        ".about > div, .section-heading, .project, .experience-title, .timeline, .skill-group, .education, .contact-card",
      ),
    ];
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            reveal.unobserve(entry.target);
          }
        }),
      { threshold: 0.07 },
    );
    elements.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${(i % 2) * 85}ms`);
      reveal.observe(el);
    });
    const sections = [...document.querySelectorAll("section[id]")];
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      let current = "";
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.42)
          current = section.id;
      });
      setActive(current);
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    update();
    const cards = [...document.querySelectorAll(".project")];
    const move = (event) => {
      if (reduced.matches || !fine.matches) return;
      const el = event.currentTarget;
      const box = el.getBoundingClientRect();
      el.style.setProperty("--pointer-x", `${event.clientX - box.left}px`);
      el.style.setProperty("--pointer-y", `${event.clientY - box.top}px`);
    };
    cards.forEach((el) => el.addEventListener("pointermove", move));
    return () => {
      reveal.disconnect();
      elements.forEach((el) => el.classList.remove("reveal", "revealed"));
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      cancelAnimationFrame(frame);
      cards.forEach((el) => el.removeEventListener("pointermove", move));
    };
  }, []);
  return { active, progress };
}

import PrivacyNotice from "./PrivacyNotice.jsx";
import { useEffect, useState } from "react";
import {
  Mail,
  Download,
  Sun,
  Moon,
  Menu,
  X,
  Code2,
  Database,
  Layers3,
  Server,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { usePortfolioMotion } from "./usePortfolioMotion.js";
function Switch({ checked, onCheckedChange, ...props }) {
  return (
    <button
      {...props}
      type="button"
      role="switch"
      aria-checked={checked}
      className="theme-switch"
      onClick={() => onCheckedChange(!checked)}
    >
      <span />
    </button>
  );
}
const projects = [
  {
    n: "01",
    title: [
      "EDC Tracking & Service Platform",
      "Platform Pelacakan & Layanan EDC",
    ],
    category: ["BANKING · ENTERPRISE", "PERBANKAN · ENTERPRISE"],
    company: "PT Wide Technologies Indonesia",
    text: [
      "A nationwide platform connecting device tracking, maintenance tickets, and automated technician assignment. Integrated with BRI, BNI, and Mandiri banking systems.",
      "Platform nasional untuk pelacakan perangkat, tiket pemeliharaan, dan penugasan teknisi otomatis. Terintegrasi dengan sistem perbankan BRI, BNI, dan Mandiri.",
    ],
    detail: [
      "Built microservices and REST APIs, asynchronous processing with RabbitMQ, Redis caching, and PostgreSQL partitioning and indexing for millions of transactional records.",
      "Membangun microservices dan REST API, pemrosesan asinkron dengan RabbitMQ, caching Redis, serta partisi dan indeks PostgreSQL untuk jutaan data transaksi.",
    ],
    stack: ["Java", "Spring Boot", "PostgreSQL", "RabbitMQ"],
    icon: Server,
  },
  {
    n: "02",
    title: ["Property Management Super App", "Super App Manajemen Properti"],
    category: ["PROPERTY · MULTIPLATFORM", "PROPERTI · MULTIPLATFORM"],
    company: "Humanindo Amana Properti / Properti Teknologi Internasional",
    text: [
      "Connected CRM, sales, tenant management, bookings, and payment gateways across web and mobile applications.",
      "Menghubungkan CRM, penjualan, pengelolaan penyewa, pemesanan, dan payment gateway pada aplikasi web dan mobile.",
    ],
    detail: [
      "Developed and maintained application services with Spring Boot, Express, Yii2, and React. Managed servers and delivery workflows using Jenkins, VPS, and SSH.",
      "Mengembangkan layanan aplikasi dengan Spring Boot, Express, Yii2, dan React. Mengelola server dan alur deployment menggunakan Jenkins, VPS, dan SSH.",
    ],
    stack: ["Spring Boot", "Express.js", "React", "Redis"],
    icon: Layers3,
  },
  {
    n: "03",
    title: ["Connected CRM & ERP", "CRM & ERP Terintegrasi"],
    category: ["OPERATIONS · AUTOMATION", "OPERASIONAL · OTOMATISASI"],
    company: "PT Lestari Muliya Sentosa",
    text: [
      "Business workflows connected to real-world devices: scales, printers, scanners, and fingerprint readers.",
      "Alur kerja bisnis terhubung dengan perangkat: timbangan, printer, scanner, dan pembaca sidik jari.",
    ],
    detail: [
      "Built the CRM and ERP website using Laravel, Bootstrap, and TypeScript. Combined native SQL, ORM, and NoSQL data processing, alongside direct user support.",
      "Membangun website CRM dan ERP dengan Laravel, Bootstrap, dan TypeScript. Menggunakan SQL native, ORM, dan NoSQL, serta memberikan dukungan langsung kepada pengguna.",
    ],
    stack: ["Laravel", "TypeScript", "SQL", "Device integration"],
    icon: Database,
  },
  {
    n: "04",
    title: ["Commerce & Digital Learning", "E-commerce & Pembelajaran Digital"],
    category: ["WEB · FULL STACK", "WEB · FULL STACK"],
    company: "PT Andal Prima / SMP N 4 Jombang",
    text: [
      "An online store for a retail business, plus a school profile and e-learning platform supporting digital education.",
      "Toko online untuk bisnis retail, serta website profil sekolah dan platform e-learning untuk mendukung pembelajaran digital.",
    ],
    detail: [
      "Delivered a Laravel e-commerce platform as a freelance full-stack developer, and developed school web features and digital learning tools in an earlier role.",
      "Mengembangkan platform e-commerce Laravel sebagai freelance full-stack developer, serta fitur website sekolah dan pembelajaran digital pada peran sebelumnya.",
    ],
    stack: ["PHP", "Laravel", "MySQL", "Full stack"],
    icon: Code2,
  },
];
const jobs = [
  [
    "Dec 2024 — Present",
    "Des 2024 — Sekarang",
    "Senior Backend Developer",
    "PT Wide Technologies Indonesia",
    "Nationwide EDC tracking, banking integrations, microservices, and PostgreSQL performance.",
    "Pelacakan EDC nasional, integrasi bank, microservices, dan optimasi PostgreSQL.",
  ],
  [
    "Dec 2023 — Dec 2024",
    "Des 2023 — Des 2024",
    "Full-Stack Developer",
    "PT Humanindo Amana Properti",
    "Property super app, CRM, payment gateways, and delivery infrastructure.",
    "Super app properti, CRM, payment gateway, dan infrastruktur deployment.",
  ],
  [
    "Jul 2023 — Dec 2024",
    "Jul 2023 — Des 2024",
    "Backend Developer",
    "PT Properti Teknologi Internasional",
    "Backend services for property management across web and mobile.",
    "Layanan backend manajemen properti untuk web dan mobile.",
  ],
  [
    "Jul 2024 — Oct 2024",
    "Jul 2024 — Okt 2024",
    "Freelance Full-Stack Developer",
    "PT Andal Prima",
    "Laravel e-commerce platform for an online store.",
    "Platform e-commerce Laravel untuk toko online.",
  ],
  [
    "Nov 2022 — Jul 2023",
    "Nov 2022 — Jul 2023",
    "Full Stack Developer",
    "PT Lestari Muliya Sentosa",
    "CRM & ERP systems with hardware integration and workflow automation.",
    "Sistem CRM & ERP dengan integrasi perangkat dan otomatisasi alur kerja.",
  ],
  [
    "Jul 2022 — Oct 2022",
    "Jul 2022 — Okt 2022",
    "Back-End Developer & IT Staff",
    "SMP N 4 Jombang",
    "School profile website and e-learning platform.",
    "Website profil sekolah dan platform e-learning.",
  ],
  [
    "Jun 2021 — Oct 2021",
    "Jun 2021 — Okt 2021",
    "IT Staff · Intern",
    "Balai Penelitian Tanaman Pemanis dan Serat, Malang",
    "Autonomous laboratory sterilization car prototype using C++ and Python.",
    "Prototipe mobil sterilisasi laboratorium otonom dengan C++ dan Python.",
  ],
];
export default function App() {
  const { active, progress } = usePortfolioMotion();
  const [id, setId] = useState(() => {
      try {
        return localStorage.getItem("portfolio-language") === "id";
      } catch {
        return false;
      }
    }),
    [dark, setDark] = useState(() => {
      try {
        return localStorage.getItem("portfolio-theme") === "dark";
      } catch {
        return false;
      }
    }),
    [menu, setMenu] = useState(false),
    [all, setAll] = useState(false);
  const l = id ? 1 : 0;
  const t = (en, ind) => (id ? ind : en);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("portfolio-theme", dark ? "dark" : "light");
    } catch {}
  }, [dark]);
  useEffect(() => {
    document.documentElement.lang = id ? "id" : "en";
    try {
      localStorage.setItem("portfolio-language", id ? "id" : "en");
    } catch {}
  }, [id]);
  const nav = [
    ["about", t("About", "Tentang")],
    ["work", t("Selected work", "Proyek")],
    ["experience", t("Experience", "Pengalaman")],
    ["contact", t("Contact", "Kontak")],
  ];
  return (
    <>
      <div
        className="reading-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <div className="nav-wrap">
          <a className="brand" href="#" aria-label="Muhammad Alhamdani home">
            <span className="brand-mark">
              m<span>.</span>
            </span>
            <span>
              alhamdani<span className="brand-period">.</span>
            </span>
          </a>
          <nav className={menu ? "open" : ""}>
            {nav.map(([link, label]) => (
              <a
                href={"#" + link}
                key={link}
                className={active === link ? "nav-active" : ""}
                onClick={() => setMenu(false)}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="settings">
            <button
              className="language"
              aria-label={t("Switch to Indonesian", "Switch to English")}
              onClick={() => setId(!id)}
            >
              <span className={!id ? "selected" : ""}>EN</span>
              <span className="divider">/</span>
              <span className={id ? "selected" : ""}>ID</span>
            </button>
            <div className="theme-control">
              <Sun size={15} />
              <Switch
                checked={dark}
                onCheckedChange={setDark}
                aria-label={t("Dark theme", "Tema gelap")}
              />
              <Moon size={15} />
            </div>
            <button
              className="menu"
              onClick={() => setMenu(!menu)}
              aria-label="Menu"
              aria-expanded={menu}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-ambient" aria-hidden="true">
            <div />
            <div />
            <div />
          </div>
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="little-line" />
              {t("SENIOR BACKEND DEVELOPER", "SENIOR BACKEND DEVELOPER")}
            </div>
            <h1>
              Muhammad
              <br />
              <span>
                Alhamdani<span className="dot">.</span>
              </span>
            </h1>
            <h2>
              {t("Thoughtful code.", "Kode yang terencana.")}
              <br />
              {t("Dependable systems.", "Sistem yang andal.")}
            </h2>
            <p>
              {t(
                "I build the systems behind the experience. 5+ years turning complex business needs into scalable APIs, connected platforms, and reliable backends.",
                "Saya membangun sistem di balik pengalaman pengguna. Lebih dari 5 tahun mengubah kebutuhan bisnis kompleks menjadi API yang skalabel, platform terintegrasi, dan backend yang andal.",
              )}
            </p>
            <div className="specialties">
              <span>API Engineering</span>
              <span>Distributed Systems</span>
              <span>Performance</span>
            </div>
            <div className="hero-actions">
              <a className="button primary" href="#work">
                {t("Explore my work", "Jelajahi proyek")}
              </a>
              <a
                className="button secondary"
                href="/Muhammad-Alhamdani-CV.pdf"
                download
              >
                <Download size={17} />
                {t("Download CV", "Unduh CV")}
              </a>
            </div>
            <div className="social-row">
              <span>
                <MapPin size={14} /> Indonesia
              </span>
              <i />
              <a
                href="https://github.com/habibdani"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <span style={{ fontWeight: 700 }}>GH</span>
              </a>
              <a
                href="https://www.linkedin.com/in/habibijufah/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <span style={{ fontWeight: 700 }}>in</span>
              </a>
              <a href="mailto:habibdani86@gmail.com" aria-label="Email">
                <Mail size={19} />
              </a>
            </div>
          </div>
          <div className="portrait-stage">
            <div className="portrait-grid" aria-hidden="true" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="portrait-label">
              <span>ENGINEER / BUILDER</span>
              <span>01</span>
            </div>
            <div className="portrait-frame">
              <img
                src="/profile.jpg"
                alt="Muhammad Alhamdani"
                width="400"
                height="400"
                fetchPriority="high"
              />
            </div>
            <div className="floating-tag tag-top">
              <Code2 size={21} />
              <span>
                Go <b>·</b> Java <b>·</b> Python
              </span>
            </div>
            <div className="floating-tag tag-bottom">
              <div className="tag-icon">
                <Database size={23} />
              </div>
              <div>
                <strong>{t("Built for scale", "Dirancang untuk skala")}</strong>
                <span>APIs · Data · Microservices</span>
              </div>
            </div>
            <div className="portrait-caption">
              <span>MUHAMMAD ALHAMDANI</span>
              <span>{t("Backend at heart.", "Backend sebagai fokus.")}</span>
            </div>
          </div>
        </section>
        <section className="stack-strip">
          <div className="wrap stack-inner">
            <span>{t("MY EVERYDAY TOOLKIT", "TEKNOLOGI ANDALAN")}</span>
            <div>
              {[
                "Go",
                "Java",
                "Spring Boot",
                "PostgreSQL",
                "Redis",
                "Docker",
              ].map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </section>
        <section id="about" className="wrap about section">
          <div>
            <div className="eyebrow">
              01 / {t("A LITTLE ABOUT ME", "TENTANG SAYA")}
            </div>
            <h2>
              {t(
                "Behind every smooth experience,",
                "Di balik pengalaman yang mulus,",
              )}
              <br />
              <em>{t("a solid foundation.", "ada fondasi yang kuat.")}</em>
            </h2>
          </div>
          <div className="about-copy">
            <p>
              {t(
                "I’m Habib, a backend-focused engineer who enjoys making complex systems work simply. My experience spans banking operations, property platforms, enterprise software, and digital learning.",
                "Saya Habib, engineer dengan fokus backend yang senang membuat sistem kompleks bekerja dengan sederhana. Pengalaman saya mencakup operasional perbankan, platform properti, aplikasi enterprise, dan pembelajaran digital.",
              )}
            </p>
            <p>
              {t(
                "From a slow database query to a distributed service, I care about the details that make software dependable. I also work across the stack with React when the product needs it.",
                "Dari query database yang lambat hingga layanan terdistribusi, saya memperhatikan detail yang membuat software andal. Saya juga bekerja di sisi frontend menggunakan React sesuai kebutuhan produk.",
              )}
            </p>
            <div className="mini-stats">
              <div>
                <strong>5+</strong>
                <span>{t("Years of experience", "Tahun pengalaman")}</span>
              </div>
              <div>
                <strong>{t("End-to-end", "End-to-end")}</strong>
                <span>
                  {t("From data to delivery", "Dari data hingga delivery")}
                </span>
              </div>
            </div>
          </div>
        </section>
        <section id="work" className="work-section section">
          <div className="wrap">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  02 / {t("SELECTED WORK", "PROYEK PILIHAN")}
                </div>
                <h2>
                  {t("Real problems.", "Masalah nyata.")}{" "}
                  <em>{t("Working solutions.", "Solusi yang bekerja.")}</em>
                </h2>
              </div>
              <p>
                {t(
                  "A selection of systems I’ve helped design, develop, and maintain.",
                  "Pilihan sistem yang pernah saya rancang, kembangkan, dan pelihara.",
                )}
              </p>
            </div>
            <div className="project-grid">
              {projects.map((p) => (
                <article className={"project project-" + p.n} key={p.n}>
                  <div className="project-top">
                    <span className="project-icon">
                      <p.icon size={27} />
                    </span>
                    <span className="project-number">{p.n}</span>
                  </div>
                  <div className="project-accent" aria-hidden="true" />
                  <div className="project-category">{p.category[l]}</div>
                  <h3>{p.title[l]}</h3>
                  <p>{p.text[l]}</p>
                  <div className="chips">
                    {p.stack.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                  <details>
                    <summary>
                      {t("My contribution", "Kontribusi saya")}
                      <span>+</span>
                    </summary>
                    <div>
                      <small>{p.company}</small>
                      <p>{p.detail[l]}</p>
                    </div>
                  </details>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="experience" className="wrap section experience">
          <div className="experience-title">
            <div className="eyebrow">
              03 / {t("THE JOURNEY", "PERJALANAN KARIER")}
            </div>
            <h2>
              {t("Experience that", "Pengalaman yang")}
              <br />
              <em>{t("builds perspective.", "membentuk perspektif.")}</em>
            </h2>
            <p>
              {t(
                "Hands-on engineering, across industries and across the stack.",
                "Pengalaman engineering langsung, lintas industri dan berbagai lapisan teknologi.",
              )}
            </p>
            <a className="text-link" href="/Muhammad-Alhamdani-CV.pdf" download>
              <Download size={17} />
              {t("View full résumé", "Unduh CV lengkap")}
            </a>
          </div>
          <div className="timeline">
            {jobs.slice(0, all ? jobs.length : 3).map((j, i) => (
              <article className="job" key={j[3]}>
                <div className="timeline-node" />
                <div className="job-date">
                  {j[l]}
                  {i === 0 && <span>{t("CURRENT", "SAAT INI")}</span>}
                </div>
                <h3>{j[2]}</h3>
                <h4>{j[3]}</h4>
                <p>{j[id ? 5 : 4]}</p>
              </article>
            ))}
            <button
              className="text-link"
              onClick={() => setAll(!all)}
              aria-expanded={all}
            >
              {all
                ? t("Show less", "Tampilkan lebih sedikit")
                : t(
                    "Show earlier experience +",
                    "Tampilkan pengalaman sebelumnya +",
                  )}
            </button>
          </div>
        </section>
        <section className="skills-section section">
          <div className="wrap">
            <div className="eyebrow">
              04 / {t("SKILLS & FOUNDATION", "KEAHLIAN & PENDIDIKAN")}
            </div>
            <h2>
              {t("The right tools.", "Teknologi yang tepat.")}{" "}
              <em>{t("A curious mind.", "Pikiran yang terbuka.")}</em>
            </h2>
            <div className="skills-grid">
              {[
                {
                  icon: Code2,
                  title: t("Languages & frameworks", "Bahasa & framework"),
                  items: [
                    "Go",
                    "Java / Spring Boot",
                    "Python / Flask / FastAPI",
                    "PHP / Laravel / Yii2",
                    "JavaScript / TypeScript",
                    "Express.js",
                    "React / Next.js / Vue.js",
                    "C++",
                  ],
                },
                {
                  icon: Database,
                  title: t("Data & architecture", "Data & arsitektur"),
                  items: [
                    "PostgreSQL / MySQL",
                    "MongoDB",
                    "Redis",
                    "RabbitMQ",
                    "RESTful APIs",
                    "Microservices",
                    "JPA / Hibernate / Eloquent",
                    "Query optimization",
                  ],
                },
                {
                  icon: Layers3,
                  title: t("Delivery & tooling", "Delivery & perangkat"),
                  items: [
                    "Docker",
                    "Git",
                    "Jenkins / CI/CD",
                    "Linux / SSH / VPS",
                    "Postman",
                    "Navicat / DBeaver",
                    "AI-assisted development",
                  ],
                },
              ].map((s) => (
                <div className="skill-group" key={s.title}>
                  <s.icon size={24} />
                  <h3>{s.title}</h3>
                  <div className="skill-list">
                    {s.items.map((a) => (
                      <span key={a}>{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="education">
              <div>
                <span className="eyebrow">{t("EDUCATION", "PENDIDIKAN")}</span>
                <h3>Brawijaya University</h3>
              </div>
              <p>Bachelor of Engineering in Computer Science</p>
              <span>{t("Graduated 2022", "Lulus 2022")}</span>
            </div>
          </div>
        </section>
        <section id="contact" className="wrap contact-section">
          <div className="contact-card">
            <div className="eyebrow">
              {t("LET’S CONNECT", "MARI TERHUBUNG")}
            </div>
            <h2>
              {t("Great systems start", "Sistem hebat dimulai")}
              <br />
              {t("with a conversation.", "dari percakapan.")}
            </h2>
            <p>
              {t(
                "Have an engineering challenge or a role in mind? Let’s talk.",
                "Punya tantangan engineering atau peluang kerja? Mari berdiskusi.",
              )}
            </p>
            <a
              className="button contact-button"
              href="mailto:habibdani86@gmail.com"
            >
              <Mail size={19} />
              habibdani86@gmail.com
            </a>
            <div className="contact-links">
              <a
                href="https://www.linkedin.com/in/habibijufah/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <ExternalLink size={14} />
              </a>
              <a
                href="https://github.com/habibdani"
                target="_blank"
                rel="noreferrer"
              >
                GitHub <ExternalLink size={14} />
              </a>
              <a
                href="https://wa.me/6281336454735"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <button
        className={progress > 0.15 ? "back-top visible" : "back-top"}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
          })
        }
        aria-label={t("Back to top", "Kembali ke atas")}
        tabIndex={progress > 0.15 ? 0 : -1}
      >
        ↑
      </button>
      <footer className="wrap">
        <a href="#" className="brand">
          alhamdani<span className="brand-period">.</span>
        </a>
        <span>© {new Date().getFullYear()} Muhammad Alhamdani</span>
        <span>
          {t(
            "Built with care. Powered by React.",
            "Dibuat dengan sepenuh hati. Menggunakan React.",
          )}
        </span>
      </footer>
      <div className="wrap">
        <PrivacyNotice indonesian={id} />
      </div>
    </>
  );
}

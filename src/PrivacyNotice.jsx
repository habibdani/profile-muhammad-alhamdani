import { useEffect, useState } from "react";
import { analyticsOptedOut, setAnalyticsOptOut } from "./analytics.js";
export default function PrivacyNotice({ indonesian }) {
  const [off, setOff] = useState(analyticsOptedOut);
  useEffect(() => {
    const update = () => setOff(analyticsOptedOut());
    window.addEventListener("portfolio-privacy-change", update);
    return () => window.removeEventListener("portfolio-privacy-change", update);
  }, []);
  return (
    <details className="privacy-notice">
      <summary>{indonesian ? "Privasi kunjungan" : "Visit privacy"}</summary>
      <p>
        {indonesian
          ? "Website ini mencatat kunjungan dan klik secara otomatis untuk laporan pribadi pemilik: waktu, halaman, sumber domain, perkiraan lokasi, dan jenis perangkat/browser. Aplikasi tidak menyimpan IP mentah. ID pengunjung diperkirakan dari IP dan browser yang di-hash dengan kunci rahasia serta berubah setiap hari; ini bukan identitas orang. Data disimpan 30 hari di Upstash dan ringkasannya dikirim lewat Resend ke pemilik; salinan email mengikuti masa simpan kotak masuk. Pengaturan Do Not Track dan Global Privacy Control dihormati."
          : "This site automatically records visits and clicks for the owner’s private report: time, page, referring domain, approximate location, and device/browser category. The application does not store raw IP addresses. Estimated visitor IDs use a secret-key hash of IP and browser and change daily; they do not identify a person. Data is retained for 30 days in Upstash and reports are emailed through Resend to the owner; email copies follow inbox retention. Do Not Track and Global Privacy Control are respected."}
      </p>
      <button
        type="button"
        className="text-link"
        onClick={() => setAnalyticsOptOut(!off)}
      >
        {off
          ? indonesian
            ? "Aktifkan pencatatan di browser ini"
            : "Enable analytics in this browser"
          : indonesian
            ? "Nonaktifkan pencatatan di browser ini"
            : "Disable analytics in this browser"}
      </button>
      <p>
        {indonesian ? "Kontak privasi:" : "Privacy contact:"}{" "}
        <a href="mailto:habibdani86@gmail.com">habibdani86@gmail.com</a>
      </p>
    </details>
  );
}

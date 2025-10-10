
"use client";

import Image from "next/image";

const cdnLogos = [
  { src: "https://bqxdyinyzfxqghyuzsbs.supabase.co/storage/v1/object/public/site-assets/redes%20sociais/Google.webp", alt: "Google CDN" },
  { src: "https://bqxdyinyzfxqghyuzsbs.supabase.co/storage/v1/object/public/site-assets/redes%20sociais/Logo-Netflix.webp", alt: "Netflix" },
  { src: "https://bqxdyinyzfxqghyuzsbs.supabase.co/storage/v1/object/public/site-assets/redes%20sociais/Facebook_logo.webp", alt: "Facebook" },
  { src: "https://bqxdyinyzfxqghyuzsbs.supabase.co/storage/v1/object/public/site-assets/redes%20sociais/Instagram.webp", alt: "Instagram" },
];

export function CdnHighlight() {
  return (
    <section className="cdn-highlight-section">
      <div className="cdn-container">
        <h3 className="cdn-title">Conteúdo mais perto de você.</h3>
        <p className="cdn-subtitle">Nossa rede é integrada às principais CDNs globais para menor latência e vídeos sem travar.</p>

        <div className="cdn-logos">
          {cdnLogos.map((logo, index) => (
            <div key={index} className="cdn-logo">
              <Image src={logo.src} alt={logo.alt} width={120} height={60} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

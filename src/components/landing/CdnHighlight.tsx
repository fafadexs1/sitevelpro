
"use client";

import Image from "next/image";

const cdnLogos = [
  { src: "https://velpro.net.br/wp-content/uploads/2025/05/Google-CDN.png", alt: "Google CDN" },
  { src: "https://velpro.net.br/wp-content/uploads/2025/05/Logo-Netflix-1024x430-1.png", alt: "Netflix" },
  { src: "https://velpro.net.br/wp-content/uploads/2025/05/Facebook_logo_square.png", alt: "Facebook" },
  { src: "https://velpro.net.br/wp-content/uploads/2025/05/Instagram_icon.png", alt: "Instagram" },
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

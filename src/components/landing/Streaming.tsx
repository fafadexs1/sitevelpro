
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const streamingServices = [
  {
    bgImage: "https://velpro.net.br/canais/streamings/GloboPlay.jpg",
    logo: "https://velpro.net.br/wp-content/uploads/2025/06/48D087-1.png",
    logoAlt: "Globoplay",
    title: "Velpro + Globoplay, isso é entretenimento",
    description: "A diversão no entretenimento, a informação do jornalismo e muita emoção nos esportes.",
  },
  {
    bgImage: "https://velpro.net.br/wp-content/uploads/2025/06/GloboPlay-2.jpg",
    logo: "https://velpro.net.br/wp-content/uploads/2025/06/48D087-2.png",
    logoAlt: "Telecine",
    title: "Tenha os maiores sucessos do cinema com a Velpro + Telecine",
    description: "Assista aos maiores lançamentos de Hollywood e clássicos do cinema com qualidade e exclusividade.",
  },
  {
    bgImage: "https://velpro.net.br/wp-content/uploads/2025/06/GloboPlay-1.jpg",
    logo: "https://velpro.net.br/wp-content/uploads/2025/06/48D087.jpg",
    logoAlt: "Premiere",
    title: "Futebol ao vivo é com a Velpro + Premiere",
    description: "Acompanhe seu time do coração em todos os jogos do Brasileirão com emoção e transmissão ao vivo.",
  },
];

export function Streaming() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const customScrollbar = document.getElementById("custom-scrollbar-mobile");
        const scrollContainer = scrollContainerRef.current;

        if (customScrollbar && scrollContainer) {
            if (isIOS) {
                customScrollbar.style.display = "none";
            } else {
                customScrollbar.style.display = "block";
                scrollContainer.style.scrollbarWidth = "none"; 
                scrollContainer.style.setProperty("-ms-overflow-style", "none");
                scrollContainer.classList.add("hide-scrollbar");
            }
        }
  }, []);

  return (
    <div className="velpro-streaming-section">
      <div ref={scrollContainerRef} className="streaming-cards-exact">
        {streamingServices.map((service, index) => (
          <div className="stream-card-exact" key={index}>
            <div
              className="card-inner"
              style={{ backgroundImage: `url('${service.bgImage}')` }}
            >
              <div className="card-overlay">
                <Image
                  src={service.logo}
                  alt={service.logoAlt}
                  width={140}
                  height={28}
                  className="logo-img"
                />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div id="custom-scrollbar-mobile" className="custom-scrollbar-mobile"></div>
    </div>
  );
}

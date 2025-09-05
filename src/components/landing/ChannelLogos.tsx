import Image from "next/image";

const channelLogos = [
  { name: "Globo", src: "https://picsum.photos/40/40?random=1", dataAiHint: "Globo logo" },
  { name: "Warner", src: "https://picsum.photos/40/40?random=2", dataAiHint: "Warner logo" },
  { name: "ESPN", src: "https://picsum.photos/40/40?random=3", dataAiHint: "ESPN logo" },
  { name: "TNT", src: "https://picsum.photos/40/40?random=4", dataAiHint: "TNT logo" },
  { name: "Discovery", src: "https://picsum.photos/40/40?random=5", dataAiHint: "Discovery logo" },
];

export function ChannelLogos() {
  return (
    <div className="my-4">
      <p className="text-sm text-center text-white/70 mb-2">Principais canais inclusos:</p>
      <div className="flex items-center justify-center -space-x-3">
        {channelLogos.map((logo) => (
          <div
            key={logo.name}
            className="w-10 h-10 rounded-full bg-white shadow-md overflow-hidden border-2 border-neutral-800 transition-transform hover:scale-110 hover:-translate-y-1"
            title={logo.name}
          >
            <Image
              src={logo.src}
              alt={`${logo.name} logo`}
              width={40}
              height={40}
              data-ai-hint={logo.dataAiHint}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

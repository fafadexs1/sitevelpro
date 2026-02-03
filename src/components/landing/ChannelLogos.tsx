"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Channel = {
  id: string;
  name: string;
  logo_url: string;
};

export function ChannelLogos({ channelIds, allChannels }: { channelIds?: string[], allChannels: Channel[] }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelIds || channelIds.length === 0) {
      setChannels([]);
      setLoading(false);
      return;
    }

    const orderedChannels = channelIds.map(id => allChannels.find(c => c.id === id)).filter(Boolean) as Channel[];
    setChannels(orderedChannels);
    setLoading(false);

  }, [channelIds, allChannels]);

  if (loading) {
    return <div className="h-10 my-4" />;
  }

  if (!channels.length) {
    return null;
  }

  return (
    <div className="my-4">
      <p className="text-sm text-center text-neutral-600 mb-2">
        Canais em destaque:
      </p>
      <div className="flex items-center justify-center -space-x-3">
        {channels.map((logo) => (
          <div
            key={logo.name}
            className="w-10 h-10 rounded-full bg-white shadow-md overflow-hidden border-2 border-neutral-200 transition-transform hover:scale-110 hover:-translate-y-1"
            title={logo.name}
          >
            <Image
              src={logo.logo_url}
              alt={`${logo.name} logo`}
              width={40}
              height={40}
              className="object-contain w-full h-full p-0.5"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

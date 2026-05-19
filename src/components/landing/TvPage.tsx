"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Computer,
  Info,
  Search,
  Smartphone,
  Tv,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Channel = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string;
};

type TvPackage = {
  id: string;
  name: string;
};

type PackageChannel = {
  package_id: string;
  channel_id: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function ChannelDetailsDialog({ channel, children }: { channel: Channel; children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-neutral-950 text-white border-white/10 sm:max-w-md">
        <DialogHeader>
          <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white p-3">
            <Image src={channel.logo_url} alt={channel.name} width={112} height={72} className="object-contain" unoptimized />
          </div>
          <DialogTitle className="text-2xl">{channel.name}</DialogTitle>
          <DialogDescription className="text-neutral-400">
            {channel.description || "Descrição não disponível para este canal."}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function AccessDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-white transition-colors hover:bg-white/10">
          <Info className="h-4 w-4 text-primary" />
          Como acessar
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-white/10 bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle>Como acessar a Velpro TV</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Use a Velpro TV nos principais navegadores, Smart TVs e dispositivos móveis compatíveis.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Computer,
              title: "Computador",
              items: ["Google Chrome", "Mozilla Firefox", "Microsoft Edge"],
            },
            {
              icon: Tv,
              title: "TV",
              items: ["LG WebOS", "Samsung Tizen", "Android TV", "Fire TV", "Chromecast"],
            },
            {
              icon: Smartphone,
              title: "Celular e tablet",
              items: ["Android", "iPhone", "iPad"],
            },
          ].map((group) => (
            <div key={group.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center gap-3">
                <group.icon className="h-5 w-5 text-primary" />
                <h3 className="font-bold">{group.title}</h3>
              </div>
              <ul className="space-y-2 text-sm text-neutral-400">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChannelGuideView({
  pkg,
  allChannels,
  packageChannels,
  onBack,
}: {
  pkg: TvPackage;
  allChannels: Channel[];
  packageChannels: PackageChannel[];
  onBack: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const channelsForPackage = useMemo(() => {
    const channelIds = new Set(
      packageChannels.filter((packageChannel) => packageChannel.package_id === pkg.id).map((item) => item.channel_id),
    );

    return allChannels.filter((channel) => channelIds.has(channel.id));
  }, [pkg.id, allChannels, packageChannels]);

  const filteredChannels = useMemo(() => {
    const term = normalize(searchTerm.trim());
    if (!term) return channelsForPackage;

    return channelsForPackage.filter((channel) => normalize(channel.name).includes(term));
  }, [channelsForPackage, searchTerm]);

  return (
    <div className="min-h-full bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <button
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-xl px-1 py-2 text-sm font-medium text-neutral-300 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver outros pacotes
        </button>

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Guia de canais
            </span>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{pkg.name}</h1>
          </div>
          <AccessDialog />
        </div>

        <div className="sticky top-[92px] z-20 mb-6 rounded-2xl border border-white/10 bg-neutral-950/90 p-2 backdrop-blur">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar canal..."
              className="h-12 rounded-xl border-white/10 bg-white/[0.06] pl-11 pr-11 text-base text-white placeholder:text-neutral-500 focus-visible:ring-primary"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {filteredChannels.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-8 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredChannels.map((channel) => (
              <ChannelDetailsDialog key={channel.id} channel={channel}>
                <button className="group flex min-h-[150px] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white/[0.07] hover:shadow-[0_18px_44px_rgba(0,0,0,0.35)] focus:outline-none focus:ring-2 focus:ring-primary">
                  <div className="flex flex-1 items-center justify-center bg-black p-4">
                    <Image
                      src={channel.logo_url}
                      alt={channel.name}
                      width={132}
                      height={82}
                      className="max-h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="w-full border-t border-white/10 px-3 py-3">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{channel.name}</p>
                  </div>
                </button>
              </ChannelDetailsDialog>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-14 text-center text-neutral-400">
            Nenhum canal encontrado com esse nome.
          </div>
        )}
      </div>
    </div>
  );
}

export function TvPage({
  initialChannels,
  initialPackages,
  initialPackageChannels,
}: {
  initialChannels: Channel[];
  initialPackages: TvPackage[];
  initialPackageChannels: PackageChannel[];
}) {
  const [selectedPackage, setSelectedPackage] = useState<TvPackage | null>(null);

  const packagePreview = useMemo(() => {
    return initialPackages.map((pkg) => {
      const channelIds = new Set(
        initialPackageChannels.filter((item) => item.package_id === pkg.id).map((item) => item.channel_id),
      );
      const channels = initialChannels.filter((channel) => channelIds.has(channel.id));

      return {
        pkg,
        preview: channels.slice(0, 6),
      };
    });
  }, [initialChannels, initialPackageChannels, initialPackages]);

  if (selectedPackage) {
    return (
      <ChannelGuideView
        pkg={selectedPackage}
        allChannels={initialChannels}
        packageChannels={initialPackageChannels}
        onBack={() => setSelectedPackage(null)}
      />
    );
  }

  return (
    <div className="min-h-full bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <span className="mb-4 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Velpro TV
          </span>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Escolha um pacote e veja os canais</h1>
          <p className="mt-4 text-base leading-7 text-neutral-400 sm:text-lg">
            Abra um pacote para buscar canais, conferir a lista completa e ver detalhes sem ficar preso em uma tela
            pequena.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packagePreview.map(({ pkg, preview }) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white/[0.07] hover:shadow-[0_22px_54px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                    <Tv className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-black text-white">{pkg.name}</h2>
                </div>
                <ArrowRight className="mt-2 h-5 w-5 text-neutral-500 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {preview.map((channel) => (
                  <div key={channel.id} className="flex h-16 items-center justify-center rounded-xl bg-black p-2">
                    <Image
                      src={channel.logo_url}
                      alt={channel.name}
                      width={88}
                      height={48}
                      className="max-h-10 w-auto object-contain"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

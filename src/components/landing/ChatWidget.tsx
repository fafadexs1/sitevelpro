"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatModal } from "./ChatModal";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 font-medium text-primary-foreground shadow-xl shadow-primary/20 transition-transform hover:bg-primary/90 active:scale-95"
        aria-label="Abrir chat de suporte"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Falar com Suporte</span>
      </button>
      <ChatModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { customerSupportChatbot } from "@/ai/flows/customer-support-chatbot";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Wifi, User, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "bot";
  content: string;
};

export function ChatModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (scrollAreaViewportRef.current) {
        scrollAreaViewportRef.current.scrollTo({ top: scrollAreaViewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "bot",
          content: "Olá! Como posso ajudar com nossos planos ou verificar a cobertura para você?",
        },
      ]);
    }
  }, [isOpen, messages.length]);
  
  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await customerSupportChatbot({ query: input });
      const botMessage: Message = { role: "bot", content: result.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        role: "bot",
        content: "Desculpe, ocorreu um erro. Tente novamente mais tarde.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-950 border-white/10 text-white max-w-md p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Wifi className="text-primary" />
            Suporte Velpro
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Nosso assistente virtual pode responder sobre planos e cobertura.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] border-y border-white/10">
          <div className="p-6" ref={scrollAreaViewportRef}>
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "bot" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        <Wifi className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "p-3 rounded-lg max-w-[80%] text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-neutral-800 text-white/90"
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                     <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-white/10">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        <Wifi className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                     <div className="p-3 rounded-lg bg-neutral-800 text-white/90">
                         <Loader className="h-4 w-4 animate-spin"/>
                     </div>
                 </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-2">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua pergunta..."
              className="flex-grow rounded-lg border-white/10 bg-neutral-900 focus:ring-primary"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { customerSupportChatbot } from "@/ai/flows/customer-support-chatbot";

interface Message {
  role: "user" | "bot";
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (isOpen) {
        setMessages([
            { role: "bot", content: "Olá! Como posso ajudar com os planos e cobertura da Velpro?" }
        ]);
    }
  }, [isOpen])

  const handleSend = async () => {
    if (input.trim() === "" || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await customerSupportChatbot({ query: input });
      const botMessage: Message = { role: "bot", content: result.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        role: "bot",
        content: "Desculpe, estou com problemas para me conectar. Tente novamente mais tarde.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          <Button
            size="icon"
            className="rounded-full w-14 h-14 bg-primary shadow-lg shadow-primary/30 hover:bg-primary/90"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir chat"
          >
            <Bot className="w-7 h-7" />
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm h-[70vh] max-h-[500px] bg-neutral-900/80 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Velpro Suporte</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
                aria-label="Fechar chat"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-xs md:max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-white/10 rounded-br-none"
                        : "bg-primary/10 text-white/90 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                   {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center">
                      <User className="w-5 h-5 text-white/70" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                 <div className="flex items-start gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="max-w-xs md:max-w-[75%] rounded-2xl px-4 py-2 text-sm bg-primary/10 text-white/90 rounded-bl-none">
                        <Loader2 className="w-4 h-4 animate-spin"/>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Digite sua pergunta..."
                  className="w-full bg-neutral-800 border border-white/10 rounded-full py-2 pl-4 pr-12 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full w-8 h-8"
                  onClick={handleSend}
                  disabled={loading || input.trim() === ""}
                  aria-label="Enviar mensagem"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

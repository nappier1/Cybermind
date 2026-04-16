import { useState, useRef, useEffect } from "react";
import { Shield, Cpu, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { streamChat, type Message } from "@/lib/chat";
import { useToast } from "@/hooks/use-toast";

const SUGGESTIONS = [
  "Explain zero-trust architecture",
  "Compare GPT-5 vs Gemini 2.5 Pro",
  "How does ransomware work?",
  "What is RAG in AI systems?",
  "Top 10 cybersecurity threats in 2026",
  "How to set up a SOC from scratch",
];

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (input: string) => {
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          toast({ title: "Error", description: err, variant: "destructive" });
          setIsLoading(false);
        },
      });
    } catch {
      toast({ title: "Error", description: "Failed to connect", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
            <Shield size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground font-[var(--font-display)]" style={{ fontFamily: "var(--font-display)" }}>
              CyberMind
            </h1>
            <p className="text-xs text-muted-foreground">Cybersecurity & AI Expert</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Online
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 glow-primary">
                <Terminal size={36} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gradient mb-2" style={{ fontFamily: "var(--font-display)" }}>
                CyberMind
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Your AI expert on cybersecurity, threat intelligence, and all major AI platforms. Ask me anything.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                  onClick={() => send(s)}
                  className="text-left text-xs px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-card-foreground"
                >
                  <span className="text-primary mr-1.5">›</span>
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
            </AnimatePresence>
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <Shield size={16} />
                </div>
                <div className="bg-card border border-border rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={send} isLoading={isLoading} />
    </div>
  );
        }

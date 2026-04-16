import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Bot, User, Shield } from "lucide-react";
import type { Message } from "@/lib/chat";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser
            ? "bg-accent/20 text-accent"
            : "bg-primary/20 text-primary"
        }`}
      >
        {isUser ? <User size={16} /> : <Shield size={16} />}
      </div>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 ${
          isUser
            ? "bg-accent/10 border border-accent/20"
            : "bg-card border border-border"
        }`}
      >
        <div className="prose prose-sm prose-invert max-w-none [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary [&_code]:text-xs [&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_a]:text-accent [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:text-card-foreground [&_p]:text-card-foreground">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}

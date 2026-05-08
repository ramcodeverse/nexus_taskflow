import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { nexusAI } from '../../lib/gemini';
import { cn } from '../../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function NexusAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Nexus AI assistant. How can I help you manage your projects today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }] as Message[];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const systemInstruction = 'You are Nexus AI, a professional project management assistant integrated into the Nexus TaskFlow platform. You help users organize tasks, provide productivity tips, and analyze project status. Be concise, helpful, and professional.';
      const result = await nexusAI.chat(newMessages, systemInstruction);

      const assistantContent = result.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to my neural network. Please check your connection or try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg glow animate-pulse-glow"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className={cn(
              "glass-strong rounded-3xl border border-[var(--color-border)] shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
              isExpanded ? "w-[800px] h-[600px]" : "w-[380px] h-[520px]"
            )}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-blue-600/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text)]">Nexus Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-bold">System Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-[var(--color-surface-secondary)] rounded-lg text-[var(--color-text-secondary)] transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-[var(--color-text-secondary)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hidden"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex gap-3",
                    m.role === 'user' ? "flex-row-reverse text-right" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
                    m.role === 'assistant' ? "bg-blue-600/10 text-blue-400" : "bg-indigo-600/10 text-indigo-400"
                  )}>
                    {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.role === 'assistant' 
                      ? "bg-[var(--color-surface-secondary)] text-[var(--color-text)] rounded-tl-none border border-[var(--color-border)]"
                      : "bg-blue-600 text-white rounded-tr-none shadow-md"
                  )}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[var(--color-surface-secondary)] rounded-2xl px-4 py-2.5 rounded-tl-none border border-[var(--color-border)] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-sm text-[var(--color-text-secondary)] italic">Thinking...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)]/30">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-[var(--color-text)]"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all shadow-sm"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-2 text-[10px] text-center text-[var(--color-text-tertiary)] uppercase tracking-widest font-medium">
                POWERED BY GEMINI 1.5 FLASH
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

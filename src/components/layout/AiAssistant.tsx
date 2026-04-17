import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, Sparkles, ExternalLink, Phone, Heart, Volume2, VolumeX, GraduationCap, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/contexts/AuthContext";

type Msg = { role: "user" | "assistant"; content: string };

const EMERGENCY_PHONE = "7380730281";
const WHATSAPP_CALL_URL = `https://wa.me/917380730281?text=${encodeURIComponent("🚨 EMERGENCY: I need to speak with someone from ANUVATI immediately. I was connected through the AI Assistant.")}`;
const CRISIS_TAG = "[EMERGENCY_CRISIS]";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-work-assistant`;
const CRISIS_CALL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crisis-call`;

const QUICK_OPTIONS = [
  { label: "Government Schemes", icon: ExternalLink, prompt: "What are the major government welfare schemes available in India that I can benefit from?" },
  { label: "Mental Health Support", icon: Phone, prompt: "I need mental health support. What helplines and services are available?" },
  { label: "Career Guidance", icon: GraduationCap, prompt: "I need career guidance. I'm a student and confused about what to do after my studies." },
  { label: "About ANUVATI", icon: Heart, prompt: "Tell me about ANUVATI and how I can get involved." },
  { label: "Legal Aid", icon: Sparkles, prompt: "I need free legal help. How can I get legal aid in India?" },
];

const getAnonymousId = (): string => {
  let id = localStorage.getItem("anuvati_anon_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("anuvati_anon_id", id);
  }
  return id;
};

const AiAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [crisisCallTriggered, setCrisisCallTriggered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef(window.speechSynthesis);

  const triggerCrisisCall = useCallback(async () => {
    if (crisisCallTriggered) return;
    setCrisisCallTriggered(true);
    console.log("🚨 Crisis detected — auto-triggering emergency call to admin");
    try {
      const resp = await fetch(CRISIS_CALL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: "initiate-call" }),
      });
      const data = await resp.json();
      if (data.success) {
        console.log("✅ Crisis call initiated:", data.callSid);
      } else {
        console.error("❌ Crisis call failed:", data.error);
      }
    } catch (err) {
      console.error("❌ Crisis call error:", err);
    }
  }, [crisisCallTriggered]);

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Stop speech on unmount
  useEffect(() => {
    return () => { synthRef.current.cancel(); };
  }, []);

  const speakText = useCallback((text: string) => {
    const synth = synthRef.current;
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    // Strip markdown
    const clean = text.replace(/[#*_`\[\]()>~-]/g, "").replace(/\n+/g, ". ");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.lang = "en-IN";
    // Try to pick a good voice
    const voices = synth.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("india"))
      || voices.find(v => v.lang.startsWith("en") && !v.name.toLowerCase().includes("compact"))
      || voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    synth.speak(utterance);
  }, []);

  const streamChat = useCallback(async (allMessages: Msg[]) => {
    setIsLoading(true);
    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      // Auto-trigger crisis call when tag detected
      if (assistantSoFar.includes(CRISIS_TAG)) {
        triggerCrisisCall();
      }
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const body: any = { messages: allMessages };
      if (profileId) body.profileId = profileId;
      else if (user?.id) body.userId = user.id;
      else body.anonymousId = getAnonymousId();

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok || !resp.body) {
        upsert("I'm sorry, I'm having trouble connecting right now. Please try again shortly.");
        setIsLoading(false);
        return;
      }

      // Capture profile ID from response header
      const respProfileId = resp.headers.get("X-Profile-Id");
      if (respProfileId && !profileId) setProfileId(respProfileId);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch {
      upsert("I'm sorry, something went wrong. Please try again.");
    }
    setIsLoading(false);
  }, [profileId, user, triggerCrisisCall]);

  const send = (text: string) => {
    if (!text.trim() || isLoading) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
    const userMsg: Msg = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setShowGreeting(false);
    streamChat(updated);
  };

  return (
    <>
      {/* Greeting bubble */}
      <AnimatePresence>
        {showGreeting && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 bg-card border border-border rounded-2xl shadow-xl p-4 max-w-[260px]"
          >
            <button onClick={() => setShowGreeting(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
            <p className="text-sm font-medium text-foreground">👋 How may I help you?</p>
            <p className="text-xs text-muted-foreground mt-1">Ask me about government schemes, mental health support, career guidance, legal aid, or anything about ANUVATI.</p>
            <Button size="sm" className="mt-2 w-full text-xs" onClick={() => { setIsOpen(true); setShowGreeting(false); }}>
              Chat with me
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <button
        onClick={() => { setIsOpen(!isOpen); setShowGreeting(false); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
        aria-label="AI Assistant"
      >
        {isOpen ? <X size={24} /> : <Bot size={28} />}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-120px)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-sm">ANUVATI Assistant</h3>
                <p className="text-xs opacity-80">Social Work • Welfare • Career Guidance</p>
              </div>
              {isSpeaking && (
                <button onClick={() => { synthRef.current.cancel(); setIsSpeaking(false); }} className="p-1.5 rounded-lg bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors" title="Stop speaking">
                  <VolumeX size={16} />
                </button>
              )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                    <p className="text-sm text-foreground">Namaste! 🙏 I'm ANUVATI's AI Assistant. I can help you with government schemes, mental health resources, career guidance, legal aid, and more. How can I assist you today?</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => send(opt.prompt)}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background hover:bg-accent/50 transition-colors text-left"
                      >
                        <opt.icon size={14} className="text-primary shrink-0" />
                        <span className="text-xs font-medium text-foreground">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="space-y-1">
                        <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1 [&>h3]:text-sm [&>h3]:mt-2 [&>h3]:mb-1 [&_a]:text-primary [&_a]:underline">
                          <ReactMarkdown>{msg.content.replace(CRISIS_TAG, "")}</ReactMarkdown>
                        </div>
                        {msg.content.includes(CRISIS_TAG) && (
                          <a
                            href={WHATSAPP_CALL_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-2 w-full justify-center rounded-xl bg-destructive text-destructive-foreground py-3 px-4 text-sm font-semibold animate-pulse hover:opacity-90 transition-opacity"
                          >
                            <PhoneCall size={18} />
                            🚨 Connect with ANUVATI on WhatsApp Now
                          </a>
                        )}
                        {!isLoading && msg.content.length > 20 && (
                          <button
                            onClick={() => speakText(msg.content.replace(CRISIS_TAG, ""))}
                            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            title="Listen to this response"
                          >
                            <Volume2 size={12} />
                            <span>Listen</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="border-t border-border p-3 flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="rounded-xl shrink-0">
                <Send size={16} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiAssistant;

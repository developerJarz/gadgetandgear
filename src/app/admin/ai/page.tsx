"use client";

import { useState } from "react";
import { Sparkles, FileText, BarChart3, Image, Send, Copy, RefreshCw, Wand2, MessageSquare, Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AI_TOOLS = [
  { id: "product-desc", name: "Product Description", description: "Generate compelling product descriptions", icon: FileText, category: "Content" },
  { id: "seo-meta", name: "SEO Meta Tags", description: "Generate SEO-optimized title & description", icon: BarChart3, category: "SEO" },
  { id: "ad-copy", name: "Ad Copy", description: "Create Facebook/Google ad copy", icon: MessageSquare, category: "Marketing" },
  { id: "social-post", name: "Social Media Post", description: "Generate engaging social media posts", icon: MessageSquare, category: "Marketing" },
  { id: "email-subject", name: "Email Subject Lines", description: "Generate high-converting email subjects", icon: FileText, category: "Marketing" },
  { id: "image-enhance", name: "Image Enhancement", description: "AI-powered image quality improvement", icon: Image, category: "Image" },
];

const DEMO_RESPONSES: Record<string, string> = {
  "product-desc": `🔥 **Galaxy Flagship Pro 5G 256GB**\n\nExperience the pinnacle of mobile technology with the Galaxy Flagship Pro 5G. Powered by the latest Snapdragon processor, this smartphone delivers blazing-fast 5G connectivity and unparalleled performance.\n\n**Key Features:**\n✅ 6.8" Dynamic AMOLED 2X Display (120Hz)\n✅ 200MP AI Triple Camera System\n✅ 5000mAh Battery with 65W Fast Charging\n✅ 256GB Storage / 12GB RAM\n✅ Official Warranty in Bangladesh\n\nPerfect for photography enthusiasts, gamers, and professionals who demand the best. Available now at Gadget & Gear BD with 0% EMI options.\n\n**Order now and get free delivery inside Dhaka!** 🚚`,
  "seo-meta": `**SEO Title:** Galaxy Flagship Pro 5G 256GB Price in Bangladesh | Gadget & Gear BD\n\n**Meta Description:** Buy Galaxy Flagship Pro 5G 256GB at the best price in Bangladesh. Official warranty, 0% EMI, free Dhaka delivery. ৳129,900 at Gadget & Gear BD.\n\n**Keywords:** galaxy flagship pro price bd, galaxy flagship pro 5g bangladesh, buy smartphone dhaka, flagship phone price in bangladesh`,
  "ad-copy": `📱 **Facebook Ad Copy:**\n\n🎯 **Headline:** Galaxy Flagship Pro 5G - Now in Bangladesh!\n\n📝 **Primary Text:** Ready for the ultimate smartphone experience? The Galaxy Flagship Pro 5G is here with a 200MP camera, 5G speed, and all-day battery. \n\n🔥 Special launch price: ৳129,900\n✅ Official warranty\n🚚 Free delivery inside Dhaka\n💳 0% EMI available\n\nOrder now at Gadget & Gear BD!\n\n🔗 **CTA:** Shop Now`,
  "social-post": `📱✨ **NEW ARRIVAL** ✨📱\n\nThe Galaxy Flagship Pro 5G has landed at Gadget & Gear BD! 🇧🇩\n\n📸 200MP Camera? Check ✅\n⚡ 5G Speed? Check ✅\n🔋 All-Day Battery? Check ✅\n\nPrice: ৳129,900\n🚚 Free delivery in Dhaka!\n\nDM us or visit gadgetandgear.bd to order! 🛒\n\n#GadgetAndGearBD #GalaxyFlagship #SmartphoneBD #TechBangladesh #5GBangladesh`,
};

export default function AIPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [tab, setTab] = useState<"generator" | "assistant">("generator");

  const handleGenerate = () => {
    if (!selectedTool || !input.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setOutput(DEMO_RESPONSES[selectedTool] || `Generated content for: ${input}\n\nThis is a demo response. Connect an AI API (OpenAI, Gemini, etc.) for real content generation.`);
      setGenerating(false);
    }, 1500);
  };

  const handleChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setTimeout(() => {
      const responses: Record<string, string> = {
        "best selling": "📊 Based on your sales data, the top 3 best-selling products this month are:\n1. Galaxy Flagship Pro 5G (45 units, ৳5.8M revenue)\n2. Pods Pro ANC Earbuds (89 units, ৳1.7M revenue)\n3. Aurora Ultrabook 14 (23 units, ৳3.4M revenue)",
        "revenue": "💰 This month's revenue is ৳19.5L, up 22% from last month. Your highest revenue day was August 15 (Eid sale) with ৳3.2L in a single day.",
        "recommend": "🎯 Based on trends, I recommend:\n1. Increase stock on Pods Pro ANC - trending upward\n2. Run a flash sale on keyboards - slow movers\n3. Consider adding phone cases - high search volume",
      };
      const key = Object.keys(responses).find((k) => userMsg.toLowerCase().includes(k));
      setChatMessages((prev) => [...prev, { role: "ai", content: key ? responses[key] : `Great question! Based on your store data, I'd suggest analyzing your conversion funnel. Your current conversion rate is 3.8%, which is above the BD e-commerce average of 2.5%. Focus on improving mobile checkout speed to boost it further.` }]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-3xl">AI Tools</h1>
          <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold">BETA</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">AI-powered content generation & analytics assistant</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {([{ key: "generator", label: "Content Generator", icon: Wand2 }, { key: "assistant", label: "Analytics Assistant", icon: Bot }] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}><t.icon className="w-4 h-4" /> {t.label}</button>
        ))}
      </div>

      {tab === "generator" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tool Selection */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm">Select Tool</h3>
            {AI_TOOLS.map((tool) => (
              <button key={tool.id} onClick={() => { setSelectedTool(tool.id); setOutput(""); }} className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${selectedTool === tool.id ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border hover:border-primary/20"}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${selectedTool === tool.id ? "gradient-brand text-white" : "bg-muted"}`}><tool.icon className="w-4 h-4" /></div>
                <div><p className="text-sm font-medium">{tool.name}</p><p className="text-[10px] text-muted-foreground">{tool.description}</p></div>
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm">Input</h3>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={selectedTool ? "Enter product name, details, or context..." : "Select a tool first"} rows={8} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" disabled={!selectedTool} />
            <button onClick={handleGenerate} disabled={!selectedTool || !input.trim() || generating} className="w-full py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
            </button>
          </div>

          {/* Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-display font-semibold text-sm">Output</h3>{output && <div className="flex gap-1"><button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }} className="p-1.5 hover:bg-accent rounded-lg"><Copy className="w-3.5 h-3.5" /></button><button onClick={() => { setOutput(""); }} className="p-1.5 hover:bg-accent rounded-lg"><RefreshCw className="w-3.5 h-3.5" /></button></div>}</div>
            <div className="min-h-[200px] p-4 rounded-xl border border-border bg-muted/30 text-sm whitespace-pre-wrap">{output || <span className="text-muted-foreground">Generated content will appear here...</span>}</div>
          </div>
        </div>
      )}

      {tab === "assistant" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-2xl mx-auto">
          <div className="p-4 border-b border-border bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /><span className="font-display font-semibold">AI Analytics Assistant</span></div>
            <p className="text-xs text-muted-foreground mt-0.5">Ask about your sales, products, customers, or get recommendations</p>
          </div>
          <div className="h-[400px] overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  {["What are my best selling products?", "How is my revenue trending?", "Recommend actions to boost sales"].map((q) => (
                    <button key={q} onClick={() => { setChatInput(q); }} className="px-3 py-1.5 rounded-lg bg-muted text-xs hover:bg-accent transition">{q}</button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "ai" && <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shrink-0"><Bot className="w-3.5 h-3.5 text-white" /></div>}
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>{msg.content}</div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border">
            <form onSubmit={(e) => { e.preventDefault(); handleChat(); }} className="flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about your sales, products..." className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button type="submit" className="px-4 py-2.5 rounded-xl gradient-brand text-primary-foreground hover:opacity-90 transition"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

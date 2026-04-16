import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are CyberMind — an elite AI expert specializing in cybersecurity and artificial intelligence. You have deep, comprehensive knowledge of:

**Cybersecurity:**
- Network security, penetration testing, vulnerability assessment
- Malware analysis, reverse engineering, threat intelligence
- OWASP Top 10, CVEs, zero-day exploits
- SOC operations, SIEM, incident response, digital forensics
- Cloud security (AWS, Azure, GCP), container security
- Cryptography, PKI, TLS/SSL, encryption algorithms
- Identity & access management, zero trust architecture
- Compliance frameworks: NIST, ISO 27001, SOC 2, GDPR, HIPAA
- Red team / blue team / purple team operations
- Social engineering, phishing, and human-factor security
- Bug bounty programs and responsible disclosure

**Artificial Intelligence & ML Platforms:**
- OpenAI (GPT-4, GPT-5, DALL-E, Whisper, Codex, Sora)
- Google (Gemini, PaLM, Bard, DeepMind, AlphaFold)
- Anthropic (Claude family)
- Meta AI (LLaMA, SAM, FAIR research)
- Mistral AI, Cohere, AI21 Labs
- Stability AI (Stable Diffusion), Midjourney
- Hugging Face ecosystem and open-source models
- xAI (Grok), Inflection AI, Perplexity AI
- Microsoft Copilot, GitHub Copilot
- AWS Bedrock, Azure AI, Google Vertex AI
- MLOps, model deployment, fine-tuning, RAG architectures
- AI safety, alignment, responsible AI, bias mitigation
- Computer vision, NLP, reinforcement learning, generative AI
- AI in cybersecurity: threat detection, anomaly detection, automated response

**Style guidelines:**
- Be technical but accessible. Use markdown formatting.
- Include code examples when relevant.
- Cite specific tools, frameworks, and techniques.
- Warn about ethical and legal implications when discussing offensive security.
- Stay current — reference the latest developments and platforms.
- Use terminal/hacker-style formatting when it enhances clarity.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
);
  }
});

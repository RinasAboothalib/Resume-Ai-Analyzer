import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, targetRole } = await req.json();

    if (!resumeText || resumeText.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Resume text is too short or empty." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert resume analyst and career coach. Analyze the provided resume and return a JSON response using the suggest_analysis tool. Be specific, actionable, and honest. Score from 0-100.`;

    const userPrompt = `Analyze this resume${targetRole ? ` for the role of "${targetRole}"` : ""}:

${resumeText}

Provide:
1. An overall score (0-100)
2. A brief summary of the candidate
3. List of identified skills (technical and soft)
4. Missing skills that would strengthen the resume${targetRole ? ` for the "${targetRole}" role` : ""}
5. Specific, actionable improvement suggestions
6. Strengths of the resume
7. Weaknesses of the resume`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_analysis",
              description: "Return structured resume analysis",
              parameters: {
                type: "object",
                properties: {
                  score: { type: "number", description: "Overall resume score 0-100" },
                  summary: { type: "string", description: "Brief candidate summary" },
                  identifiedSkills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string", enum: ["technical", "soft", "domain"] },
                      },
                      required: ["name", "category"],
                      additionalProperties: false,
                    },
                  },
                  missingSkills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        importance: { type: "string", enum: ["critical", "recommended", "nice-to-have"] },
                      },
                      required: ["name", "importance"],
                      additionalProperties: false,
                    },
                  },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["score", "summary", "identifiedSkills", "missingSkills", "suggestions", "strengths", "weaknesses"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned from AI");

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

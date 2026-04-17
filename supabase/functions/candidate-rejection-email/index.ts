import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateName, candidateEmail, jobTitle, reason } = await req.json();

    if (!candidateName || !candidateEmail || !jobTitle) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Generate professional rejection email using AI
    const aiResponse = await fetch("https://ai-gateway.lovable.dev/api/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are the HR department of ANUVATI Foundation, a development sector NGO. Write a professional, respectful, and compassionate rejection email. Keep it concise, warm, and encouraging. Do not use markdown formatting. Write plain text only suitable for email.",
          },
          {
            role: "user",
            content: `Write a rejection email for candidate "${candidateName}" who applied for the "${jobTitle}" position at ANUVATI Foundation.${reason ? ` Reason/context: ${reason}` : ""} The email should:
1. Thank them for applying
2. Inform them politely that we are not moving forward
3. Encourage them to apply for future openings
4. Be signed by "HR Team, ANUVATI Foundation"`,
          },
        ],
        max_tokens: 500,
      }),
    });

    const aiData = await aiResponse.json();
    const emailBody = aiData.choices?.[0]?.message?.content || `Dear ${candidateName},\n\nThank you for your interest in the ${jobTitle} position at ANUVATI Foundation. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe encourage you to apply for future openings.\n\nBest regards,\nHR Team, ANUVATI Foundation`;

    // Store the notification in database
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Log the email content (in production, integrate with email service)
    console.log(`Rejection email for ${candidateEmail}:\n${emailBody}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailBody,
        message: `Rejection email generated for ${candidateName}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

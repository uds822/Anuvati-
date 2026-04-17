import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_PHONE = "+917380730281";

serve(async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Twilio fetches TwiML via POST when call connects
  if (action === "twiml") {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-IN">Alert! This is an emergency call from ANUVATI AI Assistant. A user in crisis needs immediate help. Please stay on the line.</Say>
  <Pause length="2"/>
  <Say voice="alice" language="en-IN">The user was connected through the ANUVATI website AI chatbot and may be experiencing a mental health crisis or emergency situation. Please call them back or take appropriate action immediately.</Say>
  <Pause length="1"/>
  <Say voice="alice" language="en-IN">This message will now repeat.</Say>
  <Pause length="2"/>
  <Say voice="alice" language="en-IN">Alert! A user on the ANUVATI website needs urgent help. They were flagged by the AI assistant as being in crisis. Please take immediate action.</Say>
</Response>`;

    return new Response(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Status callback from Twilio
  if (action === "status") {
    console.log("Call status callback received");
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Initiate call - POST from frontend
  try {
    const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_PHONE = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_PHONE) {
      throw new Error("Twilio credentials not configured");
    }

    const body = await req.json().catch(() => ({}));

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const twimlUrl = `${SUPABASE_URL}/functions/v1/crisis-call?action=twiml`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Calls.json`;
    const authHeader = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);

    const formData = new URLSearchParams();
    formData.append("To", ADMIN_PHONE);
    formData.append("From", TWILIO_PHONE);
    formData.append("Url", twimlUrl);

    const callResp = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const callData = await callResp.json();

    if (!callResp.ok) {
      console.error("Twilio error:", JSON.stringify(callData));
      throw new Error(callData.message || "Failed to initiate call");
    }

    console.log("Crisis call initiated:", callData.sid);

    return new Response(
      JSON.stringify({
        success: true,
        callSid: callData.sid,
        message: "Emergency call initiated to ANUVATI admin",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Crisis call error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

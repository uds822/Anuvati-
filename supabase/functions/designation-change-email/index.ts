const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SB_URL = Deno.env.get("SUPABASE_URL");
const SB_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employee_name, employee_email, change_type, old_designation, new_designation, reasons, effective_date } = await req.json();

    if (!employee_name || !employee_email || !change_type || !new_designation) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use AI to generate a professional email
    const isPromotion = change_type === "promote";
    const prompt = isPromotion
      ? `Write a professional, warm congratulatory email from ANUVATI Foundation HR to ${employee_name} about their promotion from "${old_designation}" to "${new_designation}", effective ${effective_date}. ${reasons ? `Additional context: ${reasons}.` : ""} Keep it professional but warm. Include congratulations, mention the new role responsibilities, and wish them success. Sign off as "HR Department, ANUVATI Foundation". Do not include a subject line, just the email body. Use plain text, no HTML.`
      : `Write a professional, respectful email from ANUVATI Foundation HR to ${employee_name} about their designation change from "${old_designation}" to "${new_designation}", effective ${effective_date}. The reasons for this change are: ${reasons}. Be respectful and constructive. Mention that the organization values their contribution and looks forward to their continued efforts. Include a note that they can reach out to HR for any questions. Sign off as "HR Department, ANUVATI Foundation". Do not include a subject line, just the email body. Use plain text, no HTML.`;

    let emailBody = "";

    // Call Lovable AI
    const aiRes = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
      }),
    });

    if (aiRes.ok) {
      const aiData = await aiRes.json();
      emailBody = aiData.choices?.[0]?.message?.content || "";
    }

    // Fallback if AI fails
    if (!emailBody) {
      emailBody = isPromotion
        ? `Dear ${employee_name},\n\nWe are pleased to inform you that you have been promoted from ${old_designation} to ${new_designation}, effective ${effective_date}.\n\nCongratulations on this well-deserved recognition of your contributions to ANUVATI Foundation. We look forward to your continued success in your new role.\n\nBest regards,\nHR Department\nANUVATI Foundation`
        : `Dear ${employee_name},\n\nThis is to inform you that your designation has been changed from ${old_designation} to ${new_designation}, effective ${effective_date}.\n\nReasons: ${reasons}\n\nWe value your contributions and look forward to your continued efforts. Please feel free to reach out to HR if you have any questions.\n\nBest regards,\nHR Department\nANUVATI Foundation`;
    }

    const subject = isPromotion
      ? `Congratulations on Your Promotion – ${new_designation}`
      : `Designation Change Notification – ${new_designation}`;

    // Store as notification in the database
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseAdmin = createClient(SB_URL!, SB_ANON_KEY!);

    // Find employee user_id
    const { data: empData } = await supabaseAdmin
      .from("hr_employees")
      .select("user_id")
      .eq("email", employee_email)
      .single();

    if (empData?.user_id) {
      await supabaseAdmin.from("hr_notifications").insert({
        user_id: empData.user_id,
        title: subject,
        message: emailBody.substring(0, 500),
        type: isPromotion ? "promotion" : "demotion",
        audience: "individual",
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${isPromotion ? "Promotion" : "Demotion"} notification processed for ${employee_name}`,
      email_body: emailBody,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

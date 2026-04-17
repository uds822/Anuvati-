import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify the caller is an HR admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Check HR admin role
    const { data: roleData } = await supabase
      .from("hr_user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "hr_admin"]);

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { employee_id, email, full_name } = await req.json();

    if (!email || !full_name) {
      return new Response(JSON.stringify({ error: "Email and name are required" }), { status: 400, headers: corsHeaders });
    }

    const redirectUrl = `${req.headers.get("origin") || "https://anuvati-foundational-framework.lovable.app"}/hr/onboarding`;

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // User already exists - link to employee and send password recovery email
      await supabase
        .from("hr_employees")
        .update({ user_id: existingUser.id })
        .eq("email", email);

      // Send a password recovery email so they can set their password and sign in
      const { error: recoveryError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: redirectUrl },
      });

      console.log("Recovery link for existing user:", email, recoveryError ? `(error: ${recoveryError.message})` : "(success)");

      return new Response(JSON.stringify({
        success: true,
        message: `User already exists. A password reset email has been sent to ${email} so they can access the onboarding portal.`,
        user_exists: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Invite new user - this ACTUALLY sends an email
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name, is_onboarding: true },
      redirectTo: redirectUrl,
    });

    if (inviteError) {
      console.error("Invite error:", inviteError.message);
      throw inviteError;
    }

    // Link the auth user to the employee record
    if (inviteData?.user) {
      await supabase
        .from("hr_employees")
        .update({ user_id: inviteData.user.id })
        .eq("email", email);

      // Assign employee role
      await supabase.from("hr_user_roles").upsert({
        user_id: inviteData.user.id,
        role: "employee",
      }, { onConflict: "user_id,role" });
    }

    console.log("Invite email sent to:", email, "(success)");

    return new Response(JSON.stringify({
      success: true,
      message: `Onboarding invitation email sent to ${email}. They will receive a link to set their password and complete onboarding.`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

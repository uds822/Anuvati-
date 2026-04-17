import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ANUVATI's AI Social Work Assistant — a compassionate, knowledgeable, and resourceful guide specializing in social work, psychology, sociology, law, and public welfare.

## YOUR CORE EXPERTISE
You have deep, professional-level knowledge in:
- **Social Work**: Case management, community organizing, group work, counseling techniques, social welfare administration
- **Psychology**: Clinical psychology, counseling psychology, developmental psychology, abnormal psychology, mental health first aid
- **Sociology**: Social structures, inequality, caste dynamics, gender studies, rural-urban dynamics in India
- **Law**: Indian constitutional rights, Right to Education (RTE), Protection of Children from Sexual Offences (POCSO), Juvenile Justice Act, Domestic Violence Act, SC/ST Atrocities Act, MGNREGA, Right to Information (RTI), Mental Healthcare Act 2017, Rights of Persons with Disabilities Act 2016, Transgender Persons Act 2019
- **Government Schemes & Welfare Programs**: All central and state-level schemes in India

## KEY GOVERNMENT SCHEMES YOU MUST KNOW (with application details)
Always provide the official portal link, eligibility, and how to apply:

### Mental Health & Wellbeing
- **Tele-MANAS**: National toll-free helpline 14416 or 1800-891-4416. Free tele-mental health counseling. Website: https://telemanas.mohfw.gov.in
- **iCall**: Psychosocial helpline by TISS - 9152987821. Website: https://icallhelpline.org
- **Vandrevala Foundation**: 1860-2662-345. 24/7 mental health support.
- **NIMHANS Helpline**: 080-46110007

### Women & Child Welfare
- **Women Helpline**: 181 (universal)
- **Childline India**: 1098 (24/7 emergency for children)
- **Beti Bachao Beti Padhao**: https://wcd.nic.in/bbbp-schemes
- **Pradhan Mantri Matru Vandana Yojana (PMMVY)**: Apply via Anganwadi/health center or https://pmmvy.wcd.gov.in
- **One Stop Centre (Sakhi)**: For women affected by violence. Apply at district level.
- **Mahila Shakti Kendra**: Support at village level through community participation.
- **ICDS (Integrated Child Development Services)**: Through local Anganwadi centers.

### Education
- **Samagra Shiksha Abhiyan**: Integrated scheme for school education. Through state education departments.
- **National Scholarship Portal**: https://scholarships.gov.in - Pre-Matric, Post-Matric, Merit-cum-Means scholarships.
- **PM YASASVI**: For OBC, EBC, DNT students. Apply at https://yet.nta.ac.in
- **Mid-Day Meal / PM POSHAN**: Through schools.

### Health
- **Ayushman Bharat (PM-JAY)**: ₹5 lakh health coverage. Check eligibility: https://pmjay.gov.in or call 14555.
- **Jan Aushadi Kendras**: Affordable medicines. Locate: https://janaushadhi.gov.in
- **Nikshay Poshan Yojana**: Nutritional support for TB patients. https://nikshay.in
- **National AIDS Helpline**: 1097

### Livelihood & Employment
- **MGNREGA**: 100 days employment guarantee. Apply at Gram Panchayat or https://nrega.nic.in
- **PM Kaushal Vikas Yojana (PMKVY)**: Skill training. https://pmkvyofficial.org
- **Startup India**: https://startupindia.gov.in
- **PM SVANidhi**: Micro-credit for street vendors. https://pmsvanidhi.mohua.gov.in
- **MUDRA Yojana**: Business loans. Apply at any bank.
- **DAY-NRLM (Deen Dayal Antyodaya)**: Self-help group formation. Through block offices.

### Social Security & Pension
- **PM Kisan Samman Nidhi**: ₹6000/year for farmers. https://pmkisan.gov.in
- **PM Jeevan Jyoti Bima Yojana**: Life insurance ₹2 lakh at ₹436/year. Through banks.
- **PM Suraksha Bima Yojana**: Accident insurance ₹2 lakh at ₹20/year. Through banks.
- **Atal Pension Yojana**: https://npscra.nsdl.co.in/scheme-details.php
- **National Social Assistance Programme (NSAP)**: Old age pension, widow pension, disability pension. Apply at district/block office.

### Housing & Urban Development
- **PM Awas Yojana (Urban & Gramin)**: Housing for all. https://pmaymis.gov.in (Urban) / https://pmayg.nic.in (Rural)
- **Swachh Bharat Mission**: Toilet construction support. Through Gram Panchayat.

### Disability & Inclusion
- **UDID Card**: Unique Disability ID. Apply at https://swavlambancard.gov.in
- **Accessible India Campaign**
- **Assistance to Disabled Persons (ADIP)**: Assistive devices. Through ALIMCO or district offices.

### Senior Citizens
- **Elder Helpline**: 14567
- **Maintenance and Welfare of Parents and Senior Citizens Act**
- **Rashtriya Vayoshri Yojana**: Physical aids for senior citizens BPL.

### Legal Aid
- **NALSA (National Legal Services Authority)**: Free legal aid. https://nalsa.gov.in. Helpline: 15100
- **Cyber Crime Helpline**: 1930 or https://cybercrime.gov.in

### Skill Development & Career Guidance
- **PMKVY (Pradhan Mantri Kaushal Vikas Yojana)**: Free skill training with certification. https://pmkvyofficial.org
- **National Career Service Portal**: https://www.ncs.gov.in — Job matching, career counseling, skill courses.
- **NSDC (National Skill Development Corporation)**: Industry-relevant training. https://nsdcindia.org
- **DDU-GKY (Deen Dayal Upadhyaya Grameen Kaushalya Yojana)**: Rural youth skilling for employment.
- **NIELIT**: IT and electronics courses. https://nielit.gov.in
- **IGNOU**: Open/distance learning for all. https://ignou.ac.in
- **Swayam Portal**: Free online courses from IITs, IIMs. https://swayam.gov.in
- **DIKSHA**: Teacher training and learning platform. https://diksha.gov.in
- **Atal Innovation Mission**: Innovation/entrepreneurship for youth. https://aim.gov.in
- **Startup India**: Mentoring, funding, tax benefits. https://startupindia.gov.in

## CAREER COUNSELING CAPABILITIES
When someone asks about career guidance (especially students in Class 10, 12, or graduates):
1. **Ask about their interests, strengths, subjects they enjoy, and any hobbies/passions.**
2. **Ask about their family situation, financial background, and location** to provide practical suggestions.
3. **Suggest multiple career paths** — don't limit to conventional options. Include:
   - Traditional paths (Engineering, Medicine, Law, etc.)
   - Creative paths (Design, Arts, Media, Content)
   - Vocational paths (Skilled trades, Hospitality, Agriculture)
   - Emerging paths (AI/ML, Data Science, Cybersecurity, Green Energy, Social Enterprise)
   - Social sector paths (Social Work, Public Policy, NGO Management, Teaching)
4. **Always mention relevant government schemes** for education and skill development.
5. **Be honest and balanced**: "This is my recommendation based on what you've shared, but remember — you know yourself best. Career choices are deeply personal. I'm an AI assistant, and my suggestions are a starting point, not a final answer. Explore, talk to mentors, and trust your instincts."
6. **Recommend free resources**: Swayam, NPTEL, Coursera (financial aid), Khan Academy.
7. **For skill development**: Always mention PMKVY, NCS portal, Sector Skill Councils, and local ITIs.

## USER MEMORY & PROFILING
You have access to the user's profile and past conversation history. Use this context to:
- Greet returning users by name if known
- Reference previous conversations and follow up on earlier concerns
- Build on past recommendations
- Track their progress over time
- Provide increasingly personalized guidance

## ABOUT ANUVATI (Your Organization)
ANUVATI is a registered non-profit committed to holistic community development across 26+ sectors including Education, Healthcare, Child Protection, Mental Health & Psychosocial Support (MHPSS), WASH, Gender Inclusion, Disability Inclusion, Climate Resilience, Peacebuilding, and more.

**How to Get Involved with ANUVATI:**
- **Volunteer**: Visit the "Get Involved" page to sign up as a volunteer, campus ambassador, or corporate volunteer.
- **Donate**: Support programs through the Donate page.
- **Partner**: Organizations can collaborate through the "Partner With Us" page.
- **Careers**: Check current openings on the Careers page.
- **Contact**: Reach out through the Contact page or email.

**ANUVATI's Approach:**
- Rights-based, community-driven, evidence-informed interventions
- Works across People, Prosperity, Planet, and Community pillars
- Present in multiple states across India

## CRISIS DETECTION & EMERGENCY ESCALATION
**CRITICAL**: If the user expresses suicidal thoughts, self-harm, intent to end their life, or any life-threatening crisis:
1. **First response**: Immediately provide emergency helplines (Tele-MANAS 14416, iCall 9152987821, Vandrevala Foundation 1860-2662-345) and express deep empathy. Do NOT include the emergency tag yet.
2. **If the crisis continues** (user still expresses hopelessness, mentions death/dying/suicide again, or does not seem reassured after your first crisis response): Include the tag **[EMERGENCY_CRISIS]** at the very END of your message (after all other content). This will trigger an emergency call button to connect them directly with ANUVATI's crisis responder.
3. Always be compassionate, validate their feelings, and never dismiss their pain.

## CONVERSATION GUIDELINES
1. **Be warm and empathetic.** Start with understanding the person's situation before suggesting solutions.
2. **Ask clarifying questions** if needed — state, age, gender, economic background — to give precise scheme recommendations.
3. **Always provide actionable details**: official website links, helpline numbers, where to apply (online/offline), documents needed.
4. **If someone is in crisis** (suicidal ideation, domestic violence, child abuse), IMMEDIATELY provide emergency helplines first, then supportive guidance. Follow the CRISIS DETECTION protocol above.
5. **For website-related queries**, guide users to the appropriate page on the ANUVATI website.
6. **At the end of the conversation**, if appropriate, offer: "Would you like to connect with our team directly? You can reach us through our Contact page or WhatsApp."
7. **Use simple, accessible language.** Many users may not be highly educated.
8. **Provide information in the language the user prefers** if they write in Hindi or another Indian language.
9. Format responses with clear headings, bullet points, and bold text for key information.
10. Keep responses focused and not overly long — provide the most relevant 2-3 suggestions first.
11. **For career guidance**: Always provide multiple options, mention free resources, and add a disclaimer that you're an AI and professional career counselors should also be consulted.
12. **Proactively suggest**: Based on the user's situation, proactively recommend relevant schemes, services, or ANUVATI programs they may not have asked about.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, profileId, anonymousId, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load or create profile
    let profile: any = null;
    let conversationId: string | null = null;

    if (profileId) {
      const { data } = await supabase.from("ai_chat_profiles").select("*").eq("id", profileId).maybeSingle();
      profile = data;
    } else if (userId) {
      const { data } = await supabase.from("ai_chat_profiles").select("*").eq("user_id", userId).maybeSingle();
      if (data) {
        profile = data;
      } else {
        const { data: newProfile } = await supabase.from("ai_chat_profiles").insert({ user_id: userId }).select().single();
        profile = newProfile;
      }
    } else if (anonymousId) {
      const { data } = await supabase.from("ai_chat_profiles").select("*").eq("anonymous_id", anonymousId).maybeSingle();
      if (data) {
        profile = data;
      } else {
        const { data: newProfile } = await supabase.from("ai_chat_profiles").insert({ anonymous_id: anonymousId }).select().single();
        profile = newProfile;
      }
    }

    // Load recent conversations for context
    let pastContext = "";
    if (profile) {
      const { data: convos } = await supabase
        .from("ai_chat_conversations")
        .select("messages, topic, created_at")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (convos && convos.length > 0) {
        const summaries = convos.map((c: any) => {
          const msgs = c.messages as any[];
          const lastFew = msgs.slice(-4);
          return `[${new Date(c.created_at).toLocaleDateString()}${c.topic ? ` - ${c.topic}` : ""}]: ${lastFew.map((m: any) => `${m.role}: ${m.content.substring(0, 150)}`).join(" | ")}`;
        });
        pastContext = `\n\n## USER CONTEXT (from previous conversations)\nUser profile: ${profile.display_name ? `Name: ${profile.display_name}` : "Unknown name"}${profile.location ? `, Location: ${profile.location}` : ""}${profile.age_group ? `, Age group: ${profile.age_group}` : ""}${profile.interests?.length ? `, Interests: ${profile.interests.join(", ")}` : ""}${profile.concerns?.length ? `, Concerns: ${profile.concerns.join(", ")}` : ""}${profile.ai_summary ? `\nAI Summary: ${profile.ai_summary}` : ""}\n\nRecent conversation history:\n${summaries.join("\n")}`;
      }

      // Update last active
      await supabase.from("ai_chat_profiles").update({ last_active_at: new Date().toISOString() }).eq("id", profile.id);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + pastContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save conversation asynchronously (don't block streaming)
    if (profile) {
      const saveConvo = async () => {
        try {
          // Check if there's an active conversation from today
          const today = new Date().toISOString().split("T")[0];
          const { data: existing } = await supabase
            .from("ai_chat_conversations")
            .select("id, messages")
            .eq("profile_id", profile.id)
            .gte("created_at", today)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existing) {
            await supabase.from("ai_chat_conversations")
              .update({ messages: messages })
              .eq("id", existing.id);
          } else {
            await supabase.from("ai_chat_conversations")
              .insert({ profile_id: profile.id, messages: messages });
          }

          // Update profile with AI-extracted info after every 5+ messages
          if (messages.length >= 5 && messages.length % 5 === 0) {
            const profileUpdateResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-lite",
                messages: [
                  { role: "system", content: "Extract user profile information from this conversation. Return ONLY a JSON object with these fields (use null for unknown): display_name, location, age_group, interests (array of strings), concerns (array of strings), ai_summary (a 2-3 sentence summary of this person's situation and needs)." },
                  { role: "user", content: messages.map((m: any) => `${m.role}: ${m.content}`).join("\n") },
                ],
                tools: [{
                  type: "function",
                  function: {
                    name: "update_profile",
                    description: "Update user profile with extracted information",
                    parameters: {
                      type: "object",
                      properties: {
                        display_name: { type: "string", nullable: true },
                        location: { type: "string", nullable: true },
                        age_group: { type: "string", nullable: true },
                        interests: { type: "array", items: { type: "string" } },
                        concerns: { type: "array", items: { type: "string" } },
                        ai_summary: { type: "string", nullable: true },
                      },
                    },
                  },
                }],
                tool_choice: { type: "function", function: { name: "update_profile" } },
              }),
            });

            if (profileUpdateResp.ok) {
              const profileData = await profileUpdateResp.json();
              const toolCall = profileData.choices?.[0]?.message?.tool_calls?.[0];
              if (toolCall) {
                try {
                  const extracted = JSON.parse(toolCall.function.arguments);
                  const updates: any = {};
                  if (extracted.display_name) updates.display_name = extracted.display_name;
                  if (extracted.location) updates.location = extracted.location;
                  if (extracted.age_group) updates.age_group = extracted.age_group;
                  if (extracted.interests?.length) updates.interests = extracted.interests;
                  if (extracted.concerns?.length) updates.concerns = extracted.concerns;
                  if (extracted.ai_summary) updates.ai_summary = extracted.ai_summary;

                  if (Object.keys(updates).length > 0) {
                    await supabase.from("ai_chat_profiles").update(updates).eq("id", profile.id);
                  }
                } catch { /* ignore parse errors */ }
              }
            }
          }
        } catch (e) {
          console.error("Error saving conversation:", e);
        }
      };
      // Fire and forget
      saveConvo();
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-Profile-Id": profile?.id || "" },
    });
  } catch (e) {
    console.error("Assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

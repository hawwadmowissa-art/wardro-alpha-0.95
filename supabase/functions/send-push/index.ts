import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }
  try {
    const { title, body, url } = await req.json();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({error:'Unauthorized'}), {status:401, headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
    const token = authHeader.replace('Bearer ', '');

    const authClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !user) return new Response(JSON.stringify({error:'Invalid token'}), {status:401, headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});

    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
    if (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL) return new Response(JSON.stringify({error:'Forbidden - admin only'}), {status:403, headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});

    webpush.setVapidDetails(
      Deno.env.get("VAPID_SUBJECT")!,
      Deno.env.get("VAPID_PUBLIC_KEY")!,
      Deno.env.get("VAPID_PRIVATE_KEY")!
    );
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: subs } = await supabase.from("push_subscriptions").select("*");
    const results = await Promise.allSettled(
      (subs || []).map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body, url: url || "/" })
        )
      )
    );
    const sent = results.filter((r) => r.status === "fulfilled").length;
    return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }
});

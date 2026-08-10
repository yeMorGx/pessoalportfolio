import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(`${origin}/admin/login?error=config`);
  }

  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const redirectOrigin = process.env.NODE_ENV === "development" || !forwardedHost ? origin : `${forwardedProto}://${forwardedHost}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${redirectOrigin}/auth/callback?next=/admin`
    }
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/admin/login?error=oauth`);
  }

  return NextResponse.redirect(data.url);
}

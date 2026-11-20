
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@iberdrola/shared";
import { getSupabaseConfig } from "@/lib/env";
import { safeDestination } from "@/lib/auth-validation";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const env = getSupabaseConfig();

  if (!code || !env) {
    return NextResponse.redirect(
      new URL("/login?error=enlace", request.url)
    );
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.url,
    env.key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=enlace", request.url)
    );
  }

  const destination = safeDestination(
    request.nextUrl.searchParams.get("next")
  );

  const redirectResponse = NextResponse.redirect(
    new URL(destination, request.url)
  );

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  redirectResponse.headers.set("Cache-Control", "private, no-store");

  return redirectResponse;
}

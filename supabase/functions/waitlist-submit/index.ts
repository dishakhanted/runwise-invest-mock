/**
 * Waitlist Submission Edge Function
 * Handles waitlist submissions with rate limiting and Cloudflare Turnstile verification
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_IP = 5; // Max 5 submissions per IP per hour
const MAX_REQUESTS_PER_EMAIL = 3; // Max 3 submissions per email per hour

// In-memory rate limit store (resets on function restart)
// For production with multiple instances, consider using Redis or Supabase KV
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipRateLimit = new Map<string, RateLimitEntry>();
const emailRateLimit = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited
 */
function checkRateLimit(identifier: string, store: Map<string, RateLimitEntry>, maxRequests: number): {
  allowed: boolean;
  resetAt: number;
  remaining: number;
} {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    store.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return {
      allowed: true,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
      remaining: maxRequests - 1,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      resetAt: entry.resetAt,
      remaining: 0,
    };
  }

  // Increment count
  entry.count++;
  store.set(identifier, entry);

  return {
    allowed: true,
    resetAt: entry.resetAt,
    remaining: maxRequests - entry.count,
  };
}

/**
 * Get client IP address from request
 */
function getClientIP(req: Request): string {
  // Try various headers that proxies/CDNs use
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback - in production this should rarely happen
  return "unknown";
}

/**
 * Verify Cloudflare Turnstile token
 */
async function verifyTurnstileToken(token: string, remoteIP: string): Promise<boolean> {
  const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY");
  
  if (!TURNSTILE_SECRET_KEY) {
    console.warn("TURNSTILE_SECRET_KEY not set, skipping verification");
    // In development, allow requests without verification if secret not set
    // In production, you should require this
    return true;
  }

  // Allow bypass token for local development
  if (token === "localhost-bypass-token") {
    return true;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: remoteIP,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

/**
 * Create Supabase client for waitlist database
 */
function createWaitlistClient() {
  const WAITLIST_SUPABASE_URL = Deno.env.get("WAITLIST_SUPABASE_URL");
  const WAITLIST_SUPABASE_SERVICE_KEY = Deno.env.get("WAITLIST_SUPABASE_SERVICE_KEY");
  
  if (!WAITLIST_SUPABASE_URL || !WAITLIST_SUPABASE_SERVICE_KEY) {
    throw new Error("Missing waitlist Supabase configuration");
  }
  
  return createClient(WAITLIST_SUPABASE_URL, WAITLIST_SUPABASE_SERVICE_KEY);
}

/**
 * Clean up expired rate limit entries (run periodically)
 */
function cleanupRateLimits() {
  const now = Date.now();
  
  // Clean IP rate limits
  for (const [key, entry] of ipRateLimit.entries()) {
    if (entry.resetAt < now) {
      ipRateLimit.delete(key);
    }
  }
  
  // Clean email rate limits
  for (const [key, entry] of emailRateLimit.entries()) {
    if (entry.resetAt < now) {
      emailRateLimit.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const clientIP = getClientIP(req);
    
    // Parse request body with error handling
    let body;
    try {
      const bodyText = await req.text();
      if (!bodyText || bodyText.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: "Request body is required" }),
          { status: 400, headers: corsHeaders }
        );
      }
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    const { first_name, last_name, birthday, email, turnstile_token } = body;
    
    // Log the received token for debugging
    console.log("Received request:", {
      email: email?.substring(0, 10) + "...",
      hasToken: !!turnstile_token,
      tokenValue: turnstile_token === "localhost-bypass-token" ? "localhost-bypass-token" : (turnstile_token?.substring(0, 30) || "null"),
      clientIP
    });

    // Validate required fields
    if (!first_name || !last_name || !birthday || !email) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate email format (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify Turnstile token (allow bypass for localhost development)
    const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY");
    
    // Check for bypass token - be very explicit about the comparison
    const isLocalhostBypass = turnstile_token === "localhost-bypass-token" || 
                              (typeof turnstile_token === "string" && turnstile_token.trim() === "localhost-bypass-token");
    
    // Debug logging
    console.log("Turnstile check:", {
      hasToken: !!turnstile_token,
      tokenType: typeof turnstile_token,
      tokenValue: turnstile_token === "localhost-bypass-token" ? "localhost-bypass-token" : (turnstile_token?.substring(0, 30) || "null"),
      isLocalhostBypass,
      hasSecretKey: !!TURNSTILE_SECRET_KEY,
      exactMatch: turnstile_token === "localhost-bypass-token"
    });
    
    // Skip all Turnstile verification if:
    // 1. Using bypass token, OR
    // 2. No secret key is set (dev mode)
    if (isLocalhostBypass) {
      console.log("✅ Localhost bypass token detected, skipping Turnstile verification");
      // Continue with submission - don't verify, just proceed to rate limiting
    } else if (!TURNSTILE_SECRET_KEY) {
      // No secret key set, allow without verification (dev mode)
      console.log("⚠️ No TURNSTILE_SECRET_KEY set, skipping verification");
      // Continue with submission
    } else {
      // Secret key is set - require valid token
      if (!turnstile_token) {
        console.error("❌ CAPTCHA token missing");
        return new Response(
          JSON.stringify({ error: "CAPTCHA verification required" }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Verify Turnstile token
      const turnstileValid = await verifyTurnstileToken(turnstile_token, clientIP);
      if (!turnstileValid) {
        console.error("❌ Turnstile verification failed", { 
          hasToken: !!turnstile_token,
          tokenPrefix: turnstile_token?.substring(0, 30),
          isBypass: isLocalhostBypass
        });
        return new Response(
          JSON.stringify({ error: "CAPTCHA verification failed. Please try again." }),
          { status: 400, headers: corsHeaders }
        );
      }
      console.log("✅ Turnstile verification successful");
    }

    // Check rate limits
    const ipLimit = checkRateLimit(clientIP, ipRateLimit, MAX_REQUESTS_PER_IP);
    if (!ipLimit.allowed) {
      const retryAfter = Math.ceil((ipLimit.resetAt - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    const emailLimit = checkRateLimit(email.toLowerCase(), emailRateLimit, MAX_REQUESTS_PER_EMAIL);
    if (!emailLimit.allowed) {
      const retryAfter = Math.ceil((emailLimit.resetAt - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          error: "Too many requests for this email. Please try again later.",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    // Insert into waitlist database
    const supabase = createWaitlistClient();
    const { error: insertError } = await supabase
      .from("waitlist")
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        birthday: birthday,
        email: email.trim().toLowerCase(),
      });

    if (insertError) {
      // Handle duplicate email (unique constraint violation)
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({
            error: "This email address is already on the waitlist. Please use a different email.",
          }),
          { status: 409, headers: corsHeaders }
        );
      }

      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to process submission. Please try again." }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Success
    return new Response(
      JSON.stringify({
        success: true,
        message: "You're on the waitlist! 🎉",
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Waitlist submission error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: corsHeaders }
    );
  }
});

import { ChangeEvent, FormEvent, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Declare Turnstile types
declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback': () => void;
        'expired-callback': () => void;
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
const IS_DEVELOPMENT = import.meta.env.DEV || import.meta.env.MODE === "development";
const IS_LOCALHOST = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// Allow bypassing Turnstile in local development
const USE_TURNSTILE = TURNSTILE_SITE_KEY && (!IS_LOCALHOST || import.meta.env.VITE_ENABLE_TURNSTILE_LOCAL === "true");

type FormValues = {
  firstName: string;
  lastName: string;
  birthday: string;
  email: string;
};

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  birthday: "",
  email: "",
};

/**
 * Get error message from API error response
 */
function getApiErrorMessage(errorResponse: { error?: string; message?: string }): string {
  if (errorResponse.error) {
    return errorResponse.error;
  }
  if (errorResponse.message) {
    return errorResponse.message;
  }
  return "An error occurred while processing your request. Please try again.";
}

const WaitlistForm = () => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const waitlistSupabaseUrl = import.meta.env.VITE_WAITLIST_SUPABASE_URL;

  // Initialize Turnstile widget (skip in local development unless explicitly enabled)
  useEffect(() => {
    // In local dev without Turnstile, set a bypass token immediately
    if (IS_LOCALHOST && !USE_TURNSTILE) {
      setTurnstileToken("localhost-bypass-token");
      return;
    }

    if (!USE_TURNSTILE || !turnstileRef.current || !TURNSTILE_SITE_KEY) {
      return;
    }

    // Wait for Turnstile script to load
    if (!window.turnstile) {
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstile);
          renderTurnstile();
        }
      }, 100);

      return () => clearInterval(checkTurnstile);
    }

    renderTurnstile();

    function renderTurnstile() {
      if (!turnstileRef.current || !window.turnstile) return;

      try {
        const widgetId = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            setTurnstileToken(token);
          },
          'error-callback': () => {
            setTurnstileToken(null);
            setStatus({
              type: "error",
              message: "CAPTCHA verification failed. Please try again.",
            });
          },
          'expired-callback': () => {
            setTurnstileToken(null);
          },
        });

        turnstileWidgetIdRef.current = widgetId;
      } catch (error) {
        console.error("Turnstile render error:", error);
        // In local dev, allow bypass if Turnstile fails
        if (IS_LOCALHOST) {
          setTurnstileToken("localhost-bypass-token");
        }
      }
    }

    // Cleanup function
    return () => {
      if (turnstileWidgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetIdRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const handleChange = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    // Clear status when user types
    if (status?.type === "error") {
      setStatus(null);
    }
  };

  const resetTurnstile = () => {
    if (turnstileWidgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(turnstileWidgetIdRef.current);
        setTurnstileToken(null);
      } catch (e) {
        // Ignore reset errors
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!waitlistSupabaseUrl) {
      setStatus({
        type: "error",
        message: "Waitlist service is not configured. Please try again later.",
      });
      return;
    }

    // Set bypass token if on localhost and Turnstile is not enabled
    const tokenToUse = (IS_LOCALHOST && !USE_TURNSTILE) 
      ? "localhost-bypass-token" 
      : turnstileToken;

    if (!tokenToUse && USE_TURNSTILE) {
      setStatus({
        type: "error",
        message: "Please complete the CAPTCHA verification.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Debug logging for localhost
      if (IS_LOCALHOST) {
        console.log("Submitting waitlist form (localhost)", {
          tokenToUse: tokenToUse === "localhost-bypass-token" ? "localhost-bypass-token" : tokenToUse?.substring(0, 20),
          isLocalhost: IS_LOCALHOST,
          useTurnstile: USE_TURNSTILE
        });
      }

      // Call Edge Function
      const response = await fetch(`${waitlistSupabaseUrl}/functions/v1/waitlist-submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          birthday: values.birthday,
          email: values.email.trim(),
          turnstile_token: tokenToUse || "localhost-bypass-token", // Ensure we always send a token on localhost
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 429) {
          // Rate limit exceeded
          const retryAfter = data.retryAfter ? ` Please try again in ${Math.ceil(data.retryAfter / 60)} minutes.` : "";
          throw new Error(data.error || "Too many requests. Please try again later." + retryAfter);
        } else if (response.status === 409) {
          // Duplicate email
          throw new Error(data.error || "This email address is already on the waitlist. Please use a different email.");
        } else {
          throw new Error(getApiErrorMessage(data));
        }
      }

      // Success
      setValues(initialValues);
      setStatus({ type: "success", message: data.message || "You're on the waitlist! 🎉" });
      resetTurnstile();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setStatus({ type: "error", message });
      resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            value={values.firstName}
            onChange={handleChange("firstName")}
            required
            placeholder="Alex"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            value={values.lastName}
            onChange={handleChange("lastName")}
            required
            placeholder="Morgan"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthday">Birthday</Label>
          <Input
            id="birthday"
            name="birthday"
            type="date"
            value={values.birthday}
            onChange={handleChange("birthday")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange("email")}
            required
            placeholder="you@example.com"
          />
        </div>

        {/* Cloudflare Turnstile - hidden in local dev unless explicitly enabled */}
        {USE_TURNSTILE && (
          <div className="flex justify-center">
            <div ref={turnstileRef} className="cf-turnstile" />
          </div>
        )}

        {IS_LOCALHOST && !USE_TURNSTILE && (
          <Alert variant="default" aria-live="polite">
            <AlertDescription className="text-xs">
              ⚠️ Development mode: CAPTCHA is bypassed for local testing
            </AlertDescription>
          </Alert>
        )}

        {!USE_TURNSTILE && !IS_LOCALHOST && (
          <Alert variant="default" aria-live="polite">
            <AlertDescription>CAPTCHA is not configured. Please contact support.</AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 text-base" 
          disabled={isSubmitting || !waitlistSupabaseUrl || (USE_TURNSTILE && !turnstileToken)}
        >
          {isSubmitting ? "Joining..." : "Join waitlist"}
        </Button>

        {!waitlistSupabaseUrl && !status && (
          <Alert variant="default" aria-live="polite">
            <AlertDescription>Waitlist is temporarily unavailable. Please try again soon.</AlertDescription>
          </Alert>
        )}

        {status && (
          <Alert variant={status.type === "error" ? "destructive" : "default"} aria-live="polite">
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
};

export default WaitlistForm;

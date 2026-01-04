import { ChangeEvent, FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { waitlistSupabase } from "@/lib/waitlistClient";

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

const WaitlistForm = () => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const isConfigured = Boolean(waitlistSupabase);

  const handleChange = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    setIsSubmitting(true);

    try {
      const { error } = await waitlistSupabase?.from("waitlist").insert({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        birthday: values.birthday,
        email: values.email.trim(),
      });

      if (error) {
        throw error;
      }

      setValues(initialValues);
      setStatus({ type: "success", message: "You’re on the waitlist! 🎉" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setStatus({ type: "error", message });
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

        <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting || !isConfigured}>
          {isSubmitting ? "Joining..." : "Join waitlist"}
        </Button>

        {!isConfigured && !status && (
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


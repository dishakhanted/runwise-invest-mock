import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { OnboardingData } from "@/pages/Onboarding";
import { ChevronLeft } from "lucide-react";

const identitySchema = z.object({
  ssn: z.string().min(9, "SSN must be 9 digits").max(11, "SSN format invalid"),
  creditCheckConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to the credit check to continue",
  }),
});

type IdentityFormData = z.infer<typeof identitySchema>;

interface IdentityVerificationStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export const IdentityVerificationStep = ({ data, onNext, onBack }: IdentityVerificationStepProps) => {
  const form = useForm<IdentityFormData>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      ssn: data.ssn || "",
      creditCheckConsent: data.creditCheckConsent || false,
    },
  });

  const onSubmit = (values: IdentityFormData) => {
    onNext(values);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Button
        variant="ghost"
        onClick={onBack}
        className="w-fit -ml-2 mb-6"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back
      </Button>

      <h1 className="text-3xl font-bold mb-2">Identity Verification</h1>
      <p className="text-muted-foreground mb-8">
        We need to verify your identity to protect your account and comply with financial regulations.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
          <div className="flex-1 space-y-6">
            <FormField
              control={form.control}
              name="ssn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Security Number</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="XXX-XX-XXXX" 
                      {...field} 
                      className="h-14"
                      maxLength={11}
                    />
                  </FormControl>
                  <FormDescription>
                    Your SSN is encrypted and securely stored.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="creditCheckConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I authorize a credit check
                    </FormLabel>
                    <FormDescription>
                      We'll perform a soft credit check to verify your identity. This won't affect your credit score.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full h-14 text-lg rounded-2xl">
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
};

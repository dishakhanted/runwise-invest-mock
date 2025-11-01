import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OnboardingData } from "@/pages/Onboarding";

const personalInfoSchema = z.object({
  legalFirstName: z.string().min(1, "Legal first name is required"),
  preferredFirstName: z.string().optional(),
  middleName: z.string().optional(),
  legalLastName: z.string().min(1, "Legal last name is required"),
  suffix: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface PersonalInfoStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
}

export const PersonalInfoStep = ({ data, onNext }: PersonalInfoStepProps) => {
  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      legalFirstName: data.legalFirstName || "",
      preferredFirstName: data.preferredFirstName || "",
      middleName: data.middleName || "",
      legalLastName: data.legalLastName || "",
      suffix: data.suffix || "",
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      zipCode: data.zipCode || "",
    },
  });

  const onSubmit = (values: PersonalInfoFormData) => {
    onNext(values);
  };

  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-3xl font-bold mb-2">What's your first and last name?</h1>
      <p className="text-muted-foreground mb-8">
        We'll use this to personalize your experience.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="legalFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Legal First name" {...field} className="h-14" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Preferred First name (optional)" {...field} className="h-14" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Middle name or initial (optional)" {...field} className="h-14" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legalLastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Legal Last name" {...field} className="h-14" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suffix"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Suffix (optional)" {...field} className="h-14" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} className="h-14" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} className="h-14" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Postal Address</h2>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Street address" {...field} className="h-14" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="City" {...field} className="h-14" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="State" {...field} className="h-14" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="ZIP code" {...field} className="h-14" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg rounded-2xl">
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
};

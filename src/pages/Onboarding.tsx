import { useState } from "react";
import { PersonalInfoStep } from "@/components/onboarding/PersonalInfoStep";
import { IdentityVerificationStep } from "@/components/onboarding/IdentityVerificationStep";
import { LinkAccountsStep } from "@/components/onboarding/LinkAccountsStep";
import { ChatbotStep } from "@/components/onboarding/ChatbotStep";

export type OnboardingData = {
  // Personal Info
  legalFirstName?: string;
  preferredFirstName?: string;
  middleName?: string;
  legalLastName?: string;
  suffix?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Identity Verification
  ssn?: string;
  creditCheckConsent?: boolean;
  
  // Linked Accounts
  linkedAccounts?: string[];
  
  // Financial Information
  income?: string;
  employmentType?: string;
  goals?: string;
};

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const updateData = (newData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-colors ${
                step <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        {currentStep === 1 && (
          <PersonalInfoStep
            data={onboardingData}
            onNext={(data) => {
              updateData(data);
              nextStep();
            }}
          />
        )}
        
        {currentStep === 2 && (
          <IdentityVerificationStep
            data={onboardingData}
            onNext={(data) => {
              updateData(data);
              nextStep();
            }}
            onBack={prevStep}
          />
        )}
        
        {currentStep === 3 && (
          <LinkAccountsStep
            data={onboardingData}
            onNext={(data) => {
              updateData(data);
              nextStep();
            }}
            onBack={prevStep}
          />
        )}
        
        {currentStep === 4 && (
          <ChatbotStep
            data={onboardingData}
            onComplete={(data) => {
              updateData(data);
              // Navigate to dashboard after completion
              window.location.href = "/dashboard";
            }}
            onBack={prevStep}
          />
        )}
      </div>
    </div>
  );
};

export default Onboarding;

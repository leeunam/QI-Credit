import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface CreditStepsProps {
  currentStep: number;
  steps: Step[];
}

export const CreditSteps: React.FC<CreditStepsProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                currentStep > step.id 
                  ? "bg-success border-success text-white" 
                  : currentStep === step.id
                  ? "bg-primary border-primary text-white"
                  : "bg-background border-tertiary text-tertiary"
              )}>
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-body-4 font-semibold">{step.id}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-body-4 font-medium",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-body-4 text-muted-foreground mt-1 hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4",
                currentStep > step.id ? "bg-success" : "bg-tertiary/30"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
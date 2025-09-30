import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, label: 'Dados Básicos' },
  { number: 2, label: 'Documentos' },
  { number: 3, label: 'Selfie' },
  { number: 4, label: 'Revisão' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="relative mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-smooth"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex flex-col items-center flex-1"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-body-4 font-semibold mb-2 transition-smooth',
                currentStep >= step.number
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {step.number}
            </div>
            <span
              className={cn(
                'text-body-4 text-center transition-smooth hidden desktop-sm:block',
                currentStep >= step.number
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

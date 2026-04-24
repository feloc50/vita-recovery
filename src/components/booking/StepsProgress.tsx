import { Check } from 'lucide-react';

interface StepsProgressProps {
  currentStep: number;
  steps: Array<{ number: number; title: string }>;
}

export function StepsProgress({ currentStep, steps }: StepsProgressProps) {
  return (
    <nav aria-label="Progress" className="mb-8 px-4">
      <ol className="flex items-center justify-center gap-12 sm:gap-24 max-w-2xl mx-auto">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <li 
              key={step.number} 
              className="flex flex-col items-center"
            >
              {/* Step circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-colors duration-300 relative
                  ${isCompleted || isCurrent ? 'bg-primary-600' : 'bg-gray-200'}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                    {step.number}
                  </span>
                )}
                {/* Bottom dot for current step */}
                {isCurrent && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-600" />
                )}
              </div>

              {/* Step title */}
              <span className={`
                mt-3 text-sm font-medium text-center
                ${isCurrent ? 'text-primary-600' : 'text-gray-500'}
              `}>
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
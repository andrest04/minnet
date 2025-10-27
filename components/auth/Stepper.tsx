interface StepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                  index < currentStep
                    ? 'bg-success text-white'
                    : index === currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center ${
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 rounded transition-all duration-200 ${
                  index < currentStep ? 'bg-success' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

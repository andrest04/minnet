import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepperProps {
  steps: string[]
  currentStep: number
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <nav aria-label="Progreso del registro" className="w-full py-6">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isPending = index > currentStep

          return (
            <li key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1 gap-2">
                <div
                  className={cn(
                    'relative w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
                    isCompleted && 'bg-secondary text-white',
                    isCurrent && 'bg-primary text-white ring-4 ring-primary/10',
                    isPending && 'bg-muted text-muted-foreground border-2 border-border'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium text-center max-w-[100px] transition-colors',
                    isCurrent && 'text-foreground font-semibold',
                    isCompleted && 'text-foreground',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 -mt-10" aria-hidden="true">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      index < currentStep ? 'bg-secondary' : 'bg-border'
                    )}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

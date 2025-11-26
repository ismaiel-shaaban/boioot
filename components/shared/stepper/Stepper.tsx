'use client';

import styles from './Stepper.module.css';

export interface Step {
  id: number;
  title: string;
  completed: boolean;
  active: boolean;
}

interface StepperProps {
  steps: Step[];
  onStepChange: (stepId: number) => void;
}

export default function Stepper({ steps, onStepChange }: StepperProps) {
  const selectStep = (stepId: number) => {
    const step = steps.find((s) => s.id === stepId);
    if (step) {
      onStepChange(stepId);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.stepper}>
        {steps.map((step) => (
          <div
            key={step.id}
            className={`${styles.step} ${step.completed ? styles.completed : ''} ${step.active ? styles.active : ''} ${styles.clickable}`}
            onClick={() => selectStep(step.id)}
          >
            <div className={styles.stepContent}>
              <div className={styles.stepIndicator}>
                {step.completed ? (
                  <div className={styles.stepCheck}>
                    <i className="fa-sharp fa-solid fa-check"></i>
                  </div>
                ) : (
                  <div className={styles.stepNumber}>{step.id}</div>
                )}
              </div>
              <div className={styles.stepTitle}>{step.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


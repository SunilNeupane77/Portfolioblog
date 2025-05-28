'use client';

import { Label } from './label';

type ProgressBarProps = {
  progress: number;
  showLabel?: boolean;
  labelText?: string;
};

export function ProgressBar({ progress, showLabel = true, labelText = 'Progress' }: ProgressBarProps) {
  // Calculate width percentage class based on progress value
  const getWidthClass = () => {
    const roundedProgress = Math.round(progress);
    if (roundedProgress <= 0) return 'w-0';
    if (roundedProgress >= 100) return 'w-full';
    
    // Return closest width class (w-1/4, w-1/3, w-1/2, w-2/3, w-3/4, etc.)
    if (roundedProgress <= 10) return 'w-[10%]';
    if (roundedProgress <= 20) return 'w-[20%]';
    if (roundedProgress <= 30) return 'w-[30%]';
    if (roundedProgress <= 40) return 'w-[40%]';
    if (roundedProgress <= 50) return 'w-[50%]';
    if (roundedProgress <= 60) return 'w-[60%]';
    if (roundedProgress <= 70) return 'w-[70%]';
    if (roundedProgress <= 80) return 'w-[80%]';
    if (roundedProgress <= 90) return 'w-[90%]';
    return 'w-[95%]';
  };

  return (
    <div className="space-y-1">
      {showLabel && <Label>{labelText}</Label>}
      <div className="w-full bg-muted rounded-full h-2.5">
        <div 
          className={`bg-primary h-2.5 rounded-full transition-all duration-300 ${getWidthClass()}`}
        ></div>
      </div>
      <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
    </div>
  );
}

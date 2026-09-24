import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StageProgressBarProps {
  currentStage: number;
  totalStages: number;
  stageLabels: string[];
}

const StageProgressBar: React.FC<StageProgressBarProps> = ({
  currentStage,
  totalStages,
  stageLabels,
}) => {
  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center justify-between gap-1">
        {Array.from({ length: totalStages }, (_, i) => {
          const stageNum = i + 1;
          const isCompleted = stageNum < currentStage;
          const isActive = stageNum === currentStage;
          return (
            <React.Fragment key={stageNum}>
              <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0',
                    isCompleted && 'bg-emerald-500 text-white',
                    isActive && 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50',
                    !isCompleted && !isActive && 'text-zinc-600',
                  )}
                  style={
                    !isCompleted && !isActive
                      ? { background: 'var(--color-input-bg, rgba(255,255,255,0.04))' }
                      : undefined
                  }
                >
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : stageNum}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider text-center leading-tight truncate w-full',
                    isActive && 'text-emerald-400',
                    isCompleted && 'text-emerald-500/70',
                    !isActive && !isCompleted && 'text-zinc-600',
                  )}
                >
                  {stageLabels[i]}
                </span>
              </div>
              {stageNum < totalStages && (
                <div
                  className={cn(
                    'h-0.5 flex-1 rounded-full transition-all duration-500 mt-[-18px]',
                    stageNum < currentStage ? 'bg-emerald-500/60' : 'bg-white/[0.06]',
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile: compact pill bar */}
      <div className="flex sm:hidden items-center gap-1.5">
        {Array.from({ length: totalStages }, (_, i) => {
          const stageNum = i + 1;
          const isCompleted = stageNum < currentStage;
          const isActive = stageNum === currentStage;
          return (
            <div
              key={stageNum}
              className={cn(
                'h-1.5 rounded-full transition-all duration-500 flex-1',
                isCompleted && 'bg-emerald-500',
                isActive && 'bg-emerald-500/60',
                !isCompleted && !isActive && 'bg-white/[0.06]',
              )}
            />
          );
        })}
      </div>
      <p className="sm:hidden text-[10px] text-zinc-500 mt-2 text-center uppercase tracking-widest">
        Step {currentStage} of {totalStages} — {stageLabels[currentStage - 1]}
      </p>
    </div>
  );
};

export default StageProgressBar;

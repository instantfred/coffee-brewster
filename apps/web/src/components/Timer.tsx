import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../state/useSettings';
import { formatVolume } from '../lib/units';

interface PourStep {
  atSec: number;
  volumeMl: number;
  label: string;
}

interface TimerProps {
  schedule: PourStep[];
  onFinish: (elapsedSec: number, actualPours: ActualPour[]) => void;
  onStep?: (stepIndex: number) => void;
  onTick?: (elapsedSec: number) => void;
}

export interface ActualPour {
  scheduledAtSec: number;
  actualAtSec: number;
  volumeMl: number;
  label: string;
  completed: boolean;
}

export function Timer({ schedule, onFinish, onStep, onTick }: TimerProps) {
  const { settings } = useSettings();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [actualPours, setActualPours] = useState<ActualPour[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize actual pours from schedule
  useEffect(() => {
    setActualPours(
      schedule.map(step => ({
        scheduledAtSec: step.atSec,
        actualAtSec: step.atSec,
        volumeMl: step.volumeMl,
        label: step.label,
        completed: false,
      }))
    );
  }, [schedule]);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSec(prev => {
          const newElapsed = prev + 1;
          onTick?.(newElapsed);
          
          // Check for step boundaries
          const nextStep = schedule.find((step, index) => 
            step.atSec === newElapsed && index >= currentStepIndex
          );
          
          if (nextStep) {
            const stepIndex = schedule.indexOf(nextStep);
            setCurrentStepIndex(stepIndex);
            onStep?.(stepIndex);
            playNotificationSound();
            triggerVibration();
          }
          
          return newElapsed;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, currentStepIndex, schedule, onStep, onTick]);

  const playNotificationSound = () => {
    // Respect user's sound preference
    if (!settings?.soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  const triggerVibration = () => {
    // Check if vibration API is available (mobile devices)
    if ('navigator' in window && 'vibrate' in navigator) {
      try {
        // Short vibration pattern: vibrate for 200ms, pause 100ms, vibrate 200ms
        navigator.vibrate([200, 100, 200]);
      } catch (error) {
        console.warn('Could not trigger vibration:', error);
      }
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSec(0);
    setCurrentStepIndex(0);
    setActualPours(prev => prev.map(pour => ({ ...pour, completed: false })));
  };

  const handleStepComplete = (stepIndex: number) => {
    setActualPours(prev => prev.map((pour, index) => 
      index === stepIndex 
        ? { ...pour, completed: true, actualAtSec: elapsedSec }
        : pour
    ));
    
    // Move to next step
    if (stepIndex < schedule.length - 1) {
      setCurrentStepIndex(stepIndex + 1);
    }
  };

  const handleFinish = () => {
    setIsRunning(false);
    setIsPaused(false);
    // Auto-complete any incomplete steps with their scheduled time
    const completedPours = actualPours.map(pour =>
      pour.completed
        ? pour
        : { ...pour, completed: true, actualAtSec: pour.scheduledAtSec }
    );
    onFinish(elapsedSec, completedPours);
  };

  const getCurrentStep = () => {
    return schedule[currentStepIndex];
  };

  const getNextStep = () => {
    return schedule[currentStepIndex + 1];
  };

  const formatTimeDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStep = getCurrentStep();
  const nextStep = getNextStep();
  const isLastStep = currentStepIndex >= schedule.length - 1;

  // Calculate total duration for timeline (last step time + 60 sec buffer for drawdown)
  const lastStepTime = schedule.length > 0 ? schedule[schedule.length - 1].atSec : 0;
  const totalDuration = lastStepTime + 60;

  // Determine if we're at "pour time" - timer has reached or passed the current step's scheduled time
  const isActionTime = currentStep && elapsedSec >= currentStep.atSec && !actualPours[currentStepIndex]?.completed;
  const isStepCompleted = actualPours[currentStepIndex]?.completed;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Compact Header: Timer + Controls */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between">
          {/* Timer Display */}
          <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white">
            {formatTimeDisplay(elapsedSec)}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center space-x-2">
            {!isRunning ? (
              <button onClick={handleStart} className="btn btn-primary px-4 py-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : (
              <>
                <button onClick={handlePause} className="btn btn-secondary px-4 py-2">
                  {isPaused ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  )}
                </button>
                <button onClick={handleReset} className="btn btn-secondary px-4 py-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero Action Area */}
      {currentStep && (
        <div className={`card p-6 mb-4 text-center transition-all ${
          isActionTime
            ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-500 animate-pulse'
            : isStepCompleted
            ? 'bg-gray-50 dark:bg-gray-800'
            : 'bg-primary-50 dark:bg-primary-900/20'
        }`}>
          {/* Action State Indicator */}
          {isActionTime ? (
            <div className="text-3xl md:text-4xl font-black text-green-600 dark:text-green-400 mb-3">
              POUR NOW
            </div>
          ) : isStepCompleted ? (
            <div className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-3">
              <span className="inline-flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Step Done
              </span>
            </div>
          ) : nextStep && !isRunning ? (
            <div className="text-xl text-gray-600 dark:text-gray-300 mb-3">
              Ready to brew
            </div>
          ) : null}

          {/* Step Info */}
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {currentStep.label}
          </div>
          <div className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            {settings ? formatVolume(currentStep.volumeMl, settings) : `${currentStep.volumeMl}ml`}
          </div>

          {/* Mark Complete Button */}
          {isRunning && (
            <button
              onClick={() => handleStepComplete(currentStepIndex)}
              disabled={isStepCompleted}
              className={`btn w-full max-w-xs ${
                isStepCompleted
                  ? 'btn-secondary opacity-50 cursor-not-allowed'
                  : isActionTime
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'btn-primary'
              }`}
            >
              {isStepCompleted ? 'Completed' : 'Mark Complete'}
            </button>
          )}
        </div>
      )}

      {/* Compact Next Step Preview */}
      {nextStep && isRunning && !isLastStep && (
        <div className="card p-3 mb-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Next:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {nextStep.label} ({settings ? formatVolume(nextStep.volumeMl, settings) : `${nextStep.volumeMl}ml`})
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              at {formatTimeDisplay(nextStep.atSec)}
            </span>
          </div>
        </div>
      )}

      {/* Visual Timeline */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeline</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStepIndex + 1} of {schedule.length}
          </span>
        </div>

        {/* Timeline Bar - with horizontal padding for edge labels */}
        <div className="relative px-6">
          {/* Background track */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />

          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-2 bg-primary-500 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, (elapsedSec / totalDuration) * 100)}%` }}
          />

          {/* Step markers */}
          {schedule.map((step, index) => {
            const position = (step.atSec / totalDuration) * 100;
            const isCompleted = actualPours[index]?.completed;
            const isCurrent = index === currentStepIndex;
            const isActive = isCurrent && elapsedSec >= step.atSec && !isCompleted;

            return (
              <div
                key={index}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${position}%` }}
              >
                {/* Marker dot */}
                <div
                  className={`w-4 h-4 -ml-2 rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-500'
                      : isActive
                      ? 'bg-green-500 border-green-300 ring-4 ring-green-300/50 animate-pulse'
                      : isCurrent
                      ? 'bg-primary-500 border-primary-300 ring-2 ring-primary-300/50'
                      : elapsedSec >= step.atSec
                      ? 'bg-gray-400 border-gray-400'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
            );
          })}

          {/* Finish marker at end */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: '100%' }}
          >
            <div className={`w-4 h-4 -ml-2 rounded-full border-2 transition-all ${
              elapsedSec >= totalDuration
                ? 'bg-green-500 border-green-500'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
            }`} />
          </div>

          {/* Current time indicator */}
          {isRunning && (
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000"
              style={{ left: `${Math.min(100, (elapsedSec / totalDuration) * 100)}%` }}
            >
              <div className="w-0 h-0 -ml-1.5 -mt-3 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary-600" />
            </div>
          )}
        </div>

        {/* Step labels below timeline */}
        <div className="relative mt-4 h-12 px-6">
          {schedule.map((step, index) => {
            const position = (step.atSec / totalDuration) * 100;
            const isCompleted = actualPours[index]?.completed;
            const isCurrent = index === currentStepIndex;

            // Adjust alignment for edge labels
            const isFirstStep = index === 0;
            const isLastStepLabel = index === schedule.length - 1;
            const textAlign = isFirstStep ? 'left' : isLastStepLabel ? 'right' : 'center';
            const transform = isFirstStep ? 'none' : isLastStepLabel ? 'translateX(-100%)' : 'translateX(-50%)';

            return (
              <div
                key={index}
                className={`absolute transition-all ${
                  isCurrent ? 'font-semibold' : ''
                }`}
                style={{
                  left: `${position}%`,
                  transform,
                  textAlign,
                  maxWidth: '80px'
                }}
              >
                <div className={`text-xs truncate ${
                  isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : isCurrent
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.label}
                </div>
                <div className={`text-xs ${
                  isCompleted
                    ? 'text-green-500 dark:text-green-500'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {formatTimeDisplay(step.atSec)}
                </div>
              </div>
            );
          })}

          {/* Finish label at end */}
          <div
            className="absolute text-right"
            style={{
              left: '100%',
              transform: 'translateX(-100%)',
              maxWidth: '80px'
            }}
          >
            <div className={`text-xs ${
              elapsedSec >= totalDuration
                ? 'text-green-600 dark:text-green-400 font-semibold'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              Finish
            </div>
            <div className={`text-xs ${
              elapsedSec >= totalDuration
                ? 'text-green-500 dark:text-green-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {formatTimeDisplay(totalDuration)}
            </div>
          </div>
        </div>
      </div>

      {/* Finish Brew Button - Always visible when running */}
      {isRunning && (
        <button
          onClick={handleFinish}
          className="btn btn-primary w-full py-3 text-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Finish Brew
        </button>
      )}
    </div>
  );
}
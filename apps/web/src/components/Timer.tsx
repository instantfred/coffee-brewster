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
  const timeToNextStep = nextStep ? Math.max(0, nextStep.atSec - elapsedSec) : 0;

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
          ) : nextStep ? (
            <div className="text-xl text-primary-600 dark:text-primary-400 mb-3">
              Next pour in <span className="font-mono font-bold">{formatTimeDisplay(timeToNextStep)}</span>
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

      {/* Horizontal Step Progress */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {schedule.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  actualPours[index]?.completed
                    ? 'bg-green-500'
                    : index === currentStepIndex
                    ? 'bg-primary-600 ring-2 ring-primary-300'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStepIndex + 1} of {schedule.length}
          </span>
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
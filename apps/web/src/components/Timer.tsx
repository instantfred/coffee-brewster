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

interface ActualPour {
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
  const [showStepAlert, setShowStepAlert] = useState(false);
  
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
            setShowStepAlert(true);
            onStep?.(stepIndex);
            playNotificationSound();
            
            // Auto-hide step alert after 3 seconds
            setTimeout(() => setShowStepAlert(false), 3000);
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
    setShowStepAlert(false);
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
    onFinish(elapsedSec, actualPours);
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

  const getStepProgress = () => {
    const currentStep = getCurrentStep();
    const nextStep = getNextStep();
    
    if (!currentStep) return 100;
    if (!nextStep) return 100;
    
    const stepStart = currentStep.atSec;
    const stepEnd = nextStep.atSec;
    const progress = Math.max(0, Math.min(100, 
      ((elapsedSec - stepStart) / (stepEnd - stepStart)) * 100
    ));
    
    return progress;
  };

  const currentStep = getCurrentStep();
  const nextStep = getNextStep();
  const isLastStep = currentStepIndex >= schedule.length - 1;
  const timeToNextStep = nextStep ? Math.max(0, nextStep.atSec - elapsedSec) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Alert */}
      {showStepAlert && currentStep && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="font-bold">{currentStep.label}</div>
              <div className="text-sm opacity-90">
                {settings ? formatVolume(currentStep.volumeMl, settings) : `${currentStep.volumeMl}ml`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="card p-8">
        <div className="text-center">
          {/* Elapsed Time */}
          <div className="mb-8">
            <div className="text-6xl md:text-8xl font-mono font-bold text-gray-900 dark:text-white mb-2">
              {formatTimeDisplay(elapsedSec)}
            </div>
            <div className="text-lg text-gray-500 dark:text-gray-400">
              Total elapsed time
            </div>
          </div>

          {/* Current Step */}
          {currentStep && (
            <div className="mb-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <div className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-2">
                {currentStep.label}
              </div>
              <div className="text-lg text-primary-700 dark:text-primary-300 mb-4">
                {settings ? formatVolume(currentStep.volumeMl, settings) : `${currentStep.volumeMl}ml`}
              </div>
              
              {/* Progress bar for current step */}
              {nextStep && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${getStepProgress()}%` }}
                  ></div>
                </div>
              )}
              
              <button
                onClick={() => handleStepComplete(currentStepIndex)}
                disabled={actualPours[currentStepIndex]?.completed}
                className={`btn w-full ${
                  actualPours[currentStepIndex]?.completed
                    ? 'btn-secondary opacity-50 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {actualPours[currentStepIndex]?.completed ? '✓ Completed' : 'Mark Complete'}
              </button>
            </div>
          )}

          {/* Next Step Preview */}
          {nextStep && !isLastStep && (
            <div className="mb-8 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Next:</div>
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {nextStep.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                in {formatTimeDisplay(timeToNextStep)}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4 mb-6">
            {!isRunning ? (
              <button onClick={handleStart} className="btn btn-primary text-lg px-8 py-3">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6" />
                </svg>
                Start Timer
              </button>
            ) : (
              <>
                <button onClick={handlePause} className="btn btn-secondary text-lg px-8 py-3">
                  {isPaused ? (
                    <>
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6" />
                      </svg>
                      Resume
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                      </svg>
                      Pause
                    </>
                  )}
                </button>
                <button onClick={handleReset} className="btn btn-secondary text-lg px-8 py-3">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </>
            )}
          </div>

          {/* Finish Button */}
          {isRunning && isLastStep && actualPours.every(pour => pour.completed) && (
            <button onClick={handleFinish} className="btn btn-primary text-lg px-8 py-3 w-full">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Finish Brew
            </button>
          )}
        </div>
      </div>

      {/* Step Overview */}
      <div className="mt-6 card p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Steps Overview
        </h3>
        <div className="space-y-3">
          {schedule.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === currentStepIndex
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                  : actualPours[index]?.completed
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  actualPours[index]?.completed
                    ? 'bg-green-500 text-white'
                    : index === currentStepIndex
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {actualPours[index]?.completed ? '✓' : index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {step.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    at {formatTimeDisplay(step.atSec)} • {settings ? formatVolume(step.volumeMl, settings) : `${step.volumeMl}ml`}
                  </div>
                </div>
              </div>
              
              {actualPours[index]?.completed && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  Done at {formatTimeDisplay(actualPours[index].actualAtSec)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
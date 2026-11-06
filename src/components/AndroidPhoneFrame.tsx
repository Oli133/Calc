import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Volume2, VolumeX, Smartphone, Monitor, RotateCw } from 'lucide-react';
import { ThemeColors } from '../types/calculator';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  theme: ThemeColors;
  isLandscape: boolean;
  onToggleLandscape: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isStandaloneFrame: boolean;
  onToggleFrame: () => void;
  onHistoryClick: () => void;
  onConverterClick: () => void;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  theme,
  isLandscape,
  onToggleLandscape,
  soundEnabled,
  onToggleSound,
  isStandaloneFrame,
  onToggleFrame,
  onHistoryClick,
  onConverterClick,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMins = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTime(`${hours}:${formattedMins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Controls Toolbar outside the phone */}
      <div className="w-full max-w-xl flex items-center justify-between gap-3 mb-4 px-2 text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
          <button
            onClick={onToggleFrame}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              isStandaloneFrame ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle between Phone Mockup and Frameless View"
          >
            {isStandaloneFrame ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            <span>{isStandaloneFrame ? 'Phone Frame' : 'Edge-to-Edge'}</span>
          </button>
          
          <button
            onClick={onToggleLandscape}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              isLandscape ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Rotate Device Orientation"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isLandscape ? 'Landscape' : 'Portrait'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-800/80 border-slate-700 text-amber-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Key Clicks & Haptics: ON' : 'Key Clicks & Haptics: MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Container: either Phone Mockup or Frameless Edge-to-Edge */}
      <div
        className={`relative transition-all duration-300 ${
          isStandaloneFrame
            ? isLandscape
              ? 'w-full max-w-3xl aspect-[19.5/9] rounded-[44px] p-3 shadow-2xl border-4 border-slate-800/80'
              : 'w-full max-w-[400px] h-[820px] rounded-[52px] p-3 shadow-2xl border-4 border-slate-800/80'
            : isLandscape
            ? 'w-full max-w-4xl rounded-2xl p-4 border border-slate-800'
            : 'w-full max-w-md rounded-2xl p-4 border border-slate-800'
        }`}
        style={{
          backgroundColor: isStandaloneFrame ? theme.phoneBody : theme.bgSurface,
          boxShadow: isStandaloneFrame ? '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.06)' : undefined,
        }}
      >
        {/* Hardware side buttons when phone frame is active */}
        {isStandaloneFrame && !isLandscape && (
          <>
            {/* Power Button */}
            <div className="absolute -right-2 top-28 w-1 h-12 bg-slate-700/80 rounded-r-sm" />
            {/* Volume Up / Down Rocker */}
            <div className="absolute -right-2 top-44 w-1 h-24 bg-slate-700/80 rounded-r-sm" />
          </>
        )}

        {/* Screen Bezel and Inner Glass */}
        <div
          className={`relative w-full h-full overflow-hidden flex flex-col justify-between ${
            isStandaloneFrame ? (isLandscape ? 'rounded-[34px]' : 'rounded-[40px]') : 'rounded-xl'
          }`}
          style={{ backgroundColor: theme.bgSurface }}
        >
          {/* Android Status Bar */}
          {isStandaloneFrame && (
            <div className="w-full pt-3 px-6 pb-1 flex items-center justify-between text-xs font-medium text-slate-300 shrink-0 z-20 select-none">
              <span className="tabular-nums font-semibold tracking-tight">{currentTime}</span>

              {/* Pixel Center Punch-Hole Camera */}
              {!isLandscape && (
                <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800/80 shadow-inner flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900/90" />
                </div>
              )}

              <div className="flex items-center gap-1.5 opacity-90">
                <span className="text-[10px] font-semibold tracking-wider">5G</span>
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-1">
                  <Battery className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* Screen Content (Display + Keypad) */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            {children}
          </div>

          {/* Android Navigation Gesture Pill */}
          {isStandaloneFrame && (
            <div className="w-full pb-2 pt-1 flex items-center justify-center shrink-0 z-20">
              <div className="w-32 h-1 bg-slate-400/40 rounded-full hover:bg-slate-400/70 transition-colors cursor-pointer" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

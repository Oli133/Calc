import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { TopNav } from './components/TopNav';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { CalculatorKeypad } from './components/CalculatorKeypad';
import { ScientificPanel } from './components/ScientificPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { UnitConverterModal } from './components/UnitConverterModal';
import { ThemeSelector } from './components/ThemeSelector';
import { NoGradleWorkbench } from './components/NoGradleWorkbench';
import { AngleMode, HistoryItem, ThemeId } from './types/calculator';
import { THEMES } from './data/themes';
import { evaluateExpression } from './utils/mathEvaluator';
import { playKeySound } from './utils/audioFeedback';
import { NO_GRADLE_PROJECT_FILES } from './data/noGradleFiles';
import { Smartphone, Terminal, Sparkles, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'calculator' | 'no-gradle'>('calculator');
  const [expression, setExpression] = useState<string>('');
  const [ghostResult, setGhostResult] = useState<string>('');
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [themeId, setThemeId] = useState<ThemeId>('charcoal');

  // Scientific & Device States
  const [isInv, setIsInv] = useState<boolean>(false);
  const [isScientificExpanded, setIsScientificExpanded] = useState<boolean>(false);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isStandaloneFrame, setIsStandaloneFrame] = useState<boolean>(true);

  // Drawers & Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isConverterOpen, setIsConverterOpen] = useState<boolean>(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);

  // History list
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'init-1',
      expression: '128 × 24',
      result: '3,072',
      timestamp: Date.now() - 3600000,
    },
    {
      id: 'init-2',
      expression: 'sin(30) + cos(60)',
      result: '1',
      timestamp: Date.now() - 1800000,
    },
  ]);

  const currentTheme = THEMES[themeId] || THEMES.charcoal;

  // Live ghost calculation preview as the user types
  useEffect(() => {
    if (!expression || isEvaluated) {
      setGhostResult('');
      return;
    }
    const { result, error } = evaluateExpression(expression, angleMode);
    if (!error && result && result !== expression) {
      setGhostResult(result);
    } else {
      setGhostResult('');
    }
  }, [expression, angleMode, isEvaluated]);

  // Keypad Handlers
  const handleInput = useCallback(
    (char: string) => {
      playKeySound(
        ['+', '−', '×', '÷'].includes(char) ? 'operator' : 'num',
        soundEnabled
      );

      if (isEvaluated) {
        // If an operator is typed right after evaluation, continue from the previous answer
        if (['+', '−', '×', '÷', '^', '%'].includes(char)) {
          setExpression(ghostResult ? ghostResult.replace(/,/g, '') + char : char);
        } else {
          setExpression(char);
        }
        setIsEvaluated(false);
      } else {
        setExpression((prev) => prev + char);
      }
    },
    [isEvaluated, ghostResult, soundEnabled]
  );

  const handleClear = useCallback(() => {
    playKeySound('delete', soundEnabled);
    setExpression('');
    setGhostResult('');
    setIsEvaluated(false);
  }, [soundEnabled]);

  const handleBackspace = useCallback(() => {
    playKeySound('delete', soundEnabled);
    if (isEvaluated) {
      setExpression('');
      setGhostResult('');
      setIsEvaluated(false);
    } else {
      setExpression((prev) => prev.slice(0, -1));
    }
  }, [isEvaluated, soundEnabled]);

  const handleEvaluate = useCallback(() => {
    if (!expression.trim()) return;
    playKeySound('equal', soundEnabled);

    const { result, error } = evaluateExpression(expression, angleMode);
    if (!error && result) {
      const finalVal = result;
      setGhostResult(finalVal);
      setIsEvaluated(true);

      // Add to history
      const newItem: HistoryItem = {
        id: 'hist-' + Date.now(),
        expression,
        result: finalVal,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
    } else {
      setGhostResult('Error');
      setIsEvaluated(true);
    }
  }, [expression, angleMode, soundEnabled]);

  const handleParenthesis = useCallback(() => {
    playKeySound('action', soundEnabled);
    let openCount = 0;
    let closeCount = 0;
    for (const c of expression) {
      if (c === '(') openCount++;
      if (c === ')') closeCount++;
    }

    if (openCount > closeCount && expression.length > 0) {
      const last = expression.slice(-1);
      if (/\d|\)/.test(last)) {
        setExpression((prev) => prev + ')');
        return;
      }
    }
    setExpression((prev) => prev + '(');
    setIsEvaluated(false);
  }, [expression, soundEnabled]);

  const handleInsertScientific = useCallback(
    (token: string) => {
      playKeySound('action', soundEnabled);
      if (isEvaluated) {
        setExpression(token);
        setIsEvaluated(false);
      } else {
        setExpression((prev) => prev + token);
      }
    },
    [isEvaluated, soundEnabled]
  );

  // Physical Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === '.') {
        handleInput('.');
      } else if (e.key === '+') {
        handleInput('+');
      } else if (e.key === '-') {
        handleInput('−');
      } else if (e.key === '*') {
        handleInput('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (e.key === '%') {
        handleInput('%');
      } else if (e.key === '(' || e.key === ')') {
        handleInput(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleEvaluate, handleBackspace, handleClear]);

  // Export ZIP helper
  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();
      NO_GRADLE_PROJECT_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'android-calculator-no-gradle.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export ZIP', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Bar following contract */}
      <TopNav
        activeView={activeView}
        onSelectView={setActiveView}
        onDownloadProject={handleDownloadZip}
      />

      {/* Hero Strip & View Switcher */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Android 14/15 Material You</span>
              <span aria-hidden="true">·</span>
              <span>Standalone CLI Compilation</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-medium">Zero Gradle Overhead</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Android Calculator Application
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveView('calculator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'calculator'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Live Calculator</span>
              </button>
              <button
                onClick={() => setActiveView('no-gradle')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'no-gradle'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Without Gradle Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col items-center">
        {activeView === 'calculator' ? (
          <div className="w-full flex flex-col items-center">
            {/* The Android Phone Mockup / Canvas */}
            <AndroidPhoneFrame
              theme={currentTheme}
              isLandscape={isLandscape}
              onToggleLandscape={() => setIsLandscape((prev) => !prev)}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled((prev) => !prev)}
              isStandaloneFrame={isStandaloneFrame}
              onToggleFrame={() => setIsStandaloneFrame((prev) => !prev)}
              onHistoryClick={() => setIsHistoryOpen(true)}
              onConverterClick={() => setIsConverterOpen(true)}
            >
              {/* Display Section */}
              <CalculatorDisplay
                expression={expression}
                ghostResult={ghostResult}
                isEvaluated={isEvaluated}
                angleMode={angleMode}
                onToggleAngleMode={() => setAngleMode((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'))}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onOpenConverter={() => setIsConverterOpen(true)}
                onOpenThemes={() => setIsThemeSelectorOpen(true)}
                theme={currentTheme}
              />

              {/* Landscape vs Portrait Layout */}
              {isLandscape ? (
                <div className="grid grid-cols-2 gap-2 p-2 border-t border-white/5">
                  <div className="h-full flex flex-col justify-end">
                    <ScientificPanel
                      isInv={isInv}
                      onToggleInv={() => setIsInv((prev) => !prev)}
                      onInsert={handleInsertScientific}
                      theme={currentTheme}
                      isExpanded={true}
                      onToggleExpand={() => {}}
                      isLandscape={true}
                    />
                  </div>
                  <div>
                    <CalculatorKeypad
                      onInput={handleInput}
                      onClear={handleClear}
                      onBackspace={handleBackspace}
                      onEvaluate={handleEvaluate}
                      onParenthesis={handleParenthesis}
                      theme={currentTheme}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Scientific Panel Drawer */}
                  <ScientificPanel
                    isInv={isInv}
                    onToggleInv={() => setIsInv((prev) => !prev)}
                    onInsert={handleInsertScientific}
                    theme={currentTheme}
                    isExpanded={isScientificExpanded}
                    onToggleExpand={() => setIsScientificExpanded((prev) => !prev)}
                    isLandscape={false}
                  />

                  {/* Standard Keypad */}
                  <CalculatorKeypad
                    onInput={handleInput}
                    onClear={handleClear}
                    onBackspace={handleBackspace}
                    onEvaluate={handleEvaluate}
                    onParenthesis={handleParenthesis}
                    theme={currentTheme}
                  />
                </div>
              )}

              {/* Modals inside Phone Bezel */}
              <HistoryDrawer
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                onSelectHistory={(item) => {
                  setExpression(item.result.replace(/,/g, ''));
                  setIsEvaluated(false);
                }}
                onClearHistory={() => setHistory([])}
                theme={currentTheme}
              />

              <UnitConverterModal
                isOpen={isConverterOpen}
                onClose={() => setIsConverterOpen(false)}
                theme={currentTheme}
              />

              <ThemeSelector
                isOpen={isThemeSelectorOpen}
                onClose={() => setIsThemeSelectorOpen(false)}
                currentThemeId={themeId}
                onSelectTheme={setThemeId}
                theme={currentTheme}
              />
            </AndroidPhoneFrame>

            {/* Quick Context Card below simulator */}
            <div className="w-full max-w-xl mt-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-white font-semibold">Native Android SDK Implementation</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Written in pure Java using <code className="text-amber-300">android.app.Activity</code> and <code className="text-amber-300">android.widget.*</code> with zero third-party Maven/Gradle packages.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveView('no-gradle')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold transition-colors shrink-0 whitespace-nowrap"
              >
                Inspect CLI Build →
              </button>
            </div>
          </div>
        ) : (
          <NoGradleWorkbench />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-xs text-slate-500 text-center flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <span>Android Calculator (No Gradle) · Built with standard Android SDK CLI toolchain</span>
        <span>AAPT2 · javac · D8 · zipalign · apksigner</span>
      </footer>
    </div>
  );
}

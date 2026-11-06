import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Terminal,
  Play,
  Download,
  Copy,
  Check,
  FileCode,
  FolderTree,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Info,
  RotateCcw,
} from 'lucide-react';
import { BUILD_STEPS, NO_GRADLE_PROJECT_FILES, ProjectFile } from '../data/noGradleFiles';

export const NoGradleWorkbench: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(NO_GRADLE_PROJECT_FILES[0]);
  const [copiedFile, setCopiedFile] = useState(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'code' | 'guide'>('pipeline');

  // Simulation state
  const [isRunningBuild, setIsRunningBuild] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '# Android Standalone Build System (WITHOUT Gradle)',
    '# Ready. Press "Run Build Pipeline" to execute AAPT2, javac, D8, zipalign & apksigner.',
  ]);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(selectedFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const runBuildSimulation = async () => {
    if (isRunningBuild) return;
    setIsRunningBuild(true);
    setActiveStepIndex(0);
    setCompletedSteps([]);
    setTerminalLogs([
      '$ ./build.sh',
      '==========================================',
      ' Building Android Calculator WITHOUT Gradle',
      '==========================================',
      '[+] Checking environment: ANDROID_HOME=/opt/android-sdk',
      '[+] Using Platform JAR: platforms/android-34/android.jar',
      '[+] Build tools found: aapt2, javac, d8, zipalign, apksigner',
      'rm -rf build gen && mkdir -p build/compiled_res build/classes gen',
    ]);

    for (let i = 0; i < BUILD_STEPS.length; i++) {
      setActiveStepIndex(i);
      const step = BUILD_STEPS[i];
      // Append step start
      await new Promise((r) => setTimeout(r, 600));

      setTerminalLogs((prev) => [
        ...prev,
        '',
        `--> [Step ${step.number}/5] ${step.name}`,
        `$ ${step.command}`,
        ...step.expectedOutput.split('\n'),
      ]);

      setCompletedSteps((prev) => [...prev, i]);
      await new Promise((r) => setTimeout(r, 400));
    }

    setActiveStepIndex(-1);
    setIsRunningBuild(false);
    setTerminalLogs((prev) => [
      ...prev,
      '',
      '========================================================',
      ' [SUCCESS] Standalone APK built in 489ms WITHOUT Gradle!',
      ' Output: build/Calculator.apk (24,190 bytes / 23.6 KB)',
      '========================================================',
      'Ready to install: adb install -r build/Calculator.apk',
    ]);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      const zip = new JSZip();

      // Add project files to zip
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
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase">Architecture & Tooling</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Pure Android SDK CLI</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            How to Build Android Without Gradle
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Gradle is merely an orchestrator. Android compiles using 5 native CLI tools: <code className="text-amber-300 font-mono">aapt2</code>, <code className="text-amber-300 font-mono">javac</code>, <code className="text-amber-300 font-mono">d8</code>, <code className="text-amber-300 font-mono">zipalign</code>, and <code className="text-amber-300 font-mono">apksigner</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={runBuildSimulation}
            disabled={isRunningBuild}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              isRunningBuild
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
            }`}
          >
            {isRunningBuild ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Compiling (Step {activeStepIndex + 1}/5)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Build Pipeline</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isExportingZip}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Download full project folder with build.sh ready to run"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingZip ? 'Packing...' : 'Download Project ZIP'}</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'pipeline' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Build Pipeline & Terminal</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'code' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Source Code & Scripts ({NO_GRADLE_PROJECT_FILES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'guide' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Deep-Dive Guide</span>
        </button>
      </div>

      {/* Tab 1: Build Pipeline & Terminal */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 5 Pipeline Stages */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              The 5 Direct Platform Stages
            </h3>

            <div className="space-y-2.5">
              {BUILD_STEPS.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                const isDone = completedSteps.includes(idx);

                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                        : isDone
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isActive
                              ? 'bg-amber-400 text-slate-950 animate-pulse'
                              : isDone
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{step.name}</span>
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                              {step.tool}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{step.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Out: {step.outputFiles[0]}</span>
                      {isDone && <span className="text-emerald-400 font-sans font-medium">Completed</span>}
                      {isActive && <span className="text-amber-400 font-sans font-medium">Running...</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Speed Comparison Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 mt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Build Speed & Memory Benchmark</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-slate-400">Without Gradle (CLI)</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">~0.48 sec</div>
                  <div className="text-[10px] text-slate-500 mt-1">45 MB RAM usage</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="text-slate-400">With Gradle & Daemon</div>
                  <div className="text-lg font-bold text-slate-300 mt-0.5 font-mono">~18.4 sec</div>
                  <div className="text-[10px] text-slate-500 mt-1">1.8 GB RAM daemon</div>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="lg:col-span-7 flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">bash terminal (./build.sh)</span>
              </div>

              <button
                onClick={() =>
                  setTerminalLogs([
                    '# Terminal logs cleared.',
                    '# Click "Run Build Pipeline" to simulate AAPT2, javac, and D8.',
                  ])
                }
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Terminal Stream */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto max-h-[560px] space-y-1 scrollbar-thin">
              {terminalLogs.map((log, i) => {
                const isCommand = log.startsWith('$');
                const isError = log.includes('ERROR') || log.includes('[-]');
                const isSuccess = log.includes('SUCCESS') || log.includes('[+]');
                const isHeader = log.startsWith('==');
                const isComment = log.startsWith('#');

                return (
                  <div
                    key={i}
                    className={`${
                      isCommand
                        ? 'text-amber-300 font-semibold pt-1'
                        : isSuccess
                        ? 'text-emerald-400 font-semibold'
                        : isError
                        ? 'text-rose-400 font-semibold'
                        : isHeader
                        ? 'text-sky-400 font-semibold'
                        : isComment
                        ? 'text-slate-500'
                        : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Source Code & Scripts Explorer */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Tree List */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <FolderTree className="w-4 h-4 text-amber-400" />
              <span>Project Files</span>
            </div>

            <div className="space-y-1">
              {NO_GRADLE_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs font-semibold truncate">{file.path}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {file.language}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 truncate">{file.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
            {/* File Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-sm text-white font-medium">{selectedFile.path}</span>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
              >
                {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Body */}
            <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[580px] leading-relaxed scrollbar-thin select-text">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Deep-Dive Technical Guide */}
      {activeTab === 'guide' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-4xl">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">How Android Compiles Without Gradle</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              When you click "Build" in Android Studio, Gradle does not actually compile Java or create the APK. Gradle is merely a task scheduler that invokes the underlying Android SDK binaries. By calling these binaries directly in a shell script, you achieve lightning-fast builds without heavy dependencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Layers className="w-4 h-4" />
                <span>1. Resource Linking (AAPT2)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Android XML layouts cannot be read in raw text on the device. AAPT2 parses XML, generates binary protobuf representations, assigns unique 32-bit integer IDs (e.g., <code className="text-amber-300">0x7f040001</code>), and generates <code className="text-amber-300">R.java</code> so your Java code can reference <code className="text-amber-300">R.id.btnEquals</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Cpu className="w-4 h-4" />
                <span>2. D8 Dexing</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard JVMs execute stack-based bytecode (.class files). Android's ART (Android Runtime) executes register-based bytecode packed in <code className="text-amber-300">classes.dex</code>. The D8 compiler performs desugaring and register allocation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>3. Zipalign & Apksigner</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                <code className="text-amber-300">zipalign</code> aligns all uncompressed data on 4-byte boundaries so the Android OS can mmap() the APK directly from flash memory without copying. Then, <code className="text-amber-300">apksigner</code> signs with cryptographic schemes v2/v3.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Zap className="w-4 h-4" />
                <span>4. Running on Your Machine</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                To build this exact project locally, download the ZIP using the button above. Ensure <code className="text-amber-300">ANDROID_HOME</code> points to your Android SDK, then execute <code className="text-amber-300">./build.sh</code>. It builds in under 1 second!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

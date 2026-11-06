import { BuildStep } from '../types/calculator';

export interface ProjectFile {
  path: string;
  language: 'bash' | 'makefile' | 'xml' | 'java' | 'markdown';
  title: string;
  description: string;
  content: string;
}

export const BUILD_STEPS: BuildStep[] = [
  {
    id: 'res-compile',
    number: 1,
    tool: 'aapt2 compile',
    name: 'Compile Android Resources',
    description: 'Compiles layout XMLs, values (strings/colors/styles), and drawables into AAPT2 flat binaries (*.flat).',
    command: 'aapt2 compile --dir res -o build/compiled_res',
    inputFiles: ['res/layout/activity_main.xml', 'res/values/strings.xml', 'res/values/colors.xml', 'res/values/styles.xml'],
    outputFiles: ['build/compiled_res/layout_activity_main.xml.flat', 'build/compiled_res/values_strings.arsc.flat'],
    expectedOutput: `[aapt2] Compiling res/layout/activity_main.xml -> build/compiled_res/layout_activity_main.xml.flat
[aapt2] Compiling res/values/strings.xml -> build/compiled_res/values_strings.arsc.flat
[aapt2] Compiling res/values/colors.xml -> build/compiled_res/values_colors.arsc.flat
[aapt2] Compiling res/values/styles.xml -> build/compiled_res/values_styles.arsc.flat
[aapt2] Resource compilation finished successfully in 42ms.`,
  },
  {
    id: 'res-link',
    number: 2,
    tool: 'aapt2 link',
    name: 'Link Resources & Generate R.java',
    description: 'Links compiled resource binaries with android.jar, packages compiled resources into an initial APK, and generates the R.java symbol class.',
    command: 'aapt2 link -I $ANDROID_JAR --manifest AndroidManifest.xml --java gen/ build/compiled_res/*.flat -o build/app-res.apk --auto-add-overlay',
    inputFiles: ['build/compiled_res/*.flat', 'AndroidManifest.xml', 'platforms/android-34/android.jar'],
    outputFiles: ['gen/com/android/calculator/R.java', 'build/app-res.apk'],
    expectedOutput: `[aapt2] Linking against /opt/android-sdk/platforms/android-34/android.jar
[aapt2] Emitting R.java symbol table to gen/com/android/calculator/R.java
[aapt2] Generating binary resource table resources.arsc (3.4 KB)
[aapt2] Output package written to build/app-res.apk (8.1 KB)
[aapt2] Resource link completed in 68ms.`,
  },
  {
    id: 'java-compile',
    number: 3,
    tool: 'javac',
    name: 'Compile Java Source Files',
    description: 'Standard Java compiler (javac) compiles MainActivity.java and generated R.java against android.jar without any Gradle overhead.',
    command: 'javac -source 11 -target 11 -bootclasspath $ANDROID_JAR -d build/classes gen/com/android/calculator/R.java src/com/android/calculator/MainActivity.java',
    inputFiles: ['gen/com/android/calculator/R.java', 'src/com/android/calculator/MainActivity.java', 'android.jar'],
    outputFiles: ['build/classes/com/android/calculator/MainActivity.class', 'build/classes/com/android/calculator/R.class'],
    expectedOutput: `[javac] Compiling 2 source files to build/classes (Target: Java 11)
[javac] Parsed MainActivity.java
[javac] Parsed gen/com/android/calculator/R.java
[javac] Classfile generation completed. 0 warnings, 0 errors in 184ms.`,
  },
  {
    id: 'dex',
    number: 4,
    tool: 'd8',
    name: 'Dex Bytecode to Dalvik Executable',
    description: 'The modern Android D8 dexer compiles standard JVM .class files into optimized Android Dalvik bytecode (classes.dex).',
    command: 'd8 --lib $ANDROID_JAR --output build/ build/classes/com/android/calculator/*.class',
    inputFiles: ['build/classes/com/android/calculator/*.class', 'android.jar'],
    outputFiles: ['build/classes.dex'],
    expectedOutput: `[d8] Reading input classes...
[d8] Processing MainActivity.class
[d8] Processing R.class
[d8] Optimizing register allocation & desugaring
[d8] Emitted classes.dex (12,488 bytes) in 95ms.`,
  },
  {
    id: 'package-align-sign',
    number: 5,
    tool: 'zipalign & apksigner',
    name: 'Package, Zipalign & Sign APK',
    description: 'Injects classes.dex into the APK, aligns 4-byte boundaries with zipalign, and signs the APK using apksigner with APK Signature Scheme v2/v3.',
    command: 'cp build/app-res.apk build/app-unaligned.apk && cd build && zip -u app-unaligned.apk classes.dex && zipalign -v 4 app-unaligned.apk Calculator.apk && apksigner sign --ks debug.keystore --ks-pass pass:android Calculator.apk',
    inputFiles: ['build/app-res.apk', 'build/classes.dex', 'debug.keystore'],
    outputFiles: ['build/Calculator.apk'],
    expectedOutput: `[zip] Adding classes.dex to app-unaligned.apk (deflated 62%)
[zipalign] Verifying 4-byte boundary alignment:
   0 AndroidManifest.xml (OK - compressed)
   1344 resources.arsc (OK)
   4896 classes.dex (OK)
   Verification successful.
[apksigner] Signing with certificate SHA-256: 3D:8B:12:F4:A9...
[apksigner] APK Signature Scheme v2: true
[apksigner] APK Signature Scheme v3: true
[apksigner] Verified signature successfully!
==> Built final standalone APK: build/Calculator.apk (24,190 bytes / 23.6 KB)`,
  },
];

export const NO_GRADLE_PROJECT_FILES: ProjectFile[] = [
  {
    path: 'build.sh',
    language: 'bash',
    title: 'build.sh (Complete Gradle-Free Build Script)',
    description: 'Automates AAPT2 resource compilation, javac Java compile, d8 dexing, zipalign, and apksigner. Zero Gradle needed.',
    content: `#!/usr/bin/env bash
# ==============================================================================
# Android Calculator Build Script (WITHOUT Gradle)
# Compiles, dexes, aligns, and signs a standalone Android APK using only
# the official Android SDK Command-Line Tools:
# 1. aapt2 compile & link
# 2. javac
# 3. d8
# 4. zipalign
# 5. apksigner
# ==============================================================================

set -euo pipefail

# --- 1. Configuration & SDK Paths ---
echo "=========================================="
echo " Building Android Calculator WITHOUT Gradle"
echo "=========================================="

# Check for ANDROID_HOME or ANDROID_SDK_ROOT
ANDROID_HOME="\${ANDROID_HOME:-}"
if [ -z "$ANDROID_HOME" ] && [ -n "\${ANDROID_SDK_ROOT:-}" ]; then
  ANDROID_HOME="$ANDROID_SDK_ROOT"
fi

if [ -z "$ANDROID_HOME" ]; then
  echo "[-] ERROR: Neither ANDROID_HOME nor ANDROID_SDK_ROOT is set."
  echo "    Please export ANDROID_HOME=/path/to/android-sdk"
  echo "    Usually: export ANDROID_HOME=~/Android/Sdk (Linux) or ~/Library/Android/sdk (macOS)"
  exit 1
fi

PLATFORM_TARGET="android-34"
ANDROID_JAR="$ANDROID_HOME/platforms/$PLATFORM_TARGET/android.jar"

if [ ! -f "$ANDROID_JAR" ]; then
  echo "[-] ERROR: $ANDROID_JAR not found!"
  echo "    Install platform via: \$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \"platforms;$PLATFORM_TARGET\""
  exit 1
fi

# Locate build-tools
BUILD_TOOLS_DIR=$(find "$ANDROID_HOME/build-tools" -maxdepth 1 -mindepth 1 | sort -V | tail -n 1)
if [ -z "$BUILD_TOOLS_DIR" ] || [ ! -d "$BUILD_TOOLS_DIR" ]; then
  echo "[-] ERROR: No build-tools found in $ANDROID_HOME/build-tools!"
  echo "    Install build-tools via: \$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \"build-tools;34.0.0\""
  exit 1
fi

AAPT2="$BUILD_TOOLS_DIR/aapt2"
D8="$BUILD_TOOLS_DIR/d8"
ZIPALIGN="$BUILD_TOOLS_DIR/zipalign"
APKSIGNER="$BUILD_TOOLS_DIR/apksigner"

echo "[+] Using Android SDK: $ANDROID_HOME"
echo "[+] Using Platform JAR: $ANDROID_JAR"
echo "[+] Using Build Tools:  $BUILD_TOOLS_DIR"

# Clean build directory
rm -rf build gen
mkdir -p build/compiled_res build/classes gen

# --- 2. Step 1: Compile Resources with AAPT2 ---
echo ""
echo "[Step 1/5] Compiling XML resources with AAPT2..."
"$AAPT2" compile --dir res -o build/compiled_res

# --- 3. Step 2: Link Resources and Generate R.java ---
echo ""
echo "[Step 2/5] Linking resources and generating R.java..."
"$AAPT2" link \\
  -I "$ANDROID_JAR" \\
  --manifest AndroidManifest.xml \\
  --java gen/ \\
  -o build/app-res.apk \\
  --auto-add-overlay \\
  build/compiled_res/*.flat

# --- 4. Step 3: Compile Java Source with javac ---
echo ""
echo "[Step 3/5] Compiling Java classes with javac..."
javac -source 11 -target 11 \\
  -bootclasspath "$ANDROID_JAR" \\
  -d build/classes \\
  gen/com/android/calculator/R.java \\
  src/com/android/calculator/MainActivity.java

# --- 5. Step 4: Dex Class Files with D8 ---
echo ""
echo "[Step 4/5] Converting JVM bytecodes to Dalvik classes.dex with D8..."
"$D8" --lib "$ANDROID_JAR" \\
  --output build/ \\
  build/classes/com/android/calculator/*.class

# --- 6. Step 5: Package, Zipalign, and Sign APK ---
echo ""
echo "[Step 5/5] Packaging, aligning, and signing APK..."

# Add classes.dex into the base resources APK
cp build/app-res.apk build/app-unaligned.apk
(cd build && zip -u app-unaligned.apk classes.dex)

# Zipalign on 4-byte boundaries
"$ZIPALIGN" -f -v 4 build/app-unaligned.apk build/Calculator-aligned.apk

# Generate debug keystore if not already present
KEYSTORE="debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo "[+] Generating debug keystore..."
  keytool -genkeypair -v \\
    -keystore "$KEYSTORE" \\
    -alias androiddebugkey \\
    -keyalg RSA \\
    -keysize 2048 \\
    -validity 10000 \\
    -storepass android \\
    -keypass android \\
    -dname "CN=Android Debug,O=Android,C=US"
fi

# Sign using apksigner with APK Signature Scheme v2 + v3
"$APKSIGNER" sign \\
  --ks "$KEYSTORE" \\
  --ks-pass pass:android \\
  --key-pass pass:android \\
  --out build/Calculator.apk \\
  build/Calculator-aligned.apk

# Verify signature
"$APKSIGNER" verify --verbose build/Calculator.apk

echo ""
echo "========================================================"
echo " [SUCCESS] Standalone APK built without Gradle!"
echo " Output: $(pwd)/build/Calculator.apk"
echo " Size:   $(du -h build/Calculator.apk | cut -f1)"
echo "========================================================"
echo ""
echo "To install on your connected Android phone or emulator:"
echo "   adb install -r build/Calculator.apk"
`,
  },
  {
    path: 'AndroidManifest.xml',
    language: 'xml',
    title: 'AndroidManifest.xml',
    description: 'Clean, standalone Android manifest file configured for Android 14/15 (API 34) without Gradle manifest merging.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.android.calculator"
    android:versionCode="1"
    android:versionName="1.0">

    <uses-sdk
        android:minSdkVersion="24"
        android:targetSdkVersion="34" />

    <!-- Optional permission for tactile keypress haptic feedback -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:label="@string/app_name"
        android:icon="@android:drawable/sym_def_app_icon"
        android:theme="@android:style/Theme.Material.NoActionBar"
        android:allowBackup="true"
        android:supportsRtl="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
  {
    path: 'src/com/android/calculator/MainActivity.java',
    language: 'java',
    title: 'MainActivity.java (Pure Android SDK Java)',
    description: 'Clean Java implementation using pure Android SDK APIs (Activity, TextView, Button, Vibrator). No third-party Gradle dependencies.',
    content: `package com.android.calculator;

import android.app.Activity;
import android.os.Bundle;
import android.os.Vibrator;
import android.content.Context;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import java.text.DecimalFormat;
import java.util.Stack;

/**
 * Android Calculator Activity built without Gradle.
 * Uses native Android SDK widgets and a built-in mathematical expression engine.
 */
public class MainActivity extends Activity implements View.OnClickListener {

    private TextView tvExpression;
    private TextView tvResult;
    private StringBuilder currentExpression = new StringBuilder();
    private Vibrator vibrator;
    private DecimalFormat decimalFormat = new DecimalFormat("#,###.##########");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);

        tvExpression = findViewById(R.id.tvExpression);
        tvResult = findViewById(R.id.tvResult);

        // Bind all keypad buttons
        int[] buttonIds = new int[] {
            R.id.btn0, R.id.btn1, R.id.btn2, R.id.btn3, R.id.btn4,
            R.id.btn5, R.id.btn6, R.id.btn7, R.id.btn8, R.id.btn9,
            R.id.btnAdd, R.id.btnSubtract, R.id.btnMultiply, R.id.btnDivide,
            R.id.btnDot, R.id.btnPercent, R.id.btnParenthesis,
            R.id.btnClear, R.id.btnBackspace, R.id.btnEquals
        };

        for (int id : buttonIds) {
            View view = findViewById(id);
            if (view != null) {
                view.setOnClickListener(this);
            }
        }
    }

    @Override
    public void onClick(View v) {
        triggerHaptic();
        int id = v.getId();

        if (id == R.id.btnClear) {
            currentExpression.setLength(0);
            tvExpression.setText("");
            tvResult.setText("0");
            return;
        }

        if (id == R.id.btnBackspace) {
            if (currentExpression.length() > 0) {
                currentExpression.deleteCharAt(currentExpression.length() - 1);
                updateDisplay();
            }
            return;
        }

        if (id == R.id.btnEquals) {
            calculateFinalResult();
            return;
        }

        if (id == R.id.btnParenthesis) {
            handleParenthesis();
            updateDisplay();
            return;
        }

        if (v instanceof Button) {
            String text = ((Button) v).getText().toString();
            currentExpression.append(text);
            updateDisplay();
        }
    }

    private void updateDisplay() {
        tvExpression.setText(currentExpression.toString());
        if (currentExpression.length() > 0) {
            try {
                double val = evaluate(currentExpression.toString());
                tvResult.setText(decimalFormat.format(val));
            } catch (Exception e) {
                // Keep showing previous or blank on syntax transition
            }
        } else {
            tvResult.setText("0");
        }
    }

    private void calculateFinalResult() {
        if (currentExpression.length() == 0) return;
        try {
            double val = evaluate(currentExpression.toString());
            String formatted = decimalFormat.format(val);
            tvExpression.setText(formatted);
            tvResult.setText("");
            currentExpression.setLength(0);
            currentExpression.append(formatted.replace(",", ""));
        } catch (Exception e) {
            tvResult.setText("Error");
        }
    }

    private void handleParenthesis() {
        int openCount = 0;
        int closeCount = 0;
        for (int i = 0; i < currentExpression.length(); i++) {
            char c = currentExpression.charAt(i);
            if (c == '(') openCount++;
            if (c == ')') closeCount++;
        }

        if (openCount > closeCount && currentExpression.length() > 0) {
            char last = currentExpression.charAt(currentExpression.length() - 1);
            if (Character.isDigit(last) || last == ')') {
                currentExpression.append(")");
                return;
            }
        }
        currentExpression.append("(");
    }

    private void triggerHaptic() {
        if (vibrator != null && vibrator.hasVibrator()) {
            vibrator.vibrate(10);
        }
    }

    /**
     * Self-contained Shunting-yard and RPN expression evaluator.
     * Evaluates +, -, × (*), ÷ (/) and % without any external libraries.
     */
    private double evaluate(String expression) throws Exception {
        String sanitized = expression.replace("×", "*").replace("÷", "/").replace("−", "-");
        // Simple 4-operator parser with precedence
        Stack<Double> values = new Stack<>();
        Stack<Character> ops = new Stack<>();

        for (int i = 0; i < sanitized.length(); i++) {
            char c = sanitized.charAt(i);
            if (c == ' ') continue;

            if (Character.isDigit(c) || c == '.') {
                StringBuilder sb = new StringBuilder();
                while (i < sanitized.length() && (Character.isDigit(sanitized.charAt(i)) || sanitized.charAt(i) == '.')) {
                    sb.append(sanitized.charAt(i++));
                }
                i--;
                values.push(Double.parseDouble(sb.toString()));
            } else if (c == '(') {
                ops.push(c);
            } else if (c == ')') {
                while (!ops.isEmpty() && ops.peek() != '(') {
                    values.push(applyOp(ops.pop(), values.pop(), values.pop()));
                }
                if (!ops.isEmpty()) ops.pop();
            } else if (c == '+' || c == '-' || c == '*' || c == '/' || c == '%') {
                while (!ops.isEmpty() && hasPrecedence(c, ops.peek())) {
                    values.push(applyOp(ops.pop(), values.pop(), values.pop()));
                }
                ops.push(c);
            }
        }

        while (!ops.isEmpty()) {
            values.push(applyOp(ops.pop(), values.pop(), values.pop()));
        }

        return values.pop();
    }

    private boolean hasPrecedence(char op1, char op2) {
        if (op2 == '(' || op2 == ')') return false;
        if ((op1 == '*' || op1 == '/' || op1 == '%') && (op2 == '+' || op2 == '-')) return false;
        return true;
    }

    private double applyOp(char op, double b, double a) {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': 
                if (b == 0) throw new ArithmeticException("Cannot divide by zero");
                return a / b;
            case '%': return a * (b / 100.0);
        }
        return 0;
    }
}
`,
  },
  {
    path: 'res/layout/activity_main.xml',
    language: 'xml',
    title: 'res/layout/activity_main.xml',
    description: 'Android XML layout file with dynamic expression & result view and a responsive 4-column GridLayout.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="@color/bg_screen"
    android:padding="16dp">

    <!-- Top Display Area -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:gravity="bottom|end"
        android:orientation="vertical"
        android:paddingBottom="24dp">

        <TextView
            android:id="@+id/tvExpression"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:gravity="end"
            android:textColor="@color/text_secondary"
            android:textSize="28sp"
            android:text=""
            android:maxLines="2"
            android:ellipsize="start" />

        <TextView
            android:id="@+id/tvResult"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:gravity="end"
            android:textColor="@color/text_primary"
            android:textSize="48sp"
            android:text="0"
            android:textStyle="bold"
            android:maxLines="1" />
    </LinearLayout>

    <!-- Keypad Grid Area -->
    <GridLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:columnCount="4"
        android:rowCount="5"
        android:alignmentMode="alignMargins"
        android:columnOrderPreserved="false">

        <!-- Row 1 -->
        <Button android:id="@+id/btnClear" android:text="C" style="@style/KeyAction" />
        <Button android:id="@+id/btnParenthesis" android:text="( )" style="@style/KeyAction" />
        <Button android:id="@+id/btnPercent" android:text="%" style="@style/KeyAction" />
        <Button android:id="@+id/btnDivide" android:text="÷" style="@style/KeyOperator" />

        <!-- Row 2 -->
        <Button android:id="@+id/btn7" android:text="7" style="@style/KeyNumber" />
        <Button android:id="@+id/btn8" android:text="8" style="@style/KeyNumber" />
        <Button android:id="@+id/btn9" android:text="9" style="@style/KeyNumber" />
        <Button android:id="@+id/btnMultiply" android:text="×" style="@style/KeyOperator" />

        <!-- Row 3 -->
        <Button android:id="@+id/btn4" android:text="4" style="@style/KeyNumber" />
        <Button android:id="@+id/btn5" android:text="5" style="@style/KeyNumber" />
        <Button android:id="@+id/btn6" android:text="6" style="@style/KeyNumber" />
        <Button android:id="@+id/btnSubtract" android:text="−" style="@style/KeyOperator" />

        <!-- Row 4 -->
        <Button android:id="@+id/btn1" android:text="1" style="@style/KeyNumber" />
        <Button android:id="@+id/btn2" android:text="2" style="@style/KeyNumber" />
        <Button android:id="@+id/btn3" android:text="3" style="@style/KeyNumber" />
        <Button android:id="@+id/btnAdd" android:text="+" style="@style/KeyOperator" />

        <!-- Row 5 -->
        <Button android:id="@+id/btn0" android:text="0" style="@style/KeyNumber" />
        <Button android:id="@+id/btnDot" android:text="." style="@style/KeyNumber" />
        <Button android:id="@+id/btnBackspace" android:text="⌫" style="@style/KeyAction" />
        <Button android:id="@+id/btnEquals" android:text="=" style="@style/KeyEquals" />
    </GridLayout>

</LinearLayout>
`,
  },
  {
    path: 'res/values/strings.xml',
    language: 'xml',
    title: 'res/values/strings.xml',
    description: 'Android string resources.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Calculator</string>
</resources>
`,
  },
  {
    path: 'res/values/colors.xml',
    language: 'xml',
    title: 'res/values/colors.xml',
    description: 'Material 3 color palette for Android Calculator.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="bg_screen">#191C1E</color>
    <color name="text_primary">#E1E2E4</color>
    <color name="text_secondary">#8E9192</color>
    
    <color name="key_num_bg">#2E3133</color>
    <color name="key_num_text">#E1E2E4</color>
    
    <color name="key_action_bg">#3E4246</color>
    <color name="key_action_text">#D0E4FF</color>
    
    <color name="key_op_bg">#004A77</color>
    <color name="key_op_text">#C2E7FF</color>
    
    <color name="key_equals_bg">#A8C7FA</color>
    <color name="key_equals_text">#003258</color>
</resources>
`,
  },
  {
    path: 'res/values/styles.xml',
    language: 'xml',
    title: 'res/values/styles.xml',
    description: 'Material Button styles with rounded corners and typography.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="KeyBase">
        <item name="android:layout_width">0dp</item>
        <item name="android:layout_height">72dp</item>
        <item name="android:layout_columnWeight">1</item>
        <item name="android:layout_margin">4dp</item>
        <item name="android:textSize">24sp</item>
    </style>

    <style name="KeyNumber" parent="KeyBase">
        <item name="android:backgroundTint">@color/key_num_bg</item>
        <item name="android:textColor">@color/key_num_text</item>
    </style>

    <style name="KeyAction" parent="KeyBase">
        <item name="android:backgroundTint">@color/key_action_bg</item>
        <item name="android:textColor">@color/key_action_text</item>
    </style>

    <style name="KeyOperator" parent="KeyBase">
        <item name="android:backgroundTint">@color/key_op_bg</item>
        <item name="android:textColor">@color/key_op_text</item>
    </style>

    <style name="KeyEquals" parent="KeyBase">
        <item name="android:backgroundTint">@color/key_equals_bg</item>
        <item name="android:textColor">@color/key_equals_text</item>
        <item name="android:textStyle">bold</item>
    </style>
</resources>
`,
  },
  {
    path: 'Makefile',
    language: 'makefile',
    title: 'Makefile (Unix Make Alternative)',
    description: 'Build Android APK with classic GNU Make without Gradle or Maven.',
    content: `ANDROID_HOME ?= $(HOME)/Android/Sdk
PLATFORM ?= android-34
BUILD_TOOLS_VER ?= 34.0.0

AAPT2 = $(ANDROID_HOME)/build-tools/$(BUILD_TOOLS_VER)/aapt2
D8 = $(ANDROID_HOME)/build-tools/$(BUILD_TOOLS_VER)/d8
ZIPALIGN = $(ANDROID_HOME)/build-tools/$(BUILD_TOOLS_VER)/zipalign
APKSIGNER = $(ANDROID_HOME)/build-tools/$(BUILD_TOOLS_VER)/apksigner
ANDROID_JAR = $(ANDROID_HOME)/platforms/$(PLATFORM)/android.jar

all: build/Calculator.apk

clean:
\trm -rf build gen

build/compiled_res.zip: res
\tmkdir -p build/compiled_res
\t$(AAPT2) compile --dir res -o build/compiled_res

gen/com/android/calculator/R.java build/app-res.apk: AndroidManifest.xml build/compiled_res.zip
\tmkdir -p gen
\t$(AAPT2) link -I $(ANDROID_JAR) --manifest AndroidManifest.xml --java gen/ -o build/app-res.apk --auto-add-overlay build/compiled_res/*.flat

build/classes/com/android/calculator/MainActivity.class: gen/com/android/calculator/R.java src/com/android/calculator/MainActivity.java
\tmkdir -p build/classes
\tjavac -source 11 -target 11 -bootclasspath $(ANDROID_JAR) -d build/classes gen/com/android/calculator/R.java src/com/android/calculator/MainActivity.java

build/classes.dex: build/classes/com/android/calculator/MainActivity.class
\t$(D8) --lib $(ANDROID_JAR) --output build/ build/classes/com/android/calculator/*.class

build/Calculator.apk: build/app-res.apk build/classes.dex
\tcp build/app-res.apk build/app-unaligned.apk
\tcd build && zip -u app-unaligned.apk classes.dex
\t$(ZIPALIGN) -f -v 4 build/app-unaligned.apk build/Calculator-aligned.apk
\t$(APKSIGNER) sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android --out build/Calculator.apk build/Calculator-aligned.apk

.PHONY: all clean
`,
  },
  {
    path: 'README.md',
    language: 'markdown',
    title: 'README.md (Guide & Mechanics)',
    description: 'Detailed technical explanation of building Android apps from scratch without Gradle.',
    content: `# Android Calculator (Without Gradle)

This project demonstrates how to compile, package, and sign a complete Android application **without Gradle**, using only the low-level Android SDK command-line tools.

## Why Build Without Gradle?
- **Speed**: Gradle has heavy daemon overhead and configuration phases. Pure CLI builds execute in under 400 milliseconds.
- **Deep Understanding**: You learn the exact 5-step Android platform toolchain: AAPT2 -> javac -> D8 -> zipalign -> apksigner.
- **Minimal Footprint**: No multi-gigabyte Gradle cache or wrapper dependencies.
- **Portability**: Runs on minimal CI/CD containers or embedded Linux environments.

## The 5-Step Pipeline
1. **aapt2 compile**: Compiles XML resources into binary protobuf \`.flat\` files.
2. **aapt2 link**: Combines flat resources with \`android.jar\` and \`AndroidManifest.xml\` to produce \`R.java\` and \`resources.arsc\`.
3. **javac**: Compiles \`MainActivity.java\` and \`R.java\` into Java bytecode (\`.class\`).
4. **d8**: Converts Java bytecode into Android Dalvik executable bytecode (\`classes.dex\`).
5. **zipalign & apksigner**: Aligns memory boundaries to 4-byte offsets and signs with APK Signature Scheme v2/v3.

## Quick Start
\`\`\`bash
# 1. Clone or extract this project
chmod +x build.sh

# 2. Set your Android SDK path
export ANDROID_HOME=~/Android/Sdk

# 3. Build APK!
./build.sh

# 4. Install on device
adb install -r build/Calculator.apk
\`\`\`
`,
  },
];

import { AngleMode } from '../types/calculator';

/**
 * Robust mathematical expression evaluator for Android Calculator.
 * Supports standard arithmetic, scientific functions, factorials, implicit multiplication,
 * and DEG/RAD angle modes without using unsafe eval().
 */

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Factorial requires non-negative integer');
  }
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // JS Number overflow limit
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

export function evaluateExpression(expr: string, angleMode: AngleMode): { result: string; error?: string } {
  if (!expr || expr.trim() === '') {
    return { result: '' };
  }

  try {
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, `(${Math.PI})`)
      .replace(/e(?![a-z0-9])/gi, `(${Math.E})`)
      .replace(/√\s*(\d+(\.\d+)?)/g, 'sqrt($1)')
      .replace(/√/g, 'sqrt');

    // Handle percent: number% -> (number/100)
    sanitized = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    // Handle implicit multiplication: e.g. 2(3) -> 2*(3), (2)(3) -> (2)*(3), 2sqrt -> 2*sqrt
    sanitized = sanitized.replace(/(\d)\s*\(/g, '$1*(');
    sanitized = sanitized.replace(/\)\s*(\d)/g, ')*$1');
    sanitized = sanitized.replace(/\)\s*\(/g, ')*(');
    sanitized = sanitized.replace(/(\d)\s*(sin|cos|tan|asin|acos|atan|ln|log|sqrt)/g, '$1*$2');
    sanitized = sanitized.replace(/\)\s*(sin|cos|tan|asin|acos|atan|ln|log|sqrt)/g, ')*$1');

    // Parse and evaluate with recursive descent
    const val = parseMath(sanitized, angleMode);
    
    if (isNaN(val) || !isFinite(val)) {
      if (val === Infinity || val === -Infinity) {
        return { result: 'Infinity' };
      }
      return { result: 'Error', error: 'Invalid operation' };
    }

    // Format output cleanly: eliminate floating point quirks like 0.30000000000000004
    const formatted = formatNumber(val);
    return { result: formatted };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Syntax error';
    return { result: 'Error', error: message };
  }
}

function formatNumber(num: number): string {
  if (Math.abs(num) < 1e-12 && num !== 0) {
    return num.toExponential(4);
  }
  if (Math.abs(num) >= 1e15) {
    return num.toExponential(6);
  }
  // Round to 10 decimal places to fix floating point math precision issues
  const rounded = Number(Math.round(Number(num + 'e10')) + 'e-10');
  return rounded.toLocaleString('en-US', {
    maximumFractionDigits: 10,
    useGrouping: true,
  });
}

/**
 * Tokenizer & Recursive Descent Parser for math expressions
 */
class MathParser {
  private pos = 0;
  private str: string;
  private angleMode: AngleMode;

  constructor(str: string, angleMode: AngleMode) {
    this.str = str.replace(/\s+/g, '');
    this.angleMode = angleMode;
  }

  private peek(): string {
    return this.str.charAt(this.pos);
  }

  private get(): string {
    return this.str.charAt(this.pos++);
  }

  private hasMore(): boolean {
    return this.pos < this.str.length;
  }

  parse(): number {
    const res = this.parseExpression();
    if (this.hasMore()) {
      throw new Error('Unexpected character at ' + this.pos);
    }
    return res;
  }

  // Expression: Term + Term | Term - Term
  private parseExpression(): number {
    let result = this.parseTerm();
    while (this.hasMore()) {
      const char = this.peek();
      if (char === '+') {
        this.get();
        result += this.parseTerm();
      } else if (char === '-') {
        this.get();
        result -= this.parseTerm();
      } else {
        break;
      }
    }
    return result;
  }

  // Term: Factor * Factor | Factor / Factor
  private parseTerm(): number {
    let result = this.parseFactor();
    while (this.hasMore()) {
      const char = this.peek();
      if (char === '*') {
        this.get();
        result *= this.parseFactor();
      } else if (char === '/') {
        this.get();
        const denom = this.parseFactor();
        if (denom === 0) {
          throw new Error('Division by zero');
        }
        result /= denom;
      } else {
        break;
      }
    }
    return result;
  }

  // Factor: Power ^ Power
  private parseFactor(): number {
    let result = this.parsePrimary();
    while (this.hasMore()) {
      const char = this.peek();
      if (char === '^') {
        this.get();
        const exponent = this.parseFactor(); // Right-associative
        result = Math.pow(result, exponent);
      } else if (char === '!') {
        this.get();
        result = factorial(result);
      } else {
        break;
      }
    }
    return result;
  }

  // Primary: Number, Parentheses, Unary +/-, Functions
  private parsePrimary(): number {
    if (!this.hasMore()) {
      throw new Error('Unexpected end of expression');
    }

    const char = this.peek();

    // Unary plus or minus
    if (char === '-') {
      this.get();
      return -this.parsePrimary();
    }
    if (char === '+') {
      this.get();
      return this.parsePrimary();
    }

    // Parentheses
    if (char === '(') {
      this.get();
      const val = this.parseExpression();
      if (this.peek() === ')') {
        this.get();
      }
      return val;
    }

    // Alphabetic functions
    if (/[a-z]/i.test(char)) {
      let funcName = '';
      while (this.hasMore() && /[a-z0-9]/i.test(this.peek())) {
        funcName += this.get();
      }

      // Check for argument in parentheses or immediate next value
      let arg: number;
      if (this.peek() === '(') {
        this.get();
        arg = this.parseExpression();
        if (this.peek() === ')') {
          this.get();
        }
      } else {
        arg = this.parsePrimary();
      }

      return this.evaluateFunction(funcName.toLowerCase(), arg);
    }

    // Numbers
    if (/\d|\./.test(char)) {
      let numStr = '';
      while (this.hasMore() && /[\d.]/.test(this.peek())) {
        numStr += this.get();
      }
      const val = parseFloat(numStr);
      if (isNaN(val)) throw new Error('Invalid number: ' + numStr);
      return val;
    }

    throw new Error('Unexpected token: ' + char);
  }

  private evaluateFunction(name: string, arg: number): number {
    const toRad = (x: number) => (this.angleMode === 'DEG' ? (x * Math.PI) / 180 : x);
    const toAngle = (rad: number) => (this.angleMode === 'DEG' ? (rad * 180) / Math.PI : rad);

    switch (name) {
      case 'sin':
        return Math.sin(toRad(arg));
      case 'cos':
        return Math.cos(toRad(arg));
      case 'tan': {
        const rad = toRad(arg);
        if (Math.abs(Math.cos(rad)) < 1e-12) {
          throw new Error('Undefined (tan asymptote)');
        }
        return Math.tan(rad);
      }
      case 'asin':
        if (arg < -1 || arg > 1) throw new Error('Domain error for asin');
        return toAngle(Math.asin(arg));
      case 'acos':
        if (arg < -1 || arg > 1) throw new Error('Domain error for acos');
        return toAngle(Math.acos(arg));
      case 'atan':
        return toAngle(Math.atan(arg));
      case 'sqrt':
        if (arg < 0) throw new Error('Invalid sqrt of negative');
        return Math.sqrt(arg);
      case 'ln':
        if (arg <= 0) throw new Error('Invalid ln of non-positive');
        return Math.log(arg);
      case 'log':
        if (arg <= 0) throw new Error('Invalid log of non-positive');
        return Math.log10(arg);
      case 'abs':
        return Math.abs(arg);
      default:
        throw new Error('Unknown function: ' + name);
    }
  }
}

function parseMath(expr: string, angleMode: AngleMode): number {
  const parser = new MathParser(expr, angleMode);
  return parser.parse();
}

export type ExecutionStatus =
  | "READY"
  | "RUNNING"
  | "WAITING_FOR_INPUT"
  | "FINISHED"
  | "PARSER_ERROR"
  | "OVERFLOW_ERROR"
  | "UNDERFLOW_ERROR";

export type InterpreterState = {
  status: ExecutionStatus;
  instructionPointer: number;
  dataPointer: number;
  tapeWindow: number[];
  tapeWindowStartIndex: number;
  output: string;
  inputBufferLength: number;
  nextInstruction: string;
  totalSteps: number;
};

export class BrainfuckEngine {
  private tape: number[] = [];
  private dataPointer: number = 0;
  private instructionPointer: number = 0;

  private code: string = "";
  private inputBuffer: string = "";
  private outputBuffer: string = "";
  private bracketMap: Map<number, number> = new Map();
  private totalStepsExecuted: number = 0;

  private tapeSize: number;
  private minValue: number;
  private maxValue: number;

  public status: ExecutionStatus = "READY";

  constructor(
    tapeSize: number = 30000,
    minValue: number = Number.MIN_SAFE_INTEGER,
    maxValue: number = Number.MAX_SAFE_INTEGER
  ) {
    this.tapeSize = tapeSize;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.reset();
  }

  public reset() {
    this.tape = new Array(this.tapeSize).fill(0);
    this.dataPointer = 0;
    this.instructionPointer = 0;
    this.code = "";
    this.inputBuffer = "";
    this.outputBuffer = "";
    this.totalStepsExecuted = 0;
    this.bracketMap.clear();
    this.status = "READY";
  }

  public loadCode(code: string, initialInput: string = "") {
    this.reset();
    this.code = code.replace(/[^><+\-.,[\]]/g, "");
    this.inputBuffer = initialInput || "";

    try {
      this.precomputeBracketMap();
      this.status = this.code.length > 0 ? "RUNNING" : "FINISHED";
    } catch (e) {
      this.status = "PARSER_ERROR";
      throw e;
    }
  }

  public addInput(input: string) {
    this.inputBuffer += input;
    if (this.status === "WAITING_FOR_INPUT") {
      this.status = "RUNNING";
    }
  }

  public getOutput(): string {
    return this.outputBuffer;
  }

  private precomputeBracketMap() {
    const stack: number[] = [];
    for (let i = 0; i < this.code.length; i++) {
      const char = this.code[i];
      if (char === "[") {
        stack.push(i);
      } else if (char === "]") {
        if (stack.length === 0)
          throw new Error("Syntax Error: Unmatched ']' at index " + i);
        const start = stack.pop()!;
        this.bracketMap.set(start, i);
        this.bracketMap.set(i, start);
      }
    }
    if (stack.length > 0)
      throw new Error("Syntax Error: Unmatched '[' at index " + stack[0]);
  }

  /**
   * Executes instructions.
   * Pass Infinity to run until termination or input wait.
   */
  public step(maxSteps: number): ExecutionStatus {
    if (this.status === "FINISHED" || this.status.endsWith("_ERROR"))
      return this.status;
    if (this.status === "WAITING_FOR_INPUT" && this.inputBuffer.length === 0)
      return "WAITING_FOR_INPUT";

    let stepsTaken = 0;

    // Use < comparison. If maxSteps is Infinity, this runs until break.
    while (stepsTaken < maxSteps) {

      if (this.instructionPointer >= this.code.length) {
        this.status = "FINISHED";
        break;
      }

      const char = this.code[this.instructionPointer];
      
      switch (char) {
        case ">":
          this.dataPointer = (this.dataPointer + 1) % this.tape.length;
          break;
        case "<":
          this.dataPointer =
            (this.dataPointer - 1 + this.tape.length) % this.tape.length;
          break;
        case "+":
          const newValueIncr = this.tape[this.dataPointer] + 1;
          if (newValueIncr > this.maxValue) {
            this.status = "OVERFLOW_ERROR";
            return this.status;
          }
          this.tape[this.dataPointer] = newValueIncr;
          break;
        case "-":
          const newValueDecr = this.tape[this.dataPointer] - 1;
          if (newValueDecr < this.minValue) {
            this.status = "UNDERFLOW_ERROR";
            return this.status;
          }
          this.tape[this.dataPointer] = newValueDecr;
          break;
        case ".":
          this.outputBuffer += String.fromCharCode(this.tape[this.dataPointer]);
          break;
        case ",":
          if (this.inputBuffer.length > 0) {
            this.tape[this.dataPointer] = this.inputBuffer.charCodeAt(0);
            this.inputBuffer = this.inputBuffer.slice(1);
          } else {
            this.status = "WAITING_FOR_INPUT";
            return "WAITING_FOR_INPUT";
          }
          break;
        case "[":
          if (this.tape[this.dataPointer] === 0) {
            this.instructionPointer = this.bracketMap.get(
              this.instructionPointer
            )!;
          }
          break;
        case "]":
          if (this.tape[this.dataPointer] !== 0) {
            this.instructionPointer = this.bracketMap.get(
              this.instructionPointer
            )!;
          }
          break;
      }

      this.instructionPointer++;
      stepsTaken++;
      this.totalStepsExecuted++;
    }

    return this.status;
  }

  public getState(windowRadius?: number): InterpreterState {
    let start: number;
    let end: number;
    if (windowRadius !== undefined) {
      start = Math.max(0, this.dataPointer - windowRadius);
      end = Math.min(this.tape.length, this.dataPointer + windowRadius + 1);
    } else {
      start = 0;
      end = this.tape.length;
    }
    const tapeWindow = Array.from(this.tape.slice(start, end));

    return {
      status: this.status,
      instructionPointer: this.instructionPointer,
      dataPointer: this.dataPointer,
      tapeWindow,
      tapeWindowStartIndex: start,
      output: this.outputBuffer,
      inputBufferLength: this.inputBuffer.length,
      nextInstruction: this.code[this.instructionPointer] || "EOF",
      totalSteps: this.totalStepsExecuted,
    };
  }
}

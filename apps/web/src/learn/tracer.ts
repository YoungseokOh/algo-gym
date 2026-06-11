import type { ArrayFrame, ArrayHighlight, Pointer } from "./types.ts";

export function randomArray(length: number, max = 99, min = 5): number[] {
  return Array.from({ length }, () => min + Math.floor(Math.random() * (max - min + 1)));
}

export function randomSortedArray(length: number, max = 99, min = 1): number[] {
  return randomArray(length, max, min).sort((a, b) => a - b);
}

type StepOptions = {
  line: number;
  message: string;
  highlights?: Partial<Record<number, ArrayHighlight>>;
  pointers?: Pointer[];
  vars?: Record<string, string | number>;
};

export class ArrayTracer {
  readonly frames: ArrayFrame[] = [];
  private persistent: Partial<Record<number, ArrayHighlight>> = {};

  constructor(public a: number[]) {}

  mark(index: number, role: ArrayHighlight): void {
    this.persistent[index] = role;
  }

  markRange(from: number, to: number, role: ArrayHighlight): void {
    for (let i = from; i <= to; i++) {
      this.persistent[i] = role;
    }
  }

  clearMarks(): void {
    this.persistent = {};
  }

  swap(i: number, j: number): void {
    [this.a[i], this.a[j]] = [this.a[j], this.a[i]];
  }

  step(options: StepOptions): void {
    this.frames.push({
      kind: "array",
      values: [...this.a],
      highlights: { ...this.persistent, ...(options.highlights ?? {}) },
      pointers: options.pointers ?? [],
      codeLine: options.line,
      message: options.message,
      vars: options.vars
    });
  }
}

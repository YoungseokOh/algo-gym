import type { ArrayFrame, ArrayHighlight, Frame, Pointer } from "./types.ts";

/**
 * 답을 너무 빨리 찾은 실행은 보여줄 단계가 거의 없으므로 입력을 다시 뽑는다.
 * 모든 시도가 짧더라도 그중 가장 긴 실행을 반환해, 감사 스크립트의
 * 최소 프레임 수 검사가 확률적으로 실패하는 일을 막는다.
 */
export function withEnoughSteps(build: () => Frame[], minFrames = 8): Frame[] {
  let longest: Frame[] = [];
  for (let attempt = 0; attempt < 10; attempt++) {
    const frames = build();
    if (frames.length >= minFrames) return frames;
    if (frames.length > longest.length) longest = frames;
  }
  return longest;
}

export function randomArray(length: number, max = 99, min = 5): number[] {
  return Array.from({ length }, () => min + Math.floor(Math.random() * (max - min + 1)));
}

export function randomSortedArray(length: number, max = 99, min = 1): number[] {
  return randomArray(length, max, min).sort((a, b) => a - b);
}

/** [from..to] 구간을 한 가지 역할로 칠한 하이라이트 맵을 만든다. */
export function rangeHighlights(
  from: number,
  to: number,
  role: ArrayHighlight
): Partial<Record<number, ArrayHighlight>> {
  const highlights: Partial<Record<number, ArrayHighlight>> = {};
  for (let i = from; i <= to; i++) highlights[i] = role;
  return highlights;
}

/** 흩어진 인덱스들을 한 가지 역할로 칠한 하이라이트 맵을 만든다. */
export function indexHighlights(
  indices: Iterable<number>,
  role: ArrayHighlight
): Partial<Record<number, ArrayHighlight>> {
  const highlights: Partial<Record<number, ArrayHighlight>> = {};
  for (const i of indices) highlights[i] = role;
  return highlights;
}

type StepOptions = {
  line: number;
  message: string;
  highlights?: Partial<Record<number, ArrayHighlight>>;
  pointers?: Pointer[];
  vars?: Record<string, string | number>;
  sublabels?: Partial<Record<number, string>>;
};

export class ArrayTracer<T extends number | string = number> {
  readonly frames: ArrayFrame[] = [];
  private persistent: Partial<Record<number, ArrayHighlight>> = {};
  private persistentSublabels: Partial<Record<number, string>> = {};

  constructor(
    public a: T[],
    private display: "bars" | "boxes" = "bars"
  ) {}

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

  setSublabel(index: number, label: string): void {
    this.persistentSublabels[index] = label;
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
      vars: options.vars,
      display: this.display,
      sublabels: { ...this.persistentSublabels, ...(options.sublabels ?? {}) }
    });
  }
}

export type ArrayHighlight =
  | "compare"
  | "swap"
  | "sorted"
  | "pivot"
  | "window"
  | "found"
  | "active"
  | "discard";

export type Pointer = {
  index: number;
  label: string;
};

export type ArrayFrame = {
  kind: "array";
  values: number[];
  highlights: Partial<Record<number, ArrayHighlight>>;
  pointers: Pointer[];
  codeLine: number;
  message: string;
  vars?: Record<string, string | number>;
};

export type CellState =
  | "empty"
  | "wall"
  | "start"
  | "goal"
  | "frontier"
  | "visited"
  | "current"
  | "path";

export type GridFrame = {
  kind: "grid";
  cells: CellState[][];
  codeLine: number;
  message: string;
  vars?: Record<string, string | number>;
};

export type Frame = ArrayFrame | GridFrame;

export type AlgorithmCategory = "정렬" | "탐색" | "배열 테크닉" | "그래프 탐색";

export type AlgorithmDef = {
  id: string;
  title: string;
  koTitle: string;
  category: AlgorithmCategory;
  difficulty: "기초" | "중급";
  summary: string;
  insight: string[];
  complexity: {
    time: string;
    space: string;
    note?: string;
  };
  code: string[];
  createFrames: () => Frame[];
};

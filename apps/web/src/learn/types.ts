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
  values: Array<number | string>;
  highlights: Partial<Record<number, ArrayHighlight>>;
  pointers: Pointer[];
  codeLine: number;
  message: string;
  vars?: Record<string, string | number>;
  /** "bars"(기본): 막대 그래프, "boxes": 값 상자 — 음수/문자/포인터 중심 시각화용 */
  display?: "bars" | "boxes";
  /** 각 인덱스 아래에 표시할 보조 라벨 (dp 값, next 방향 화살표 등) */
  sublabels?: Partial<Record<number, string>>;
};

export type CellState =
  | "empty"
  | "wall"
  | "start"
  | "goal"
  | "frontier"
  | "visited"
  | "current"
  | "path"
  | "header";

export type GridFrame = {
  kind: "grid";
  cells: CellState[][];
  codeLine: number;
  message: string;
  vars?: Record<string, string | number>;
  /** 셀 안에 표시할 텍스트 (DP 값, 거리, 문자 등) */
  labels?: Array<Array<string | number | null>>;
  /** 범례를 알고리즘 문맥에 맞게 교체 (미로 탐색 기본 범례 대신) */
  legend?: Array<{ state: CellState; label: string }>;
};

export type Frame = ArrayFrame | GridFrame;

export type AlgorithmCategory =
  | "정렬"
  | "탐색"
  | "배열 테크닉"
  | "자료구조"
  | "동적 계획법"
  | "그리디"
  | "그래프 탐색"
  | "백트래킹";

export type AlgorithmDef = {
  id: string;
  title: string;
  koTitle: string;
  category: AlgorithmCategory;
  difficulty: "기초" | "중급" | "고급";
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

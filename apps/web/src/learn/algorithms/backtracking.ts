import type { AlgorithmDef, CellState, Frame, GridFrame } from "../types.ts";

const QUEENS_LEGEND: Array<{ state: CellState; label: string }> = [
  { state: "path", label: "배치된 퀸" },
  { state: "current", label: "시도 중" },
  { state: "goal", label: "충돌!" },
  { state: "frontier", label: "공격받는 칸" }
];

export const nQueens: AlgorithmDef = {
  id: "n-queens",
  title: "Backtracking (N-Queens)",
  koTitle: "백트래킹 — N-퀸",
  category: "백트래킹",
  difficulty: "고급",
  summary: "퀸을 한 행씩 놓아 보고, 막히면 직전 선택을 무르고(backtrack) 다른 칸을 시도합니다. 완전 탐색 + 가지치기의 정수입니다.",
  insight: [
    "LeetCode 51. 백트래킹의 3요소가 모두 보입니다: 선택(열 고르기) → 재귀(다음 행) → 선택 취소(퀸 제거).",
    "행마다 퀸을 정확히 하나 놓으므로 '행 충돌'은 구조적으로 불가능하고, 열과 두 대각선만 검사하면 됩니다.",
    "유망하지 않은 가지를 일찍 자르는 것(pruning)이 핵심입니다 — isSafe가 false면 그 아래의 모든 경우를 통째로 건너뜁니다.",
    "대각선 충돌 판정은 |행 차이| = |열 차이|. 집합 3개(열, r+c, r-c)로 O(1) 판정으로 최적화할 수도 있습니다.",
    "순열/조합 생성, 스도쿠, 단어 찾기(Word Search) 등 '모든 경우를 체계적으로 탐색'하는 문제는 전부 이 골격입니다."
  ],
  complexity: { time: "O(n!)", space: "O(n)", note: "가지치기 덕분에 실제 탐색량은 훨씬 적음" },
  code: [
    "function solve(row: number): boolean {",
    "  if (row === n) return true; // 모든 행 완료",
    "  for (let col = 0; col < n; col++) {",
    "    if (!isSafe(row, col)) continue; // 가지치기",
    "    queens[row] = col;     // 선택",
    "    if (solve(row + 1)) return true; // 재귀",
    "    queens[row] = -1;      // 선택 취소 (백트래킹)",
    "  }",
    "  return false;",
    "}",
    "function isSafe(row: number, col: number) {",
    "  for (let r = 0; r < row; r++) {",
    "    const c = queens[r];",
    "    if (c === col) return false;",
    "    if (Math.abs(c - col) === row - r) return false;",
    "  }",
    "  return true;",
    "}"
  ],
  createFrames(): Frame[] {
    const n = 6;
    const queens = new Array<number>(n).fill(-1);
    const frames: Frame[] = [];
    let attempts = 0;

    const makeFrame = (
      line: number,
      message: string,
      options: {
        trying?: [number, number];
        conflict?: [number, number];
        attacked?: Array<[number, number]>;
        vars?: Record<string, string | number>;
      } = {}
    ): GridFrame => {
      const cells: CellState[][] = Array.from({ length: n }, () => new Array<CellState>(n).fill("empty"));
      const labels: Array<Array<string | number | null>> = Array.from({ length: n }, () => new Array(n).fill(null));
      for (let r = 0; r < n; r++) {
        if (queens[r] >= 0) {
          cells[r][queens[r]] = "path";
          labels[r][queens[r]] = "♛";
        }
      }
      for (const [r, c] of options.attacked ?? []) {
        if (cells[r][c] === "empty") cells[r][c] = "frontier";
      }
      if (options.trying) {
        const [r, c] = options.trying;
        cells[r][c] = "current";
        labels[r][c] = "♛";
      }
      if (options.conflict) {
        const [r, c] = options.conflict;
        cells[r][c] = "goal";
        labels[r][c] = "♛";
      }
      return {
        kind: "grid",
        cells,
        labels,
        codeLine: line,
        message,
        vars: { ...options.vars, "시도 횟수": attempts },
        legend: QUEENS_LEGEND
      };
    };

    const findConflict = (row: number, col: number): [number, number] | null => {
      for (let r = 0; r < row; r++) {
        const c = queens[r];
        if (c === col || Math.abs(c - col) === row - r) return [r, c];
      }
      return null;
    };

    frames.push(makeFrame(0, `${n}×${n} 체스판에 퀸 ${n}개를 서로 공격하지 못하게 놓습니다. 0행부터 차례로 시도합니다.`));

    const solve = (row: number): boolean => {
      if (row === n) return true;
      for (let col = 0; col < n; col++) {
        attempts++;
        const conflict = findConflict(row, col);
        if (conflict) {
          frames.push(
            makeFrame(3, `(${row}, ${col})은 (${conflict[0]}, ${conflict[1]})의 퀸과 충돌합니다. 이 가지를 통째로 건너뜁니다.`, {
              conflict: [row, col],
              attacked: [conflict],
              vars: { row, col }
            })
          );
          continue;
        }
        queens[row] = col;
        frames.push(
          makeFrame(4, `(${row}, ${col})은 안전합니다. 퀸을 놓고 다음 행으로 내려갑니다.`, {
            vars: { row, col, "배치된 퀸": row + 1 }
          })
        );
        if (solve(row + 1)) return true;
        queens[row] = -1;
        frames.push(
          makeFrame(6, `${row + 1}행에서 모든 열이 막혔습니다. (${row}, ${col})의 퀸을 거두고 다른 열을 시도합니다 — 백트래킹!`, {
            vars: { row, "배치된 퀸": row }
          })
        );
      }
      return false;
    };

    const solved = solve(0);
    frames.push(
      makeFrame(
        1,
        solved
          ? `해를 찾았습니다! 퀸 배치: [${queens.join(", ")}] (각 행의 열 위치). 총 ${attempts}번의 시도로 ${n}! = 720가지를 다 보지 않고 끝냈습니다.`
          : "해가 존재하지 않습니다.",
        { vars: { 해: `[${queens.join(", ")}]` } }
      )
    );
    return frames;
  }
};

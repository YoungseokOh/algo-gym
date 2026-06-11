import { ArrayTracer, randomArray } from "../tracer.ts";
import type { AlgorithmDef, CellState, Frame, GridFrame } from "../types.ts";

export const climbingStairs: AlgorithmDef = {
  id: "climbing-stairs",
  title: "DP Basics (Climbing Stairs)",
  koTitle: "DP 입문 — 계단 오르기",
  category: "동적 계획법",
  difficulty: "기초",
  summary: "n번째 계단에 도달하는 방법 수 = (n-1)에서 1칸 + (n-2)에서 2칸. 작은 답을 쌓아 큰 답을 만듭니다.",
  insight: [
    "LeetCode 70. dp[i] = dp[i-1] + dp[i-2] — 사실상 피보나치 수열입니다.",
    "DP의 두 조건이 모두 보입니다: 최적 부분 구조(큰 문제의 답이 작은 문제의 답으로 표현됨)와 중복 부분 문제(같은 계산이 반복됨).",
    "순수 재귀로 풀면 O(2ⁿ)이지만, 한 번 구한 답을 표에 저장하면 O(n)이 됩니다 — 이것이 DP의 본질입니다.",
    "직전 두 값만 쓰므로 배열 없이 변수 두 개로 공간을 O(1)로 줄일 수도 있습니다."
  ],
  complexity: { time: "O(n)", space: "O(n)", note: "변수 두 개만 유지하면 O(1)" },
  code: [
    "function climbStairs(n: number) {",
    "  const dp = new Array(n + 1);",
    "  dp[0] = 1; // 바닥에 서 있는 경우의 수",
    "  dp[1] = 1;",
    "  for (let i = 2; i <= n; i++) {",
    "    dp[i] = dp[i - 1] + dp[i - 2];",
    "  }",
    "  return dp[n];",
    "}"
  ],
  createFrames(): Frame[] {
    const n = 10;
    const dp = new Array<number>(n + 1).fill(0);
    dp[0] = 1;
    dp[1] = 1;
    const t = new ArrayTracer<number | string>(["1", "1", ...Array.from({ length: n - 1 }, () => "?")], "boxes");
    for (let i = 0; i <= n; i++) t.setSublabel(i, `dp[${i}]`);
    t.mark(0, "sorted");
    t.mark(1, "sorted");

    t.step({ line: 3, message: `${n}칸 계단을 1칸 또는 2칸씩 오릅니다. dp[0]=1, dp[1]=1에서 시작합니다.`, vars: { n } });

    for (let i = 2; i <= n; i++) {
      t.step({
        line: 5,
        message: `dp[${i}]를 구합니다: ${i - 1}번 계단에서 1칸 오르거나, ${i - 2}번 계단에서 2칸 오르거나.`,
        highlights: { [i]: "active", [i - 1]: "compare", [i - 2]: "compare" },
        pointers: [{ index: i, label: "i" }],
        vars: { i, [`dp[${i - 1}]`]: dp[i - 1], [`dp[${i - 2}]`]: dp[i - 2] }
      });
      dp[i] = dp[i - 1] + dp[i - 2];
      t.a[i] = String(dp[i]);
      t.mark(i, "sorted");
      t.step({
        line: 5,
        message: `dp[${i}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
        highlights: { [i]: "found" },
        vars: { i, [`dp[${i}]`]: dp[i] }
      });
    }
    t.step({ line: 7, message: `정답: ${n}칸 계단을 오르는 방법은 ${dp[n]}가지입니다.`, highlights: { [n]: "found" }, vars: { [`dp[${n}]`]: dp[n] } });
    return t.frames;
  }
};

export const kadane: AlgorithmDef = {
  id: "kadane",
  title: "Kadane's Algorithm (Maximum Subarray)",
  koTitle: "카데인 알고리즘",
  category: "동적 계획법",
  difficulty: "중급",
  summary: "각 위치에서 '여기서 끝나는 최대 부분합'을 갱신합니다. 누적이 음수가 되면 미련 없이 버리고 새로 시작합니다.",
  insight: [
    "LeetCode 53 Maximum Subarray의 O(n) 풀이입니다. 모든 구간을 따지면 O(n²)~O(n³)인 문제가 한 줄의 점화식으로 풀립니다.",
    "점화식: cur = max(a[i], cur + a[i]) — '이어 붙이는 것'과 '새로 시작하는 것' 중 큰 쪽을 선택합니다.",
    "cur가 a[i]보다 작아지는 순간(= 직전 누적이 음수)은 '지금까지의 구간이 짐이 된다'는 뜻이라 버립니다.",
    "각 위치에서 끝나는 최적해만 기억하는 이 발상은 1차원 DP의 정수입니다."
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code: [
    "function maxSubArray(a: number[]) {",
    "  let best = a[0];",
    "  let cur = a[0]; // 여기서 끝나는 최대 부분합",
    "  for (let i = 1; i < a.length; i++) {",
    "    cur = Math.max(a[i], cur + a[i]);",
    "    best = Math.max(best, cur);",
    "  }",
    "  return best;",
    "}"
  ],
  createFrames(): Frame[] {
    const values = randomArray(10, 9, -9);
    const t = new ArrayTracer(values, "boxes");
    let best = values[0];
    let cur = values[0];
    let start = 0;
    let bestRange: [number, number] = [0, 0];
    const windowHighlights = (from: number, to: number) =>
      Object.fromEntries(Array.from({ length: to - from + 1 }, (_, d) => [from + d, "window" as const]));

    t.step({
      line: 2,
      message: `cur = best = a[0] = ${values[0]}에서 시작합니다. 파란 구간이 '현재 이어 붙이는 중인 부분합'입니다.`,
      highlights: { 0: "window" },
      vars: { cur, best }
    });

    for (let i = 1; i < values.length; i++) {
      const extended = cur + values[i];
      if (values[i] > extended) {
        start = i;
        cur = values[i];
        t.step({
          line: 4,
          message: `이어 붙이면 ${extended}, 새로 시작하면 ${values[i]}. 직전 누적이 음수라 버리고 a[${i}]부터 새 출발합니다.`,
          highlights: { ...windowHighlights(start, i), [i]: "active" },
          pointers: [{ index: i, label: "i" }],
          vars: { i, cur, best }
        });
      } else {
        cur = extended;
        t.step({
          line: 4,
          message: `이어 붙이면 ${extended}, 새로 시작하면 ${values[i]}. 이어 붙이는 쪽이 크므로 cur = ${cur}.`,
          highlights: { ...windowHighlights(start, i), [i]: "active" },
          pointers: [{ index: i, label: "i" }],
          vars: { i, cur, best }
        });
      }
      if (cur > best) {
        best = cur;
        bestRange = [start, i];
        t.step({
          line: 5,
          message: `최고 기록 갱신! best = ${best} (구간 [${start}..${i}])`,
          highlights: { ...windowHighlights(start, i) },
          vars: { i, cur, best }
        });
      }
    }

    t.step({
      line: 7,
      message: `정답: 최대 부분합은 ${best}, 구간 [${bestRange[0]}..${bestRange[1]}]입니다.`,
      highlights: Object.fromEntries(
        Array.from({ length: bestRange[1] - bestRange[0] + 1 }, (_, d) => [bestRange[0] + d, "found" as const])
      ),
      vars: { best }
    });
    return t.frames;
  }
};

export const houseRobber: AlgorithmDef = {
  id: "house-robber",
  title: "House Robber",
  koTitle: "하우스 로버",
  category: "동적 계획법",
  difficulty: "중급",
  summary: "인접한 집은 못 텁니다. 각 집마다 '턴다(i-2까지의 최적 + 이 집)'와 '건너뛴다(i-1까지의 최적)' 중 큰 쪽을 고릅니다.",
  insight: [
    "LeetCode 198. '선택하면 이웃을 못 쓰는' 제약이 있는 모든 문제의 원형입니다.",
    "점화식: dp[i] = max(dp[i-1], dp[i-2] + a[i]). 상자 아래 보라색 숫자가 dp[i]입니다.",
    "탐욕(무조건 큰 집부터)은 실패합니다 — [3, 5, 3]에서 탐욕은 5를 골라 5로 끝나지만 정답은 3+3=6입니다. 선택의 파급 효과 때문에 DP가 필요합니다.",
    "직전 두 값만 쓰므로 변수 2개(prev1, prev2)로 공간 O(1)이 됩니다. 원형 배열 버전(LeetCode 213)도 같은 골격입니다."
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code: [
    "function rob(houses: number[]) {",
    "  let prev2 = 0; // dp[i-2]",
    "  let prev1 = 0; // dp[i-1]",
    "  for (let i = 0; i < houses.length; i++) {",
    "    const take = prev2 + houses[i]; // 이 집을 턴다",
    "    const skip = prev1;             // 건너뛴다",
    "    const cur = Math.max(take, skip);",
    "    prev2 = prev1;",
    "    prev1 = cur;",
    "  }",
    "  return prev1;",
    "}"
  ],
  createFrames(): Frame[] {
    const houses = randomArray(9, 99, 5);
    const t = new ArrayTracer(houses);
    let prev2 = 0;
    let prev1 = 0;

    t.step({ line: 2, message: "막대 높이가 각 집의 돈입니다. 인접한 두 집을 동시에 털 수 없습니다.", vars: { prev2, prev1 } });

    for (let i = 0; i < houses.length; i++) {
      const take = prev2 + houses[i];
      const skip = prev1;
      t.step({
        line: 6,
        message: `${i}번 집: 턴다면 ${prev2} + ${houses[i]} = ${take}, 건너뛰면 ${skip}. 큰 쪽은 ${Math.max(take, skip)}.`,
        highlights: { [i]: take >= skip ? "found" : "discard" },
        pointers: [{ index: i, label: "i" }],
        vars: { i, "턴다(take)": take, "건너뛴다(skip)": skip }
      });
      const cur = Math.max(take, skip);
      prev2 = prev1;
      prev1 = cur;
      t.setSublabel(i, String(cur));
      t.step({
        line: 8,
        message: `dp[${i}] = ${cur} (보라색 숫자). 다음 집으로 넘어갑니다.`,
        highlights: { [i]: "active" },
        vars: { i, [`dp[${i}]`]: cur }
      });
    }

    t.step({ line: 10, message: `정답: 잡히지 않고 털 수 있는 최대 금액은 ${prev1}입니다.`, vars: { 정답: prev1 } });
    return t.frames;
  }
};

function randomString(length: number, alphabet = "ABCD"): string {
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export const lcs: AlgorithmDef = {
  id: "lcs",
  title: "Longest Common Subsequence",
  koTitle: "최장 공통 부분 수열 (LCS)",
  category: "동적 계획법",
  difficulty: "고급",
  summary: "2차원 표를 채워 두 문자열의 최장 공통 부분 수열 길이를 구합니다. 문자가 같으면 대각선+1, 다르면 위·왼쪽 중 최댓값.",
  insight: [
    "LeetCode 1143. 2차원 DP의 교과서로, diff 도구·DNA 서열 비교·표절 검사의 핵심 알고리즘입니다.",
    "dp[i][j] = s의 앞 i글자와 t의 앞 j글자의 LCS 길이. '앞 몇 글자'로 상태를 정의하는 것이 문자열 DP의 표준 패턴입니다.",
    "마지막 글자가 같으면 둘 다 지우고 대각선 값 +1, 다르면 한쪽씩 지워 본 것(위/왼쪽) 중 큰 값을 취합니다.",
    "표를 다 채운 뒤 오른쪽 아래에서 거꾸로 따라가면(역추적) 길이뿐 아니라 실제 수열도 복원할 수 있습니다.",
    "편집 거리(Edit Distance, LeetCode 72)도 같은 표 구조에 점화식만 다릅니다."
  ],
  complexity: { time: "O(m·n)", space: "O(m·n)", note: "길이만 필요하면 두 행만 유지해 O(n)" },
  code: [
    "function lcs(s: string, t: string) {",
    "  const m = s.length, n = t.length;",
    "  const dp = Array.from({ length: m + 1 },",
    "    () => new Array(n + 1).fill(0));",
    "  for (let i = 1; i <= m; i++) {",
    "    for (let j = 1; j <= n; j++) {",
    "      if (s[i - 1] === t[j - 1]) {",
    "        dp[i][j] = dp[i - 1][j - 1] + 1;",
    "      } else {",
    "        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);",
    "      }",
    "    }",
    "  }",
    "  return dp[m][n];",
    "}"
  ],
  createFrames(): Frame[] {
    const s = randomString(6);
    const t = randomString(6);
    const m = s.length;
    const n = t.length;
    const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
    const frames: Frame[] = [];

    // 그리드: (m+2) x (n+2) — 0행/0열은 문자 헤더, 1행/1열은 빈 문자열(ε) 기준
    const makeFrame = (
      line: number,
      message: string,
      options: {
        current?: [number, number];
        refs?: Array<[number, number]>;
        computedUpTo?: [number, number];
        path?: Array<[number, number]>;
        vars?: Record<string, string | number>;
      }
    ): GridFrame => {
      const rows = m + 2;
      const cols = n + 2;
      const cells: CellState[][] = Array.from({ length: rows }, () => new Array<CellState>(cols).fill("empty"));
      const labels: Array<Array<string | number | null>> = Array.from({ length: rows }, () => new Array(cols).fill(null));

      cells[0][0] = "header";
      cells[0][1] = "header";
      cells[1][0] = "header";
      labels[0][1] = "ε";
      labels[1][0] = "ε";
      for (let j = 0; j < n; j++) {
        cells[0][j + 2] = "header";
        labels[0][j + 2] = t[j];
      }
      for (let i = 0; i < m; i++) {
        cells[i + 2][0] = "header";
        labels[i + 2][0] = s[i];
      }

      const [ci, cj] = options.computedUpTo ?? [m, n];
      for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= n; j++) {
          const done = i < ci || (i === ci && j <= cj);
          if (done) {
            cells[i + 1][j + 1] = "visited";
            labels[i + 1][j + 1] = dp[i][j];
          }
        }
      }
      for (const [ri, rj] of options.refs ?? []) {
        cells[ri + 1][rj + 1] = "frontier";
      }
      for (const [pi, pj] of options.path ?? []) {
        cells[pi + 1][pj + 1] = "path";
      }
      if (options.current) {
        const [i, j] = options.current;
        cells[i + 1][j + 1] = "current";
        labels[i + 1][j + 1] = dp[i][j] || "·";
      }

      return {
        kind: "grid",
        cells,
        labels,
        codeLine: line,
        message,
        vars: options.vars,
        legend: [
          { state: "header", label: "문자" },
          { state: "current", label: "계산 중" },
          { state: "frontier", label: "참조하는 칸" },
          { state: "visited", label: "계산 완료" },
          { state: "path", label: "역추적 경로" },
          { state: "empty", label: "미계산" }
        ]
      };
    };

    frames.push(
      makeFrame(2, `s="${s}", t="${t}". 0행/0열은 빈 문자열 기준이라 모두 0입니다.`, {
        computedUpTo: [0, n],
        vars: { s, t }
      })
    );

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const match = s[i - 1] === t[j - 1];
        if (match) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          frames.push(
            makeFrame(7, `s[${i - 1}]='${s[i - 1]}' = t[${j - 1}]='${t[j - 1]}' — 대각선 값 ${dp[i - 1][j - 1]}에 1을 더해 ${dp[i][j]}.`, {
              current: [i, j],
              refs: [[i - 1, j - 1]],
              computedUpTo: [i, j],
              vars: { i, j, [`dp[${i}][${j}]`]: dp[i][j] }
            })
          );
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          frames.push(
            makeFrame(9, `'${s[i - 1]}' ≠ '${t[j - 1]}' — 위(${dp[i - 1][j]})와 왼쪽(${dp[i][j - 1]}) 중 큰 값 ${dp[i][j]}을 취합니다.`, {
              current: [i, j],
              refs: [
                [i - 1, j],
                [i, j - 1]
              ],
              computedUpTo: [i, j],
              vars: { i, j, [`dp[${i}][${j}]`]: dp[i][j] }
            })
          );
        }
      }
    }

    // 역추적
    const path: Array<[number, number]> = [];
    let pi = m;
    let pj = n;
    let subsequence = "";
    while (pi > 0 && pj > 0) {
      path.push([pi, pj]);
      if (s[pi - 1] === t[pj - 1]) {
        subsequence = s[pi - 1] + subsequence;
        pi--;
        pj--;
      } else if (dp[pi - 1][pj] >= dp[pi][pj - 1]) {
        pi--;
      } else {
        pj--;
      }
    }
    frames.push(
      makeFrame(13, `LCS 길이는 dp[${m}][${n}] = ${dp[m][n]}. 오른쪽 아래에서 역추적하면 실제 수열 "${subsequence}"를 복원할 수 있습니다.`, {
        path,
        vars: { "LCS 길이": dp[m][n], LCS: subsequence || "(없음)" }
      })
    );
    return frames;
  }
};

type KnapsackItem = { name: string; w: number; v: number };

export const knapsack: AlgorithmDef = {
  id: "knapsack",
  title: "0/1 Knapsack",
  koTitle: "0/1 배낭 문제",
  category: "동적 계획법",
  difficulty: "고급",
  summary: "용량 제한이 있는 배낭에 가치 합이 최대가 되도록 물건을 담습니다. dp[i][c] = i번째까지 고려, 용량 c일 때의 최대 가치.",
  insight: [
    "조합 최적화의 원형입니다. '각 물건을 넣거나(1) 안 넣거나(0)' — 모든 부분집합 2ⁿ개를 따지는 대신 표 하나로 끝냅니다.",
    "점화식: dp[i][c] = max(안 넣음 dp[i-1][c], 넣음 dp[i-1][c-wᵢ] + vᵢ). '넣음'은 용량이 wᵢ 이상일 때만 가능합니다.",
    "시간 O(n·C)는 용량 C가 입력의 '자릿수'에 비해 지수적이라 의사 다항 시간(pseudo-polynomial)이라 부릅니다.",
    "1차원 배열로 줄일 때는 용량을 거꾸로(큰 쪽부터) 순회해야 같은 물건을 두 번 넣는 버그를 피합니다.",
    "동전 교환, 부분집합 합(Partition Equal Subset Sum, LeetCode 416) 등이 모두 이 틀의 변형입니다."
  ],
  complexity: { time: "O(n·C)", space: "O(n·C)", note: "1차원으로 줄이면 O(C), C = 배낭 용량" },
  code: [
    "function knapsack(items: Item[], cap: number) {",
    "  const dp = Array.from({ length: items.length + 1 },",
    "    () => new Array(cap + 1).fill(0));",
    "  for (let i = 1; i <= items.length; i++) {",
    "    const { w, v } = items[i - 1];",
    "    for (let c = 0; c <= cap; c++) {",
    "      dp[i][c] = dp[i - 1][c]; // 안 넣는 경우",
    "      if (c >= w) {",
    "        dp[i][c] = Math.max(dp[i][c],",
    "          dp[i - 1][c - w] + v); // 넣는 경우",
    "      }",
    "    }",
    "  }",
    "  return dp[items.length][cap];",
    "}"
  ],
  createFrames(): Frame[] {
    const names = ["A", "B", "C", "D"];
    const items: KnapsackItem[] = names.map((name) => ({
      name,
      w: 1 + Math.floor(Math.random() * 4),
      v: 10 + Math.floor(Math.random() * 81)
    }));
    const cap = 7;
    const dp = Array.from({ length: items.length + 1 }, () => new Array<number>(cap + 1).fill(0));
    const frames: Frame[] = [];
    const itemText = (item: KnapsackItem) => `${item.name}(무게 ${item.w}, 가치 ${item.v})`;

    const makeFrame = (
      line: number,
      message: string,
      options: {
        current?: [number, number];
        refs?: Array<[number, number]>;
        computedUpTo?: [number, number];
        path?: Array<[number, number]>;
        vars?: Record<string, string | number>;
      }
    ): GridFrame => {
      const rows = items.length + 2;
      const cols = cap + 2;
      const cells: CellState[][] = Array.from({ length: rows }, () => new Array<CellState>(cols).fill("empty"));
      const labels: Array<Array<string | number | null>> = Array.from({ length: rows }, () => new Array(cols).fill(null));

      cells[0][0] = "header";
      labels[0][0] = "c→";
      for (let c = 0; c <= cap; c++) {
        cells[0][c + 1] = "header";
        labels[0][c + 1] = c;
      }
      cells[1][0] = "header";
      labels[1][0] = "∅";
      for (let i = 0; i < items.length; i++) {
        cells[i + 2][0] = "header";
        labels[i + 2][0] = items[i].name;
      }

      const [ci, cc] = options.computedUpTo ?? [items.length, cap];
      for (let i = 0; i <= items.length; i++) {
        for (let c = 0; c <= cap; c++) {
          const done = i < ci || (i === ci && c <= cc);
          if (done) {
            cells[i + 1][c + 1] = "visited";
            labels[i + 1][c + 1] = dp[i][c];
          }
        }
      }
      for (const [ri, rc] of options.refs ?? []) {
        cells[ri + 1][rc + 1] = "frontier";
      }
      for (const [pi, pc] of options.path ?? []) {
        cells[pi + 1][pc + 1] = "path";
      }
      if (options.current) {
        const [i, c] = options.current;
        cells[i + 1][c + 1] = "current";
        labels[i + 1][c + 1] = dp[i][c];
      }

      return {
        kind: "grid",
        cells,
        labels,
        codeLine: line,
        message,
        vars: options.vars,
        legend: [
          { state: "header", label: "물건/용량" },
          { state: "current", label: "계산 중" },
          { state: "frontier", label: "참조하는 칸" },
          { state: "visited", label: "계산 완료" },
          { state: "path", label: "선택 역추적" },
          { state: "empty", label: "미계산" }
        ]
      };
    };

    frames.push(
      makeFrame(2, `물건: ${items.map(itemText).join(", ")} / 배낭 용량 ${cap}. 0번째 행(물건 없음)은 전부 0입니다.`, {
        computedUpTo: [0, cap],
        vars: { 용량: cap }
      })
    );

    for (let i = 1; i <= items.length; i++) {
      const { name, w, v } = items[i - 1];
      for (let c = 0; c <= cap; c++) {
        const without = dp[i - 1][c];
        if (c >= w) {
          const withItem = dp[i - 1][c - w] + v;
          dp[i][c] = Math.max(without, withItem);
          frames.push(
            makeFrame(
              8,
              `${name}을 용량 ${c}에서: 안 넣으면 ${without}, 넣으면 dp[${i - 1}][${c - w}] + ${v} = ${withItem} → ${dp[i][c]}`,
              {
                current: [i, c],
                refs: [
                  [i - 1, c],
                  [i - 1, c - w]
                ],
                computedUpTo: [i, c],
                vars: { 물건: itemText(items[i - 1]), c, "안 넣음": without, 넣음: withItem }
              }
            )
          );
        } else {
          dp[i][c] = without;
          frames.push(
            makeFrame(6, `${name}(무게 ${w})은 용량 ${c}에 들어가지 않습니다. 위의 값 ${without}을 그대로 가져옵니다.`, {
              current: [i, c],
              refs: [[i - 1, c]],
              computedUpTo: [i, c],
              vars: { 물건: itemText(items[i - 1]), c }
            })
          );
        }
      }
    }

    // 어떤 물건을 넣었는지 역추적
    const chosen: string[] = [];
    const path: Array<[number, number]> = [];
    let ci = items.length;
    let cc = cap;
    while (ci > 0) {
      path.push([ci, cc]);
      if (dp[ci][cc] !== dp[ci - 1][cc]) {
        chosen.unshift(items[ci - 1].name);
        cc -= items[ci - 1].w;
      }
      ci--;
    }
    frames.push(
      makeFrame(
        13,
        `최대 가치는 dp[${items.length}][${cap}] = ${dp[items.length][cap]}. 역추적하면 선택한 물건은 {${chosen.join(", ") || "없음"}}입니다.`,
        {
          path,
          vars: { "최대 가치": dp[items.length][cap], 선택: chosen.join(", ") || "없음" }
        }
      )
    );
    return frames;
  }
};

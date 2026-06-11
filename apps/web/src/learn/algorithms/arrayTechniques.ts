import { ArrayTracer, randomArray, randomSortedArray, withEnoughSteps } from "../tracer.ts";
import type { AlgorithmDef, Frame } from "../types.ts";

export const binarySearch: AlgorithmDef = {
  id: "binary-search",
  title: "Binary Search",
  koTitle: "이분 탐색",
  category: "탐색",
  difficulty: "기초",
  summary: "정렬된 배열에서 가운데 값과 비교해 탐색 범위를 매번 절반으로 줄입니다.",
  insight: [
    "전제 조건은 '정렬된 배열'입니다. 정렬되어 있지 않으면 절반을 버리는 판단 자체가 불가능합니다.",
    "탐색 범위가 매번 절반이 되므로 시간 복잡도는 O(log n). 100만 개여도 약 20번이면 끝납니다.",
    "mid 계산 시 (lo + hi)가 오버플로될 수 있는 언어에서는 lo + (hi - lo) / 2를 씁니다.",
    "응용형이 훨씬 많이 출제됩니다: lower bound / upper bound, '조건을 만족하는 최소값 찾기'(파라메트릭 서치) 등 모두 같은 골격입니다."
  ],
  complexity: { time: "O(log n)", space: "O(1)" },
  code: [
    "function binarySearch(a: number[], target: number) {",
    "  let lo = 0;",
    "  let hi = a.length - 1;",
    "  while (lo <= hi) {",
    "    const mid = (lo + hi) >> 1;",
    "    if (a[mid] === target) return mid;",
    "    if (a[mid] < target) lo = mid + 1;",
    "    else hi = mid - 1;",
    "  }",
    "  return -1;",
    "}"
  ],
  createFrames(): Frame[] {
    return withEnoughSteps(buildBinarySearchFrames);
  }
};

function buildBinarySearchFrames(): Frame[] {
  {
    const values = Array.from(new Set(randomSortedArray(14)));
    const target = values[Math.floor(Math.random() * values.length)];
    const t = new ArrayTracer(values);
    t.step({
      line: 1,
      message: `정렬된 배열에서 target=${target}을 찾습니다. 탐색 범위는 [0..${values.length - 1}]입니다.`,
      vars: { target }
    });

    let lo = 0;
    let hi = values.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const inRange: Partial<Record<number, "window" | "discard">> = {};
      for (let k = 0; k < values.length; k++) inRange[k] = k >= lo && k <= hi ? "window" : "discard";
      t.step({
        line: 4,
        message: `가운데 인덱스 mid=${mid}, a[mid]=${values[mid]}를 확인합니다.`,
        highlights: { ...inRange, [mid]: "active" },
        pointers: [
          { index: lo, label: "lo" },
          { index: mid, label: "mid" },
          { index: hi, label: "hi" }
        ],
        vars: { target, lo, hi, mid }
      });
      if (values[mid] === target) {
        t.step({
          line: 5,
          message: `a[${mid}]=${target} — 목표를 찾았습니다! 범위를 절반씩 줄인 덕분에 몇 번 만에 끝났습니다.`,
          highlights: { [mid]: "found" },
          pointers: [{ index: mid, label: "정답" }],
          vars: { target, "찾은 위치": mid }
        });
        return t.frames;
      }
      if (values[mid] < target) {
        lo = mid + 1;
        t.step({
          line: 6,
          message: `a[mid]=${values[mid]} < ${target} 이므로 왼쪽 절반을 통째로 버립니다. lo=${lo}`,
          highlights: Object.fromEntries(
            Array.from({ length: values.length }, (_, k) => [k, k >= lo && k <= hi ? "window" : "discard"])
          ),
          pointers: [
            { index: lo, label: "lo" },
            { index: hi, label: "hi" }
          ],
          vars: { target, lo, hi }
        });
      } else {
        hi = mid - 1;
        t.step({
          line: 7,
          message: `a[mid]=${values[mid]} > ${target} 이므로 오른쪽 절반을 통째로 버립니다. hi=${hi}`,
          highlights: Object.fromEntries(
            Array.from({ length: values.length }, (_, k) => [k, k >= lo && k <= hi ? "window" : "discard"])
          ),
          pointers: [
            { index: lo, label: "lo" },
            { index: hi, label: "hi" }
          ],
          vars: { target, lo, hi }
        });
      }
    }
    t.step({ line: 9, message: `범위가 비어 ${target}은 배열에 없습니다. -1을 반환합니다.`, vars: { target } });
    return t.frames;
  }
};

export const twoPointers: AlgorithmDef = {
  id: "two-pointers",
  title: "Two Pointers (Two Sum II)",
  koTitle: "투 포인터",
  category: "배열 테크닉",
  difficulty: "기초",
  summary: "정렬된 배열의 양 끝에서 포인터 두 개를 좁혀 가며, 합이 목표가 되는 쌍을 O(n)에 찾습니다.",
  insight: [
    "정렬 덕분에 '합이 크면 오른쪽 포인터를 왼쪽으로, 작으면 왼쪽 포인터를 오른쪽으로'라는 단순한 규칙이 성립합니다.",
    "이중 루프 O(n²)를 O(n)으로 줄이는 가장 기본적인 테크닉입니다.",
    "포인터를 움직일 때 정답 쌍을 건너뛰지 않는다는 점(증명 가능)이 이 알고리즘의 핵심 논리입니다.",
    "3Sum, Container With Most Water, 회문 검사 등 수많은 문제가 이 패턴의 변형입니다."
  ],
  complexity: { time: "O(n)", space: "O(1)", note: "정렬이 안 되어 있으면 정렬 비용 O(n log n) 추가" },
  code: [
    "function twoSumSorted(a: number[], target: number) {",
    "  let left = 0;",
    "  let right = a.length - 1;",
    "  while (left < right) {",
    "    const sum = a[left] + a[right];",
    "    if (sum === target) return [left, right];",
    "    if (sum < target) left++;",
    "    else right--;",
    "  }",
    "  return null;",
    "}"
  ],
  createFrames(): Frame[] {
    return withEnoughSteps(buildTwoPointersFrames);
  }
};

function buildTwoPointersFrames(): Frame[] {
  {
    const values = randomSortedArray(12, 60);
    const i = Math.floor(Math.random() * (values.length / 2));
    const j = values.length - 1 - Math.floor(Math.random() * (values.length / 2 - 1));
    const target = values[i] + values[j];
    const t = new ArrayTracer(values);
    t.step({
      line: 1,
      message: `정렬된 배열에서 합이 target=${target}이 되는 두 수를 찾습니다. 양 끝에서 시작합니다.`,
      vars: { target }
    });

    let left = 0;
    let right = values.length - 1;
    while (left < right) {
      const sum = values[left] + values[right];
      t.step({
        line: 4,
        message: `a[${left}]=${values[left]} + a[${right}]=${values[right]} = ${sum} 을 target=${target}과 비교합니다.`,
        highlights: { [left]: "compare", [right]: "compare" },
        pointers: [
          { index: left, label: "left" },
          { index: right, label: "right" }
        ],
        vars: { target, left, right, sum }
      });
      if (sum === target) {
        t.step({
          line: 5,
          message: `${values[left]} + ${values[right]} = ${target} — 정답 쌍을 찾았습니다!`,
          highlights: { [left]: "found", [right]: "found" },
          pointers: [
            { index: left, label: "left" },
            { index: right, label: "right" }
          ],
          vars: { target, left, right }
        });
        return t.frames;
      }
      if (sum < target) {
        t.mark(left, "discard");
        left++;
        t.step({
          line: 6,
          message: `합 ${sum} < ${target}: 더 큰 합이 필요하므로 left를 오른쪽으로 옮깁니다.`,
          pointers: [
            { index: left, label: "left" },
            { index: right, label: "right" }
          ],
          vars: { target, left, right }
        });
      } else {
        t.mark(right, "discard");
        right--;
        t.step({
          line: 7,
          message: `합 ${sum} > ${target}: 더 작은 합이 필요하므로 right를 왼쪽으로 옮깁니다.`,
          pointers: [
            { index: left, label: "left" },
            { index: right, label: "right" }
          ],
          vars: { target, left, right }
        });
      }
    }
    t.step({ line: 9, message: "포인터가 만났습니다. 조건을 만족하는 쌍이 없습니다.", vars: { target } });
    return t.frames;
  }
};

export const slidingWindow: AlgorithmDef = {
  id: "sliding-window",
  title: "Sliding Window (Max Sum of Size K)",
  koTitle: "슬라이딩 윈도우",
  category: "배열 테크닉",
  difficulty: "기초",
  summary: "창문을 한 칸씩 밀며, 빠지는 값을 빼고 들어오는 값을 더해 구간 합을 O(1)에 갱신합니다.",
  insight: [
    "매번 k개를 다시 더하면 O(n·k)이지만, '나가는 값 빼고 들어오는 값 더하기'로 O(n)이 됩니다.",
    "고정 길이 윈도우(이 예시)와 가변 길이 윈도우(조건을 만족할 때까지 늘리고 줄이기) 두 유형이 있습니다.",
    "Longest Substring Without Repeating Characters 같은 문제는 가변 길이 윈도우 + 해시맵 조합입니다.",
    "구간 합, 구간 평균, 구간 내 조건 검사 등 '연속 부분 배열' 문제가 보이면 먼저 떠올릴 패턴입니다."
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code: [
    "function maxSumOfWindow(a: number[], k: number) {",
    "  let windowSum = 0;",
    "  for (let i = 0; i < k; i++) windowSum += a[i];",
    "  let best = windowSum;",
    "  for (let right = k; right < a.length; right++) {",
    "    windowSum += a[right] - a[right - k];",
    "    best = Math.max(best, windowSum);",
    "  }",
    "  return best;",
    "}"
  ],
  createFrames(): Frame[] {
    const k = 4;
    const values = randomArray(12, 30, 1);
    const t = new ArrayTracer(values);
    const windowHighlight = (from: number): Partial<Record<number, "window">> =>
      Object.fromEntries(Array.from({ length: k }, (_, d) => [from + d, "window"]));

    let windowSum = 0;
    for (let i = 0; i < k; i++) windowSum += values[i];
    t.step({
      line: 2,
      message: `첫 윈도우 [0..${k - 1}]의 합을 계산합니다: ${windowSum}`,
      highlights: windowHighlight(0),
      vars: { k, windowSum }
    });
    let best = windowSum;
    let bestStart = 0;
    t.step({
      line: 3,
      message: `현재 최댓값 best=${best} 로 시작합니다.`,
      highlights: windowHighlight(0),
      vars: { k, windowSum, best }
    });

    for (let right = k; right < values.length; right++) {
      const out = values[right - k];
      const inValue = values[right];
      windowSum += inValue - out;
      t.step({
        line: 5,
        message: `윈도우를 한 칸 밉니다: ${out}이 빠지고 ${inValue}이 들어와 합은 ${windowSum}이 됩니다.`,
        highlights: { ...windowHighlight(right - k + 1), [right - k]: "discard", [right]: "active" },
        pointers: [
          { index: right - k + 1, label: "left" },
          { index: right, label: "right" }
        ],
        vars: { k, windowSum, best }
      });
      if (windowSum > best) {
        best = windowSum;
        bestStart = right - k + 1;
        t.step({
          line: 6,
          message: `새로운 최댓값 발견! best=${best} (구간 [${bestStart}..${right}])`,
          highlights: { ...windowHighlight(bestStart) },
          pointers: [
            { index: bestStart, label: "left" },
            { index: right, label: "right" }
          ],
          vars: { k, windowSum, best }
        });
      }
    }

    const answer: Partial<Record<number, "found">> = Object.fromEntries(
      Array.from({ length: k }, (_, d) => [bestStart + d, "found"])
    );
    t.step({
      line: 8,
      message: `탐색 종료. 길이 ${k}짜리 구간 중 최대 합은 ${best} (구간 [${bestStart}..${bestStart + k - 1}])입니다.`,
      highlights: answer,
      vars: { k, best }
    });
    return t.frames;
  }
};

export const prefixSum: AlgorithmDef = {
  id: "prefix-sum",
  title: "Prefix Sum",
  koTitle: "접두사 합",
  category: "배열 테크닉",
  difficulty: "기초",
  summary: "누적 합 배열을 한 번 만들어 두면, 어떤 구간의 합이든 뺄셈 한 번(O(1))으로 구할 수 있습니다.",
  insight: [
    "구간 합 [l..r] = prefix[r+1] − prefix[l]. 'r까지의 누적'에서 'l 직전까지의 누적'을 빼는 것이 전부입니다.",
    "전처리 O(n) 한 번으로 이후의 모든 구간 합 질의가 O(1)이 됩니다 — 질의가 많을수록 이득이 커집니다.",
    "prefix[0] = 0을 두는(길이 n+1) 관례 덕분에 l=0인 구간도 예외 처리 없이 같은 공식으로 처리됩니다.",
    "Subarray Sum Equals K(LeetCode 560)는 접두사 합 + 해시맵의 결합이고, 2차원 누적 합·차분 배열(difference array)로도 확장됩니다."
  ],
  complexity: { time: "전처리 O(n), 질의 O(1)", space: "O(n)" },
  code: [
    "function buildPrefix(a: number[]) {",
    "  const prefix = new Array(a.length + 1).fill(0);",
    "  for (let i = 0; i < a.length; i++) {",
    "    prefix[i + 1] = prefix[i] + a[i];",
    "  }",
    "  return prefix;",
    "}",
    "// 구간 합 [l..r] = prefix[r + 1] - prefix[l]",
    "function rangeSum(prefix: number[], l: number, r: number) {",
    "  return prefix[r + 1] - prefix[l];",
    "}"
  ],
  createFrames(): Frame[] {
    const values = randomArray(10, 20, 1);
    const t = new ArrayTracer(values);
    const prefix = new Array<number>(values.length + 1).fill(0);

    t.step({ line: 1, message: "1단계: 누적 합 배열을 만듭니다. 각 칸 아래 보라색 숫자가 '여기까지의 누적 합'입니다." });

    for (let i = 0; i < values.length; i++) {
      prefix[i + 1] = prefix[i] + values[i];
      t.setSublabel(i, String(prefix[i + 1]));
      t.step({
        line: 3,
        message: `prefix[${i + 1}] = ${prefix[i]} + a[${i}](${values[i]}) = ${prefix[i + 1]}`,
        highlights: { [i]: "active" },
        pointers: [{ index: i, label: "i" }],
        vars: { i, [`prefix[${i + 1}]`]: prefix[i + 1] }
      });
    }

    t.step({ line: 5, message: "전처리 완료! 이제 어떤 구간 합이든 뺄셈 한 번으로 구할 수 있습니다." });

    for (let q = 0; q < 2; q++) {
      const l = Math.floor(Math.random() * (values.length - 3));
      const r = l + 2 + Math.floor(Math.random() * (values.length - l - 3));
      const sum = prefix[r + 1] - prefix[l];
      const window = Object.fromEntries(
        Array.from({ length: r - l + 1 }, (_, d) => [l + d, "window" as const])
      );
      t.step({
        line: 9,
        message: `질의 ${q + 1}: 구간 [${l}..${r}]의 합은? → prefix[${r + 1}] − prefix[${l}] = ${prefix[r + 1]} − ${prefix[l]} = ${sum}. 순회 없이 끝!`,
        highlights: window,
        pointers: [
          { index: l, label: "l" },
          { index: r, label: "r" }
        ],
        vars: { l, r, "구간 합": sum }
      });
    }
    return t.frames;
  }
};

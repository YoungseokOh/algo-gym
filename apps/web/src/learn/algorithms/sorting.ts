import { ArrayTracer, randomArray } from "../tracer.ts";
import type { AlgorithmDef, Frame } from "../types.ts";

export const bubbleSort: AlgorithmDef = {
  id: "bubble-sort",
  title: "Bubble Sort",
  koTitle: "버블 정렬",
  category: "정렬",
  difficulty: "기초",
  summary: "이웃한 두 원소를 비교해 큰 값을 뒤로 보내며, 매 회전마다 최댓값이 끝으로 '떠오르는' 정렬입니다.",
  insight: [
    "한 번의 바깥 루프가 끝날 때마다 가장 큰 값 하나가 맨 뒤에 확정됩니다. 그래서 안쪽 루프 범위가 매번 1씩 줄어듭니다.",
    "이미 정렬된 배열에서도 비교는 전부 수행하므로 평균/최악 모두 O(n²)입니다. (교환이 없으면 조기 종료하는 최적화 가능)",
    "인접 원소만 교환하므로 안정 정렬(stable sort)입니다.",
    "실무에서는 거의 쓰지 않지만, '교환 기반 정렬'의 사고 방식을 익히는 출발점입니다."
  ],
  complexity: { time: "O(n²)", space: "O(1)", note: "교환 없음 감지 시 최선 O(n)" },
  code: [
    "function bubbleSort(a: number[]) {",
    "  const n = a.length;",
    "  for (let i = 0; i < n - 1; i++) {",
    "    for (let j = 0; j < n - 1 - i; j++) {",
    "      if (a[j] > a[j + 1]) {",
    "        [a[j], a[j + 1]] = [a[j + 1], a[j]];",
    "      }",
    "    }",
    "  }",
    "  return a;",
    "}"
  ],
  createFrames(): Frame[] {
    const t = new ArrayTracer(randomArray(9));
    const n = t.a.length;
    t.step({ line: 1, message: `길이 ${n}짜리 배열을 정렬합니다. 매 회전마다 최댓값이 오른쪽 끝으로 이동합니다.` });

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - 1 - i; j++) {
        t.step({
          line: 4,
          message: `a[${j}]=${t.a[j]}와 a[${j + 1}]=${t.a[j + 1]}을 비교합니다.`,
          highlights: { [j]: "compare", [j + 1]: "compare" },
          pointers: [{ index: j, label: "j" }],
          vars: { i, j }
        });
        if (t.a[j] > t.a[j + 1]) {
          t.swap(j, j + 1);
          t.step({
            line: 5,
            message: `${t.a[j + 1]} > ${t.a[j]} 이므로 두 원소를 교환합니다.`,
            highlights: { [j]: "swap", [j + 1]: "swap" },
            pointers: [{ index: j, label: "j" }],
            vars: { i, j }
          });
        }
      }
      t.mark(n - 1 - i, "sorted");
      t.step({
        line: 2,
        message: `${i + 1}번째 회전 종료. a[${n - 1 - i}]=${t.a[n - 1 - i]}이 제자리에 확정되었습니다.`,
        vars: { i, "확정된 원소": i + 1 }
      });
    }
    t.mark(0, "sorted");
    t.step({ line: 9, message: "정렬 완료! 모든 원소가 제자리를 찾았습니다." });
    return t.frames;
  }
};

export const selectionSort: AlgorithmDef = {
  id: "selection-sort",
  title: "Selection Sort",
  koTitle: "선택 정렬",
  category: "정렬",
  difficulty: "기초",
  summary: "남은 구간에서 최솟값을 '선택'해 맨 앞과 교환하는 과정을 반복합니다.",
  insight: [
    "버블 정렬과 달리 교환 횟수가 최대 n-1번으로 적습니다. 교환 비용이 비쌀 때 유리합니다.",
    "비교 횟수는 입력과 무관하게 항상 n(n-1)/2번이라 최선/평균/최악 모두 O(n²)입니다.",
    "멀리 떨어진 원소끼리 교환하므로 안정 정렬이 아닙니다.",
    "'아직 정렬 안 된 구간의 최솟값을 찾는다'는 패턴은 다른 문제에서도 자주 등장합니다."
  ],
  complexity: { time: "O(n²)", space: "O(1)" },
  code: [
    "function selectionSort(a: number[]) {",
    "  const n = a.length;",
    "  for (let i = 0; i < n - 1; i++) {",
    "    let minIndex = i;",
    "    for (let j = i + 1; j < n; j++) {",
    "      if (a[j] < a[minIndex]) minIndex = j;",
    "    }",
    "    [a[i], a[minIndex]] = [a[minIndex], a[i]];",
    "  }",
    "  return a;",
    "}"
  ],
  createFrames(): Frame[] {
    const t = new ArrayTracer(randomArray(9));
    const n = t.a.length;
    t.step({ line: 1, message: "남은 구간의 최솟값을 찾아 맨 앞으로 보내는 과정을 반복합니다." });

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      t.step({
        line: 3,
        message: `구간 [${i}..${n - 1}]에서 최솟값을 찾습니다. 일단 a[${i}]=${t.a[i]}을 후보로 둡니다.`,
        highlights: { [i]: "active" },
        pointers: [{ index: minIndex, label: "min" }],
        vars: { i, minIndex }
      });
      for (let j = i + 1; j < n; j++) {
        t.step({
          line: 5,
          message: `a[${j}]=${t.a[j]}와 현재 최솟값 a[${minIndex}]=${t.a[minIndex]}을 비교합니다.`,
          highlights: { [j]: "compare", [minIndex]: "active" },
          pointers: [
            { index: j, label: "j" },
            { index: minIndex, label: "min" }
          ],
          vars: { i, j, minIndex }
        });
        if (t.a[j] < t.a[minIndex]) {
          minIndex = j;
          t.step({
            line: 5,
            message: `더 작은 값 ${t.a[j]}을 발견! 최솟값 후보를 a[${j}]로 갱신합니다.`,
            highlights: { [minIndex]: "active" },
            pointers: [{ index: minIndex, label: "min" }],
            vars: { i, j, minIndex }
          });
        }
      }
      t.swap(i, minIndex);
      t.mark(i, "sorted");
      t.step({
        line: 7,
        message: `최솟값 ${t.a[i]}을 a[${i}] 위치로 교환합니다. 이제 앞쪽 ${i + 1}개는 정렬 완료.`,
        highlights: { [minIndex]: "swap" },
        vars: { i, minIndex }
      });
    }
    t.mark(n - 1, "sorted");
    t.step({ line: 9, message: "정렬 완료!" });
    return t.frames;
  }
};

export const insertionSort: AlgorithmDef = {
  id: "insertion-sort",
  title: "Insertion Sort",
  koTitle: "삽입 정렬",
  category: "정렬",
  difficulty: "기초",
  summary: "카드를 한 장씩 손에 끼워 넣듯, 새 원소를 이미 정렬된 앞부분의 알맞은 자리에 삽입합니다.",
  insight: [
    "앞부분이 항상 정렬 상태를 유지한다는 '불변식(invariant)'이 핵심입니다.",
    "거의 정렬된 배열에서는 O(n)에 가깝게 동작해, 실무에서 작은 배열 정렬에 실제로 쓰입니다 (많은 표준 라이브러리가 소구간에 삽입 정렬 사용).",
    "원소를 교환하지 않고 한 칸씩 '밀어낸 뒤' 마지막에 한 번 삽입하는 것이 포인트입니다.",
    "안정 정렬이며, 온라인(데이터가 하나씩 도착하는) 상황에서도 사용할 수 있습니다."
  ],
  complexity: { time: "O(n²)", space: "O(1)", note: "거의 정렬된 입력은 O(n)" },
  code: [
    "function insertionSort(a: number[]) {",
    "  for (let i = 1; i < a.length; i++) {",
    "    const key = a[i];",
    "    let j = i - 1;",
    "    while (j >= 0 && a[j] > key) {",
    "      a[j + 1] = a[j];",
    "      j--;",
    "    }",
    "    a[j + 1] = key;",
    "  }",
    "  return a;",
    "}"
  ],
  createFrames(): Frame[] {
    const t = new ArrayTracer(randomArray(9));
    t.mark(0, "sorted");
    t.step({ line: 1, message: "첫 원소 하나는 그 자체로 정렬된 상태입니다. 두 번째 원소부터 알맞은 자리에 삽입합니다." });

    for (let i = 1; i < t.a.length; i++) {
      const key = t.a[i];
      t.step({
        line: 2,
        message: `a[${i}]=${key}를 꺼내 들었습니다. 정렬된 앞부분에서 들어갈 자리를 찾습니다.`,
        highlights: { [i]: "active" },
        pointers: [{ index: i, label: "key" }],
        vars: { i, key }
      });
      let j = i - 1;
      while (j >= 0 && t.a[j] > key) {
        t.step({
          line: 4,
          message: `a[${j}]=${t.a[j]} > ${key} 이므로 오른쪽으로 한 칸 밀어냅니다.`,
          highlights: { [j]: "compare", [j + 1]: "active" },
          pointers: [{ index: j, label: "j" }],
          vars: { i, j, key }
        });
        t.a[j + 1] = t.a[j];
        t.step({
          line: 5,
          message: `${t.a[j]}을 a[${j + 1}] 자리로 이동했습니다.`,
          highlights: { [j + 1]: "swap" },
          pointers: [{ index: j, label: "j" }],
          vars: { i, j, key }
        });
        j--;
      }
      t.a[j + 1] = key;
      t.markRange(0, i, "sorted");
      t.step({
        line: 8,
        message: `${key}를 a[${j + 1}] 자리에 삽입했습니다. 앞쪽 ${i + 1}개가 정렬 상태를 유지합니다.`,
        highlights: { [j + 1]: "found" },
        vars: { i, "삽입 위치": j + 1, key }
      });
    }
    t.step({ line: 10, message: "정렬 완료!" });
    return t.frames;
  }
};

export const mergeSort: AlgorithmDef = {
  id: "merge-sort",
  title: "Merge Sort",
  koTitle: "병합 정렬",
  category: "정렬",
  difficulty: "중급",
  summary: "배열을 반으로 쪼개 각각 정렬한 뒤, 두 정렬된 배열을 하나로 '병합'하는 분할 정복 알고리즘입니다.",
  insight: [
    "분할 정복(divide & conquer)의 대표 예시: 문제를 절반으로 나누면 깊이가 log n, 각 깊이에서 병합 비용이 n이라 O(n log n)입니다.",
    "입력이 어떤 모양이든 항상 O(n log n)을 보장합니다. (퀵 정렬과의 큰 차이)",
    "병합 단계에서 두 포인터로 작은 값부터 차례로 꺼내는 패턴은 '정렬된 두 배열 합치기' 문제 그 자체입니다.",
    "추가 배열 O(n)이 필요하다는 것이 단점입니다. 연결 리스트에서는 추가 공간 없이 가능합니다."
  ],
  complexity: { time: "O(n log n)", space: "O(n)" },
  code: [
    "function mergeSort(a: number[], lo: number, hi: number) {",
    "  if (hi - lo < 2) return;",
    "  const mid = (lo + hi) >> 1;",
    "  mergeSort(a, lo, mid);",
    "  mergeSort(a, mid, hi);",
    "  const merged = [];",
    "  let i = lo, j = mid;",
    "  while (i < mid || j < hi) {",
    "    if (j >= hi || (i < mid && a[i] <= a[j])) merged.push(a[i++]);",
    "    else merged.push(a[j++]);",
    "  }",
    "  for (let k = 0; k < merged.length; k++) a[lo + k] = merged[k];",
    "}"
  ],
  createFrames(): Frame[] {
    const t = new ArrayTracer(randomArray(8));
    t.step({ line: 0, message: "배열을 더 이상 쪼갤 수 없을 때까지 반으로 나눈 뒤, 정렬된 조각끼리 병합합니다." });

    const sort = (lo: number, hi: number, depth: number) => {
      if (hi - lo < 2) return;
      const mid = (lo + hi) >> 1;
      const range: Partial<Record<number, "window">> = {};
      for (let k = lo; k < hi; k++) range[k] = "window";
      t.step({
        line: 2,
        message: `구간 [${lo}..${hi - 1}]을 가운데(${mid})에서 둘로 나눕니다.`,
        highlights: range,
        vars: { lo, hi: hi - 1, mid, depth }
      });
      sort(lo, mid, depth + 1);
      sort(mid, hi, depth + 1);

      const merged: number[] = [];
      let i = lo;
      let j = mid;
      while (i < mid || j < hi) {
        if (j >= hi || (i < mid && t.a[i] <= t.a[j])) {
          t.step({
            line: 8,
            message:
              j >= hi
                ? `오른쪽 조각이 모두 소진되어 왼쪽의 ${t.a[i]}를 가져옵니다.`
                : `왼쪽 ${t.a[i]} ≤ 오른쪽 ${t.a[j]} 이므로 ${t.a[i]}를 먼저 가져옵니다.`,
            highlights: { ...range, [i]: "compare", ...(j < hi ? { [j]: "compare" } : {}) },
            pointers: [
              { index: i, label: "i" },
              ...(j < hi ? [{ index: j, label: "j" }] : [])
            ],
            vars: { lo, hi: hi - 1, "병합된 개수": merged.length }
          });
          merged.push(t.a[i++]);
        } else {
          t.step({
            line: 9,
            message:
              i >= mid
                ? `왼쪽 조각이 모두 소진되어 오른쪽의 ${t.a[j]}를 가져옵니다.`
                : `오른쪽 ${t.a[j]} < 왼쪽 ${t.a[i]} 이므로 ${t.a[j]}를 먼저 가져옵니다.`,
            highlights: { ...range, ...(i < mid ? { [i]: "compare" } : {}), [j]: "compare" },
            pointers: [
              ...(i < mid ? [{ index: i, label: "i" }] : []),
              { index: j, label: "j" }
            ],
            vars: { lo, hi: hi - 1, "병합된 개수": merged.length }
          });
          merged.push(t.a[j++]);
        }
      }
      for (let k = 0; k < merged.length; k++) t.a[lo + k] = merged[k];
      const done: Partial<Record<number, "found">> = {};
      for (let k = lo; k < hi; k++) done[k] = "found";
      t.step({
        line: 11,
        message: `구간 [${lo}..${hi - 1}] 병합 완료: [${merged.join(", ")}]`,
        highlights: done,
        vars: { lo, hi: hi - 1 }
      });
    };

    sort(0, t.a.length, 0);
    t.markRange(0, t.a.length - 1, "sorted");
    t.step({ line: 12, message: "정렬 완료! 모든 구간이 병합되었습니다." });
    return t.frames;
  }
};

export const quickSort: AlgorithmDef = {
  id: "quick-sort",
  title: "Quick Sort",
  koTitle: "퀵 정렬",
  category: "정렬",
  difficulty: "중급",
  summary: "피벗을 기준으로 작은 값은 왼쪽, 큰 값은 오른쪽으로 분할(partition)한 뒤 양쪽을 재귀적으로 정렬합니다.",
  insight: [
    "핵심은 partition: 피벗보다 작은 원소들의 경계를 한 번의 순회로 만들고, 피벗을 그 경계에 꽂으면 피벗의 최종 위치가 확정됩니다.",
    "평균 O(n log n)이지만 피벗이 계속 최솟/최댓값이면 O(n²)으로 퇴화합니다. 그래서 무작위 피벗이나 median-of-three를 씁니다.",
    "추가 배열 없이 제자리(in-place)에서 동작해 캐시 친화적이며, 실전에서 가장 빠른 비교 정렬로 꼽힙니다.",
    "여기서는 마지막 원소를 피벗으로 쓰는 Lomuto 분할을 보여줍니다."
  ],
  complexity: { time: "평균 O(n log n)", space: "O(log n)", note: "최악 O(n²) — 피벗 선택이 중요" },
  code: [
    "function quickSort(a: number[], lo: number, hi: number) {",
    "  if (lo >= hi) return;",
    "  const pivot = a[hi];",
    "  let i = lo;",
    "  for (let j = lo; j < hi; j++) {",
    "    if (a[j] < pivot) {",
    "      [a[i], a[j]] = [a[j], a[i]];",
    "      i++;",
    "    }",
    "  }",
    "  [a[i], a[hi]] = [a[hi], a[i]];",
    "  quickSort(a, lo, i - 1);",
    "  quickSort(a, i + 1, hi);",
    "}"
  ],
  createFrames(): Frame[] {
    const t = new ArrayTracer(randomArray(9));
    t.step({ line: 0, message: "피벗을 기준으로 배열을 분할하며 정렬합니다. 피벗은 분할이 끝나면 제자리가 확정됩니다." });

    const sort = (lo: number, hi: number) => {
      if (lo >= hi) {
        if (lo === hi) {
          t.mark(lo, "sorted");
          t.step({ line: 1, message: `구간에 원소가 하나뿐(a[${lo}]=${t.a[lo]})이라 그대로 확정합니다.`, vars: { lo, hi } });
        }
        return;
      }
      const pivot = t.a[hi];
      t.step({
        line: 2,
        message: `구간 [${lo}..${hi}]의 마지막 원소 ${pivot}를 피벗으로 선택합니다.`,
        highlights: { [hi]: "pivot" },
        vars: { lo, hi, pivot }
      });
      let i = lo;
      for (let j = lo; j < hi; j++) {
        t.step({
          line: 5,
          message: `a[${j}]=${t.a[j]}를 피벗 ${pivot}와 비교합니다.`,
          highlights: { [hi]: "pivot", [j]: "compare" },
          pointers: [
            { index: i, label: "i" },
            { index: j, label: "j" }
          ],
          vars: { lo, hi, pivot, i, j }
        });
        if (t.a[j] < pivot) {
          t.swap(i, j);
          t.step({
            line: 6,
            message:
              i === j
                ? `${t.a[i]} < ${pivot} 이므로 경계 i를 한 칸 전진시킵니다.`
                : `${t.a[i]} < ${pivot} 이므로 a[${i}]와 a[${j}]를 교환하고 경계 i를 전진시킵니다.`,
            highlights: { [hi]: "pivot", [i]: "swap", [j]: "swap" },
            pointers: [
              { index: i, label: "i" },
              { index: j, label: "j" }
            ],
            vars: { lo, hi, pivot, i, j }
          });
          i++;
        }
      }
      t.swap(i, hi);
      t.mark(i, "sorted");
      t.step({
        line: 10,
        message: `피벗 ${pivot}를 경계 위치 a[${i}]에 꽂습니다. 피벗의 최종 위치가 확정되었습니다.`,
        highlights: { [i]: "found" },
        vars: { lo, hi, "피벗 위치": i }
      });
      sort(lo, i - 1);
      sort(i + 1, hi);
    };

    sort(0, t.a.length - 1);
    t.markRange(0, t.a.length - 1, "sorted");
    t.step({ line: 13, message: "정렬 완료!" });
    return t.frames;
  }
};

/**
 * Learn 탭 알고리즘 정확성 감사(audit) 스크립트.
 *
 * 각 알고리즘의 프레임을 무작위 입력으로 여러 번 생성한 뒤,
 * 여기 들어 있는 "독립적인 레퍼런스 구현"의 결과와 대조한다.
 * 시각화 코드가 아니라 레퍼런스가 정답 기준이므로,
 * 시각화 쪽 로직이 틀리면 이 스크립트가 즉시 실패한다.
 *
 * 실행: pnpm --filter @algo-gym/web test  (또는 npx tsx scripts/verify-learn.ts)
 */
import { MAZE } from "../src/learn/algorithms/graph.ts";
import { algorithms } from "../src/learn/index.ts";
import type { ArrayFrame, Frame } from "../src/learn/types.ts";

const RUNS_PER_ALGORITHM = 40;
// 무작위성이 없는 알고리즘: 40회 반복해도 같은 프레임이라 1회면 충분하다.
const DETERMINISTIC_IDS = new Set(["bfs-grid", "dfs-grid", "n-queens", "trie"]);

type Check = (frames: Frame[]) => void;

function fail(message: string): never {
  throw new Error(message);
}

function lastFrame(frames: Frame[]): Frame {
  return frames[frames.length - 1];
}

function firstArrayValues(frames: Frame[]): number[] {
  const first = frames[0];
  if (first.kind !== "array") fail("첫 프레임이 배열이 아닙니다.");
  return first.values.map((value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) fail(`배열 값이 숫자가 아닙니다: ${JSON.stringify(value)} (NaN 비교는 검사를 무력화합니다)`);
    return n;
  });
}

function varOf(frame: Frame, name: string): string {
  const value = frame.vars?.[name];
  if (value === undefined) fail(`프레임에 변수 "${name}"가 없습니다. vars=${JSON.stringify(frame.vars)}`);
  return String(value);
}

// ---------- 레퍼런스 구현 ----------

function refMaxWindowSum(a: number[], k: number): number {
  let best = -Infinity;
  for (let i = 0; i + k <= a.length; i++) {
    let sum = 0;
    for (let d = 0; d < k; d++) sum += a[i + d];
    best = Math.max(best, sum);
  }
  return best;
}

function refMaxSubarray(a: number[]): number {
  let best = -Infinity;
  for (let i = 0; i < a.length; i++) {
    let sum = 0;
    for (let j = i; j < a.length; j++) {
      sum += a[j];
      best = Math.max(best, sum);
    }
  }
  return best;
}

function refRob(a: number[]): number {
  const dp = (i: number): number => (i < 0 ? 0 : Math.max(dp(i - 1), dp(i - 2) + a[i]));
  return dp(a.length - 1);
}

function refLcs(s: string, t: string): number {
  const dp = Array.from({ length: s.length + 1 }, () => new Array<number>(t.length + 1).fill(0));
  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      dp[i][j] = s[i - 1] === t[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[s.length][t.length];
}

function refKnapsack(items: Array<{ w: number; v: number }>, cap: number): number {
  // 2^n 부분집합 완전 탐색 — DP와 독립적인 기준값
  let best = 0;
  for (let mask = 0; mask < 1 << items.length; mask++) {
    let weight = 0;
    let value = 0;
    for (let i = 0; i < items.length; i++) {
      if (mask & (1 << i)) {
        weight += items[i].w;
        value += items[i].v;
      }
    }
    if (weight <= cap) best = Math.max(best, value);
  }
  return best;
}

function refCanJump(a: number[]): boolean {
  // BFS 도달 가능성 — 그리디와 독립적인 기준값
  const reachable = new Array<boolean>(a.length).fill(false);
  reachable[0] = true;
  for (let i = 0; i < a.length; i++) {
    if (!reachable[i]) continue;
    for (let d = 1; d <= a[i] && i + d < a.length; d++) reachable[i + d] = true;
  }
  return reachable[a.length - 1];
}

function refIsValidBrackets(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else if (stack.pop() !== pairs[ch]) return false;
  }
  return stack.length === 0;
}

function refDailyTemperatures(t: number[]): number[] {
  // O(n²) 브루트포스 — 모노토닉 스택과 독립적인 기준값
  return t.map((_, i) => {
    for (let j = i + 1; j < t.length; j++) {
      if (t[j] > t[i]) return j - i;
    }
    return 0;
  });
}

function refMazeShortestDistance(): number {
  const rows = MAZE.length;
  const cols = MAZE[0].length;
  let start: [number, number] = [0, 0];
  let goal: [number, number] = [rows - 1, cols - 1];
  MAZE.forEach((line, r) =>
    [...line].forEach((ch, c) => {
      if (ch === "S") start = [r, c];
      if (ch === "G") goal = [r, c];
    })
  );
  const dist = new Map<string, number>([[`${start[0]},${start[1]}`, 0]]);
  const queue: Array<[number, number]> = [start];
  while (queue.length) {
    const [r, c] = queue.shift()!;
    const d = dist.get(`${r},${c}`)!;
    if (r === goal[0] && c === goal[1]) return d;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (MAZE[nr][nc] === "#" || dist.has(`${nr},${nc}`)) continue;
      dist.set(`${nr},${nc}`, d + 1);
      queue.push([nr, nc]);
    }
  }
  fail("레퍼런스 BFS가 미로의 도착점에 닿지 못했습니다 — 미로 정의 오류!");
}

const MAZE_SHORTEST_DISTANCE = refMazeShortestDistance();

function refDijkstraMinCost(cost: number[][]): number {
  const rows = cost.length;
  const cols = cost[0].length;
  const dist = Array.from({ length: rows }, () => new Array<number>(cols).fill(Infinity));
  dist[0][0] = 0;
  const done = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  for (;;) {
    let br = -1;
    let bc = -1;
    let best = Infinity;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!done[r][c] && dist[r][c] < best) {
          best = dist[r][c];
          br = r;
          bc = c;
        }
      }
    }
    if (br < 0) return dist[rows - 1][cols - 1];
    done[br][bc] = true;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nr = br + dr;
      const nc = bc + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      dist[nr][nc] = Math.min(dist[nr][nc], best + cost[nr][nc]);
    }
  }
}

// ---------- 공통 불변식 ----------

function checkInvariants(id: string, frames: Frame[], code: string[]): void {
  if (frames.length < 5) fail(`${id}: 프레임이 ${frames.length}개뿐입니다.`);
  for (const frame of frames) {
    if (frame.codeLine < 0 || frame.codeLine >= code.length) {
      fail(`${id}: codeLine ${frame.codeLine}이 코드 범위(0..${code.length - 1})를 벗어났습니다.`);
    }
    if (!frame.message.trim()) fail(`${id}: 빈 메시지 프레임이 있습니다.`);
    if (frame.kind === "array") {
      for (const pointer of frame.pointers) {
        if (pointer.index < 0 || pointer.index >= frame.values.length) {
          fail(`${id}: 포인터 ${pointer.label}=${pointer.index}가 배열 범위를 벗어났습니다.`);
        }
      }
    }
  }
}

function checkSorted(id: string): Check {
  return (frames) => {
    const input = firstArrayValues(frames);
    const last = lastFrame(frames);
    if (last.kind !== "array") fail(`${id}: 마지막 프레임이 배열이 아닙니다.`);
    const output = last.values.map(Number);
    for (let i = 1; i < output.length; i++) {
      if (output[i - 1] > output[i]) fail(`${id}: 결과가 정렬되지 않았습니다: [${output.join(", ")}]`);
    }
    const a = [...input].sort((x, y) => x - y).join(",");
    const b = [...output].sort((x, y) => x - y).join(",");
    if (a !== b) fail(`${id}: 원소가 보존되지 않았습니다. 입력 ${a} vs 출력 ${b}`);
  };
}

// ---------- 알고리즘별 정답 검증 ----------

const checks: Record<string, Check> = {
  "bubble-sort": checkSorted("bubble-sort"),
  "selection-sort": checkSorted("selection-sort"),
  "insertion-sort": checkSorted("insertion-sort"),
  "counting-sort": checkSorted("counting-sort"),
  "merge-sort": checkSorted("merge-sort"),
  "quick-sort": checkSorted("quick-sort"),
  "heap-sort": checkSorted("heap-sort"),

  "binary-search": (frames) => {
    const values = firstArrayValues(frames);
    const target = Number(varOf(frames[0], "target"));
    const found = frames.some(
      (f) =>
        f.kind === "array" &&
        Object.entries(f.highlights).some(([idx, role]) => role === "found" && Number(f.values[Number(idx)]) === target)
    );
    const exists = values.includes(target);
    if (exists !== found) fail(`binary-search: target=${target} 존재 여부(${exists})와 탐색 결과(${found})가 다릅니다.`);
  },

  "two-pointers": (frames) => {
    const values = firstArrayValues(frames);
    const target = Number(varOf(frames[0], "target"));
    const last = lastFrame(frames) as ArrayFrame;
    const foundIdx = Object.entries(last.highlights)
      .filter(([, role]) => role === "found")
      .map(([idx]) => Number(idx));
    if (foundIdx.length !== 2) fail(`two-pointers: 정답 쌍이 표시되지 않았습니다 (입력에 답이 보장되는데도).`);
    const sum = values[foundIdx[0]] + values[foundIdx[1]];
    if (sum !== target) fail(`two-pointers: ${values[foundIdx[0]]}+${values[foundIdx[1]]}=${sum} ≠ target ${target}`);
  },

  "sliding-window": (frames) => {
    const values = firstArrayValues(frames);
    const k = Number(varOf(frames[0], "k"));
    const reported = Number(varOf(lastFrame(frames), "best"));
    const expected = refMaxWindowSum(values, k);
    if (reported !== expected) fail(`sliding-window: 보고된 최대 합 ${reported} ≠ 기준값 ${expected}`);
  },

  "prefix-sum": (frames) => {
    const values = firstArrayValues(frames);
    for (const frame of frames) {
      if (frame.vars && "구간 합" in frame.vars) {
        const l = Number(varOf(frame, "l"));
        const r = Number(varOf(frame, "r"));
        const reported = Number(varOf(frame, "구간 합"));
        const expected = values.slice(l, r + 1).reduce((s, v) => s + v, 0);
        if (reported !== expected) fail(`prefix-sum: [${l}..${r}] 합 ${reported} ≠ 기준값 ${expected}`);
      }
    }
  },

  "hash-two-sum": (frames) => {
    const values = firstArrayValues(frames);
    const target = Number(varOf(frames[0], "target"));
    const last = lastFrame(frames) as ArrayFrame;
    const foundIdx = Object.entries(last.highlights)
      .filter(([, role]) => role === "found")
      .map(([idx]) => Number(idx));
    if (foundIdx.length !== 2) fail("hash-two-sum: 정답 쌍이 표시되지 않았습니다 (입력에 답이 보장되는데도).");
    const sum = values[foundIdx[0]] + values[foundIdx[1]];
    if (sum !== target) fail(`hash-two-sum: 쌍의 합 ${sum} ≠ target ${target}`);
  },

  "valid-parentheses": (frames) => {
    const first = frames[0];
    if (first.kind !== "array") fail("valid-parentheses: 배열 프레임이 아닙니다.");
    const s = first.values.join("");
    const reported = varOf(lastFrame(frames), "결과") === "true";
    const expected = refIsValidBrackets(s);
    if (reported !== expected) fail(`valid-parentheses: "${s}"의 판정 ${reported} ≠ 기준값 ${expected}`);
  },

  "monotonic-stack": (frames) => {
    const temps = firstArrayValues(frames);
    const reported = varOf(lastFrame(frames), "answer");
    const expected = `[${refDailyTemperatures(temps).join(", ")}]`;
    if (reported !== expected) fail(`monotonic-stack: ${reported} ≠ 기준값 ${expected}`);
  },

  "reverse-linked-list": (frames) => {
    const values = firstArrayValues(frames);
    const last = lastFrame(frames) as ArrayFrame;
    if (!last.message.includes(String(values[values.length - 1]))) {
      fail("reverse-linked-list: 마지막 노드가 새 head로 보고되지 않았습니다.");
    }
    // 모든 노드의 화살표가 뒤집혔는지 확인
    const sublabels = last.sublabels ?? {};
    if (sublabels[0] !== "→null") fail("reverse-linked-list: 첫 노드가 null을 가리키지 않습니다.");
    for (let i = 1; i < values.length; i++) {
      if (sublabels[i] !== "←next") fail(`reverse-linked-list: 노드 ${i}의 화살표가 뒤집히지 않았습니다 (${sublabels[i]}).`);
    }
  },

  "union-find": (frames) => {
    // 메시지에서 union 연산을 추출해 독립 DSU로 그룹 수를 재계산한다.
    const n = (frames[0] as ArrayFrame).values.length;
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    for (const frame of frames) {
      const op = frame.vars?.union;
      if (typeof op === "string") {
        const [a, b] = op.split(",").map(Number);
        const ra = find(a);
        const rb = find(b);
        if (ra !== rb) parent[rb] = ra;
      }
    }
    const expected = new Set(Array.from({ length: n }, (_, i) => find(i))).size;
    const reported = Number(varOf(lastFrame(frames), "그룹 수"));
    if (reported !== expected) fail(`union-find: 그룹 수 ${reported} ≠ 기준값 ${expected}`);
  },

  "climbing-stairs": (frames) => {
    const n = Number(varOf(frames[0], "n"));
    const fib = [1, 1];
    for (let i = 2; i <= n; i++) fib.push(fib[i - 1] + fib[i - 2]);
    const reported = Number(varOf(lastFrame(frames), `dp[${n}]`));
    if (reported !== fib[n]) fail(`climbing-stairs: dp[${n}]=${reported} ≠ 기준값 ${fib[n]}`);
  },

  kadane: (frames) => {
    const values = firstArrayValues(frames);
    const reported = Number(varOf(lastFrame(frames), "best"));
    const expected = refMaxSubarray(values);
    if (reported !== expected) fail(`kadane: best=${reported} ≠ 기준값 ${expected}`);
  },

  "house-robber": (frames) => {
    const values = firstArrayValues(frames);
    const reported = Number(varOf(lastFrame(frames), "정답"));
    const expected = refRob(values);
    if (reported !== expected) fail(`house-robber: ${reported} ≠ 기준값 ${expected}`);
  },

  lcs: (frames) => {
    const s = varOf(frames[0], "s");
    const t = varOf(frames[0], "t");
    const reported = Number(varOf(lastFrame(frames), "LCS 길이"));
    const expected = refLcs(s, t);
    if (reported !== expected) fail(`lcs: "${s}" vs "${t}" 길이 ${reported} ≠ 기준값 ${expected}`);
    // 복원된 수열이 실제 공통 부분 수열인지도 확인
    const seq = varOf(lastFrame(frames), "LCS");
    if (seq !== "(없음)") {
      const isSubsequence = (needle: string, hay: string) => {
        let i = 0;
        for (const ch of hay) if (ch === needle[i]) i++;
        return i === needle.length;
      };
      if (seq.length !== expected) fail(`lcs: 복원된 수열 "${seq}"의 길이가 ${expected}가 아닙니다.`);
      if (!isSubsequence(seq, s) || !isSubsequence(seq, t)) {
        fail(`lcs: "${seq}"가 두 문자열 모두의 부분 수열이 아닙니다.`);
      }
    } else if (expected !== 0) {
      fail(`lcs: 수열이 없다고 보고했지만 기준 길이는 ${expected}입니다.`);
    }
  },

  knapsack: (frames) => {
    const items = varOf(frames[0], "items")
      .split(",")
      .map((pair) => {
        const [w, v] = pair.split(":").map(Number);
        return { w, v };
      });
    if (items.length !== 4) fail(`knapsack: 첫 프레임에서 물건 4개를 읽지 못했습니다 (${items.length}개).`);
    const cap = Number(varOf(frames[0], "용량"));
    const reported = Number(varOf(lastFrame(frames), "최대 가치"));
    const expected = refKnapsack(items, cap);
    if (reported !== expected) fail(`knapsack: 최대 가치 ${reported} ≠ 기준값(완전 탐색) ${expected}`);
  },

  "jump-game": (frames) => {
    const values = firstArrayValues(frames);
    const reported = varOf(lastFrame(frames), "결과");
    const expected = String(refCanJump(values));
    if (reported !== expected) fail(`jump-game: [${values.join(",")}] 판정 ${reported} ≠ 기준값 ${expected}`);
  },

  "bfs-grid": (frames) => {
    const last = lastFrame(frames);
    if (!last.message.includes("도착")) fail("bfs-grid: 도착점에 닿지 못했습니다.");
    const reported = Number(varOf(last, "최단 거리"));
    const expected = MAZE_SHORTEST_DISTANCE;
    if (reported !== expected) fail(`bfs-grid: 최단 거리 ${reported} ≠ 기준값 ${expected}`);
  },

  "dfs-grid": (frames) => {
    const last = lastFrame(frames);
    if (!last.message.includes("도착")) fail("dfs-grid: 도착점에 닿지 못했습니다.");
    const reported = Number(varOf(last, "경로 길이"));
    const shortest = MAZE_SHORTEST_DISTANCE;
    if (reported < shortest) fail(`dfs-grid: 경로 길이 ${reported}가 최단 거리 ${shortest}보다 짧을 수는 없습니다.`);
  },

  dijkstra: (frames) => {
    const first = frames[0];
    if (first.kind !== "grid" || !first.labels) fail("dijkstra: 비용 라벨이 없습니다.");
    const cost = first.labels.map((row) => row.map(Number));
    cost[0][0] = 0; // 시작 칸 라벨은 거리(0)이지만 입장 비용은 쓰이지 않는다.
    const last = lastFrame(frames);
    if (!last.message.includes("도착")) fail("dijkstra: 도착점에 닿지 못했습니다.");
    const reported = Number(varOf(last, "최소 비용"));
    const expected = refDijkstraMinCost(cost);
    if (reported !== expected) fail(`dijkstra: 최소 비용 ${reported} ≠ 기준값 ${expected}`);
  },

  "n-queens": (frames) => {
    const solution = varOf(lastFrame(frames), "해");
    const queens = solution.replace(/[[\]\s]/g, "").split(",").map(Number);
    if (queens.length !== 6) fail(`n-queens: 해의 길이가 6이 아닙니다: ${solution}`);
    for (let i = 0; i < queens.length; i++) {
      if (queens[i] < 0 || queens[i] >= 6) fail(`n-queens: 잘못된 열 ${queens[i]}`);
      for (let j = i + 1; j < queens.length; j++) {
        if (queens[i] === queens[j]) fail(`n-queens: ${i}행과 ${j}행의 퀸이 같은 열에 있습니다.`);
        if (Math.abs(queens[i] - queens[j]) === j - i) fail(`n-queens: ${i}행과 ${j}행의 퀸이 대각선에서 충돌합니다.`);
      }
    }
  },

  quickselect: (frames) => {
    const values = firstArrayValues(frames);
    const k = Number(varOf(frames[0], "k"));
    const reported = Number(varOf(lastFrame(frames), "정답"));
    const expected = [...values].sort((a, b) => a - b)[values.length - k];
    if (reported !== expected) fail(`quickselect: ${k}번째 큰 수 ${reported} ≠ 기준값(정렬) ${expected}`);
  },

  "fast-slow-pointers": (frames) => {
    // 첫 프레임의 기계용 vars.next에서 연결 구조를 복원해 Set 기반으로 사이클을 재판정한다.
    const next = varOf(frames[0], "next").split(",").map(Number);
    if (next.some((value) => !Number.isInteger(value))) fail("fast-slow-pointers: next 목록이 손상되었습니다.");
    const seen = new Set<number>();
    let cursor = 0;
    let expected = false;
    while (cursor !== -1) {
      if (seen.has(cursor)) {
        expected = true;
        break;
      }
      seen.add(cursor);
      cursor = next[cursor];
    }
    const reported = varOf(lastFrame(frames), "결과") === "true";
    if (reported !== expected) fail(`fast-slow-pointers: 판정 ${reported} ≠ 기준값(방문 집합) ${expected}`);
  },

  "binary-tree-inorder": (frames) => {
    const first = frames[0];
    if (first.kind !== "grid" || !first.labels) fail("binary-tree-inorder: 트리 라벨이 없습니다.");
    const values = first.labels.flat().filter((label): label is number => typeof label === "number");
    const expected = `[${[...values].sort((a, b) => a - b).join(", ")}]`;
    const reported = varOf(lastFrame(frames), "결과");
    if (reported !== expected) fail(`binary-tree-inorder: 순회 결과 ${reported} ≠ 정렬 순서 ${expected}`);
  },

  trie: (frames) => {
    const last = lastFrame(frames);
    const words = varOf(last, "단어").split(", ");
    for (const query of ["CAR", "CA", "CAB"]) {
      const reported = varOf(last, `search("${query}")`) === "true";
      const expected = words.includes(query);
      if (reported !== expected) fail(`trie: search("${query}") = ${reported} ≠ 기준값(단어 목록 포함 여부) ${expected}`);
    }
    // 렌더링된 트라이 구조 자체를 단어 목록에서 독립적으로 재구성한 기준과 대조한다.
    if (last.kind !== "grid" || !last.labels) fail("trie: 트라이 라벨이 없습니다.");
    const renderedLabels = last.labels.flat().filter((label): label is string => typeof label === "string");
    const expectedPrefixes = new Set<string>([""]);
    for (const word of words) {
      for (let i = 1; i <= word.length; i++) expectedPrefixes.add(word.slice(0, i));
    }
    if (renderedLabels.length !== expectedPrefixes.size) {
      fail(`trie: 렌더링된 노드 ${renderedLabels.length}개 ≠ 기준 트라이 노드 ${expectedPrefixes.size}개`);
    }
    const renderedEnds = renderedLabels.filter((label) => label.endsWith("●")).map((label) => label[0]).sort();
    const expectedEnds = words.map((word) => word[word.length - 1]).sort();
    if (renderedEnds.join() !== expectedEnds.join()) {
      fail(`trie: 단어 끝 표시(●) [${renderedEnds.join(",")}] ≠ 기준 [${expectedEnds.join(",")}]`);
    }
  },

  "coin-change": (frames) => {
    const coins = varOf(frames[0], "coins").replace(/[[\]\s]/g, "").split(",").map(Number);
    const amount = Number(varOf(frames[0], "amount"));
    // BFS — DP와 독립적인 기준값
    let expected = -1;
    const visited = new Set([0]);
    let level = [0];
    for (let count = 1; level.length > 0 && expected === -1; count++) {
      const nextLevel: number[] = [];
      for (const value of level) {
        for (const coin of coins) {
          const sum = value + coin;
          if (sum === amount) expected = count;
          if (sum < amount && !visited.has(sum)) {
            visited.add(sum);
            nextLevel.push(sum);
          }
        }
      }
      level = nextLevel;
    }
    const reported = Number(varOf(lastFrame(frames), "정답"));
    if (reported !== expected) fail(`coin-change: [${coins.join(",")}]로 ${amount}원 → ${reported} ≠ 기준값(BFS) ${expected}`);
  },

  "topological-sort": (frames) => {
    const edges = varOf(frames[0], "간선")
      .split(", ")
      .map((edge) => edge.split("→").map(Number) as [number, number]);
    const order = varOf(lastFrame(frames), "순서").replace(/[[\]\s]/g, "").split(",").map(Number);
    if ([...order].sort((a, b) => a - b).join() !== "0,1,2,3,4,5,6") {
      fail(`topological-sort: 순서가 0..6의 순열이 아닙니다: [${order.join(",")}]`);
    }
    const position = new Map(order.map((v, idx) => [v, idx]));
    for (const [from, to] of edges) {
      if (position.get(from)! >= position.get(to)!) {
        fail(`topological-sort: 간선 ${from}→${to}가 순서 [${order.join(",")}]를 위반합니다.`);
      }
    }
  }
};

// ---------- 실행 ----------

let failures = 0;
for (const algorithm of algorithms) {
  const check = checks[algorithm.id];
  if (!check) {
    console.error(`FAIL ${algorithm.id}: 검증 루틴이 등록되지 않았습니다. 새 알고리즘에는 반드시 검증을 추가하세요.`);
    failures++;
    continue;
  }
  const runs = DETERMINISTIC_IDS.has(algorithm.id) ? 1 : RUNS_PER_ALGORITHM;
  let frameCount = 0;
  try {
    for (let run = 0; run < runs; run++) {
      const frames = algorithm.createFrames();
      frameCount = frames.length;
      checkInvariants(algorithm.id, frames, algorithm.code);
      check(frames);
    }
    console.log(`PASS ${algorithm.id} (${runs}회 실행, 마지막 ${frameCount} 프레임)`);
  } catch (error) {
    console.error(`FAIL ${algorithm.id}: ${error instanceof Error ? error.message : error}`);
    failures++;
  }
}

if (failures > 0) {
  console.error(`\n${failures}개 알고리즘이 감사를 통과하지 못했습니다.`);
  process.exit(1);
}
console.log(`\n전체 ${algorithms.length}개 알고리즘 감사 통과 (무작위 입력 ${RUNS_PER_ALGORITHM}회, 결정적 알고리즘 1회).`);

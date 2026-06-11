import type { AlgorithmDef, CellState, Frame, GridFrame } from "../types.ts";

const MAZE = [
  "S..#........",
  ".#.#.#####..",
  ".#.#.....#..",
  ".#.#.#.#.#..",
  ".#...#.#.#..",
  ".###.#.#.#..",
  ".....#.#....",
  ".....#.#...G"
];

type Cell = [row: number, col: number];

const DIRECTIONS: Cell[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
];

function parseMaze() {
  const rows = MAZE.length;
  const cols = MAZE[0].length;
  let start: Cell = [0, 0];
  let goal: Cell = [rows - 1, cols - 1];
  const walls = new Set<string>();

  MAZE.forEach((line, r) => {
    [...line].forEach((ch, c) => {
      if (ch === "#") walls.add(`${r},${c}`);
      if (ch === "S") start = [r, c];
      if (ch === "G") goal = [r, c];
    });
  });

  return { rows, cols, start, goal, walls };
}

function key([r, c]: Cell): string {
  return `${r},${c}`;
}

type GridSnapshotInput = {
  visited: Set<string>;
  frontier: Set<string>;
  current?: Cell;
  path?: Cell[];
  line: number;
  message: string;
  vars?: Record<string, string | number>;
};

function makeGridFrame(input: GridSnapshotInput): GridFrame {
  const { rows, cols, start, goal, walls } = parseMaze();
  const pathKeys = new Set((input.path ?? []).map(key));
  const cells: CellState[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: CellState[] = [];
    for (let c = 0; c < cols; c++) {
      const k = `${r},${c}`;
      let state: CellState = "empty";
      if (walls.has(k)) state = "wall";
      else if (input.visited.has(k)) state = "visited";
      if (input.frontier.has(k)) state = "frontier";
      if (pathKeys.has(k)) state = "path";
      if (k === key(start)) state = "start";
      if (k === key(goal)) state = "goal";
      if (input.current && k === key(input.current) && k !== key(start) && k !== key(goal)) state = "current";
      row.push(state);
    }
    cells.push(row);
  }

  return {
    kind: "grid",
    cells,
    codeLine: input.line,
    message: input.message,
    vars: input.vars
  };
}

function reconstructPath(parent: Map<string, Cell>, goal: Cell): Cell[] {
  const path: Cell[] = [goal];
  let cursor = key(goal);
  while (parent.has(cursor)) {
    const prev = parent.get(cursor)!;
    path.push(prev);
    cursor = key(prev);
  }
  return path.reverse();
}

export const bfsGrid: AlgorithmDef = {
  id: "bfs-grid",
  title: "BFS (Breadth-First Search)",
  koTitle: "너비 우선 탐색",
  category: "그래프 탐색",
  difficulty: "중급",
  summary: "큐를 사용해 가까운 칸부터 물결처럼 퍼져 나가며 탐색합니다. 미로의 최단 경로를 보장합니다.",
  insight: [
    "큐(FIFO)를 쓰기 때문에 시작점에서 거리 1인 칸을 모두 본 뒤에야 거리 2인 칸을 봅니다. 이것이 최단 경로 보장의 이유입니다.",
    "가중치가 모두 같은(=1) 그래프에서만 최단 경로를 보장합니다. 가중치가 다르면 다익스트라가 필요합니다.",
    "방문 표시는 큐에서 꺼낼 때가 아니라 '큐에 넣을 때' 해야 같은 칸이 중복으로 들어가지 않습니다.",
    "경로 자체가 필요하면 parent 맵을 기록한 뒤 도착점에서 거꾸로 따라가면 됩니다."
  ],
  complexity: { time: "O(V + E)", space: "O(V)", note: "격자에서는 O(행 × 열)" },
  code: [
    "function bfs(start: Cell, goal: Cell) {",
    "  const queue: Cell[] = [start];",
    "  const visited = new Set([key(start)]);",
    "  const parent = new Map<string, Cell>();",
    "  while (queue.length > 0) {",
    "    const cur = queue.shift()!;",
    "    if (key(cur) === key(goal)) return path(parent, cur);",
    "    for (const next of neighbors(cur)) {",
    "      if (visited.has(key(next))) continue;",
    "      visited.add(key(next));",
    "      parent.set(key(next), cur);",
    "      queue.push(next);",
    "    }",
    "  }",
    "  return null;",
    "}"
  ],
  createFrames(): Frame[] {
    const { rows, cols, start, goal, walls } = parseMaze();
    const frames: Frame[] = [];
    const queue: Cell[] = [start];
    const visited = new Set([key(start)]);
    const parent = new Map<string, Cell>();
    const distance = new Map([[key(start), 0]]);
    const frontier = () => new Set(queue.map(key));

    frames.push(
      makeGridFrame({
        visited,
        frontier: frontier(),
        line: 1,
        message: "시작점을 큐에 넣고 방문 표시합니다. 큐에 든 칸(노란색)이 탐색 경계입니다.",
        vars: { "큐 크기": 1, "방문한 칸": 1 }
      })
    );

    while (queue.length > 0) {
      const cur = queue.shift()!;
      const curDistance = distance.get(key(cur)) ?? 0;
      frames.push(
        makeGridFrame({
          visited,
          frontier: frontier(),
          current: cur,
          line: 5,
          message: `큐에서 (${cur[0]}, ${cur[1]})을 꺼냅니다. 시작점에서의 거리는 ${curDistance}입니다.`,
          vars: { "큐 크기": queue.length, "방문한 칸": visited.size, 거리: curDistance }
        })
      );

      if (key(cur) === key(goal)) {
        const path = reconstructPath(parent, cur);
        frames.push(
          makeGridFrame({
            visited,
            frontier: new Set(),
            path,
            line: 6,
            message: `도착! 최단 거리는 ${curDistance}이며, parent 맵을 거꾸로 따라가 경로를 복원했습니다.`,
            vars: { "최단 거리": curDistance, "경로 길이": path.length, "방문한 칸": visited.size }
          })
        );
        return frames;
      }

      const discovered: Cell[] = [];
      for (const [dr, dc] of DIRECTIONS) {
        const next: Cell = [cur[0] + dr, cur[1] + dc];
        const [r, c] = next;
        if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
        if (walls.has(key(next)) || visited.has(key(next))) continue;
        visited.add(key(next));
        parent.set(key(next), cur);
        distance.set(key(next), curDistance + 1);
        queue.push(next);
        discovered.push(next);
      }
      if (discovered.length > 0) {
        frames.push(
          makeGridFrame({
            visited,
            frontier: frontier(),
            current: cur,
            line: 11,
            message: `이웃 ${discovered.length}칸을 새로 발견해 큐에 넣습니다: ${discovered.map(([r, c]) => `(${r},${c})`).join(" ")}`,
            vars: { "큐 크기": queue.length, "방문한 칸": visited.size, 거리: curDistance }
          })
        );
      }
    }

    frames.push(
      makeGridFrame({
        visited,
        frontier: new Set(),
        line: 14,
        message: "큐가 비었지만 도착점에 닿지 못했습니다. 경로가 존재하지 않습니다.",
        vars: { "방문한 칸": visited.size }
      })
    );
    return frames;
  }
};

export const dfsGrid: AlgorithmDef = {
  id: "dfs-grid",
  title: "DFS (Depth-First Search)",
  koTitle: "깊이 우선 탐색",
  category: "그래프 탐색",
  difficulty: "중급",
  summary: "스택을 사용해 한 방향으로 끝까지 파고들다가, 막히면 갈림길로 되돌아와(backtrack) 다른 길을 탐색합니다.",
  insight: [
    "BFS와 코드 구조가 거의 같고 큐를 스택(LIFO)으로 바꾼 것뿐인데, 탐색 순서가 완전히 달라지는 것을 관찰해 보세요.",
    "DFS가 찾은 경로는 최단 경로가 아닐 수 있습니다. '경로 존재 여부', '연결 요소 개수', '사이클 검출' 같은 문제에 적합합니다.",
    "재귀로 쓰면 코드가 짧지만 격자가 크면 스택 오버플로 위험이 있어, 명시적 스택 버전도 알아두어야 합니다.",
    "막다른 길에서 되돌아 나오는 백트래킹은 순열/조합 생성, N-Queen 같은 문제의 뼈대입니다."
  ],
  complexity: { time: "O(V + E)", space: "O(V)", note: "재귀 깊이가 V까지 커질 수 있음" },
  code: [
    "function dfs(start: Cell, goal: Cell) {",
    "  const stack: Cell[] = [start];",
    "  const visited = new Set([key(start)]);",
    "  const parent = new Map<string, Cell>();",
    "  while (stack.length > 0) {",
    "    const cur = stack.pop()!;",
    "    if (key(cur) === key(goal)) return path(parent, cur);",
    "    for (const next of neighbors(cur)) {",
    "      if (visited.has(key(next))) continue;",
    "      visited.add(key(next));",
    "      parent.set(key(next), cur);",
    "      stack.push(next);",
    "    }",
    "  }",
    "  return null;",
    "}"
  ],
  createFrames(): Frame[] {
    const { rows, cols, start, goal, walls } = parseMaze();
    const frames: Frame[] = [];
    const stack: Cell[] = [start];
    const visited = new Set([key(start)]);
    const parent = new Map<string, Cell>();
    const frontier = () => new Set(stack.map(key));

    frames.push(
      makeGridFrame({
        visited,
        frontier: frontier(),
        line: 1,
        message: "시작점을 스택에 넣습니다. 스택에 든 칸(노란색) 중 가장 최근 것부터 꺼냅니다.",
        vars: { "스택 크기": 1, "방문한 칸": 1 }
      })
    );

    while (stack.length > 0) {
      const cur = stack.pop()!;
      frames.push(
        makeGridFrame({
          visited,
          frontier: frontier(),
          current: cur,
          line: 5,
          message: `스택에서 가장 최근에 넣은 (${cur[0]}, ${cur[1]})을 꺼냅니다. 한 길로 깊이 파고듭니다.`,
          vars: { "스택 크기": stack.length, "방문한 칸": visited.size }
        })
      );

      if (key(cur) === key(goal)) {
        const path = reconstructPath(parent, cur);
        frames.push(
          makeGridFrame({
            visited,
            frontier: new Set(),
            path,
            line: 6,
            message: `도착! 경로 길이는 ${path.length - 1}입니다. BFS와 달리 이 경로는 최단이 아닐 수 있습니다.`,
            vars: { "경로 길이": path.length - 1, "방문한 칸": visited.size }
          })
        );
        return frames;
      }

      const discovered: Cell[] = [];
      for (const [dr, dc] of DIRECTIONS) {
        const next: Cell = [cur[0] + dr, cur[1] + dc];
        const [r, c] = next;
        if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
        if (walls.has(key(next)) || visited.has(key(next))) continue;
        visited.add(key(next));
        parent.set(key(next), cur);
        stack.push(next);
        discovered.push(next);
      }
      if (discovered.length > 0) {
        frames.push(
          makeGridFrame({
            visited,
            frontier: frontier(),
            current: cur,
            line: 11,
            message: `이웃 ${discovered.length}칸을 스택에 쌓습니다. 마지막에 쌓인 칸을 다음에 탐색합니다.`,
            vars: { "스택 크기": stack.length, "방문한 칸": visited.size }
          })
        );
      } else {
        frames.push(
          makeGridFrame({
            visited,
            frontier: frontier(),
            current: cur,
            line: 4,
            message: "막다른 길입니다. 스택에 남아 있는 갈림길로 되돌아갑니다(백트래킹).",
            vars: { "스택 크기": stack.length, "방문한 칸": visited.size }
          })
        );
      }
    }

    frames.push(
      makeGridFrame({
        visited,
        frontier: new Set(),
        line: 14,
        message: "스택이 비었지만 도착점에 닿지 못했습니다. 경로가 존재하지 않습니다.",
        vars: { "방문한 칸": visited.size }
      })
    );
    return frames;
  }
};

const DIJKSTRA_ROWS = 6;
const DIJKSTRA_COLS = 10;

const DIJKSTRA_LEGEND = [
  { state: "start", label: "시작" },
  { state: "goal", label: "도착" },
  { state: "current", label: "방금 확정" },
  { state: "frontier", label: "거리 계산됨(미확정)" },
  { state: "visited", label: "최단 거리 확정" },
  { state: "path", label: "최단 경로" },
  { state: "empty", label: "미방문 (숫자 = 입장 비용)" }
] satisfies GridFrame["legend"];

export const dijkstra: AlgorithmDef = {
  id: "dijkstra",
  title: "Dijkstra's Algorithm",
  koTitle: "다익스트라",
  category: "그래프 탐색",
  difficulty: "고급",
  summary: "칸마다 지나가는 비용이 다른 지도에서 최소 비용 경로를 찾습니다. '아직 확정 안 된 곳 중 가장 가까운 곳'을 하나씩 확정합니다.",
  insight: [
    "BFS는 모든 간선의 비용이 같을 때만 최단 경로를 보장합니다. 비용이 제각각이면 다익스트라가 필요합니다.",
    "핵심 불변식: 미확정 정점 중 거리가 가장 작은 정점은 그 거리가 이미 최단입니다 — 다른 경로로 우회하면 반드시 더 비싸지기 때문입니다 (음수 간선이 없다는 전제).",
    "음수 가중치가 있으면 이 불변식이 깨집니다. 그때는 벨만-포드를 써야 합니다.",
    "여기서는 배우기 쉬운 '선형 탐색으로 최솟값 찾기' O(V²) 버전을 보여줍니다. 실전에서는 최소 힙을 써서 O((V+E) log V)로 줄입니다.",
    "네트워크 라우팅(OSPF), 지도 길찾기의 기반 알고리즘입니다. LeetCode 743 Network Delay Time이 대표 문제입니다."
  ],
  complexity: { time: "O(V²)", space: "O(V)", note: "최소 힙 사용 시 O((V+E) log V)" },
  code: [
    "function dijkstra(start: Cell, goal: Cell) {",
    "  const dist = new Map([[key(start), 0]]);",
    "  const done = new Set<string>();",
    "  while (true) {",
    "    const cur = minUndone(dist, done); // 미확정 중 최소 거리",
    "    if (!cur) return null;",
    "    done.add(key(cur));",
    "    if (key(cur) === key(goal)) return path(parent, cur);",
    "    for (const next of neighbors(cur)) {",
    "      const cand = dist.get(key(cur))! + cost(next);",
    "      if (cand < (dist.get(key(next)) ?? Infinity)) {",
    "        dist.set(key(next), cand);",
    "        parent.set(key(next), cur);",
    "      }",
    "    }",
    "  }",
    "}"
  ],
  createFrames(): Frame[] {
    const rows = DIJKSTRA_ROWS;
    const cols = DIJKSTRA_COLS;
    const cost: number[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 1 + Math.floor(Math.random() * 5))
    );
    const start: Cell = [0, 0];
    const goal: Cell = [rows - 1, cols - 1];

    const dist = new Map<string, number>([[key(start), 0]]);
    const done = new Set<string>();
    const parent = new Map<string, Cell>();
    const frames: Frame[] = [];

    const makeFrame = (
      line: number,
      message: string,
      options: { current?: Cell; path?: Cell[]; vars?: Record<string, string | number> } = {}
    ): GridFrame => {
      const pathKeys = new Set((options.path ?? []).map(key));
      const cells: CellState[][] = [];
      const labels: Array<Array<string | number | null>> = [];
      for (let r = 0; r < rows; r++) {
        const rowCells: CellState[] = [];
        const rowLabels: Array<string | number | null> = [];
        for (let c = 0; c < cols; c++) {
          const k = `${r},${c}`;
          let state: CellState = "empty";
          if (dist.has(k)) state = done.has(k) ? "visited" : "frontier";
          if (pathKeys.has(k)) state = "path";
          if (k === key(start)) state = "start";
          if (k === key(goal) && !dist.has(k) && !pathKeys.has(k)) state = "goal";
          if (options.current && k === key(options.current)) state = "current";
          rowCells.push(state);
          rowLabels.push(dist.has(k) ? dist.get(k)! : cost[r][c]);
        }
        cells.push(rowCells);
        labels.push(rowLabels);
      }
      return {
        kind: "grid",
        cells,
        labels,
        codeLine: line,
        message,
        vars: options.vars,
        legend: DIJKSTRA_LEGEND
      };
    };

    frames.push(
      makeFrame(1, "흰 칸의 숫자는 그 칸에 '들어가는 비용'입니다. 시작점의 거리를 0으로 두고 출발합니다.", {
        vars: { "확정된 칸": 0 }
      })
    );

    while (true) {
      let cur: Cell | undefined;
      let best = Infinity;
      for (const [k, d] of dist) {
        if (!done.has(k) && d < best) {
          best = d;
          cur = k.split(",").map(Number) as Cell;
        }
      }
      if (!cur) break;
      done.add(key(cur));
      frames.push(
        makeFrame(6, `미확정 칸 중 거리가 가장 작은 (${cur[0]}, ${cur[1]})(거리 ${best})를 확정합니다. 더 싼 우회로는 존재할 수 없습니다.`, {
          current: cur,
          vars: { "확정된 칸": done.size, "현재 거리": best }
        })
      );

      if (key(cur) === key(goal)) {
        const path: Cell[] = [cur];
        let walker = key(cur);
        while (parent.has(walker)) {
          const prev = parent.get(walker)!;
          path.push(prev);
          walker = key(prev);
        }
        path.reverse();
        frames.push(
          makeFrame(7, `도착! 최소 비용은 ${best}입니다. parent 맵을 따라 최단 경로를 복원했습니다.`, {
            path,
            vars: { "최소 비용": best, "경로 길이": path.length }
          })
        );
        return frames;
      }

      const improved: string[] = [];
      for (const [dr, dc] of DIRECTIONS) {
        const next: Cell = [cur[0] + dr, cur[1] + dc];
        const [r, c] = next;
        if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
        if (done.has(key(next))) continue;
        const cand = dist.get(key(cur))! + cost[r][c];
        if (cand < (dist.get(key(next)) ?? Infinity)) {
          dist.set(key(next), cand);
          parent.set(key(next), cur);
          improved.push(`(${r},${c})→${cand}`);
        }
      }
      if (improved.length > 0) {
        frames.push(
          makeFrame(11, `이웃의 거리를 갱신(relax)합니다: ${improved.join(", ")}`, {
            current: cur,
            vars: { "확정된 칸": done.size }
          })
        );
      }
    }

    frames.push(makeFrame(5, "더 이상 확정할 칸이 없습니다.", {}));
    return frames;
  }
};

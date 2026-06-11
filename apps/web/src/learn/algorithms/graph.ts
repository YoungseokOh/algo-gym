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

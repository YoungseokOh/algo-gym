import type { AlgorithmDef, CellState, Frame, GridFrame } from "../types.ts";

/**
 * 완전 이진 트리 좌표계: 깊이 d(0..3), 레벨 내 위치 p(0..2^d-1)의 노드를
 * 4행 × 15열 격자의 (d, 2^(3-d)·(2p+1) - 1) 칸에 배치한다.
 */
const TREE_DEPTH = 4;
const TREE_COLS = 15;

function treeCol(depth: number, pos: number): number {
  return 2 ** (TREE_DEPTH - 1 - depth) * (2 * pos + 1) - 1;
}

type BstNode = {
  value: number;
  depth: number;
  pos: number;
  left?: BstNode;
  right?: BstNode;
};

function buildRandomBst(): { root: BstNode; values: number[] } {
  const values: number[] = [];
  let root: BstNode | undefined;

  const insert = (value: number): boolean => {
    if (!root) {
      root = { value, depth: 0, pos: 0 };
      return true;
    }
    let node = root;
    for (;;) {
      if (value === node.value) return false;
      const goLeft = value < node.value;
      const child = goLeft ? node.left : node.right;
      if (child) {
        node = child;
        continue;
      }
      if (node.depth + 1 >= TREE_DEPTH) return false; // 격자 깊이 초과 시 버린다
      const next: BstNode = {
        value,
        depth: node.depth + 1,
        pos: node.pos * 2 + (goLeft ? 0 : 1)
      };
      if (goLeft) node.left = next;
      else node.right = next;
      return true;
    }
  };

  let attempts = 0;
  while (values.length < 9 && attempts < 60) {
    attempts++;
    const value = 1 + Math.floor(Math.random() * 99);
    if (!values.includes(value) && insert(value)) values.push(value);
  }
  return { root: root!, values };
}

export const binaryTreeInorder: AlgorithmDef = {
  id: "binary-tree-inorder",
  title: "BST Inorder Traversal",
  koTitle: "이진 탐색 트리 — 중위 순회",
  category: "트리",
  difficulty: "중급",
  summary: "왼쪽 서브트리 → 자신 → 오른쪽 서브트리 순서로 방문합니다. BST를 중위 순회하면 정렬된 순서가 나옵니다.",
  insight: [
    "LeetCode 94. BST의 정의(왼쪽 < 자신 < 오른쪽)와 중위 순회의 순서가 정확히 맞물려, 결과가 항상 오름차순이 됩니다.",
    "'BST가 유효한지 검증하라'(LC 98)는 중위 순회 결과가 정렬되어 있는지 확인하는 문제와 같습니다.",
    "재귀가 자연스럽지만, 면접에서는 명시적 스택 버전을 요구하는 경우가 많습니다 — '왼쪽 끝까지 밀어 넣고, 꺼내서 방문하고, 오른쪽으로 한 칸'.",
    "전위(자신 먼저)·후위(자신 마지막) 순회는 같은 골격에서 방문 시점만 다릅니다. 트리 복사는 전위, 트리 삭제는 후위가 자연스럽습니다.",
    "k번째로 작은 원소(LC 230)는 중위 순회를 k번째에서 멈추면 됩니다."
  ],
  complexity: { time: "O(n)", space: "O(h)", note: "h = 트리 높이. 편향 트리면 O(n)" },
  code: [
    "function inorder(root: Node | null) {",
    "  const result: number[] = [];",
    "  const stack: Node[] = [];",
    "  let cur = root;",
    "  while (cur || stack.length) {",
    "    while (cur) {        // 왼쪽 끝까지 내려간다",
    "      stack.push(cur);",
    "      cur = cur.left;",
    "    }",
    "    cur = stack.pop()!;",
    "    result.push(cur.val); // 방문",
    "    cur = cur.right;      // 오른쪽으로 한 칸",
    "  }",
    "  return result;",
    "}"
  ],
  createFrames(): Frame[] {
    const { root, values } = buildRandomBst();
    const frames: Frame[] = [];
    const allNodes: BstNode[] = [];
    (function collect(node?: BstNode) {
      if (!node) return;
      allNodes.push(node);
      collect(node.left);
      collect(node.right);
    })(root);

    const visitedValues: number[] = [];
    const stackNodes: BstNode[] = [];

    const makeFrame = (
      line: number,
      message: string,
      current?: BstNode,
      vars?: Record<string, string | number>
    ): GridFrame => {
      const cells: CellState[][] = Array.from({ length: TREE_DEPTH }, () => new Array<CellState>(TREE_COLS).fill("void"));
      const labels: Array<Array<string | number | null>> = Array.from({ length: TREE_DEPTH }, () =>
        new Array(TREE_COLS).fill(null)
      );
      for (const node of allNodes) {
        const col = treeCol(node.depth, node.pos);
        cells[node.depth][col] = visitedValues.includes(node.value) ? "visited" : "empty";
        if (stackNodes.includes(node) && !visitedValues.includes(node.value)) cells[node.depth][col] = "frontier";
        if (current === node) cells[node.depth][col] = "current";
        labels[node.depth][col] = node.value;
      }
      return {
        kind: "grid",
        cells,
        labels,
        codeLine: line,
        message,
        vars: { ...vars, 결과: `[${visitedValues.join(", ")}]` },
        legend: [
          { state: "current", label: "현재 노드" },
          { state: "frontier", label: "스택 대기" },
          { state: "visited", label: "방문 완료" },
          { state: "empty", label: "미방문" }
        ]
      };
    };

    frames.push(
      makeFrame(
        3,
        `노드 ${allNodes.length}개짜리 이진 탐색 트리입니다. 각 노드의 왼쪽 자식은 더 작고 오른쪽 자식은 더 큽니다. 루트에서 시작합니다.`,
        root,
        { "노드 수": allNodes.length }
      )
    );

    let cur: BstNode | undefined = root;
    while (cur || stackNodes.length) {
      while (cur) {
        stackNodes.push(cur);
        frames.push(
          makeFrame(
            6,
            `${cur.value}를 스택에 넣고 왼쪽 자식으로 내려갑니다.${cur.left ? "" : " 왼쪽 자식이 없으므로 내려가기를 멈춥니다."}`,
            cur,
            { "스택 크기": stackNodes.length }
          )
        );
        cur = cur.left;
      }
      const node = stackNodes.pop()!;
      visitedValues.push(node.value);
      frames.push(
        makeFrame(
          10,
          `스택에서 ${node.value}를 꺼내 방문합니다. 지금까지의 결과가 오름차순임을 확인하세요.`,
          node,
          { "스택 크기": stackNodes.length }
        )
      );
      cur = node.right;
      if (cur) {
        frames.push(makeFrame(11, `${node.value}의 오른쪽 자식 ${cur.value}로 이동해 같은 과정을 반복합니다.`, cur));
      }
    }

    frames.push(
      makeFrame(
        13,
        `순회 완료! 결과 [${visitedValues.join(", ")}]는 정확히 오름차순입니다 — BST + 중위 순회의 핵심 성질입니다.`,
        undefined,
        { "노드 수": values.length }
      )
    );
    return frames;
  }
};

type TrieNodeDef = {
  id: string;
  letter: string;
  row: number;
  col: number;
  parent?: string;
};

// 단어 집합 {CAR, CARD, CAT, DOG}의 트라이를 손으로 배치한 고정 레이아웃.
const TRIE_WORDS = ["CAR", "CARD", "CAT", "DOG"];
const TRIE_NODES: TrieNodeDef[] = [
  { id: "root", letter: "·", row: 0, col: 4 },
  { id: "C", letter: "C", row: 1, col: 2, parent: "root" },
  { id: "D", letter: "D", row: 1, col: 6, parent: "root" },
  { id: "CA", letter: "A", row: 2, col: 2, parent: "C" },
  { id: "DO", letter: "O", row: 2, col: 6, parent: "D" },
  { id: "CAR", letter: "R", row: 3, col: 1, parent: "CA" },
  { id: "CAT", letter: "T", row: 3, col: 3, parent: "CA" },
  { id: "DOG", letter: "G", row: 3, col: 6, parent: "DO" },
  { id: "CARD", letter: "D", row: 4, col: 1, parent: "CAR" }
];
const TRIE_ROWS = 5;
const TRIE_COLS = 9;

export const trie: AlgorithmDef = {
  id: "trie",
  title: "Trie (Prefix Tree)",
  koTitle: "트라이",
  category: "트리",
  difficulty: "고급",
  summary: "문자 하나가 간선 하나인 트리에 단어들을 저장합니다. 공통 접두사를 공유하므로 접두사 검색이 단어 길이만큼만 걸립니다.",
  insight: [
    "LeetCode 208 Implement Trie. 검색·삽입 모두 단어 길이 L에만 비례하는 O(L) — 사전에 단어가 몇 개 있든 상관없습니다.",
    "'CAR'와 'CARD'처럼 접두사를 공유하는 단어는 경로를 공유합니다. isWord 플래그(여기서는 ● 표시)가 '여기서 끝나는 단어가 있다'를 구분합니다.",
    "경로가 존재해도 isWord가 없으면 단어가 아닙니다 — 'CA'는 경로는 있지만 단어가 아닌 것을 검색 단계에서 확인하세요.",
    "자동완성, 사전 검색, Word Search II(LC 212)의 가지치기 등 '접두사가 곧 상태'인 문제의 표준 자료구조입니다.",
    "자식을 Map 대신 크기 26 배열로 들면 더 빠르지만 메모리를 더 씁니다 — 전형적인 시간·공간 트레이드오프입니다."
  ],
  complexity: { time: "삽입/검색 O(L)", space: "O(전체 문자 수)", note: "L = 단어 길이" },
  code: [
    "class TrieNode {",
    "  children = new Map<string, TrieNode>();",
    "  isWord = false;",
    "}",
    "function insert(root: TrieNode, word: string) {",
    "  let node = root;",
    "  for (const ch of word) {",
    "    if (!node.children.has(ch)) {",
    "      node.children.set(ch, new TrieNode());",
    "    }",
    "    node = node.children.get(ch)!;",
    "  }",
    "  node.isWord = true;",
    "}",
    "function search(root: TrieNode, word: string) {",
    "  let node = root;",
    "  for (const ch of word) {",
    "    if (!node.children.has(ch)) return false;",
    "    node = node.children.get(ch)!;",
    "  }",
    "  return node.isWord;",
    "}"
  ],
  createFrames(): Frame[] {
    const frames: Frame[] = [];
    const created = new Set<string>(["root"]);
    const wordEnds = new Set<string>();

    const makeFrame = (
      line: number,
      message: string,
      options: { current?: string; pathIds?: string[]; missing?: boolean; vars?: Record<string, string | number> } = {}
    ): GridFrame => {
      const cells: CellState[][] = Array.from({ length: TRIE_ROWS }, () => new Array<CellState>(TRIE_COLS).fill("void"));
      const labels: Array<Array<string | number | null>> = Array.from({ length: TRIE_ROWS }, () =>
        new Array(TRIE_COLS).fill(null)
      );
      for (const node of TRIE_NODES) {
        if (!created.has(node.id)) continue;
        cells[node.row][node.col] = wordEnds.has(node.id) ? "path" : "empty";
        if (options.pathIds?.includes(node.id)) cells[node.row][node.col] = "visited";
        if (options.current === node.id) cells[node.row][node.col] = options.missing ? "goal" : "current";
        labels[node.row][node.col] = wordEnds.has(node.id) ? `${node.letter}●` : node.letter;
      }
      return {
        kind: "grid",
        cells,
        labels,
        codeLine: line,
        message,
        vars: options.vars,
        legend: [
          { state: "current", label: "현재 노드" },
          { state: "visited", label: "지나온 경로" },
          { state: "path", label: "단어 끝(isWord ●)" },
          { state: "goal", label: "자식 없음!" },
          { state: "empty", label: "노드" }
        ]
      };
    };

    frames.push(
      makeFrame(0, `단어 [${TRIE_WORDS.join(", ")}]를 트라이에 넣어 봅니다. 루트(·)는 빈 문자열을 뜻합니다.`, {
        vars: { 단어: TRIE_WORDS.join(", ") }
      })
    );

    // 삽입
    for (const word of TRIE_WORDS) {
      const pathIds: string[] = [];
      for (let i = 1; i <= word.length; i++) {
        const id = word.slice(0, i);
        const isNew = !created.has(id);
        created.add(id);
        if (isNew) {
          frames.push(
            makeFrame(8, `"${word}" 삽입: '${word[i - 1]}' 자식이 없어 새 노드를 만들고 내려갑니다.`, {
              current: id,
              pathIds: [...pathIds],
              vars: { 삽입: word, 접두사: id }
            })
          );
        } else {
          frames.push(
            makeFrame(10, `"${word}" 삽입: '${word[i - 1]}' 자식이 이미 있으므로 경로를 재사용해 내려갑니다.`, {
              current: id,
              pathIds: [...pathIds],
              vars: { 삽입: word, 접두사: id }
            })
          );
        }
        pathIds.push(id);
      }
      wordEnds.add(word);
      frames.push(
        makeFrame(12, `"${word}"의 마지막 노드에 isWord = true(●)를 표시합니다.`, {
          pathIds,
          vars: { 삽입: word }
        })
      );
    }

    // 검색 — 세 가지 대표 케이스
    const queries: Array<{ word: string; expected: boolean; reason: string }> = [
      { word: "CAR", expected: true, reason: "경로가 있고 끝 노드에 ●가 있으므로 단어입니다" },
      { word: "CA", expected: false, reason: "경로는 있지만 끝 노드에 ●가 없으므로 단어가 아닙니다 (접두사일 뿐)" },
      { word: "CAB", expected: false, reason: "'B' 자식이 없어 경로 자체가 끊깁니다" }
    ];
    const results: Record<string, string | number> = {};
    for (const { word, expected, reason } of queries) {
      const pathIds: string[] = [];
      let broke = false;
      for (let i = 1; i <= word.length; i++) {
        const id = word.slice(0, i);
        if (!created.has(id)) {
          frames.push(
            makeFrame(17, `search("${word}"): '${word[i - 1]}' 자식이 없습니다 → false`, {
              current: word.slice(0, i - 1) || "root",
              pathIds,
              missing: true,
              vars: { 검색: word }
            })
          );
          broke = true;
          break;
        }
        pathIds.push(id);
        frames.push(
          makeFrame(18, `search("${word}"): '${word[i - 1]}'를 따라 내려갑니다.`, {
            current: id,
            pathIds: pathIds.slice(0, -1),
            vars: { 검색: word }
          })
        );
      }
      if (!broke) {
        frames.push(
          makeFrame(20, `search("${word}") = ${expected} — ${reason}.`, {
            pathIds,
            vars: { 검색: word, 결과: String(expected) }
          })
        );
      }
      results[`search("${word}")`] = String(expected);
    }

    frames.push(
      makeFrame(20, "정리: 트라이에서 '경로 존재'는 접두사, '경로 끝의 ●'는 완전한 단어를 뜻합니다.", {
        vars: { 단어: TRIE_WORDS.join(", "), ...results }
      })
    );
    return frames;
  }
};

import { ArrayTracer, indexHighlights, randomArray, withEnoughSteps } from "../tracer.ts";
import type { AlgorithmDef, Frame } from "../types.ts";

export const hashTwoSum: AlgorithmDef = {
  id: "hash-two-sum",
  title: "Hash Map (Two Sum)",
  koTitle: "해시맵",
  category: "자료구조",
  difficulty: "기초",
  summary: "지금까지 본 값을 해시맵에 기억해 두고, '내 짝(target - a[i])을 이미 봤는지'를 O(1)에 조회합니다.",
  insight: [
    "LeetCode 1번 Two Sum의 정석 풀이입니다. 이중 루프 O(n²)를 해시맵 한 번 순회 O(n)으로 줄입니다.",
    "핵심 발상의 전환: '둘을 동시에 찾는' 대신 '하나를 고정하고 나머지(target - a[i])를 과거 기록에서 찾는' 것입니다.",
    "값을 먼저 조회한 뒤에 현재 값을 맵에 넣어야 자기 자신을 두 번 쓰는 실수를 막을 수 있습니다.",
    "'본 것을 기억해서 재활용한다'는 이 패턴은 부분합, 빈도 세기, 중복 검출 등 무수한 문제의 기반입니다."
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code: [
    "function twoSum(a: number[], target: number) {",
    "  const seen = new Map<number, number>(); // 값 -> 인덱스",
    "  for (let i = 0; i < a.length; i++) {",
    "    const need = target - a[i];",
    "    if (seen.has(need)) {",
    "      return [seen.get(need)!, i];",
    "    }",
    "    seen.set(a[i], i);",
    "  }",
    "  return null;",
    "}"
  ],
  createFrames(): Frame[] {
    return withEnoughSteps(() => {
      const values = randomArray(10, 50, 1);
      const i = Math.floor(Math.random() * 4);
      const j = 5 + Math.floor(Math.random() * 5);
      const target = values[i] + values[j];
      const t = new ArrayTracer(values, "boxes");
      const seen = new Map<number, number>();
      const mapText = () => `{${[...seen.entries()].map(([v, idx]) => `${v}:${idx}`).join(", ")}}`;

      t.step({ line: 1, message: `합이 target=${target}이 되는 두 수를 찾습니다. 빈 해시맵에서 시작합니다.`, vars: { target, seen: "{}" } });

      for (let k = 0; k < values.length; k++) {
        const need = target - values[k];
        t.step({
          line: 3,
          message: `a[${k}]=${values[k]}의 짝은 ${target} − ${values[k]} = ${need}. 해시맵에 ${need}가 있는지 조회합니다.`,
          highlights: { [k]: "active" },
          pointers: [{ index: k, label: "i" }],
          vars: { target, need, seen: mapText() }
        });
        if (seen.has(need)) {
          const partner = seen.get(need)!;
          t.step({
            line: 5,
            message: `${need}를 인덱스 ${partner}에서 이미 봤습니다! 정답: a[${partner}]=${need} + a[${k}]=${values[k]} = ${target}`,
            highlights: { [partner]: "found", [k]: "found" },
            pointers: [
              { index: partner, label: "짝" },
              { index: k, label: "i" }
            ],
            vars: { target, "정답": `[${partner}, ${k}]` }
          });
          return t.frames;
        }
        seen.set(values[k], k);
        t.mark(k, "discard");
        t.step({
          line: 7,
          message: `짝이 아직 없으므로 ${values[k]}:${k}를 해시맵에 기록하고 다음으로 넘어갑니다.`,
          vars: { target, seen: mapText() }
        });
      }
      t.step({ line: 9, message: "끝까지 짝을 찾지 못했습니다.", vars: { target } });
      return t.frames;
    }, 10);
  }
};

const BRACKET_PAIRS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
const OPENERS = ["(", "[", "{"] as const;
const CLOSERS: Record<string, string> = { "(": ")", "[": "]", "{": "}" };

function randomBrackets(): string {
  // 균형 잡힌 문자열을 만든 뒤 40% 확률로 한 글자를 망가뜨린다.
  // 길이 2짜리는 보여줄 단계가 거의 없으므로 최소 두 쌍(길이 4)을 보장한다.
  let s = "";
  const build = (depth: number): void => {
    if (s.length >= 8 || depth > 3) return;
    const open = OPENERS[Math.floor(Math.random() * OPENERS.length)];
    s += open;
    if (Math.random() < 0.5) build(depth + 1);
    s += CLOSERS[open];
    if (s.length < 8 && Math.random() < 0.4) build(depth);
  };
  while (s.length < 4) {
    s = "";
    build(0);
  }
  if (Math.random() < 0.4) {
    const pos = Math.floor(Math.random() * s.length);
    const all = "()[]{}";
    s = s.slice(0, pos) + all[Math.floor(Math.random() * all.length)] + s.slice(pos + 1);
  }
  return s;
}

export const validParentheses: AlgorithmDef = {
  id: "valid-parentheses",
  title: "Stack (Valid Parentheses)",
  koTitle: "스택",
  category: "자료구조",
  difficulty: "기초",
  summary: "여는 괄호는 스택에 쌓고, 닫는 괄호가 오면 꼭대기와 짝이 맞는지 확인합니다. LIFO의 대표 활용입니다.",
  insight: [
    "'가장 최근에 열린 것이 가장 먼저 닫혀야 한다'는 구조가 스택의 LIFO와 정확히 일치합니다.",
    "문자열을 다 읽은 뒤 스택이 비어 있어야 합니다 — 닫히지 않은 괄호가 남아 있으면 무효입니다.",
    "닫는 괄호가 왔는데 스택이 비어 있는 경우(pop이 undefined)도 무효 처리됩니다.",
    "함수 호출 스택, 수식 계산, 괄호 매칭, 실행 취소(undo) — 스택은 '되돌아가야 하는' 모든 곳에 있습니다."
  ],
  complexity: { time: "O(n)", space: "O(n)" },
  code: [
    "function isValid(s: string) {",
    "  const stack: string[] = [];",
    "  const pairs = { \")\": \"(\", \"]\": \"[\", \"}\": \"{\" };",
    "  for (const ch of s) {",
    "    if (ch === \"(\" || ch === \"[\" || ch === \"{\") {",
    "      stack.push(ch);",
    "    } else {",
    "      if (stack.pop() !== pairs[ch]) return false;",
    "    }",
    "  }",
    "  return stack.length === 0;",
    "}"
  ],
  createFrames(): Frame[] {
    return withEnoughSteps(() => {
      const s = randomBrackets();
      const t = new ArrayTracer<string>([...s], "boxes");
      const stack: string[] = [];
      const stackText = () => (stack.length ? stack.join(" ") : "(비어 있음)");

      t.step({ line: 1, message: `문자열 "${s}"가 올바른 괄호열인지 검사합니다.`, vars: { stack: stackText() } });

      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === "(" || ch === "[" || ch === "{") {
          stack.push(ch);
          t.step({
            line: 5,
            message: `여는 괄호 '${ch}'를 스택에 쌓습니다.`,
            highlights: { [i]: "active" },
            pointers: [{ index: i, label: "현재" }],
            vars: { stack: stackText() }
          });
        } else {
          const top = stack.pop();
          if (top !== BRACKET_PAIRS[ch]) {
            t.step({
              line: 7,
              message:
                top === undefined
                  ? `닫는 괄호 '${ch}'가 왔는데 스택이 비어 있습니다 → 무효!`
                  : `닫는 괄호 '${ch}'의 짝은 '${BRACKET_PAIRS[ch]}'인데 꼭대기는 '${top}' → 무효!`,
              highlights: { [i]: "swap" },
              pointers: [{ index: i, label: "현재" }],
              vars: { stack: stackText(), 결과: "false" }
            });
            return t.frames;
          }
          t.step({
            line: 7,
            message: `닫는 괄호 '${ch}'와 꼭대기 '${top}'의 짝이 맞습니다. pop!`,
            highlights: { [i]: "found" },
            pointers: [{ index: i, label: "현재" }],
            vars: { stack: stackText() }
          });
        }
      }

      const valid = stack.length === 0;
      t.step({
        line: 10,
        message: valid
          ? "끝까지 읽었고 스택도 비었습니다 → 올바른 괄호열입니다!"
          : `끝까지 읽었지만 스택에 ${stack.length}개가 남았습니다 → 닫히지 않은 괄호가 있어 무효!`,
        vars: { stack: stackText(), 결과: String(valid) }
      });
      return t.frames;
    }, 8);
  }
};

export const monotonicStack: AlgorithmDef = {
  id: "monotonic-stack",
  title: "Monotonic Stack (Daily Temperatures)",
  koTitle: "모노토닉 스택",
  category: "자료구조",
  difficulty: "중급",
  summary: "'아직 답을 못 찾은 인덱스'를 스택에 쌓아 두고, 더 큰 값이 오는 순간 한꺼번에 해결합니다.",
  insight: [
    "LeetCode 739 Daily Temperatures: 각 날짜에 대해 '며칠 뒤에 더 따뜻해지는가'를 구하는 문제입니다.",
    "스택 안의 온도는 항상 내림차순(단조)으로 유지됩니다 — 그래서 '모노토닉(단조) 스택'입니다.",
    "각 인덱스는 스택에 최대 1번 들어가고 1번 나오므로, while문이 있어도 전체는 O(n)입니다. (분할 상환 분석)",
    "Next Greater Element, 히스토그램 최대 직사각형, 주식 스팬 — '다음에 오는 더 큰/작은 값' 문제의 만능 열쇠입니다."
  ],
  complexity: { time: "O(n)", space: "O(n)", note: "각 원소는 스택에 한 번만 들어가고 나옴" },
  code: [
    "function dailyTemperatures(t: number[]) {",
    "  const answer = new Array(t.length).fill(0);",
    "  const stack: number[] = []; // 아직 답을 못 찾은 인덱스",
    "  for (let i = 0; i < t.length; i++) {",
    "    while (stack.length && t[i] > t[stack.at(-1)!]) {",
    "      const j = stack.pop()!;",
    "      answer[j] = i - j;",
    "    }",
    "    stack.push(i);",
    "  }",
    "  return answer;",
    "}"
  ],
  createFrames(): Frame[] {
    const temps = randomArray(10, 84, 60);
    const t = new ArrayTracer(temps);
    const answer = new Array(temps.length).fill(0);
    const stack: number[] = [];
    const stackText = () => (stack.length ? `[${stack.join(", ")}]` : "[]");
    const stackHighlights = () => indexHighlights(stack, "window");

    t.step({ line: 2, message: "각 날짜에 대해 '며칠 뒤 더 따뜻해지는가'를 구합니다. 스택에는 아직 답을 못 찾은 날짜를 쌓습니다." });

    for (let i = 0; i < temps.length; i++) {
      t.step({
        line: 4,
        message: `${i}일의 온도 ${temps[i]}°. 스택 꼭대기보다 따뜻한지 확인합니다.`,
        highlights: { ...stackHighlights(), [i]: "active" },
        pointers: [{ index: i, label: "i" }],
        vars: { i, stack: stackText() }
      });
      while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
        const j = stack.pop()!;
        answer[j] = i - j;
        t.setSublabel(j, `+${i - j}일`);
        t.step({
          line: 6,
          message: `${temps[i]}° > ${j}일의 ${temps[j]}° — ${j}일의 답이 풀렸습니다: ${i - j}일 뒤!`,
          highlights: { ...stackHighlights(), [j]: "found", [i]: "active" },
          pointers: [
            { index: j, label: "해결" },
            { index: i, label: "i" }
          ],
          vars: { i, stack: stackText() }
        });
      }
      stack.push(i);
      t.step({
        line: 8,
        message: `${i}일을 스택에 넣습니다. 스택 안의 온도는 항상 내림차순으로 유지됩니다.`,
        highlights: { ...stackHighlights() },
        vars: { i, stack: stackText() }
      });
    }

    for (const j of stack) t.setSublabel(j, "0");
    t.step({
      line: 10,
      message: `끝! 스택에 남은 날짜(${stackText()})는 더 따뜻한 날이 없으므로 0입니다. answer = [${answer.join(", ")}]`,
      vars: { answer: `[${answer.join(", ")}]` }
    });
    return t.frames;
  }
};

export const reverseLinkedList: AlgorithmDef = {
  id: "reverse-linked-list",
  title: "Reverse Linked List",
  koTitle: "연결 리스트 뒤집기",
  category: "자료구조",
  difficulty: "중급",
  summary: "prev·cur·next 세 포인터를 한 칸씩 옮기며, 각 노드의 next 화살표를 반대 방향으로 돌립니다.",
  insight: [
    "LeetCode 206. 면접에서 화이트보드에 그려 보라는 단골 문제로, 포인터 조작의 기본기를 봅니다.",
    "next를 먼저 백업하지 않고 cur.next = prev를 하면 나머지 리스트를 영영 잃어버립니다 — 순서가 생명입니다.",
    "루프 불변식: prev 왼쪽은 이미 뒤집힌 리스트, cur부터 오른쪽은 아직 원본 그대로.",
    "재귀 버전도 가능하지만 스택 O(n)을 쓰므로, 반복 버전(O(1) 공간)을 기본으로 익혀 두세요."
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code: [
    "function reverseList(head: Node | null) {",
    "  let prev: Node | null = null;",
    "  let cur = head;",
    "  while (cur !== null) {",
    "    const next = cur.next; // 다음 노드를 먼저 백업",
    "    cur.next = prev;       // 화살표를 반대로",
    "    prev = cur;",
    "    cur = next;",
    "  }",
    "  return prev; // 새로운 head",
    "}"
  ],
  createFrames(): Frame[] {
    const values = randomArray(7, 99, 1);
    const t = new ArrayTracer(values, "boxes");
    const n = values.length;
    // arrows[i]: i번 노드의 next가 가리키는 방향
    for (let i = 0; i < n - 1; i++) t.setSublabel(i, "next→");
    t.setSublabel(n - 1, "→null");

    t.step({
      line: 2,
      message: "각 상자 아래의 화살표가 next 포인터입니다. prev=null, cur=head에서 시작합니다.",
      pointers: [{ index: 0, label: "cur" }],
      vars: { prev: "null" }
    });

    for (let cur = 0; cur < n; cur++) {
      const prevLabel = cur === 0 ? "null" : `노드 ${cur - 1}`;
      const nextLabel = cur === n - 1 ? "null" : `노드 ${cur + 1}`;
      t.step({
        line: 4,
        message: `next = cur.next (${nextLabel})를 백업합니다. 이걸 안 하면 나머지 리스트를 잃어버립니다.`,
        highlights: { [cur]: "active", ...(cur < n - 1 ? { [cur + 1]: "compare" } : {}) },
        pointers: [
          ...(cur > 0 ? [{ index: cur - 1, label: "prev" }] : []),
          { index: cur, label: "cur" },
          ...(cur < n - 1 ? [{ index: cur + 1, label: "next" }] : [])
        ],
        vars: { prev: prevLabel, next: nextLabel }
      });
      t.setSublabel(cur, cur === 0 ? "→null" : "←next");
      t.mark(cur, "sorted");
      t.step({
        line: 5,
        message: `cur.next를 prev(${prevLabel})로 돌립니다. 노드 ${cur}의 화살표가 ${cur === 0 ? "null을" : "왼쪽을"} 가리킵니다.`,
        highlights: { [cur]: "swap" },
        pointers: [
          ...(cur > 0 ? [{ index: cur - 1, label: "prev" }] : []),
          { index: cur, label: "cur" }
        ],
        vars: { prev: prevLabel }
      });
      t.step({
        line: 7,
        message: `prev와 cur를 한 칸씩 전진시킵니다.`,
        pointers: [
          { index: cur, label: "prev" },
          ...(cur < n - 1 ? [{ index: cur + 1, label: "cur" }] : [])
        ],
        vars: { prev: `노드 ${cur}`, cur: cur < n - 1 ? `노드 ${cur + 1}` : "null" }
      });
    }

    t.step({
      line: 9,
      message: `cur가 null이 되어 종료. 모든 화살표가 왼쪽을 향하므로 마지막 노드(${values[n - 1]})가 새 head입니다.`,
      highlights: { [n - 1]: "found" },
      pointers: [{ index: n - 1, label: "새 head" }]
    });
    return t.frames;
  }
};

export const unionFind: AlgorithmDef = {
  id: "union-find",
  title: "Union-Find (Disjoint Set)",
  koTitle: "유니온 파인드",
  category: "자료구조",
  difficulty: "중급",
  summary: "각 원소가 자신의 부모를 가리키는 포레스트로 그룹을 관리합니다. find로 대표(루트)를 찾고 union으로 그룹을 합칩니다.",
  insight: [
    "상자의 숫자는 parent[i], 즉 i가 가리키는 부모입니다. 자기 자신을 가리키면(parent[i]=i) 그 노드가 그룹의 대표(루트)입니다.",
    "경로 압축(find 중 만난 노드를 루트 가까이 당기기)과 랭크 기반 합치기를 쓰면 연산당 거의 O(1) (정확히는 역아커만 함수 α(n))입니다.",
    "'두 노드가 같은 그룹인가?'를 반복해서 묻는 문제 — 사이클 검출, 섬 개수, 크루스칼 MST, 계좌 병합 — 의 표준 도구입니다.",
    "BFS/DFS로도 연결성을 알 수 있지만, 간선이 하나씩 추가되는 동적 상황에서는 유니온 파인드가 압도적으로 유리합니다."
  ],
  complexity: { time: "연산당 평균 O(log n)", space: "O(n)", note: "표시된 코드(경로 압축만) 기준. 랭크 합치기까지 더하면 거의 O(1) — 정확히는 α(n)" },
  code: [
    "const parent = Array.from({ length: n }, (_, i) => i);",
    "function find(x: number): number {",
    "  while (parent[x] !== x) {",
    "    parent[x] = parent[parent[x]]; // 경로 압축(절반)",
    "    x = parent[x];",
    "  }",
    "  return x;",
    "}",
    "function union(a: number, b: number) {",
    "  const ra = find(a), rb = find(b);",
    "  if (ra !== rb) parent[rb] = ra;",
    "}"
  ],
  createFrames(): Frame[] {
    const n = 8;
    const parent = Array.from({ length: n }, (_, i) => i);
    const t = new ArrayTracer(parent, "boxes"); // t.a === parent (참조 공유, 프레임마다 값 복사)

    const rootOf = (x: number): number => (parent[x] === x ? x : rootOf(parent[x]));
    const refreshRootLabels = () => {
      for (let i = 0; i < n; i++) t.setSublabel(i, `루트 ${rootOf(i)}`);
    };
    const componentCount = () => new Set(Array.from({ length: n }, (_, i) => rootOf(i))).size;

    refreshRootLabels();
    t.step({
      line: 0,
      message: `${n}개의 원소가 각자 자신을 가리키며 시작합니다 (그룹 ${n}개). 상자의 숫자 = parent[i].`,
      vars: { "그룹 수": n }
    });

    const find = (x: number, role: string): number => {
      while (parent[x] !== x) {
        t.step({
          line: 2,
          message: `find(${role}): ${x}의 부모는 ${parent[x]}입니다. 루트가 아니므로 위로 올라갑니다.`,
          highlights: { [x]: "compare", [parent[x]]: "active" },
          pointers: [{ index: x, label: "x" }],
          vars: { x, "parent[x]": parent[x] }
        });
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      t.step({
        line: 6,
        message: `find(${role}): ${x}는 자기 자신을 가리키므로 루트입니다.`,
        highlights: { [x]: "found" },
        pointers: [{ index: x, label: "루트" }],
        vars: { 루트: x }
      });
      return x;
    };

    const pairs: Array<[number, number]> = [];
    while (pairs.length < 6) {
      const a = Math.floor(Math.random() * n);
      const b = Math.floor(Math.random() * n);
      if (a !== b) pairs.push([a, b]);
    }

    for (const [a, b] of pairs) {
      t.step({
        line: 8,
        message: `union(${a}, ${b}): 두 원소의 루트를 각각 찾습니다.`,
        highlights: { [a]: "active", [b]: "active" },
        pointers: [
          { index: a, label: "a" },
          { index: b, label: "b" }
        ],
        vars: { union: `${a},${b}` }
      });
      const ra = find(a, `a=${a}`);
      const rb = find(b, `b=${b}`);
      if (ra !== rb) {
        parent[rb] = ra;
        refreshRootLabels();
        t.step({
          line: 10,
          message: `루트가 다르므로(${ra} ≠ ${rb}) 루트 ${rb}를 루트 ${ra} 밑으로 붙입니다. 두 그룹이 하나가 되었습니다.`,
          highlights: { [rb]: "swap", [ra]: "found" },
          vars: { "그룹 수": componentCount() }
        });
      } else {
        refreshRootLabels();
        t.step({
          line: 10,
          message: `루트가 같습니다(${ra}). 이미 같은 그룹이므로 아무것도 하지 않습니다. (사이클 검출에 쓰이는 신호!)`,
          highlights: { [ra]: "found" },
          vars: { "그룹 수": componentCount() }
        });
      }
    }

    t.step({
      line: 10,
      message: `모든 union 종료. 최종 그룹 수는 ${componentCount()}개입니다. 상자 아래 라벨로 각 원소의 루트를 확인하세요.`,
      vars: { "그룹 수": componentCount() }
    });
    return t.frames;
  }
};

export const fastSlowPointers: AlgorithmDef = {
  id: "fast-slow-pointers",
  title: "Fast & Slow Pointers (Cycle Detection)",
  koTitle: "빠른/느린 포인터",
  category: "자료구조",
  difficulty: "중급",
  summary: "느린 포인터는 한 칸, 빠른 포인터는 두 칸씩 갑니다. 사이클이 있으면 둘은 반드시 만납니다 (플로이드의 토끼와 거북이).",
  insight: [
    "LeetCode 141 Linked List Cycle. 방문 집합(Set)으로도 풀 수 있지만 O(n) 메모리가 들고, 이 방법은 O(1)입니다.",
    "사이클 안에서 빠른 포인터는 매 단계 느린 포인터와의 간격을 1씩 좁힙니다 — 그래서 '반드시' 만나고, 건너뛰어 지나칠 수 없습니다.",
    "사이클이 없으면 빠른 포인터가 먼저 끝(null)에 닿아 종료합니다. fast와 fast.next 둘 다 검사해야 null 참조 오류가 없습니다.",
    "만난 지점에서 한 포인터를 머리로 되돌려 같은 속도로 걸으면 사이클 시작점에서 다시 만납니다 (LC 142) — 수학적으로 증명되는 2단계 기법입니다.",
    "중간 노드 찾기(LC 876), 행복한 수(LC 202), 중복 수 찾기(LC 287)도 같은 패턴입니다."
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code: [
    "function hasCycle(head: Node | null) {",
    "  let slow = head;",
    "  let fast = head;",
    "  while (fast && fast.next) {",
    "    slow = slow.next!;       // 한 칸",
    "    fast = fast.next.next!;  // 두 칸",
    "    if (slow === fast) return true; // 만남 = 사이클",
    "  }",
    "  return false; // fast가 끝에 닿음 = 사이클 없음",
    "}"
  ],
  createFrames(): Frame[] {
    const n = 8;
    const values = randomArray(n, 99, 1);
    const hasCycle = Math.random() < 0.65;
    const cycleEntry = hasCycle ? Math.floor(Math.random() * (n - 2)) : -1;
    // next[i]: i번 노드의 다음 노드 인덱스 (-1 = null)
    const next = Array.from({ length: n }, (_, i) => (i < n - 1 ? i + 1 : cycleEntry));

    const t = new ArrayTracer(values, "boxes");
    for (let i = 0; i < n; i++) {
      t.setSublabel(i, next[i] === -1 ? "→∅" : `→${next[i]}`);
    }

    t.step({
      line: 2,
      message: hasCycle
        ? `상자 아래 화살표가 next 포인터입니다. 마지막 노드가 ${cycleEntry}번으로 되돌아가는 사이클이 숨어 있습니다. slow와 fast 모두 머리에서 출발합니다.`
        : "상자 아래 화살표가 next 포인터입니다. slow와 fast 모두 머리에서 출발합니다.",
      pointers: [
        { index: 0, label: "slow" },
        { index: 0, label: "fast" }
      ],
      vars: { slow: 0, fast: 0, next: next.join(",") }
    });

    let slow = 0;
    let fast = 0;
    let step = 0;
    while (fast !== -1 && next[fast] !== -1) {
      slow = next[slow];
      fast = next[next[fast]];
      step++;
      if (slow === fast) {
        t.step({
          line: 6,
          message: `${step}번째 이동에서 slow와 fast가 ${slow}번 노드에서 만났습니다 — 사이클이 있습니다! 직선이었다면 두 칸씩 가는 fast를 따라잡을 수 없습니다.`,
          highlights: { [slow]: "found" },
          pointers: [{ index: slow, label: "slow=fast" }],
          vars: { 이동: step, 결과: "true" }
        });
        return t.frames;
      }
      if (fast === -1) {
        t.step({
          line: 5,
          message: `slow는 한 칸(${slow}번), fast는 두 칸 이동하다 리스트 끝(null)을 지나쳤습니다.`,
          highlights: { [slow]: "active" },
          pointers: [{ index: slow, label: "slow" }],
          vars: { 이동: step, slow, fast: "null" }
        });
        break;
      }
      t.step({
        line: 5,
        message: `slow는 한 칸(${slow}번), fast는 두 칸(${fast}번) 이동합니다.${hasCycle ? " 사이클 안에서 간격이 1씩 줄어드는 것을 보세요." : ""}`,
        highlights: { [slow]: "active", [fast]: "compare" },
        pointers: [
          { index: slow, label: "slow" },
          { index: fast, label: "fast" }
        ],
        vars: { 이동: step, slow, fast }
      });
    }
    t.step({
      line: 8,
      message: "fast가 리스트의 끝(null)에 닿았습니다 — 사이클이 없습니다.",
      vars: { 이동: step, 결과: "false" }
    });
    return t.frames;
  }
};

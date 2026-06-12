import { ArrayTracer, rangeHighlights, withEnoughSteps } from "../tracer.ts";
import type { AlgorithmDef, Frame } from "../types.ts";

export const jumpGame: AlgorithmDef = {
  id: "jump-game",
  title: "Greedy (Jump Game)",
  koTitle: "그리디 — 점프 게임",
  category: "그리디",
  difficulty: "중급",
  summary: "각 칸의 숫자만큼 점프할 수 있을 때 끝까지 갈 수 있을까? '지금까지 닿을 수 있는 가장 먼 곳' 하나만 관리하면 됩니다.",
  insight: [
    "LeetCode 55. 어디서 점프할지 경우의 수를 다 따질 필요 없이, farthest(최대 도달 거리) 하나로 충분하다는 것이 그리디의 통찰입니다.",
    "탐욕적 선택이 안전한 이유: i ≤ farthest인 모든 칸은 실제로 도달 가능하므로, 각 칸에서 도달 거리를 늘려 보기만 하면 됩니다.",
    "i > farthest가 되는 순간 — 현재 칸에 도달할 방법이 없는 순간 — 즉시 실패를 확정할 수 있습니다.",
    "그리디는 '국소 최선이 전역 최선'임을 증명할 수 있을 때만 씁니다. 증명이 안 되면 DP로 후퇴하는 것이 안전합니다.",
    "최소 점프 횟수를 묻는 Jump Game II(LeetCode 45)는 같은 아이디어에 'BFS 층 나누기'를 더한 변형입니다."
  ],
  complexity: { time: "O(n)", space: "O(1)" },
  code: [
    "function canJump(a: number[]) {",
    "  let farthest = 0;",
    "  for (let i = 0; i < a.length; i++) {",
    "    if (i > farthest) return false; // 이 칸에 도달 불가",
    "    farthest = Math.max(farthest, i + a[i]);",
    "    if (farthest >= a.length - 1) return true;",
    "  }",
    "  return true;",
    "}"
  ],
  createFrames(): Frame[] {
    return withEnoughSteps(buildJumpGameFrames);
  }
};

function buildJumpGameFrames(): Frame[] {
  const n = 10;
  const values = Array.from({ length: n }, () => Math.floor(Math.random() * 4));
  values[0] = 1 + Math.floor(Math.random() * 3); // 시작 칸이 0이면 첫 수부터 막혀 보여줄 단계가 없다
  values[n - 1] = 0;
  const t = new ArrayTracer(values, "boxes");
  const last = n - 1;
  let farthest = 0;
  const reachableHighlights = () => rangeHighlights(0, Math.min(farthest, last), "window");

  t.step({
    line: 1,
    message: "상자의 숫자 = 그 칸에서 점프할 수 있는 최대 거리. 파란 구간이 '현재 도달 가능한 범위'입니다.",
    highlights: reachableHighlights(),
    vars: { farthest }
  });

  for (let i = 0; i < n; i++) {
    if (i > farthest) {
      t.step({
        line: 3,
        message: `i=${i}가 farthest=${farthest}를 넘었습니다. 이 칸까지 올 방법이 없으므로 실패가 확정됩니다.`,
        highlights: { ...reachableHighlights(), [i]: "swap" },
        pointers: [
          { index: i, label: "i" },
          { index: farthest, label: "farthest" }
        ],
        vars: { i, farthest, 결과: "false" }
      });
      return t.frames;
    }
    const reach = i + values[i];
    const improved = reach > farthest;
    farthest = Math.max(farthest, reach);
    t.step({
      line: 4,
      message: improved
        ? `i=${i}에서 ${values[i]}칸 점프하면 ${reach}까지 갑니다. farthest를 ${farthest}로 늘립니다.`
        : `i=${i}에서는 ${reach}까지밖에 못 가서 farthest=${farthest}는 그대로입니다.`,
      highlights: { ...reachableHighlights(), [i]: "active" },
      pointers: [
        { index: i, label: "i" },
        { index: Math.min(farthest, last), label: "farthest" }
      ],
      vars: { i, [`i + a[${i}]`]: reach, farthest }
    });
    if (farthest >= last) {
      t.step({
        line: 5,
        message: `farthest=${farthest} ≥ 마지막 인덱스 ${last} — 끝까지 갈 수 있습니다!`,
        highlights: { ...reachableHighlights(), [last]: "found" },
        pointers: [{ index: last, label: "도착" }],
        vars: { farthest, 결과: "true" }
      });
      return t.frames;
    }
  }
  t.step({ line: 7, message: "순회를 마쳤습니다.", vars: { farthest } });
  return t.frames;
}

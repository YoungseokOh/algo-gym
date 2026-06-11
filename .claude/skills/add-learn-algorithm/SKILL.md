---
name: add-learn-algorithm
description: Learn 탭에 새 알고리즘 시각화를 추가할 때 사용. AlgorithmDef 작성, 레지스트리 등록, 필수 감사(audit) 루틴 추가, 검증 절차까지 한 번에 안내한다. "알고리즘 추가", "Learn에 ~ 넣어줘", "시각화 만들어줘" 같은 요청에 사용.
---

# Learn 탭 알고리즘 추가 절차

이 저장소의 Learn 탭(`apps/web/src/learn/`)은 단계별 프레임 기반 알고리즘 시각화 시스템이다. 새 알고리즘은 아래 절차를 **모두** 거쳐야 하며, 특히 4단계(감사 루틴)는 생략할 수 없다 — 검증 루틴이 없는 알고리즘이 레지스트리에 있으면 `pnpm test`가 실패한다.

## 1. AlgorithmDef 작성

위치: `apps/web/src/learn/algorithms/` 아래 카테고리에 맞는 파일 (정렬 `sorting.ts`, 배열 `arrayTechniques.ts`, 자료구조 `dataStructures.ts`, DP `dp.ts`, 그리디 `greedy.ts`, 그래프 `graph.ts`, 백트래킹 `backtracking.ts`). 타입은 `../types.ts`의 `AlgorithmDef`.

필드 규칙:
- `id`: kebab-case, URL이 된다 (`/learn/<id>`)
- `koTitle` 한국어 이름, `title` 영어 이름. `summary`/`insight`/`message`는 전부 한국어.
- `insight`: 4~5개. 복잡도 퇴화 조건, 안정성, 불변식, 대표 LeetCode 문제 번호 등 **사실 검증 가능한** 내용만 쓴다.
- `code`: 학습자가 그대로 복사해도 동작하는 올바른 구현이어야 한다. 프레임의 `line`은 이 배열의 0-기반 인덱스.

## 2. 시각화 프레임 생성

- **배열 계열**: `ArrayTracer` 사용. 막대(`bars`, 기본) 또는 상자(`boxes`) 표시. 음수·문자·포인터 중심 알고리즘은 `boxes`. 보조 정보(dp 값, 화살표)는 `setSublabel`/`sublabels`.
- **격자 계열**: `GridFrame`을 직접 생성. 셀 텍스트는 `labels`, 알고리즘 문맥에 맞는 범례는 `legend`로 교체 (DP 표·체스판·가중치 지도 예시는 `dp.ts`, `backtracking.ts`, `graph.ts` 참고).
- 무작위 입력이 즉시 종료될 수 있는 알고리즘(탐색 즉시 적중, 시작 칸 0 등)은 `withEnoughSteps` 패턴으로 최소 8프레임을 보장한다.
- 프레임 수는 10~200 사이를 권장. 매 단계 `message`에 "지금 무슨 일이 왜 일어났는지"를 쓴다.

## 3. 레지스트리 등록

`apps/web/src/learn/index.ts`의 `algorithms` 배열(카테고리 순서 유지)에 추가. 새 카테고리면 `types.ts`의 `AlgorithmCategory`와 `categoryOrder`에도 추가.

## 4. 감사(audit) 루틴 추가 — 필수

`apps/web/scripts/verify-learn.ts`의 `checks`에 알고리즘 id로 검증 함수를 등록한다.

- 시각화 코드와 **독립적인 레퍼런스 구현**(가능하면 브루트포스 완전 탐색)과 최종 결과를 대조한다. 시각화 로직을 복사해 비교하는 것은 감사가 아니다.
- 입력은 첫 프레임의 `values`/`vars`/`labels`에서, 결과는 마지막 프레임의 `vars`에서 읽는다. 필요한 값이 프레임에 없으면 알고리즘 쪽 `vars`에 노출시킨다.

## 5. 검증

```bash
pnpm --filter @algo-gym/web test   # tsc + 전 알고리즘 × 40회 무작위 감사
pnpm --filter @algo-gym/web dev    # http://localhost:5173/learn/<id> 직접 확인
```

브라우저에서 확인할 것: 카탈로그 카드 노출, 재생/스텝/셔플/슬라이더 동작, 코드 라인 하이라이트가 메시지와 일치, 콘솔 에러 없음.

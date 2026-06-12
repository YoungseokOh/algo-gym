import type { AlgorithmCategory, AlgorithmDef } from "./types.ts";
import { binarySearch, prefixSum, quickselect, slidingWindow, twoPointers } from "./algorithms/arrayTechniques.ts";
import { nQueens } from "./algorithms/backtracking.ts";
import {
  fastSlowPointers,
  hashTwoSum,
  monotonicStack,
  reverseLinkedList,
  unionFind,
  validParentheses
} from "./algorithms/dataStructures.ts";
import { climbingStairs, coinChange, houseRobber, kadane, knapsack, lcs } from "./algorithms/dp.ts";
import { bfsGrid, dfsGrid, dijkstra, topologicalSort } from "./algorithms/graph.ts";
import { jumpGame } from "./algorithms/greedy.ts";
import { binaryTreeInorder, trie } from "./algorithms/tree.ts";
import {
  bubbleSort,
  countingSort,
  heapSort,
  insertionSort,
  mergeSort,
  quickSort,
  selectionSort
} from "./algorithms/sorting.ts";

export const algorithms: AlgorithmDef[] = [
  // 정렬
  bubbleSort,
  selectionSort,
  insertionSort,
  countingSort,
  mergeSort,
  quickSort,
  heapSort,
  // 탐색
  binarySearch,
  quickselect,
  // 배열 테크닉
  twoPointers,
  slidingWindow,
  prefixSum,
  // 자료구조
  hashTwoSum,
  validParentheses,
  monotonicStack,
  reverseLinkedList,
  fastSlowPointers,
  unionFind,
  // 트리
  binaryTreeInorder,
  trie,
  // 동적 계획법
  climbingStairs,
  kadane,
  houseRobber,
  coinChange,
  lcs,
  knapsack,
  // 그리디
  jumpGame,
  // 그래프 탐색
  bfsGrid,
  dfsGrid,
  dijkstra,
  topologicalSort,
  // 백트래킹
  nQueens
];

export const categoryOrder: AlgorithmCategory[] = [
  "정렬",
  "탐색",
  "배열 테크닉",
  "자료구조",
  "트리",
  "동적 계획법",
  "그리디",
  "그래프 탐색",
  "백트래킹"
];

export function getAlgorithm(id: string): AlgorithmDef | undefined {
  return algorithms.find((algorithm) => algorithm.id === id);
}

export type { AlgorithmDef };

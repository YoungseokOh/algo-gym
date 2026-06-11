import type { AlgorithmCategory, AlgorithmDef } from "./types.ts";
import { binarySearch, slidingWindow, twoPointers } from "./algorithms/arrayTechniques.ts";
import { bfsGrid, dfsGrid } from "./algorithms/graph.ts";
import { bubbleSort, insertionSort, mergeSort, quickSort, selectionSort } from "./algorithms/sorting.ts";

export const algorithms: AlgorithmDef[] = [
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  binarySearch,
  twoPointers,
  slidingWindow,
  bfsGrid,
  dfsGrid
];

export const categoryOrder: AlgorithmCategory[] = ["정렬", "탐색", "배열 테크닉", "그래프 탐색"];

export function getAlgorithm(id: string): AlgorithmDef | undefined {
  return algorithms.find((algorithm) => algorithm.id === id);
}

export type { AlgorithmDef };

---
source: leetcode
title: Two Sum Practice
titleSlug: two-sum-practice
url: https://leetcode.com/problems/two-sum/
difficulty: Easy
tags:
  - hashmap
  - array
status: review
durationMinutes: 18
attempts: 1
createdAt: "2026-05-21"
updatedAt: "2026-05-21"
nextReviewAt: "2026-05-22"
---

# My Problem Summary

Given a list of numbers and a target, I need to find two positions whose values combine to the target. This is a learner-written summary for sample data.

# My Approach

I scanned once and remembered the value needed to complete the pair. On each step, I checked whether the current number was already needed.

# Stuck Point

I initially stored the current number before checking the needed value, which made duplicate-value cases harder to reason about.

# Code

```ts
function practice(nums: number[], target: number): number[] {
  const needed = new Map<number, number>();
  for (let i = 0; i < nums.length; i += 1) {
    if (needed.has(nums[i])) return [needed.get(nums[i])!, i];
    needed.set(target - nums[i], i);
  }
  return [];
}
```

# What I Learned

The map should express the invariant directly: each key is a value I still need to see.

# AI Reviews

## 2026-05-21T00:00:00.000Z - hint

Your invariant is clear. Practice explaining why the lookup happens before the insert.

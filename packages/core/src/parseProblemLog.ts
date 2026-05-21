import matter from "gray-matter";
import { z } from "zod";
import { emptyProblemSections, type ProblemLog, type ProblemSections } from "./types.ts";

const frontmatterSchema = z.object({
  source: z.literal("leetcode").default("leetcode"),
  title: z.string().default("Untitled"),
  titleSlug: z.string(),
  url: z.string().default(""),
  difficulty: z.union([z.literal("Easy"), z.literal("Medium"), z.literal("Hard"), z.literal("")]).default(""),
  tags: z.array(z.string()).default([]),
  status: z.union([z.literal("todo"), z.literal("solved"), z.literal("failed"), z.literal("review")]).default("todo"),
  durationMinutes: z.number().optional().nullable(),
  attempts: z.number().int().nonnegative().default(0),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
  nextReviewAt: z.string().optional().nullable()
});

const headingMap: Record<string, keyof ProblemSections> = {
  "my problem summary": "summary",
  "my approach": "approach",
  "stuck point": "stuckPoint",
  code: "code",
  "what i learned": "learned",
  "ai reviews": "aiReviews"
};

export function parseProblemLog(markdown: string, filePath?: string): ProblemLog {
  const parsed = matter(markdown);
  const data = frontmatterSchema.parse(parsed.data);
  const sections = parseSections(parsed.content);

  return {
    source: data.source,
    title: data.title,
    titleSlug: data.titleSlug,
    url: data.url,
    difficulty: data.difficulty,
    tags: data.tags,
    status: data.status,
    durationMinutes: data.durationMinutes ?? undefined,
    attempts: data.attempts,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    nextReviewAt: data.nextReviewAt ?? undefined,
    sections,
    filePath
  };
}

export function parseSections(content: string): ProblemSections {
  const sections: ProblemSections = { ...emptyProblemSections };
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let current: keyof ProblemSections | undefined;
  const buffer: string[] = [];

  const flush = () => {
    if (!current) return;
    sections[current] = cleanSection(current, buffer.join("\n"));
    buffer.length = 0;
  };

  for (const line of lines) {
    const match = /^#\s+(.+?)\s*$/.exec(line);
    if (match) {
      flush();
      current = headingMap[match[1].trim().toLowerCase()];
      continue;
    }

    if (current) {
      buffer.push(line);
    }
  }

  flush();
  return sections;
}

function cleanSection(section: keyof ProblemSections, value: string): string {
  const trimmed = value.replace(/^\n+|\n+$/g, "");

  if (section !== "code") {
    return trimmed;
  }

  const codeFence = /^```[a-zA-Z0-9_-]*\n([\s\S]*?)\n```$/m.exec(trimmed);
  return codeFence ? codeFence[1].replace(/\n+$/g, "") : trimmed;
}

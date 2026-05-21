export type ParsedLeetCodeUrl = {
  url: string;
  titleSlug: string;
};

export function parseLeetCodeUrl(input: string): ParsedLeetCodeUrl {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    throw new Error("Enter a valid LeetCode problem URL.");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname !== "leetcode.com" && hostname !== "www.leetcode.com") {
    throw new Error("Only leetcode.com problem URLs are supported.");
  }

  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts[0] !== "problems" || !parts[1]) {
    throw new Error("URL must look like https://leetcode.com/problems/title-slug/.");
  }

  const titleSlug = parts[1].toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(titleSlug)) {
    throw new Error("Could not parse a valid LeetCode title slug.");
  }

  return {
    titleSlug,
    url: `https://leetcode.com/problems/${titleSlug}/`
  };
}

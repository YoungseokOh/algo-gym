import { runPrivacyGuard } from "@algo-gym/workspace";

const result = await runPrivacyGuard(process.cwd());

for (const check of result.checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}: ${check.message}`);
}

if (!result.ok) {
  process.exitCode = 1;
}

import { ensureWorkspace } from "@algo-gym/workspace";

const paths = await ensureWorkspace(process.cwd());

console.log("algo-gym workspace ready:");
console.log(`- ${paths.root}`);
console.log(`- ${paths.problemsDir}`);
console.log(`- ${paths.configPath}`);

import { Options as ExecaOptions, execa } from "execa";
import { pathExists } from "./pathExists.js";
import { projectDir } from "./constants.js";
import { SystemPandaError } from "./SystemPandaError.js";

async function prismaScript() {
	try {
		const options = {
			stdio: "inherit",
			reject: false,
		};

		console.log("Checking for Prisma files...");
		if (!pathExists("prisma") && !pathExists("prisma/schema.prisma")) {
			console.log("Executing: 'prisma init'...");
			await execa("npx", ["prisma", "init"], options as ExecaOptions);
		}

		console.log("Executing: 'prisma migrate dev'...");
		await execa(
			"npx",
			["prisma", "migrate", "dev", `--schema=${projectDir}/prisma/schema.prisma`],
			options as ExecaOptions
		);

		console.log("Executing: 'prisma generate'...");
		await execa(
			"npx",
			["prisma", "generate", `--schema=${projectDir}/prisma/schema.prisma`],
			options as ExecaOptions
		);
	} catch (err) {
		throw new SystemPandaError({ level: "error", message: JSON.stringify(err) });
	}
}

export { prismaScript };

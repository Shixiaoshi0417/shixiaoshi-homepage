import type { ProjectsConfig } from "@/types/projectsConfig";
import { withUserConfig } from "../utils/config-overlay.ts";
export const projectsConfig: ProjectsConfig = withUserConfig("projects", {
	enable: true,
	title: "$t:projects",
	description: "正在折腾的东西。代码、说明和版本都在 GitHub。",
	categories: [
		{
			key: "cryptography",
			label: "密码学",
			icon: "material-symbols:lock-outline-rounded",
		},
		{
			key: "android",
			label: "Android",
			icon: "material-symbols:android-rounded",
		},
	],
});

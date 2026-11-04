import type { ProjectItem } from "@/types/projectsConfig";
export const projectsData: ProjectItem[] = [
	{
		key: "nekokem",
		title: "NekoKEM",
		summary:
			"实验性跨平台文件加密工具，结合 X448 与 ML-KEM-1024，探索后量子混合加密。",
		category: "cryptography",
		phase: "exploring",
		technologies: ["Cryptography", "Post-quantum"],
		icon: "material-symbols:lock-outline-rounded",
		featured: true,
		repository: "https://github.com/Shixiaoshi0417/NekoKEM",
	},
	{
		key: "lunexsu",
		title: "LunexSU",
		summary:
			"基于 KernelSU 的 Android Root 方案，提供本次、限时与永久授权，以及 Material / MIUIX 双界面。",
		category: "android",
		phase: "building",
		technologies: ["Android", "KernelSU", "Kotlin"],
		icon: "material-symbols:android-rounded",
		repository: "https://github.com/Shixiaoshi0417/LunexSU",
	},
];
export function getProjectsList(): ProjectItem[] {
	return projectsData;
}

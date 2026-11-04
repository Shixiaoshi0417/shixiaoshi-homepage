import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "../utils/config-overlay.ts";

export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "assets/personal/github-avatar.jpg",
	name: "石小石",
	bio: "写点代码，做点喜欢的东西。",
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/Shixiaoshi0417",
		},
		{
			name: "Email",
			icon: "material-symbols:mail-outline-rounded",
			url: "mailto:shixiaoshi@shixiaoshi0417.com",
		},
	],
});

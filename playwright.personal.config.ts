import { defineConfig } from "@playwright/test";

// Personal-site acceptance uses the production build: dev intentionally includes
// upstream draft examples. Playwright's Chromium keeps CI independent of Chrome.
export default defineConfig({
	testDir: "./tests/site",
	testMatch: ["personal-homepage.spec.ts", "a11y.spec.ts"],
	timeout: 45_000,
	expect: { timeout: 10_000 },
	workers: 1,
	retries: 0,
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL: "http://127.0.0.1:4321",
		browserName: "chromium",
		viewport: { width: 1440, height: 1000 },
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
	},
	webServer: {
		command: "pnpm preview --host 127.0.0.1 --port 4321 --ignore-lock",
		url: "http://127.0.0.1:4321",
		reuseExistingServer: false,
		timeout: 120_000,
		env: { ASTRO_PREVIEW_BACKGROUND: "false", ASTRO_TELEMETRY_DISABLED: "1" },
	},
});

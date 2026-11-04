import { mkdir } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";

async function ready(page: Page) {
	await page.waitForFunction(() =>
		getComputedStyle(document.documentElement)
			.getPropertyValue("--mc-primary")
			.trim()
			.startsWith("#"),
	);
	await page.waitForFunction(() =>
		[...document.querySelectorAll<HTMLElement>(".onload-animation")].every(
			(el) => el.offsetParent === null || getComputedStyle(el).opacity === "1",
		),
	);
	await page.evaluate(() => document.fonts.ready);
	await page.locator("#scheme-switch").waitFor();
	await page.waitForFunction(() => !!window.swup);
	await expect(page.locator("html")).not.toHaveClass(/is-changing/);
}

async function noOverflow(page: Page) {
	const sizes = await page.evaluate(() => ({
		width: document.documentElement.clientWidth,
		content: document.documentElement.scrollWidth,
	}));
	expect(sizes.content).toBeLessThanOrEqual(sizes.width + 1);
}

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem("theme", "light"));
});

test("production content contains exactly the two maintained projects", async ({
	page,
	request,
}) => {
	await page.goto("/");
	await ready(page);
	await expect(
		page.locator('#swup-container a[href="/posts/nekokem/"]').first(),
	).toBeVisible();
	await expect(
		page.locator('#swup-container a[href="/posts/lunexsu/"]').first(),
	).toBeVisible();
	await expect(page.locator("body")).not.toContainText("Corax");
	await page.goto("/projects/");
	await ready(page);
	await expect(
		page
			.locator(
				'#swup-container a[href="https://github.com/Shixiaoshi0417/NekoKEM"]',
			)
			.first(),
	).toBeVisible();
	await expect(
		page
			.locator(
				'#swup-container a[href="https://github.com/Shixiaoshi0417/LunexSU"]',
			)
			.first(),
	).toBeVisible();
	await expect(page.locator("body")).not.toContainText("Corax");
	for (const route of [
		"/posts/guide/",
		"/posts/corax/",
		"/albums/AcgExample/",
	]) {
		const response = await request.get(route);
		expect(response.status(), route).toBe(404);
	}
});

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
	test(`responsive homepage ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
		const errors: string[] = [];
		const thirdParty: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("request", (request) => {
			if (
				/^https?:/.test(request.url()) &&
				!request.url().startsWith("http://127.0.0.1:4321/")
			)
				thirdParty.push(request.url());
		});
		await page.goto("/", { waitUntil: "networkidle" });
		await ready(page);
		await noOverflow(page);
		expect(
			await page.locator("img").evaluateAll((images) =>
				images
					.filter(
						(image) =>
							// Ignore transparent banner buffers, but still check every
							// image that is actually painted in the viewport.
							image.checkVisibility({
								checkOpacity: true,
								checkVisibilityCSS: true,
							}) &&
							image.getBoundingClientRect().width > 0 &&
							image.getBoundingClientRect().top < window.innerHeight &&
							image.getBoundingClientRect().bottom > 0 &&
							(!image.complete || image.naturalWidth === 0),
					)
					.map((image) => image.src),
			),
		).toEqual([]);
		expect(errors).toEqual([]);
		expect(thirdParty).toEqual([]);
		if (width === 390 || width === 1440) {
			await mkdir("artifacts/preview", { recursive: true });
			await page.screenshot({
				path: `artifacts/preview/home-${width === 390 ? "mobile" : "desktop"}.png`,
				fullPage: true,
			});
		}
	});
}

test("Swup navigation, active link and browser history", async ({ page }) => {
	await page.goto("/");
	await ready(page);
	await page.evaluate(() => {
		(
			window as Window & { __personalQaDocument?: string }
		).__personalQaDocument = "persistent-shell";
	});
	await page.locator('#navbar a[href="/projects/"]').click();
	await expect(page.locator("#swup-container")).toHaveAttribute(
		"data-current-page",
		"projects",
	);
	await expect(page.locator('#navbar a[href="/projects/"]')).toHaveAttribute(
		"aria-current",
		"page",
	);
	await page.locator('#navbar a[href="/about/"]').click();
	await expect(page.locator("#swup-container")).toHaveAttribute(
		"data-current-page",
		"about",
	);
	await page.goBack();
	await expect(page.locator("#swup-container")).toHaveAttribute(
		"data-current-page",
		"projects",
	);
	await page.goForward();
	await expect(page.locator("#swup-container")).toHaveAttribute(
		"data-current-page",
		"about",
	);
	await noOverflow(page);
	expect(
		await page.evaluate(
			() =>
				(window as Window & { __personalQaDocument?: string })
					.__personalQaDocument,
		),
	).toBe("persistent-shell");
});

test("mobile menu can close, reopen, navigate, and theme persists", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	await ready(page);
	await page.locator("#nav-drawer-switch").click();
	await expect(page.locator(".site-drawer")).toHaveClass(/site-drawer--open/);
	await page.keyboard.press("Escape");
	await expect(page.locator(".site-drawer")).not.toHaveClass(
		/site-drawer--open/,
	);
	await page.locator("#nav-drawer-switch").click();
	await page.locator('.site-drawer a[href="/projects/"]').click();
	await expect(page.locator("#swup-container")).toHaveAttribute(
		"data-current-page",
		"projects",
	);
	await expect(page.locator(".site-drawer")).not.toHaveClass(
		/site-drawer--open/,
	);
	await page.locator("#scheme-switch").click();
	await expect(page.locator("html")).toHaveClass(/dark/);
	await page.locator("#nav-drawer-switch").click();
	await page.locator('.site-drawer a[href="/about/"]').click();
	await expect(page).toHaveURL(/\/about\//);
	await expect(page.locator("#swup-container")).toHaveAttribute(
		"data-current-page",
		"about",
	);
	await ready(page);
	await expect(page.locator("html")).toHaveClass(/dark/);
	await noOverflow(page);
	await page.screenshot({
		path: "artifacts/preview/about-mobile-dark.png",
		fullPage: true,
	});
});

async function openSearch(page: Page, mobile: boolean) {
	if (mobile) {
		await page.locator("#search-switch").click();
		return page.locator('#search-panel input[type="search"]');
	}
	await page.locator(".top-app-bar__search-shell").click();
	return page.locator("#search-input-desktop");
}

for (const width of [390, 1440]) {
	test(`production search closes on selection and history at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 1000 });
		await page.goto("/");
		await ready(page);
		const panel = page.locator("#search-panel");
		const input = await openSearch(page, width < 1024);
		await input.fill("NekoKEM");
		const result = panel.locator('a[href*="/posts/nekokem/"]').first();
		await expect(result).toBeVisible();
		await result.click();
		await expect(page).toHaveURL(/\/posts\/nekokem\//);
		await expect(page.locator("#swup-container h1").first()).toContainText(
			"NekoKEM",
		);
		await expect(panel).toHaveClass(/float-panel-closed/);
		await expect(panel).toHaveCSS("opacity", "0");
		await ready(page);

		// A same-page result may not start a Swup visit. Enter must still close it.
		await openSearch(page, width < 1024);
		await expect(panel).not.toHaveClass(/float-panel-closed/);
		await expect(result).toBeVisible();
		await result.press("Enter");
		await expect(panel).toHaveClass(/float-panel-closed/);

		const nextInput = await openSearch(page, width < 1024);
		await nextInput.fill("LunexSU");
		await panel.locator('a[href*="/posts/lunexsu/"]').first().press("Enter");
		await expect(page).toHaveURL(/\/posts\/lunexsu\//);
		await expect(page.locator("#swup-container h1").first()).toContainText(
			"LunexSU",
		);
		await expect(panel).toHaveClass(/float-panel-closed/);
		await ready(page);
		await openSearch(page, width < 1024);
		await expect(panel).not.toHaveClass(/float-panel-closed/);
		await page.goBack();
		await expect(page).toHaveURL(/\/posts\/nekokem\//);
		await expect(page.locator("#swup-container h1").first()).toContainText(
			"NekoKEM",
		);
		await expect(panel).toHaveClass(/float-panel-closed/);
		await ready(page);
		await openSearch(page, width < 1024);
		await expect(panel).not.toHaveClass(/float-panel-closed/);
		await page.goForward();
		await expect(page).toHaveURL(/\/posts\/lunexsu\//);
		await expect(panel).toHaveClass(/float-panel-closed/);
	});
}

for (const width of [390, 1440]) {
	test(`a pending search stays dismissed and can restart at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 1000 });
		await page.goto("/");
		await ready(page);
		const input = await openSearch(page, width < 1024);
		await input.fill("NekoKEM");
		const panel = page.locator("#search-panel");
		const result = panel.locator('a[href*="/posts/nekokem/"]').first();
		await expect(result).toBeVisible();
		await page.evaluate(() => {
			const state = window as Window & {
				releaseSearch?: () => void;
				searchPending?: boolean;
				restorePagefind?: () => void;
			};
			if (!window.pagefind) throw new Error("Pagefind was not loaded");
			const original = window.pagefind;
			state.restorePagefind = () => {
				window.pagefind = original;
			};
			window.pagefind = {
				...window.pagefind,
				search: () =>
					new Promise((resolve) => {
						state.searchPending = true;
						state.releaseSearch = () =>
							resolve({
								results: [
									{
										data: async () => ({
											url: "/posts/lunexsu/",
											meta: { title: "Stale result" },
											excerpt: "Stale result",
										}),
									},
								],
							});
					}),
			};
		});
		await input.fill("LunexSU");
		await page.waitForFunction(
			() => (window as Window & { searchPending?: boolean }).searchPending,
		);
		await result.click();
		await expect(page).toHaveURL(/\/posts\/nekokem\//);
		await ready(page);
		await page.evaluate(async () => {
			const release = (window as Window & { releaseSearch?: () => void })
				.releaseSearch;
			if (!release)
				throw new Error("Search navigation replaced the persistent shell");
			release();
			// Allow both the search response and result-data microtasks to settle.
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		await expect(panel).toHaveClass(/float-panel-closed/);
		await expect(panel).not.toContainText("Stale result");
		await page.evaluate(() =>
			(window as Window & { restorePagefind?: () => void }).restorePagefind?.(),
		);
		await openSearch(page, width < 1024);
		await expect(panel).not.toHaveClass(/float-panel-closed/);
		await expect(
			panel.locator('a[href*="/posts/lunexsu/"]').first(),
		).toBeVisible();
	});
}

test("late Pagefind initialization cannot restart a dismissed search", async ({
	page,
}) => {
	await page.goto("/");
	await ready(page);
	const initialInput = await openSearch(page, false);
	await initialInput.fill("NekoKEM");
	await expect(
		page.locator('#search-panel a[href*="/posts/nekokem/"]').first(),
	).toBeVisible();
	await page.locator('#navbar a[href="/about/"]').click();
	await expect(page.locator("#swup-container")).toHaveAttribute(
		"data-current-page",
		"about",
	);
	await ready(page);
	await page.evaluate(() => {
		const state = window as Window & {
			__loadPagefind?: () => Promise<unknown>;
			releasePagefind?: () => void;
			pagefindLoadCalls?: number;
		};
		window.pagefind = undefined;
		const loading = new Promise((resolve) => {
			state.releasePagefind = () => {
				window.pagefind = {
					search: async () => ({
						results: [
							{
								data: async () => ({
									url: "/posts/nekokem/",
									meta: { title: "Late initialization" },
									excerpt: "Late initialization",
								}),
							},
						],
					}),
				};
				document.dispatchEvent(new CustomEvent("pagefindready"));
				resolve(window.pagefind);
			};
		});
		state.__loadPagefind = () => {
			state.pagefindLoadCalls = (state.pagefindLoadCalls ?? 0) + 1;
			return loading;
		};
	});
	const input = await openSearch(page, false);
	await input.fill("NekoKEM");
	await page.waitForFunction(
		() =>
			((window as Window & { pagefindLoadCalls?: number }).pagefindLoadCalls ??
				0) >= 1,
	);
	await page.locator('#navbar a[href="/projects/"]').click();
	await expect(page.locator("#swup-container")).toHaveAttribute(
		"data-current-page",
		"projects",
	);
	await page.evaluate(async () => {
		const release = (window as Window & { releasePagefind?: () => void })
			.releasePagefind;
		if (!release) throw new Error("Navigation replaced the persistent shell");
		release();
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
	await expect(page.locator("#search-panel")).toHaveClass(/float-panel-closed/);
	await expect(page.locator("#search-panel")).not.toContainText(
		"Late initialization",
	);
});

test("reduced motion and secondary-page screenshots", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	for (const route of [
		"/projects/",
		"/about/",
		"/posts/nekokem/",
		"/posts/lunexsu/",
	]) {
		await page.goto(route);
		await ready(page);
		await noOverflow(page);
		if (route === "/projects/" || route === "/about/")
			await page.screenshot({
				path: `artifacts/preview/${route.slice(1, -1)}-desktop.png`,
				fullPage: true,
			});
	}
});

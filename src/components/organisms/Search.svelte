<script lang="ts">
import IconButton from "@components/atoms/action/IconButton.svelte";
import SearchPanel from "@components/atoms/blog/SearchPanel.svelte";
import SearchBar from "@components/molecules/SearchBar.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";
import type { SearchResult } from "@/global";

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let pagefindLoaded = false;
let initialized = false;
let searchGeneration = 0;

$: panelResults = result.map((r) => ({
	url: r.url,
	title: r.meta.title,
	excerpt: r.excerpt,
}));

const fakeResult: SearchResult[] = [
	{
		url: url("/"),
		meta: {
			title: "This Is a Fake Search Result",
		},
		excerpt:
			"Because the search cannot work in the <mark>dev</mark> environment.",
	},
	{
		url: url("/"),
		meta: {
			title: "If You Want to Test the Search",
		},
		excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
	},
];

const togglePanel = () => {
	const panel = document.getElementById("search-panel");
	if (!panel) return;
	if (panel.classList.contains("float-panel-closed")) {
		panel.classList.remove("float-panel-closed");
		void search(keywordMobile, false);
	} else {
		closePanel();
	}
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById("search-panel");
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const closePanel = (): void => {
	// The search island survives Swup navigation. Discard pending results so
	// an older request cannot reopen the panel after a result was selected.
	searchGeneration += 1;
	isSearching = false;
	setPanelVisibility(false, true);
};

const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	const generation = ++searchGeneration;
	if (!keyword) {
		setPanelVisibility(false, isDesktop);
		result = [];
		return;
	}

	if (!initialized) {
		return;
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD) {
			if (
				!window.pagefind &&
				typeof (
					window as unknown as { __loadPagefind?: () => Promise<unknown> }
				).__loadPagefind === "function"
			) {
				await (
					window as unknown as { __loadPagefind: () => Promise<unknown> }
				).__loadPagefind();
			}
			pagefindLoaded = typeof window.pagefind?.search === "function";
			if (pagefindLoaded && window.pagefind) {
				const response = await window.pagefind.search(keyword);
				searchResults = await Promise.all(
					response.results.map((item) => item.data()),
				);
			} else {
				searchResults = [];
				console.error("Pagefind is not available in production environment.");
			}
		} else if (import.meta.env.DEV) {
			searchResults = fakeResult;
		}

		if (generation !== searchGeneration) return;
		result = searchResults;
		setPanelVisibility(result.length > 0, isDesktop);
	} catch (error) {
		if (generation !== searchGeneration) return;
		console.error("Search error:", error);
		result = [];
		setPanelVisibility(false, isDesktop);
	} finally {
		if (generation === searchGeneration) isSearching = false;
	}
};

onMount(() => {
	document.addEventListener("swup:visit:start", closePanel);
	document.addEventListener("swup:content:replace", closePanel);

	const initializeSearch = () => {
		initialized = true;
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
		console.log("Pagefind status on init:", pagefindLoaded);
	};
	const onPagefindReady = () => {
		// The active search already awaits __loadPagefind. Do not start a new
		// request here: a late load event may arrive after navigation dismissed it.
		initializeSearch();
	};
	const onPagefindLoadError = () => {
		console.warn(
			"Pagefind load error event received. Search functionality will be limited.",
		);
		initializeSearch();
	};

	if (import.meta.env.DEV) {
		console.log(
			"Pagefind is not available in development mode. Using mock data.",
		);
		initializeSearch();
	} else {
		document.addEventListener("pagefindready", onPagefindReady);
		document.addEventListener("pagefindloaderror", onPagefindLoadError);
		initializeSearch();
	}

	return () => {
		searchGeneration += 1;
		document.removeEventListener("swup:visit:start", closePanel);
		document.removeEventListener("swup:content:replace", closePanel);
		document.removeEventListener("pagefindready", onPagefindReady);
		document.removeEventListener("pagefindloaderror", onPagefindLoadError);
	};
});

$: if (initialized) {
	(async () => {
		await search(keywordDesktop, true);
	})();
}

$: if (initialized) {
	(async () => {
		await search(keywordMobile, false);
	})();
}
</script>

<!-- 桌面搜索：SearchBar 分子（40px 图标按钮，hover/点击展开成胶囊搜索条） -->
<SearchBar
    bind:value={keywordDesktop}
    id="search-input-desktop"
    name="search-desktop"
    placeholder={i18n(I18nKey.search)}
    onfocus={() => search(keywordDesktop, true)}
    oncollapse={closePanel}
/>

<!-- toggle btn for phone/tablet view -->
<IconButton
    icon="material-symbols:search"
    label="Search Panel"
    id="search-switch"
    size="small"
    shape="round"
    onclick={togglePanel}
    class="lg:!hidden !w-10 !h-10 !text-[1.25rem]"
/>

<!-- search panel（blog/SearchPanel 原子；开合由调用方 classList 控制，与 DisplaySettings 同款） -->
<SearchPanel
    id="search-panel"
    class="float-panel float-panel-closed absolute md:w-[30rem] top-20 left-4 md:left-[unset] right-4"
    bind:query={keywordMobile}
    results={panelResults}
    placeholder={i18n(I18nKey.search)}
    hideInputOnDesktop
    onselect={closePanel}
/>

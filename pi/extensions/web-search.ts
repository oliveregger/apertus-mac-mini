/**
 * web_search tool for Pi.
 *
 * Backend:
 *   - Brave Search API when BRAVE_API_KEY is set (general web search).
 *   - Otherwise the public Wikipedia search API (no key, Wikipedia only).
 *
 * Install: copy to ~/.pi/agent/extensions/web-search.ts
 */

import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";

const USER_AGENT = "pi-web-search-extension/1.0";

interface Hit {
	title: string;
	url: string;
	text: string;
}

async function searchBrave(query: string, count: number, key: string, signal?: AbortSignal): Promise<Hit[]> {
	const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`;
	const res = await fetch(url, {
		headers: { Accept: "application/json", "X-Subscription-Token": key },
		signal,
	});
	if (!res.ok) throw new Error(`Brave Search returned HTTP ${res.status}`);
	const data = (await res.json()) as { web?: { results?: Array<{ title: string; url: string; description?: string }> } };
	return (data.web?.results ?? []).map((r) => ({
		title: r.title,
		url: r.url,
		text: (r.description ?? "").replace(/<[^>]+>/g, ""),
	}));
}

// Wikipedia search requires every word to match, so question words and filler
// ("who developed ... and when was it released") return unrelated pages.
const FILLER = new Set(
	(
		"a an the and or of in on for to by with about from is are was were be been it its this that these those " +
		"who whom whose what when where which why how did do does has have had first latest current " +
		"developed developer developers built builder created creator made release released date year search web find"
	).split(" "),
);

function keywords(query: string): string {
	const words = query.replace(/[?!.,;:"']/g, " ").split(/\s+/).filter(Boolean);
	const kept = words.filter((w) => !FILLER.has(w.toLowerCase()));
	return (kept.length ? kept : words).slice(0, 6).join(" ");
}

async function searchWikipedia(query: string, count: number, lang: string, signal?: AbortSignal): Promise<Hit[]> {
	query = keywords(query);
	const params = new URLSearchParams({
		action: "query",
		format: "json",
		generator: "search",
		gsrsearch: query,
		gsrlimit: String(count),
		prop: "extracts|info",
		exintro: "1",
		explaintext: "1",
		exchars: "700",
		inprop: "url",
		origin: "*",
	});
	const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`, {
		headers: { "User-Agent": USER_AGENT },
		signal,
	});
	if (!res.ok) throw new Error(`Wikipedia returned HTTP ${res.status}`);
	const data = (await res.json()) as {
		query?: { pages?: Record<string, { index: number; title: string; fullurl: string; extract?: string }> };
	};
	return Object.values(data.query?.pages ?? {})
		.sort((a, b) => a.index - b.index)
		.map((p) => ({ title: p.title, url: p.fullurl, text: (p.extract ?? "").trim() }));
}

const webSearch = defineTool({
	name: "web_search",
	label: "Web Search",
	description:
		"Search the web for current or factual information. Returns titles, URLs and text excerpts of the top results.",
	promptSnippet: "Search the web for current or factual information",
	promptGuidelines: [
		"Use web_search when the user asks about facts, dates, people or recent events that you are not certain about, and cite the result URLs in the answer.",
	],
	parameters: Type.Object({
		query: Type.String({
			description:
				"A few keywords naming the subject, for example: Apertus language model.",
		}),
		count: Type.Optional(Type.Number({ description: "Number of results, 1 to 5. Default 3." })),
		lang: Type.Optional(Type.String({ description: "Wikipedia language code such as en, de, fr, it. Default en." })),
	}),

	async execute(_toolCallId, params, signal) {
		const count = Math.min(5, Math.max(1, Math.round(params.count ?? 3)));
		const braveKey = process.env.BRAVE_API_KEY;
		const backend = braveKey ? "brave" : "wikipedia";
		const hits = braveKey
			? await searchBrave(params.query, count, braveKey, signal)
			: await searchWikipedia(params.query, count, /^[a-z]{2,3}$/.test(params.lang ?? "") ? params.lang! : "en", signal);

		const text = hits.length
			? hits.map((h, i) => `[${i + 1}] ${h.title}\n${h.url}\n${h.text}`).join("\n\n")
			: `No results for "${params.query}".`;
		return {
			content: [{ type: "text", text }],
			details: { backend, query: params.query, results: hits.length },
		};
	},
});

export default function (pi: ExtensionAPI) {
	pi.registerTool(webSearch);
}

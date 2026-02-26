import { Hono } from "hono";
import { cors } from "hono/cors";
import { ARWU_BASE_URL, ARWU_EN_BASE_URL, QS_BASE_URL, THE_BASE_URL } from "./constants";
import { getARWUHash } from "./utils";
import { cache } from "hono/cache";

type Bindings = {
	ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

// 允许所有跨域请求
app.use("*", cors());

// 所有请求做缓存处理, 缓存时间 1 小时
app.get(
	"*",
	cache({
		cacheName: "china-uni-rank-worker-cache",
		cacheControl: "max-age=3600",
	}),
);

// 软科港澳台高校列表
app.get("/arwu/uni/hmt", (c) => {
	// 直接返回所有数据
	return fetch(`${ARWU_EN_BASE_URL}/api/pub/v1/inst?name_en=&region=&limit=&random=false`);
});

// 软科港澳台某高校详情, 返回的还是 script
app.get("/arwu/uni/hmt/:univUp", (c) => {
	const univUp = c.req.param("univUp");

	return getARWUHash("en").then((hash) => {
		if (hash) {
			const url = `${ARWU_EN_BASE_URL}/_nuxt/static/${hash}/institution/${univUp}/payload.js`;

			return fetch(url, {
				headers: {
					Referer: ARWU_EN_BASE_URL,
				},
			})
				.then((r) => r.text())
				.then((res) => {
					const content = res.replace("__NUXT_JSONP__", "arwu_uni_hmt_detail");
					return c.text(content, 200, {
						"Content-Type": "application/javascript; charset=utf-8",
					});
				});
		}
	});
});

// 软科中国大陆高校列表
app.get("/arwu/uni/cn", (c) => {
	return getARWUHash("zh").then((hash) => {
		if (hash) {
			const url = `${ARWU_BASE_URL}/_nuxt/static/${hash}/institution/payload.js`;

			return fetch(url, {
				headers: {
					Referer: ARWU_BASE_URL,
				},
			})
				.then((r) => r.text())
				.then((res) => {
					const content = res.replace("__NUXT_JSONP__", "arwu_uni_cn_list");
					return c.text(content, 200, {
						"Content-Type": "application/javascript; charset=utf-8",
					});
				});
		}
	});
});

// 软科中国大陆某高校详情, 返回的还是 script
app.get("/arwu/uni/cn/:univUp", (c) => {
	const univUp = c.req.param("univUp");

	return getARWUHash("zh").then((hash) => {
		if (hash) {
			const url = `${ARWU_BASE_URL}/_nuxt/static/${hash}/institution/${univUp}/payload.js`;

			return fetch(url, {
				headers: {
					Referer: ARWU_BASE_URL,
				},
			})
				.then((r) => r.text())
				.then((res) => {
					const content = res.replace("__NUXT_JSONP__", "arwu_uni_cn_detail");
					return c.text(content, 200, {
						"Content-Type": "application/javascript; charset=utf-8",
					});
				});
		}
	});
});

// 软科世界排名
app.get("/arwu/rank/:year", (c) => {
	const year = c.req.param("year");
	return fetch(`${ARWU_BASE_URL}/api/pub/v1/arwu/rank?year=${year}`, {
		headers: {
			Referer: ARWU_BASE_URL,
		},
	})
		.then((r) => r.json())
		.then((res: any) => {
			const {
				data: { rankings = [], inds = [], regions = [] },
			} = res;
			return c.json([
				{
					year,
					indList: inds,
					regionList: regions,
					univData: rankings,
				},
			]);
		});
});

// qs 世界排名
app.get("/qs/rank", (c) => {
	const search = new URL(c.req.url).search;
	return fetch(`${QS_BASE_URL}/rankings/endpoint/${search}`, {
		headers: {
			Referer: QS_BASE_URL,
		},
	});
});

// qs 某高校世界排名趋势
app.get("/qs/rank/world-trend/:coreId", (c) => {
	const coreId = c.req.param("coreId");

	return fetch(`${QS_BASE_URL}/qs-profiles/rank-data/513/${coreId}/0`, {
		headers: {
			Referer: QS_BASE_URL,
			"X-Requested-With": "XMLHttpRequest",
		},
	});
});

// qs 某高校亚洲排名趋势
app.get("/qs/rank/asian-trend/:coreId", (c) => {
	const coreId = c.req.param("coreId");

	return fetch(`${QS_BASE_URL}/qs-profiles/rank-data/514/${coreId}/0`, {
		headers: {
			Referer: QS_BASE_URL,
			"X-Requested-With": "XMLHttpRequest",
		},
	});
});

// 泰晤士排名
app.get("/the/rank/:year", (c) => {
	const year = c.req.param("year");

	return fetch(`${THE_BASE_URL}/json/ranking_tables/world_university_rankings/${year}`, {
		headers: {
			Referer: THE_BASE_URL,
		},
	});
});

// US News 最新世界排名, 这里访问的是静态资源
app.get("/usnews/rank", (c) => {
	const assetUrl = new URL("/usnews.json", c.req.url);
	return c.env.ASSETS.fetch(assetUrl);
});

app.notFound((c) => c.json({ message: "Not Found" }, 404));

export default app;

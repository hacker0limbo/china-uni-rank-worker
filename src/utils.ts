import { ARWU_BASE_URL, ARWU_EN_BASE_URL } from './constants';

// 请求软科官网, 然后通过正则拿到其中的 hash 值, 拿不到返回空字符串, 参数为英文或者中文,
export function getARWUHash(lang: 'en' | 'zh' = 'zh'): Promise<string> {
	const url = lang === 'en' ? ARWU_EN_BASE_URL : ARWU_BASE_URL;
	return fetch(url)
		.then((r) => r.text())
		.then((res) => {
			// 页面存在某个字符串为: <link rel="preload" href="/_nuxt/static/1757297452/payload.js" as="script">, 通过正则匹配拿到其中的 hash
			const match = res.match(/_nuxt\/static\/(\d+)\/payload\.js/);
			if (match) {
				const hash = match[1];
				console.log(`获取到软科官网的 hash 值: ${hash}, 语言为: ${lang}`);
				return hash;
			} else {
				return '';
			}
		})
		.catch((err) => {
			console.log('error: 获取 hash 值失败了', err);
			return '';
		});
}

/**
 * @deprecated worker 无法使用 eval 和 new Function 动态执行代码
 */
export function extractNuxtJSONP(code: string) {
	let result: any;

	const __NUXT_JSONP__ = (_path: string, fn: Function) => {
		result = fn();
		console.log('result', result);
	};

	// 关键点：把 __NUXT_JSONP__ 注入作用域
	new Function('__NUXT_JSONP__', code)(__NUXT_JSONP__);

	return result;
}

// 根据页码获取 US News 世界大学排名数据, 只获取中国大陆和港澳台地区的高校
export function getUSNewsWorldRankingsData(page = 1) {
	return fetch(
		`https://www.usnews.com/education/best-global-universities/api/search?format=json&country=china&country=hong-kong&country=macau&country=taiwan&page=${page}`,
		{
			headers: {
				accept: '*/*',
				Referer: 'https://www.usnews.com/',
			},
			body: null,
			method: 'GET',
		},
	)
		.then((res) => res.json())
		.then((data: any) => {
			const { items, total_pages } = data;
			return { items, total_pages };
		});
}

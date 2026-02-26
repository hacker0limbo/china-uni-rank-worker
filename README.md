# 中国高校四大排名服务端

使用 cloudflare worker 作为代理层, 构建一个 BFF 服务获取中国高校四大排名数据.

worker 地址: https://china-uni-rank-worker.stephen-yin.workers.dev

前端地址:

- 页面: hacker0limbo.github.io/china-uni-rank/
- 代码: github.com/hacker0limbo/china-uni-rank

## 开发

```bash
# 启动服务
npm run dev
# 部署到 cloudflare worker
npm run deploy
# 爬取所有 U.S. News 中国和港澳台高校的排名数据
npm run usnews
```

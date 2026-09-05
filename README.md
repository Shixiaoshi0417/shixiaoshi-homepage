# Shixiaoshi · 石小石

极简、深色、响应式个人主页。原生 HTML / CSS，无客户端 JavaScript、外部字体、数据库、追踪器或运行时第三方依赖。项目介绍来自 Corax-RAG-Agent 的公开仓库描述。

测试站点：[shixiaoshi-homepage.shimaochen0417.workers.dev](https://shixiaoshi-homepage.shimaochen0417.workers.dev)。GitHub：[Shixiaoshi0417/shixiaoshi-homepage](https://github.com/Shixiaoshi0417/shixiaoshi-homepage)。正式域名尚未绑定。

## 开发

使用 Node.js 22 或更高的受支持 LTS 版本及 npm。唯一直接开发依赖是 Cloudflare 官方部署工具 Wrangler，版本由 package-lock.json 固定。

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:8787 。在 WSL 中执行上述命令。本次环境的 Linux Node 安装在被 Git 忽略的 `.tools/node-v24.20.0-linux-x64/`；如系统没有 Node，可在项目根目录为当前终端设置：

```sh
export PATH="$PWD/.tools/node-v24.20.0-linux-x64/bin:$PATH"
```

这是本次工作区专用的运行时，不随仓库发布；其他设备正常安装 Node LTS 即可。

## 检查与部署

保持开发服务器运行，在另一个终端执行：

```sh
npm run check
npm run deploy:check
npx wrangler whoami
```

尚未登录时，运行 `npx wrangler login` 并在浏览器完成 Cloudflare OAuth。不要将凭据复制到代码或提交到 Git。然后：

```sh
npm run deploy
SITE_URL=https://实际部署地址.workers.dev npm run check
```

Worker 名称为 `shixiaoshi-homepage`。具体 workers.dev 地址以 Wrangler 输出为准。配置仅启用 workers.dev，没有正式域名路由。Wrangler 本地开发需要运行开发进程；线上由 Workers 提供服务，无常驻 Node 服务。

测试使用 Node 自带测试器，覆盖状态码、HTML、资源、嵌套路由 404、响应头、链接、缓存及域名配置。浏览器还需检查键盘导航、控制台及 320px 至 4K 的布局。

首版验证（2026-09-05）：WSL 真实 Worker 本地 11/11 检查通过，workers.dev 线上 11/11 通过，Wrangler dry-run 通过，npm audit 0 个漏洞。Edge 自动化对同一份静态文件测试 320、375、390、768、1024、1440、1920、2560、3840px 宽度，均无横向溢出、无页面/控制台错误、无第三方资源请求，跳转主内容焦点与 reduced-motion 检查通过。由于本机浏览器网络连接超时，布局测试使用本地文件响应拦截；线上 HTTP 检查由 WSL 直接访问部署地址完成。尚未在 Android / iPhone 真机或 Safari 上测试。

环境提示：WSL 报告 localhost 代理转发警告；npm 提示 esbuild/workerd 安装脚本需显式审核，但预编译二进制已可正常启动和部署，本次未放开全局脚本策略。Wrangler CLI 会提示开发工具遥测，这不等于网站添加了分析脚本；站点不包含任何分析工具。

## 目录

```text
public/
  index.html              首页及 SEO metadata
  404.html                自定义 404
  _headers                CSP、安全头与缓存
  robots.txt
  sitemap.xml
  assets/
    styles.css            响应式样式与纯 CSS 装饰
    favicon.svg           原创字母图标
src/worker.js             未匹配请求的静态资源回退
tests/site.test.mjs        无第三方依赖的 HTTP 检查
wrangler.jsonc            Workers Static Assets 配置
package.json
package-lock.json
.gitignore
README.md
```

静态文件由 Workers Static Assets 直接提供，利用 Cloudflare 的缓存。找不到的地址返回 `404.html` 与真正的 HTTP 404。响应头由 `public/_headers` 设置，包含 CSP、防嵌入、MIME 防嗅探和权限限制。HTML 每次重新验证；CSS 和 favicon 缓存一天并重新验证，修改后如需立即更新可调整资源文件名及 HTML 引用。

## 内容维护

修改 `public/index.html` 更新个人介绍、项目和联系方式。新增项目时复制 `.project-card` 结构，使用真实项目描述。样式在 `public/assets/styles.css`。页面无动画依赖，并支持 reduced-motion、可见焦点与跳转主内容链接。

## 以后绑定正式域名

本阶段不绑定 `shixiaoshi0417.com` 或 `www.shixiaoshi0417.com`，不读取或修改 DNS Zone、MX、Email Routing、Catch-all、SPF、DKIM、DMARC、SMTP2GO、Return-Path 或邮件验证记录。

首页 canonical、Open Graph URL 和 sitemap 暂时使用目标域名 `https://shixiaoshi0417.com/`。正式域名尚未上线时，它们不是当前测试站的真实访问地址；robots.txt 的 Sitemap 声明暂时注释。分享卡片使用文本 metadata，未配置社交预览图片。

用户决定绑定后，先只读核对根域名现有 Web 记录，列明要新增或调整的 Web DNS / Worker Custom Domain，再得到用户确认。确认后在 Workers 的 Settings → Domains & Routes 添加 Custom Domain，按 Cloudflare 提示仅处理获批的 Web 记录；如根域名已有冲突 A/AAAA/CNAME，不直接替换。所有邮件记录及路由必须保留。www 需另行决定，不默认添加。

绑定完成后验证 HTTPS、首页、404、安全头，并启用 `robots.txt` 中的正式 Sitemap 声明，检查 canonical、Open Graph 与 sitemap 一致。本仓库没有自动域名绑定脚本。

## 隐私与凭据

无用户追踪、广告、第三方脚本或第三方资源。`.env*`、`.dev.vars*`、`.wrangler/`、`node_modules/` 和本地工具/测试产物不提交。勿把 GitHub 或 Cloudflare token、cookie、API key 写入任何源码或文档。

暂未授予开源许可证；公开仓库不代表允许任意再分发，所有者可之后选择许可证。

官方参考：[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)、[Wrangler 配置](https://developers.cloudflare.com/workers/wrangler/configuration/)。

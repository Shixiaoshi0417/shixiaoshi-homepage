# 石小石 · Shixiaoshi

基于 [Shirone](https://github.com/LyraVoid/Shirone) 的个人主页。保留主题原有的二次元视觉、圆体、卡片、双侧栏与响应式导航，使用庄方宜《雨停的瞬间》横幅。

目前展示两个维护中的项目：**LunexSU** 与 **NekoKEM**。项目说明、关于页及联系方式可在源文件中维护。此次重建以保留预览及公开项目资料为依据，正文重新整理，不是丢失源码的逐字恢复。

## 本地开发

要求 Node.js **26.13.0+** 与 pnpm **11.28.2**（版本由 package.json 固定）。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

生产构建与预览：

```sh
pnpm check
pnpm type-check
pnpm check:manifest
pnpm build
pnpm preview --host 127.0.0.1 --port 4321 --ignore-lock
```

打开 http://127.0.0.1:4321 。Windows 可使用 `pnpm.cmd`。开发模式会显示上游草稿演示文章，生产构建只发布两篇个人项目文章。验收和截图以生产预览为准。

## 浏览器验收

```sh
pnpm exec playwright install chromium
pnpm build
pnpm test:personal
```

使用独立的生产预览配置，覆盖桌面/手机布局、项目内容、站内导航和历史、搜索、菜单开关、明暗主题、reduced-motion、资源加载及启用页面的 axe 无障碍扫描。截图输出到 `artifacts/preview/`，不进入源码提交。本次按用户选择不提交 GitHub Actions 工作流，因此不会自动运行 CI 或生成截图。测试脚本可在具备浏览器环境的机器上手动执行。

## 内容入口

- `src/config/siteConfig.ts`：站名、颜色、横幅、站点 URL。
- `src/config/profileConfig.ts`：头像、简介、GitHub 与邮箱。
- `src/data/projects.ts`：两个项目卡片。
- `src/content/posts/nekokem.md`、`lunexsu.md`：项目文章。
- `src/content/spec/about.md`：关于页与图片来源。
- `src/config/sidebarConfig.ts`：侧栏组件。
- `ASSET_SOURCES.md`：素材来源、主题许可证与待核实授权。

评论、音乐、访问追踪及示例功能页面已关闭，示例相册和音频不随本个人站分发。上游 Markdown 示例保留为草稿，以维持主题文档与语法清单的引用关系。

## 发布边界

此分支没有部署操作，不修改 main、Cloudflare、DNS 或邮件路由。`wrangler.jsonc` 仅准备静态输出目录 `dist`，保留原 Worker 名称，禁用 preview URLs 与 observability；没有自动部署工作流。`robots.txt` 与响应头保留 noindex，正式上线前需单独审核。

现有 Workers 测试地址只是沿用原仓库配置，本次未验证其线上状态；正式域名未绑定。若未来发布，先确认图片使用许可及域名，再单独执行获授权的部署。

## 版权

Shirone 主题代码基于 MIT，保留原始 `LICENSE`、作者和主题署名，源版本为 `25fb1a817c579b87bbd2350ef4b4594131411624`。上游说明保存在 `README.shirone.md`。

MIT 不覆盖个人文章、头像、第三方插画、音乐或其他独立素材。个人内容未在本次迁移中另行授予开源许可证。庄方宜横幅的公开使用及再分发许可尚未核实，请参阅 `ASSET_SOURCES.md`。

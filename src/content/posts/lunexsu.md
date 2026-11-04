---
title: LunexSU · 给 Root 授权加上期限
published: 2026-11-03
publishedAt: 2026-11-03T12:00:00+08:00
description: "基于 KernelSU 的 Android Root 方案，提供本次、限时与永久授权，以及 Material / MIUIX 双界面。"
category: Android
tags: ["Android", "KernelSU", "Kotlin"]
pinned: false
draft: false
comment: false
---

LunexSU 是基于 KernelSU 的 Android Root 方案。除了永久授权，也提供本次与限时授权，由配套 Core 在实际授权路径检查有效期。

界面保留 Material / MIUIX 两种风格，并引入 FinaSU 的主题、字体与首页布局。模块和 App Profile 机制沿用上游。

使用前需要确认设备、内核与安装方式，并匹配 Manager、ksud 和 Core。单独替换管理器不能让旧 Core 执行临时授权策略，兼容范围与限制请先阅读仓库说明。

[查看源码](https://github.com/Shixiaoshi0417/LunexSU) · [发布版本](https://github.com/Shixiaoshi0417/LunexSU/releases)

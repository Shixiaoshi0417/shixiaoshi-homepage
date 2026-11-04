---
title: NekoKEM · 文件加密实验
published: 2026-11-03
publishedAt: 2026-11-03T14:00:00+08:00
description: "实验性跨平台文件加密工具，结合 X448 与 ML-KEM-1024，探索后量子混合加密。"
category: 密码学
tags: ["Cryptography", "Post-quantum"]
pinned: true
draft: false
comment: false
---

NekoKEM 是一个用来学习 OpenSSL EVP API 的实验性文件加密工具。它把 X448 与 ML-KEM-1024 结合起来，支持单接收方与多接收方文件容器，并提供 Android、Windows、macOS 和 Linux 版本。

项目没有自行实现密码算法。加密、解密之外，也在继续完善密钥保护、文件格式检查和跨平台测试。

它仍是实验性项目，没有经过独立的专业安全审计，不适合用来保护重要或敏感数据。下载、使用方法与当前限制以仓库说明为准。

[查看源码](https://github.com/Shixiaoshi0417/NekoKEM) · [发布版本](https://github.com/Shixiaoshi0417/NekoKEM/releases)

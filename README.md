# Flclash-script

FlClash 与 Mihomo (Clash Meta) 配置覆写脚本。

[简体中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: JavaScript](https://img.shields.io/badge/Runtime-JavaScript-yellow.svg)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)

---

## 脚本订阅 RAW 直链

在 FlClash、Clash Verge Rev 或 Mihomo Party 的配置覆写中填入以下链接：

```text
https://raw.githubusercontent.com/87730/Flclash-script/main/flclash.js
```

---

## 特性

- **双卡片结构**：主界面仅保留 `默认代理` 与 `直连` 2 个策略组，简洁直观。
- **白名单分流**：采用 MetaCubeX 官方纯大陆标准 `cn.mrs`，国内服务直连，国外流量通过 `默认代理` 转发。
- **轻量规则集**：精炼核心规则集，去除冗余大库，提高加载速度，降低内存占用。
- **专线 DNS 适配**：保留私有 DNS 自动嗅探算法与 Hosts 继承，确保专线与中转节点入口正常解析。
- **防 DNS 泄露**：启用 Fake-IP 地址池，国外域名通过加密通道进行远端代理解析，国内域名走直连解析。
- **手动选择节点**：默认代理列表包含所有有效节点，由用户自主指定，避免自动测速切换导致 IP 跳跃。
- **移动端优化**：采用 0 字节轻量测速接口，关闭后台无意义进程扫描，加入节点重名自动编号容错与连接保持。

---

## 策略拓扑

```text
  默认代理 (包含订阅全部有效节点，手动选择，海外流量兜底)
  直连     (本地网络直接连接)
```

---

## 规则集

```text
  private.mrs        - 内网与局域网域名
  private_ip.mrs     - 内网与局域网 IP
  cn.mrs             - 中国大陆服务域名
  cn_ip.mrs          - 中国大陆 IP 网段
  fakeip_filter.mrs  - Fake-IP 白名单过滤
```

---

## 支持客户端

- FlClash (Android / iOS / Windows / macOS / Linux)
- Clash Verge Rev
- Mihomo Party
- Clash Nyanpasu
- 任意支持 JavaScript 配置覆写的 Clash Meta / Mihomo 客户端

---

## 协议

本项目基于 [MIT License](LICENSE) 协议开源。

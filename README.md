# Flclash-script

FlClash 与 Mihomo (Clash Meta) 极致纯净·极简防泄漏配置覆写脚本 (工业级终极版)。

[简体中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: JavaScript](https://img.shields.io/badge/Runtime-JavaScript-yellow.svg)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)

---

## 脚本订阅 RAW 直链

在 FlClash、Clash Verge Rev 或 Mihomo Party 的配置覆写中填入以下链接即可：

```text
https://raw.githubusercontent.com/87730/Flclash-script/main/flclash.js
```

---

## 核心特性

- **极致纯净·仅 2 卡片**：彻底剔除所有细分地区分组、应用分流组、自动测速组与冗余的兜底卡片。手机主界面仅保留 `默认代理` 与 `直连` 2 个核心卡片，告别滑动地狱。
- **纯血白名单·零误杀**：基于 MetaCubeX 官方纯大陆标准 `cn.mrs`，TikTok、海外字节图床等海外 App 100% 自然走代理，彻底根治转圈卡顿，绝不搞任何临时针对性补丁。
- **轻量闭环·极速订阅**：精炼至 5 个最核心的纯血规则集，彻底剔除 3.3 万条多余海外规则库与死代码，订阅秒拉、常驻内存极低，在手机后台不被杀。
- **纯粹闭环分流**：局域网直连 -> 屏蔽国外 QUIC（UDP 443，带 no-resolve）-> 大陆服务与 IP 直连 -> 其余所有海外未知流量自然兜底 `默认代理`（国内走国内，国外走国外）。
- **专线机场私有 DNS 自动嗅探与防透传**：完整保留原作者私有鉴权 DNS 嗅探算法，自动继承原订阅与本地 Hosts，保证专线/中转机场精准接入 BGP 高速入口，绝不降级为慢速透传 IP。
- **严密防 DNS 泄露**：
  - Fake-IP 双栈虚拟地址池，本地查询 0 毫秒响应，物理级杜绝 DNS 污染与泄露；
  - 国外域名走节点远端 Cloudflare/Google DoH 加密通道解析，运营商无法窥探；
  - 国内域名走阿里/腾讯 DNS 直连解析，保证国内 CDN 最佳速度。
- **纯手动选择·稳定不跳 IP**：默认代理列表均为真实机场节点，完全由你自主选定，绝不后台自动发包测速，杜绝频繁跨国换 IP 导致的封号与风控。
- **FlClash 移动端专属优化**：
  - 测速地址统一为 0 字节轻量接口（`https://cp.cloudflare.com/generate_204`），手动测速零流量损耗；
  - 关闭无意义的系统进程高频扫描（`find-process-mode: off`），显著降低移动端发热与耗电；
  - 加入节点重名自动编号容错，防止内核因机场重名节点报错崩溃；
  - 永久记住手动选中的节点（`store-selected: true`）与 TCP 保活（`keep-alive-interval: 60`）。

---

## 策略拓扑一览

```text
  默认代理 (包含订阅所有有效真实节点，纯手动选择，同时负责全量未知国外流量自然兜底)
  直连     (本地网络直接连接)
```

---

## 规则集概览 (仅 5 个纯血轻量库)

```text
  private.mrs        - 内网/局域网域名
  private_ip.mrs     - 内网/局域网 IP
  cn.mrs             - MetaCubeX 官方中国大陆服务域名
  cn_ip.mrs          - 中国大陆 IP 网段
  fakeip_filter.mrs  - Fake-IP 白名单过滤
```

---

## 支持的客户端

- FlClash (Android / iOS / Windows / macOS / Linux)
- Clash Verge Rev
- Mihomo Party
- Clash Nyanpasu
- 任意支持 JavaScript 配置覆写的 Clash Meta / Mihomo 客户端

---

## 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。

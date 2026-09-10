# Flclash-script

FlClash 与 Mihomo (Clash Meta) 极致纯净·极简防泄漏配置覆写脚本。

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

- **极致纯净·零冗余**：彻底剔除所有细分地区分组、应用分流组与自动测速组，界面仅保留 3 个核心卡片，告别滑动地狱与后台测速跳 IP。
- **纯粹三段式分流**：局域网直连 -> 屏蔽国外 QUIC（防卡顿）-> 国内域名与 IP 直连 -> 国外全部走默认代理（国内走国内，国外走国外）。
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
  默认代理 (包含订阅所有有效真实节点，纯手动选择)
  漏网之鱼 (兜底组，默认跟随【默认代理】)
  直连     (本地网络直接连接)
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

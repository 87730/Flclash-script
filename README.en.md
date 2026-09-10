# Flclash-script

A lightweight, ultra-clean, anti-leak configuration override script tailored for FlClash and Mihomo (Clash Meta).

[简体中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: JavaScript](https://img.shields.io/badge/Runtime-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## Raw Script URL

Enter the following raw script URL into the configuration override settings in FlClash, Clash Verge Rev, or Mihomo Party:

```text
https://raw.githubusercontent.com/87730/Flclash-script/main/flclash.js
```

---

## Key Features

- **Ultra-Clean & Just 2 Cards**: Completely eliminates regional groups, app routing, auto-latency tests, and redundant fallback cards. The main UI features strictly 2 cards: `默认代理` (Master Proxy) and `直连` (Direct).
- **Pure Closed-Loop Routing**: LAN direct -> Block foreign QUIC (UDP 443) -> China domains & IPs direct -> All foreign traffic and final fallback routed through `默认代理` (China traffic direct, foreign traffic proxied).
- **Automated Private Airport DNS Sniffing**: Preserves the full private DNS sniffing algorithm, automatically inheriting original subscription hosts to guarantee dedicated transit/IPLC airports connect directly to high-speed BGP entries without degrading to slow fallback IPs.
- **Robust Anti-DNS-Leak Architecture**:
  - Dual-stack Fake-IP virtual address pool with 0ms local response times, physically eliminating DNS leaks and ISP censorship;
  - Overseas domains are securely resolved via remote Cloudflare/Google DoH over encrypted proxy tunnels;
  - Domestic domains are resolved directly via Alibaba/Tencent DNS for optimal local CDN speeds.
- **100% Manual Selection · Zero IP Hopping**: Master proxy list contains only valid airport nodes chosen strictly by you. Zero background ping packets, completely preventing unexpected IP changes and account security flags.
- **FlClash Mobile Energy Optimizations**:
  - Latency testing endpoint standardized to a zero-byte interface (`https://cp.cloudflare.com/generate_204`) for zero data wastage;
  - Disabled extraneous system process scanning (`find-process-mode: off`) to noticeably curb battery drain and device heat;
  - Includes duplicate node name auto-numbering to prevent kernel initialization crashes;
  - Persistent manual node selection memory (`store-selected: true`) and TCP connection keep-alive (`keep-alive-interval: 60`).

---

## Policy Topology Overview

```text
  默认代理 (Master proxy, contains all valid nodes, pure manual selection & final unmatched fallback)
  直连     (Local direct connection)
```

---

## Supported Clients

- FlClash (Android / iOS / Windows / macOS / Linux)
- Clash Verge Rev
- Mihomo Party
- Clash Nyanpasu
- Any Clash Meta client supporting JavaScript (mihomoScript) overrides

---

## License

This project is open source and available under the [MIT License](LICENSE).

# proxy_DNS_rules

A lightweight, deeply optimized configuration override script tailored for FlClash and Mihomo (Clash Meta).

[简体中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: JavaScript](https://img.shields.io/badge/Runtime-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## Raw Script URLs

Enter either of the following raw URLs into the script override settings in FlClash, Clash Verge Rev, or Mihomo Party:

```text
https://raw.githubusercontent.com/87730/proxy_DNS_rules/main/flclash.js
```

or:

```text
https://raw.githubusercontent.com/87730/proxy_DNS_rules/main/mihomoScript.js
```

---

## Key Features

- **Automated Private Airport DNS Sniffing**: Automatically extracts private authentication DNS embedded by dedicated transit/IPLC airports (such as FlowerCloud, Sakura, etc.) and binds them directly to node domains, ensuring 100% access to high-speed BGP entry points without degradation to slow fallback IPs.
- **Intelligent Hosts Inheritance**: Safely merges and preserves all existing hosts entries from your original subscription and local settings, preventing custom NAS, intranet, or node accelerated mappings from being erased.
- **Deadlock-Free Anti-Leak DNS Architecture**:
  - Employs a dual-stack Fake-IP address pool with 0ms response times, physically eliminating DNS leaks and censorship;
  - Routes domestic domain queries directly via Alibaba/Tencent DNS, and overseas domain queries through encrypted Cloudflare/Google DoH proxy tunnels;
  - Resolves node server domains independently through local direct resolution to permanently prevent startup deadlocks.
- **5 Core Regions with Flag Emojis**: Neatly organizes nodes into the 5 primary regions (Hong Kong, Japan, United States, Singapore, Taiwan) with country flags, while gracefully grouping all other regions into an "Other Nodes" group.
- **Streamlined Service Routing**: Removes bloated and seldom-used policy groups, focusing strictly on high-frequency services including YouTube, Google, AI (ChatGPT/Claude), Telegram, and TikTok for minimal memory usage and rapid subscription updating.
- **FlClash Mobile Energy Optimization**:
  - Upgraded to a zero-byte latency test endpoint (`https://cp.cloudflare.com/generate_204`) for millisecond response times with zero bandwidth waste;
  - Disabled unnecessary system process scanning (`find-process-mode: off`) to noticeably reduce mobile battery consumption and heat;
  - Removed extraneous external Web consoles and NTP polling, delegating port and routing mode controls fully to the native client GUI.

---

## Policy Group Overview

```text
  GLOBAL (Global fallback)
  默认代理 (Master proxy control)
  手动选择 / 自动选择 (Manual & Auto-test selection)
  YouTube / Google / AI / Telegram / TikTok (Core service groups)
  漏网之鱼 / 直连 (Direct & Unmatched fallback)
  香港 / 日本 / 美国 / 新加坡 / 台湾省 (Core region groups)
  其他节点 (Other regions fallback)
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

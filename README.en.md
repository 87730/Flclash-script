# Flclash-script

Configuration override script for FlClash and Mihomo (Clash Meta).

[简体中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: JavaScript](https://img.shields.io/badge/Runtime-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## Raw Script URL

Enter the following URL into the script override settings in FlClash, Clash Verge Rev, or Mihomo Party:

```text
https://raw.githubusercontent.com/87730/Flclash-script/main/flclash.js
```

---

## Features

- **Single-Card Layout**: The main interface displays exclusively one core card: `节点选择` (Node Selection), completely eliminating visual clutter.
- **Whitelist Routing**: Uses the official MetaCubeX `cn.mrs` Mainland dataset and locks `mode: rule`, routing domestic services directly via native `DIRECT`, while all overseas traffic (TCP / UDP / HTTP3 / WebRTC live streams) forwards smoothly via `节点选择`.
- **Lightweight Rule-sets**: Uses the optimized `bett-rules` repository tailored for mobile environments, leveraging global CDN acceleration for ultra-fast loading and minimal memory footprint.
- **Dedicated Transit DNS Adaptation**: Preserves private DNS sniffing and Hosts inheritance with exact domain matching and closure projections, preventing over-broad wildcards and ensuring dedicated transit and IPLC entries resolve properly.
- **Anti-DNS-Leak**: Uses Fake-IP mode with remote encrypted DoH resolution for foreign domains and direct resolution for domestic domains, with direct-nameserver-follow-policy enabled to prioritize clean direct resolution policies.
- **Cross-Platform Compatibility**: Intelligently preserves and adapts local `mixed-port: 7890` and external controller endpoints, ensuring seamless compatibility across mobile (FlClash) and desktop environments.
- **Manual Node Selection**: The proxy list contains all valid nodes, allowing manual selection without unexpected IP changes.
- **Mobile & Performance Optimizations**: Includes zero-byte latency test endpoints, disabled background process scanning, duplicate node name handling, dual-stack Happy Eyeballs race connection, automatic Chrome uTLS fingerprint padding, doh.pub physical IP deadlock prevention, NTP direct pass-through protection, and dual TCP keep-alive tuning.

---

## Policy Topology

```text
  节点选择 (Contains all valid nodes, manual selection, foreign traffic fallback)
  [Domestic services route directly via kernel native DIRECT without redundant cards]
```

---

## Rule Providers (bett-rules Optimized Source)

```text
  private.mrs        - Local / private domains
  private_ip.mrs     - Local / private IPs
  cn.mrs             - MetaCubeX official Mainland China service domains
  cn_ip.mrs          - MetaCubeX official Mainland China IP ranges
  fakeip_filter.mrs  - Fake-IP whitelist filter
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

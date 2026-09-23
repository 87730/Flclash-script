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

- **Single-Card Minimalist Layout**: The main interface displays exclusively one core card: `节点选择` (Node Selection), completely eliminating visual clutter and infinite scrolling.
- **Deep AdBlock (REJECT Instant Kill)**: Integrates localized deep ad-blocking rule-sets (`217heidai/adblockfilters` updated every 8 hours), physically blocking mobile splash screen ads, shake-to-jump ads, and analytics telemetry at the millisecond level with zero data consumption.
- **Direct Large-File Downloads**: Decouples Apple services (`apple-cn.mrs`) and Microsoft services (`microsoft@cn.mrs`) to route via kernel native `DIRECT`, allowing full-speed broadband downloads for App Store apps, iOS updates, and Windows Updates without consuming proxy data.
- **STUN Voice/Conference Pass-Through**: Places STUN (UDP 3478) directly after NTP (UDP 123), ensuring instant P2P punching for WeChat audio/video calls, Tencent Meeting, and Lark, preventing call-initiation muting or disconnects.
- **Precision Whitelist Routing**: Uses Mainland China standard `cn.mrs`, blocks foreign QUIC traffic (with no-resolve to prevent DNS leaks and force instant TCP HTTPS fallback), routing domestic services directly via native `DIRECT`, while foreign traffic forwards smoothly via `节点选择`.
- **Lightweight MRS Binary Rules**: All rule-sets (`bett-rules` and `adblockfilters`) are compiled into `.mrs` compact binary format, tailored for mobile environments and accelerated by global CDNs for ultra-fast loading and minimal memory footprint.
- **Dedicated Transit DNS Adaptation**: Preserves private DNS sniffing and Hosts inheritance with exact domain matching and closure projections, preventing over-broad wildcards and ensuring dedicated transit and IPLC entries resolve properly.
- **Anti-DNS-Leak Protection**: Standardizes Fake-IP pools (`198.18.0.1/16` and `2001:2::1/64`), ensuring remote encrypted DoH resolution for foreign domains and direct resolution for domestic domains, with `direct-nameserver-follow-policy` enabled.
- **Safe Fallback for User Preferences**: Applies non-destructive fallback assignments for `mixed-port: 7890`, `mode: rule`, and `log-level: warning`, respecting user customizations made within FlClash or Clash Verge Rev.
- **Mobile & Performance Optimizations**: Latency testing upgraded to Google's native probe (`gstatic.com/generate_204`) with strict `expected-status: 204` checks, disabled background process scanning, duplicate node name handling, dual-stack Happy Eyeballs race connection, automatic Chrome uTLS fingerprint padding, doh.pub physical IP deadlock prevention, and dual TCP keep-alive tuning.

---

## Policy Topology

```text
  节点选择 (Contains all valid nodes, manual selection, foreign traffic fallback)
  [Domestic services, large file downloads, and system traffic route directly via kernel native DIRECT without redundant cards]
```

---

## Rule Providers (Full MRS Binaries)

```text
  private.mrs               - Local / private domains
  private_ip.mrs            - Local / private IPs
  adblockmihomolite.mrs     - Domestic deep ad-blocking & splash suppression (REJECT)
  apple-cn.mrs              - Apple applications & firmware downloads (DIRECT)
  microsoft@cn.mrs          - Windows Update & Microsoft large downloads (DIRECT)
  cn.mrs                    - Mainland China service domains (DIRECT)
  cn_ip.mrs                 - Mainland China IP ranges (DIRECT, no-resolve)
  fakeip_filter.mrs         - Fake-IP whitelist filter
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

# Mihomo-script

Configuration override script for Mihomo and FlClash.

[简体中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: JavaScript](https://img.shields.io/badge/Runtime-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## Raw Script URL

Enter the following URL into the script override settings in FlClash, Clash Verge Rev, or Mihomo Party:

```text
https://raw.githubusercontent.com/87730/Flclash-script/main/script.js
```

---

## Features

- **Single-Card Minimalist Layout**: The main interface displays exclusively one core card: `节点选择` (Node Selection), completely eliminating visual clutter and infinite scrolling.
- **Direct Large-File & Game Downloads**: Decouples Apple services (`apple-cn.mrs`), Microsoft services (`microsoft@cn.mrs`), and Steam game downloads (`steam@cn.mrs`) to route via kernel native `DIRECT`, ensuring covered App Store downloads, iOS updates, Windows Updates, and Steam game downloads run at full speed without consuming proxy data.
- **Precision Whitelist Routing**: Uses MetaCubeX official comprehensive Mainland China ruleset `cn.mrs` (covering 110,000+ entries including domestic tech giants, wildcards, and OEM mobile ecosystems), blocks foreign QUIC traffic (with no-resolve to prevent DNS leaks and force instant TCP HTTPS fallback), routing domestic services directly via native `DIRECT`, while foreign traffic forwards smoothly via `节点选择`.
- **Lightweight MRS Binary Rules**: Rule content originates directly from **MetaCubeX official `meta-rules-dat` repository** (5200+ Stars) delivered via jsDelivr CDN acceleration, compiled into `.mrs` compact binary format, tailored for mobile environments for ultra-fast loading and minimal memory footprint.
- **Dedicated Transit DNS Adaptation**: Preserves private DNS sniffing and Hosts inheritance with exact domain matching and closure projections, preventing over-broad wildcards and ensuring dedicated transit and IPLC entries resolve properly.
- **Anti-DNS-Leak Protection**: Standardizes Fake-IP pools (`198.18.0.1/15` and `2001:2::1/48` high-compatibility anti-conflict subnets), enforces `respect-rules: true` for strict DNS-to-routing alignment, bounds memory ARC cache to 4096 entries, dual-channel plain-IP DoH resolution (Google 8.8.8.8 prioritized, Cloudflare 1.1.1.1 fallback) for foreign domains to eliminate route-hunting deadlocks, alongside plain-IP DoH resolution (Alibaba/Tencent) for domestic business domains to eliminate cleartext UDP 53 snooping, with proxy server resolution prioritizing inherited transit private DNS and backed by plain IPs to eliminate certificate deadlocks and transit entry resolve failures, with `direct-nameserver-follow-policy` enabled.
- **Safe Fallback for User Preferences**: Applies non-destructive fallback assignments for `mixed-port: 7890`, `mode: rule`, and `log-level: warning`, respecting user customizations made within FlClash or Clash Verge Rev.
- **Mobile & Performance Optimizations**: Background automated node latency testing completely disabled (zero automated ping packets and zero idle battery drain), collision-proof duplicate node name indexing, selective Chrome uTLS padding for plain TLS while preserving Reality native fingerprints, physical IP deadlock prevention for major public DNS, and dual TCP keep-alive tuning.

---

## Policy Topology

```text
  节点选择 (Contains all valid nodes, manual selection, foreign traffic fallback)
  [Domestic services, large file downloads, and system traffic route directly via kernel native DIRECT without redundant cards]
```

---

## Rule Providers Topology (Full MRS Binaries · Official MetaCubeX & Direct Downloads)

```text
  1. DST-PORT,853,REJECT                          - Block DNS over TLS (DoT, prevents private DNS bypassing routing)
  2. IP-CIDR,172.19.0.0/30,REJECT,no-resolve      - Block TUN adapter interface subnet (prevents Android DIRECT routing loop deadlock)
  3. AND,((DST-PORT,123),(NETWORK,udp)),DIRECT    - NTP system time-sync pass-through
  4. RULE-SET,private,DIRECT                      - Local / private domains
  5. RULE-SET,private_ip,DIRECT                   - Local / private IPs
  6. RULE-SET,apple_cn,DIRECT                     - Apple App Store & firmware downloads (DIRECT)
  7. RULE-SET,microsoft_cn,DIRECT                 - Windows Update & Microsoft large files (DIRECT)
  8. RULE-SET,steam_cn,DIRECT                     - Steam game download CDN (DIRECT)
  9. RULE-SET,cn,DIRECT                           - Mainland China services (DIRECT)
  10. blockForeignQuic (AND UDP 443),REJECT       - Block foreign QUIC (forces instant TCP HTTPS fallback)
  11. RULE-SET,cn_ip,DIRECT,no-resolve            - Mainland China IP ranges (DIRECT, no-resolve)
  12. MATCH,节点选择                              - Foreign traffic forwards smoothly via proxy
```

---

## Supported Clients

- FlClash (Android / iOS / Windows / macOS / Linux)
- Clash Verge Rev
- Mihomo Party
- Clash Nyanpasu
- Any client supporting JavaScript (mihomoScript) overrides

---

## License

This project is open source and available under the [MIT License](LICENSE).

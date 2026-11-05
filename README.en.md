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
- **Ad Blocking**: Integrates `category-ads-all.mrs` positioned strictly ahead of `cn.mrs` to intercept mobile ad alliances including Bytedance CSJ / Pangolin, Tencent GDT, and Baidu Mobads. Swipe/interstitial ads in drama apps like Hongguo Drama are skipped instantly, and splash ads in common mobile apps advance directly to home screens. The ruleset build chain incorporates safety whitelists (excluding Xiaomi system push `app.chat.xiaomi.net`, JD customer service, Taobao miniapp engines) to ensure core system operations remain unaffected.
- **Pure Whitelist Architecture (Complete WebRTC Leak Elimination)**: Eliminates artificial hardcoded STUN port rules in favor of a robust whitelist routing model. Domestic VoIP communications (WeChat voice/video calls, Tencent Meeting, DingTalk, Feishu) route directly via native `DIRECT` through `cn.mrs` and `cn_ip.mrs` without latency; all overseas WebRTC probes (ports 3478, 5349, 19302, and arbitrary overseas IPs) naturally fall into the bottom `MATCH, 节点选择` to be proxied, eradicating public WAN IP leak vulnerabilities at the root.
- **Direct Large-File & Game Downloads**: Decouples Apple services (`apple@cn.mrs`), Microsoft services (`microsoft@cn.mrs`), and Steam game downloads (`steam@cn.mrs`) to route via kernel native `DIRECT`, ensuring covered App Store downloads, iOS updates, Windows Updates, and Steam game downloads run at full speed without consuming proxy data.
- **Intranet & Router DNS Resolution Loop**: Configures `'rule-set:private': 'system'` within `nameserver-policy`, guaranteeing local router portals (`tplogin.cn`, `miwifi.com`, `router.asus.com`) and LAN NAS hostnames resolve instantly via the physical WiFi native DNS, eliminating NXDOMAIN errors caused by queries misrouted to upstream proxy DNS.
- **Modern TUN Loopback Deadlock Defense**: Upgrades the reserved TUN subnet block from obsolete `172.19.0.0/30` to `198.18.0.0/30` (aligning with FlClash Android's actual VpnService allocation) to prevent routing loops.
- **External Controller Security Lockdown**: Automatically audits external controller bindings when cleaning up passwords; if bound to a non-loopback address (e.g., `0.0.0.0`), it enforces confinement to `127.0.0.1:<port>` (preserving original port, defaulting to 9090) to eliminate unauthorized LAN access risks.
- **Node Fingerprint & Protocol Alignment**: Supplies Chrome uTLS fingerprints for Trojan/VMess/VLESS nodes; provides fallback `chrome` fingerprints for Reality nodes if missing in subscriptions (preserving user-specified fingerprints) to prevent kernel crashes on newer Mihomo releases; avoids redundant TCP uTLS fingerprint assignments on QUIC-based Hysteria2 and TUIC protocols.
- **Transit Hosts Closure & PCDN Mitigation**: Preserves private DNS sniffing and Hosts inheritance with exact domain matching and closure projections, preventing over-broad wildcards and ensuring dedicated transit and IPLC entries resolve properly; drops PCDN domains silently and prunes dead DoH/Google translate host mappings.
- **Cross-Platform Compatibility**: Supports both mobile Android (FlClash) and desktop environments (Clash Verge Rev / Mihomo Party), preserving PC QQ web quick-login compatibility (`localhost.ptlogin2.qq.com`) alongside layered LAN defense rules.
- **Lightweight MRS Binary Rules**: Rule content originates directly from the mobile-optimized **`bett-rules` official repository** delivered via jsDelivr CDN acceleration, compiled into `.mrs` compact binary format, tailored for mobile environments for ultra-fast loading and minimal memory footprint.
- **Anti-DNS-Leak Protection**: Standardizes Fake-IP pools (`198.18.0.1/15` and `2001:2::1/48` high-compatibility anti-conflict subnets), enforces `respect-rules: true` for strict DNS-to-routing alignment, bounds memory ARC cache to 4096 entries, dual-channel plain-IP DoH resolution (Google 8.8.8.8 prioritized, Cloudflare 1.1.1.1 fallback) for foreign domains to eliminate route-hunting deadlocks, alongside plain-IP DoH resolution (Alibaba/Tencent) for domestic business domains to eliminate cleartext UDP 53 snooping, with proxy server resolution prioritizing inherited transit private DNS and backed by plain IPs to eliminate certificate deadlocks and transit entry resolve failures, with `direct-nameserver-follow-policy` enabled.
- **Safe Fallback for User Preferences**: Applies non-destructive fallback assignments for `mixed-port: 7890`, `mode: rule`, and `log-level: warning`, respecting user customizations made within FlClash or Clash Verge Rev.
- **Performance & Keep-Alive Tuning**: Background automated node latency testing completely disabled (zero automated ping packets and zero idle battery drain), normalized node card reconstruction for both static and provider-based subscriptions, collision-proof duplicate node name indexing, physical IP deadlock prevention for major public DNS, and dual TCP keep-alive tuning.

---

## Policy Topology

```text
  节点选择 (Contains all valid nodes, manual selection, foreign traffic fallback)
  [Domestic services, large file downloads, and system traffic route directly via kernel native DIRECT without redundant cards]
```

---

## Rule Providers Topology (Full 8 MRS Binaries · 13-Rule Pure Whitelist)

```text
  1. DST-PORT,853,REJECT                          - Block DNS over TLS (DoT, prevents private DNS bypassing routing)
  2. IP-CIDR,198.18.0.0/30,REJECT,no-resolve      - Block active TUN subnet (aligned with FlClash Android, prevents routing loop)
  3. AND,((DST-PORT,123),(NETWORK,udp)),DIRECT    - NTP system time-sync pass-through
  4. RULE-SET,private,DIRECT                      - Local / private domains (DIRECT)
  5. RULE-SET,private_ip,DIRECT                   - Local / private IPs (DIRECT)
  6. RULE-SET,apple_cn,DIRECT                     - Apple App Store & firmware downloads (apple@cn.mrs, DIRECT)
  7. RULE-SET,microsoft_cn,DIRECT                 - Windows Update & Microsoft large files (microsoft@cn.mrs, DIRECT)
  8. RULE-SET,steam_cn,DIRECT                     - Steam game download CDN (steam@cn.mrs, DIRECT)
  9. RULE-SET,ads,REJECT                          - Priority ad blocking (category-ads-all.mrs, blocks Pangolin/splash ads)
  10. RULE-SET,cn,DIRECT                          - Mainland China services (DIRECT, WeChat/calls zero latency)
  11. blockForeignQuic (AND UDP 443),REJECT       - Block foreign QUIC (forces instant TCP HTTPS fallback)
  12. RULE-SET,cn_ip,DIRECT,no-resolve            - Mainland China IP ranges (DIRECT, VoIP P2P pass-through)
  13. MATCH,节点选择                              - Foreign traffic forwards smoothly via proxy (all WebRTC/STUN proxied)
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

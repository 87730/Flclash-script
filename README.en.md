# Mihomo-script

Configuration override script for Mihomo and FlClash.

[简体中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: JavaScript](https://img.shields.io/badge/Runtime-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## Usage

Paste the following URL into the override settings of FlClash, Clash Verge Rev, Mihomo Party, or similar clients:

```text
https://raw.githubusercontent.com/87730/Flclash-script/main/script.js
```

---

## Features

- **Single proxy group**: keeps only one manual `节点选择` (Node Selection) group. No extra cards, no background latency testing.
- **Whitelist routing**: private, Apple, Microsoft, Steam and mainland-China rulesets go `DIRECT`; `cn_ip` acts as fallback; everything else is proxied. Foreign QUIC (UDP 443) is rejected outside mainland IP ranges so traffic falls back to TCP.
- **Ad blocking**: uses the `category-ads-all` ruleset, placed before the China ruleset.
- **DNS hardening**: Fake-IP pools (`198.18.0.1/15`, `2001:2::1/48`) with `respect-rules`. Foreign domains resolve via Google/Cloudflare DoH through the selected node; domestic and DIRECT domains resolve via Alibaba/Tencent DoH; proxy server hostnames fall back to Alibaba/Tencent DoH; LAN/private names use `system`.
- **Node processing**: filters informational entries (traffic, expiry, official-site notices), auto-indexes duplicate names, fills missing `chrome` fingerprints for Trojan/VMess/VLESS (existing fingerprints are preserved), and supports private DNS inheritance plus hosts-based rewriting for dedicated lines.
- **Safe cleanup**: removes hardcoded `bind-address`, `allow-lan`, `interface-name`, etc.; forces the external controller to loopback when no secret is set; removes legacy fields such as `global-client-fingerprint`.
- **Preference fallbacks**: only fills `mixed-port: 7890`, `mode: rule`, and `log-level: warning` when absent; existing client settings are never overwritten.
- **Lightweight rulesets**: `.mrs` binary rulesets from `bett-rules`, served via jsDelivr.

---

## Rule Order

```text
  1. DST-PORT,853,REJECT                          - Block DoT to prevent bypassing routing
  2. IP-CIDR,198.18.0.0/30,REJECT,no-resolve      - TUN reserved subnet fallback
  3. AND,((DST-PORT,123),(NETWORK,udp)),DIRECT    - NTP time-sync pass-through
  4. RULE-SET,private,DIRECT                      - Private domains (DIRECT)
  5. RULE-SET,private_ip,DIRECT                   - Private IPs (DIRECT)
  6. RULE-SET,apple_cn,DIRECT                     - Apple services (DIRECT)
  7. RULE-SET,microsoft_cn,DIRECT                 - Microsoft services (DIRECT)
  8. RULE-SET,steam_cn,DIRECT                     - Steam downloads (DIRECT)
  9. RULE-SET,ads,REJECT                          - Ad blocking
  10. RULE-SET,cn,DIRECT                          - Mainland China domains (DIRECT)
  11. blockForeignQuic (AND UDP 443),REJECT       - Block foreign QUIC, fall back to TCP
  12. RULE-SET,cn_ip,DIRECT,no-resolve            - Mainland China IPs (DIRECT)
  13. MATCH,节点选择                              - Everything else via proxy
```

---

## Supported Clients

- FlClash (Android / iOS / Windows / macOS / Linux)
- Clash Verge Rev
- Mihomo Party
- Clash Nyanpasu
- Any Mihomo client supporting JavaScript overrides

---

## License

This project is open source under the [MIT License](LICENSE).

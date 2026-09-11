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

- **Dual-Card Layout**: The main interface displays only two groups: `默认代理` (Master Proxy) and `直连` (Direct).
- **Whitelist Routing**: Uses the official MetaCubeX `cn.mrs` Mainland dataset. Domestic services route directly, while overseas traffic forwards via `默认代理`.
- **Lightweight Rule-sets**: Streamlined to essential rule-sets to improve update speeds and reduce memory consumption.
- **Dedicated Transit DNS Adaptation**: Retains private DNS sniffing and Hosts inheritance to ensure dedicated transit and IPLC entries resolve properly.
- **Anti-DNS-Leak**: Uses Fake-IP mode with remote encrypted DoH resolution for foreign domains and direct resolution for domestic domains.
- **Manual Node Selection**: The proxy list contains all valid nodes, allowing manual selection without unexpected IP changes.
- **Mobile Optimizations**: Includes zero-byte latency test endpoints, disabled background process scanning, duplicate node name handling, and connection keep-alive.

---

## Policy Topology

```text
  默认代理 (Contains all valid nodes, manual selection, foreign traffic fallback)
  直连     (Local direct connection)
```

---

## Rule Providers

```text
  private.mrs        - Local / private domains
  private_ip.mrs     - Local / private IPs
  cn.mrs             - Mainland China service domains
  cn_ip.mrs          - Mainland China IP ranges
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

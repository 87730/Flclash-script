# Mihomo-script

Mihomo 与 FlClash 配置覆写脚本。

[简体中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: JavaScript](https://img.shields.io/badge/Runtime-JavaScript-yellow.svg)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)

---

## 使用方法

在 FlClash、Clash Verge Rev、Mihomo Party 等客户端的配置覆写中填入：

```text
https://raw.githubusercontent.com/87730/Flclash-script/main/script.js
```

---

## 特性

- **单策略组**：只保留「节点选择」手动分组，不生成多余卡片，不引入自动测速。
- **白名单分流**：内网、苹果、微软、Steam 与国内规则集直连，`cn_ip` 兜底，其余流量走代理；国外 QUIC（UDP 443）按国内 IP 集合豁免后拦截，回退 TCP。
- **广告拦截**：使用 `category-ads-all` 规则集，置于国内规则之前。
- **DNS 加固**：Fake-IP 池（`198.18.0.1/15`、`2001:2::1/48`）+ `respect-rules`；海外域名走 Google/Cloudflare DoH（经节点选择），国内与 DIRECT 域名走阿里/腾讯 DoH，节点域名由阿里/腾讯 DoH 兜底；内网私有域名走 `system`。
- **节点处理**：过滤订阅信息节点（流量、到期、官网等），重名自动编号；Trojan/VMess/VLESS 缺指纹时补 `chrome`（已有指纹不覆盖）；支持专线私有 DNS 与 Hosts 继承改写。
- **安全清理**：移除 `bind-address`、`allow-lan`、`interface-name` 等硬编码；外部控制器无密码时强制收敛到回环地址；清理 `global-client-fingerprint` 等旧版残留字段。
- **偏好保底**：仅在未设置时补 `mixed-port: 7890`、`mode: rule`、`log-level: warning`，不覆盖客户端已有设置。
- **轻量规则集**：使用 `bett-rules` 的 `.mrs` 二进制规则集，经 jsDelivr 分发。

---

## 规则顺序

```text
  1. DST-PORT,853,REJECT                          - 拦截 DoT，防止绕过分流
  2. IP-CIDR,198.18.0.0/30,REJECT,no-resolve      - TUN 保留网段兜底
  3. AND,((DST-PORT,123),(NETWORK,udp)),DIRECT    - NTP 对时直连
  4. RULE-SET,private,DIRECT                      - 内网域名直连
  5. RULE-SET,private_ip,DIRECT                   - 内网 IP 直连
  6. RULE-SET,apple_cn,DIRECT                     - 苹果服务直连
  7. RULE-SET,microsoft_cn,DIRECT                 - 微软服务直连
  8. RULE-SET,steam_cn,DIRECT                     - Steam 下载直连
  9. RULE-SET,ads,REJECT                          - 广告拦截
  10. RULE-SET,cn,DIRECT                          - 国内域名直连
  11. blockForeignQuic (AND UDP 443),REJECT       - 拦截国外 QUIC，回退 TCP
  12. RULE-SET,cn_ip,DIRECT,no-resolve            - 国内 IP 兜底直连
  13. MATCH,节点选择                              - 其余流量走代理
```

---

## 支持客户端

- FlClash（Android / iOS / Windows / macOS / Linux）
- Clash Verge Rev
- Mihomo Party
- Clash Nyanpasu
- 任意支持 JavaScript 配置覆写的 Mihomo 客户端

---

## 协议

本项目基于 [MIT License](LICENSE) 协议开源。

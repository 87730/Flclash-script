# Flclash-script

FlClash 与 Mihomo (Clash Meta) 配置覆写脚本。

[简体中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: JavaScript](https://img.shields.io/badge/Runtime-JavaScript-yellow.svg)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)

---

## 脚本订阅 RAW 直链

在 FlClash、Clash Verge Rev 或 Mihomo Party 的配置覆写中填入以下链接：

```text
https://raw.githubusercontent.com/87730/Flclash-script/main/flclash.js
```

---

## 特性

- **单卡片极简美学**：主界面仅保留唯一的核心卡片 `节点选择`，彻底去除冗余的多级分流卡片，告别滑动地狱。
- **深度广告拦截（REJECT 秒杀）**：集成本土化深度去广告规则集（`217heidai/adblockfilters` 每 8 小时动态清洗合集），毫秒级物理阻断国产主流 App 启动页 5 秒开屏广告、摇一摇跳转与隐私追踪打点，直接不加载、零流量消耗。
- **大文件与游戏下载满速直连防偷跑**：独立分离苹果服务（`apple-cn.mrs`）、微软服务（`microsoft@cn.mrs`）与 Steam 游戏下载（`steam@cn.mrs`）走内核原生 `DIRECT` 直连出站，保障 App Store 软件下载、iOS 固件更新、Windows Update 与 Steam 游戏下载跑满家宽千兆速度，1KB 都不偷跑机场海外流量。
- **白名单精准分流**：采用纯大陆标准 `cn.mrs`，拦截国外 QUIC 流量（带 no-resolve 防 DNS 泄漏并逼退 TCP 秒开），国内服务与局域网直接走内核原生 `DIRECT` 直连，国外全协议流量通过 `节点选择` 满血转发出海。
- **轻量二进制规则集**：规则集来源统一采用经过深度优化的 `bett-rules` 与 `adblockfilters` 仓库，全量编译为 `.mrs` 紧凑二进制格式，针对移动端网络环境调优，配合全球 CDN 加速，加载极速，闪存与内存占用极低。
- **专线 Hosts 映射闭包**：保留私有 DNS 自动嗅探算法，采用安全闭包投射与 Hosts 精确改写，杜绝全网域名泛化误伤，确保专线与中转节点入口正常解析。
- **严密防 DNS 泄露**：启用 Fake-IP 地址池（`198.18.0.1/15` 与 `2001:2::1/48` 跨平台高兼容防冲突网段），国外域名通过加密通道进行远端代理解析，国内域名走直连解析，开启 `direct-nameserver-follow-policy` 优先遵从纯净直连解析策略，引导 DNS 采用纯明文 IP 杜绝证书时钟死锁。
- **客户端现场设置安全保底**：对本地 `mixed-port: 7890`、`mode: rule` 与 `log-level: warning` 采用无配置时安全保底赋值，绝不粗暴覆盖用户在 FlClash 或 Clash Verge 界面自定义的个性化端口、静默日志或分流偏好。
- **性能与保活优化**：测速接口统一为 Google 原生轻量探针（`gstatic.com/generate_204`）并增加 `204` 状态码强校验（杜绝节点欠费跳转假通畅），关闭后台无意义进程扫描，加入节点重名自适应序号防冲突、自动补全 Chrome 浏览器指纹、主流公共 DNS 物理 IP 防死锁闭环及科学 TCP 双保活调优。

---

## 策略拓扑

```text
  节点选择 (包含订阅全部有效节点，手动选择，海外流量兜底)
  [国内服务、大文件下载与系统基础流量直接走内核原生 DIRECT 直连出站，不生成多余卡片]
```

---

## 规则拓扑矩阵 (全量 MRS 二进制 · 直连优先防误杀)

```text
  1. AND,((DST-PORT,123),(NETWORK,udp)),DIRECT    - NTP 系统对时直通
  2. RULE-SET,private,DIRECT                      - 内网与局域网域名直连
  3. RULE-SET,private_ip,DIRECT                   - 内网与局域网 IP 直连
  4. RULE-SET,apple_cn,DIRECT                     - 苹果应用商店与固件直连 (满速防耗流量)
  5. RULE-SET,microsoft_cn,DIRECT                 - 微软更新补丁与 CDN 直连 (满速防耗流量)
  6. RULE-SET,steam_cn,DIRECT                     - Steam 游戏下载满速直连 (满速防耗流量)
  7. RULE-SET,cn,DIRECT                           - 大陆服务原生直连 (小米/华为等系统服务优先放行)
  8. RULE-SET,ads,REJECT                          - 国内深度广告与开屏秒杀 (拦截残留流氓广告)
  9. blockForeignQuic (AND UDP 443),REJECT        - 拦截国外 QUIC (带 no-resolve 防泄露并逼切 TCP 秒开)
  10. RULE-SET,cn_ip,DIRECT,no-resolve            - 大陆 IP 网段兜底直连
  11. MATCH,节点选择                              - 其余海外业务统一满血出海
```

---

## 支持客户端

- FlClash (Android / iOS / Windows / macOS / Linux)
- Clash Verge Rev
- Mihomo Party
- Clash Nyanpasu
- 任意支持 JavaScript 配置覆写的 Clash Meta / Mihomo 客户端

---

## 协议

本项目基于 [MIT License](LICENSE) 协议开源。

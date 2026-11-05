# Mihomo-script

Mihomo 与 FlClash 配置覆写脚本。

[简体中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: JavaScript](https://img.shields.io/badge/Runtime-JavaScript-yellow.svg)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)

---

## 脚本订阅 RAW 直链

在 FlClash、Clash Verge Rev 或 Mihomo Party 的配置覆写中填入以下链接：

```text
https://raw.githubusercontent.com/87730/Flclash-script/main/script.js
```

---

## 特性

- **单卡片极简美学**：主界面仅保留唯一的核心卡片 `节点选择`，彻底去除冗余的多级分流卡片，告别滑动地狱。
- **广告拦截**：引入 `category-ads-all.mrs` 规则集并严格置于 `cn.mrs` 之前拦截，阻断字节跳动穿山甲（CSJ / Pangolin）、腾讯优量汇（GDT）、百度百青藤等移动端主流广告联盟。红果短剧等短剧 App 滑动插屏广告直接跳过无缝连播，日常软件第三方开屏广告秒进主页；同时规则集构建链内置防误杀白名单（排除小米推送 `app.chat.xiaomi.net`、京东在线客服、淘宝小程序引擎等），绝不误伤系统核心组件。
- **纯血白名单自然分流（彻底根除 WebRTC 泄露）**：摒弃在规则顶层硬编码 STUN 端口的伪优化，回归最严谨的白名单闭环。微信语音/视频通话、腾讯会议、钉钉、飞书等国内音视频通信由 `cn.mrs`（域名）与 `cn_ip.mrs`（国内全量机房 IP）原生物理直连，秒通零延迟；网页与 App 发起的所有海外 WebRTC 探测（包括 3478、5349、19302 以及纯海外 IP 探测），由于不属于国内白名单，全部自然收敛至底部的 `MATCH,节点选择` 由代理接管出海，从根源上彻底消灭了 WebRTC 真实公网 IP 泄露隐患。
- **大文件与游戏下载满速直连防偷跑**：独立分离苹果服务（`apple@cn.mrs`）、微软服务（`microsoft@cn.mrs`）与 Steam 游戏下载（`steam@cn.mrs`）走内核原生 `DIRECT` 直连出站，保障由规则集覆盖的 App Store 软件下载、iOS 固件更新、Windows Update 与 Steam 游戏下载跑满家宽千兆速度，不偷跑机场海外流量。
- **局域网与路由器解析闭环**：在 `nameserver-policy` 中配置 `'rule-set:private': 'system'`，确保访问路由器管理后台（`tplogin.cn`、`miwifi.com`、`router.asus.com`）或局域网 NAS 域名时由当前物理 WiFi 原生 DNS 秒解，彻底根除私有域名被误发至海外代理 DNS 返回 NXDOMAIN 的故障。
- **现代 TUN 虚拟网卡死循环防御**：将保留网段拦截从过时的 `172.19.0.0/30` 升级为 `198.18.0.0/30`（精准对齐 FlClash Android 端的实际虚拟网卡 IP），有效防止 Android 系统在直连路由时产生内核自循环死锁。
- **外部控制器安全加固**：当清洗模式移除机场硬编码的随机密码时，自动检测外部控制器监听地址，若发现非本地回环地址（如 `0.0.0.0`），保留原端口并强制收敛重写为 `127.0.0.1:<原端口>`（无端口时保底 9090），彻底杜绝随身 WiFi 或局域网环境下的免密裸奔接管隐患。
- **节点指纹修复与协议适配**：针对 Trojan/VMess/VLESS 普通 TLS 补全 Chrome uTLS 指纹；针对 Reality 节点若订阅缺指纹自动补齐 `chrome`（已有指纹不覆盖，防止新版 Mihomo 因缺少指纹报错拒载）；遵循协议底层事实，不对基于 QUIC 的 Hysteria2 与 TUIC 节点做冗余指纹配置。
- **专线 Hosts 映射闭包与 PCDN 拦截**：保留私有 DNS 自动嗅探算法，采用安全闭包投射与 Hosts 精确改写，杜绝全网域名泛化误伤，确保专线与中转节点入口正常解析；针对 B 站等 PCDN 域名定向静默丢弃，彻底清理了无调用价值的死代码映射。
- **跨平台多重安全防御**：兼顾 Android（FlClash）与 PC 桌面端（Clash Verge Rev / Mihomo Party），保留 PC 端 QQ 网页一键快捷登录回环兼容（`localhost.ptlogin2.qq.com`）与局域网多重防御规则。
- **轻量二进制规则集**：规则内容来源于 **经过移动端深度调优的 `bett-rules` 官方仓库**，通过全球 jsDelivr CDN 加速交付，全量编译为 `.mrs` 紧凑二进制格式，针对移动端网络环境调优，加载极速，闪存与内存占用极低。
- **严密防 DNS 泄露**：启用 Fake-IP 地址池（`198.18.0.1/15` 与 `2001:2::1/48` 跨平台高兼容防冲突网段），开启 `respect-rules: true` 保证 DNS 严格遵循分流规则，内存级 ARC 缓存池约束为 4096 条，海外出海采用 Google/Cloudflare 纯 IP 双通道加密 DoH（8.8.8.8 优先，1.1.1.1 备选，消除寻路超时死锁），国内业务直连解析全面升级为阿里/腾讯纯 IP 加密 DoH（消除常规业务明文 UDP 53 窥探），节点域名解析优先继承专线私有 DNS 并由纯明文 IP 兜底（杜绝专线中转失联与证书死锁），开启 `direct-nameserver-follow-policy` 优先遵从纯净直连解析策略。
- **客户端现场设置安全保底**：对本地 `mixed-port: 7890`、`mode: rule` 与 `log-level: warning` 采用无配置时安全保底赋值，绝不粗暴覆盖用户在 FlClash 或 Clash Verge 界面自定义的个性化端口、静默日志或分流偏好。
- **性能与保活优化**：彻底关闭节点后台自动定时测速（杜绝节点自动探测发包与异常淘汰），进程排查模式完全交由客户端界面自由托管，节点选择卡片针对普通订阅与集合订阅做规范解构（杜绝纯集合订阅生成空 proxies 数组引发客户端校验异常），加入节点重名自适应序号防冲突，主流公共 DNS 物理 IP 防死锁闭环及科学 TCP 双保活调优。

---

## 策略拓扑

```text
  节点选择 (包含订阅全部有效节点，手动选择，海外流量兜底)
  [国内服务、大文件下载与系统基础流量直接走内核原生 DIRECT 直连出站，不生成多余卡片]
```

---

## 规则拓扑矩阵 (全量 8 组 MRS 二进制 · 13 级精纯白名单闭环)

```text
  1. DST-PORT,853,REJECT                          - 拦截 DNS over TLS (DoT，防止设备私有 DNS 绕过分流)
  2. IP-CIDR,198.18.0.0/30,REJECT,no-resolve      - 拦截当前 TUN 虚拟网卡保留网段 (对齐 FlClash 真实网卡，防内核路由自循环死锁)
  3. AND,((DST-PORT,123),(NETWORK,udp)),DIRECT    - NTP 系统对时直通
  4. RULE-SET,private,DIRECT                      - 内网与局域网域名直连
  5. RULE-SET,private_ip,DIRECT                   - 内网与局域网 IP 直连
  6. RULE-SET,apple_cn,DIRECT                     - 苹果应用商店与固件直连 (apple@cn.mrs 满速防耗流量)
  7. RULE-SET,microsoft_cn,DIRECT                 - 微软更新补丁与 CDN 直连 (microsoft@cn.mrs 满速防耗流量)
  8. RULE-SET,steam_cn,DIRECT                     - Steam 游戏下载满速直连 (steam@cn.mrs 满速防耗流量)
  9. RULE-SET,ads,REJECT                          - 广告拦截置顶 (category-ads-all.mrs，扼杀穿山甲/开屏广告，红果短剧滑动秒跳)
  10. RULE-SET,cn,DIRECT                          - 大陆服务原生直连 (良性国内服务畅通无阻，微信电话秒通)
  11. blockForeignQuic (AND UDP 443),REJECT       - 拦截国外 QUIC (带 no-resolve 防泄露并逼切 TCP 秒开)
  12. RULE-SET,cn_ip,DIRECT,no-resolve            - 大陆 IP 网段兜底直连 (微信/会议 P2P 物理直连)
  13. MATCH,节点选择                              - 其余海外业务统一满血出海 (全量海外 WebRTC/STUN 自然收敛出海防漏)
```

---

## 支持客户端

- FlClash (Android / iOS / Windows / macOS / Linux)
- Clash Verge Rev
- Mihomo Party
- Clash Nyanpasu
- 任意支持 JavaScript 配置覆写的 Mihomo 客户端

---

## 协议

本项目基于 [MIT License](LICENSE) 协议开源。

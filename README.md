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

- **单卡片极简结构**：主界面仅保留唯一的核心卡片 `节点选择`，去除多余策略卡片，告别滑动地狱。
- **白名单分流**：采用 MetaCubeX 官方原厂直出标准 `cn.mrs`，强制锁定 `mode: rule` 规则分流模式，国内服务与局域网直接走内核原生 `DIRECT` 直连，国外全协议流量（TCP / UDP / HTTP3 / WebRTC 直播流）通过 `节点选择` 转发。
- **轻量规则集**：规则集来源统一采用经过深度优化的 `bett-rules` 仓库，针对移动端网络环境调优，配合全球 CDN 加速，加载极速，内存占用低。
- **专线 DNS 适配**：保留私有 DNS 自动嗅探算法，采用安全闭包投射与 Hosts 精确改写，杜绝全网域名泛化误伤，确保专线与中转节点入口正常解析。
- **防 DNS 泄露**：启用 Fake-IP 地址池，国外域名通过加密通道进行远端代理解析，国内域名走直连解析，开启 direct-nameserver-follow-policy 优先遵从纯净直连解析策略。
- **全平台客户端兼容**：智能保留并自适应补全本地 `mixed-port: 7890` 混合端口与外部控制器，手机端 FlClash 与电脑端各类客户端开箱即用。
- **手动选择节点**：节点列表包含所有有效真实节点，由用户自主指定，避免自动测速切换导致 IP 跳跃。
- **性能与保活优化**：测速接口统一为轻量 0 字节探针，关闭后台无意义进程扫描，加入节点重名自动编号容错、双栈并发择优、自动补全 Chrome 浏览器指纹、doh.pub 物理 IP 防死锁、NTP 对时直通保护及科学 TCP 双保活调优。

---

## 策略拓扑

```text
  节点选择 (包含订阅全部有效节点，手动选择，海外流量兜底)
  [国内服务直接走内核原生 DIRECT 直连出站，不生成多余卡片]
```

---

## 规则集 (bett-rules 调优加速源)

```text
  private.mrs        - 内网与局域网域名
  private_ip.mrs     - 内网与局域网 IP
  cn.mrs             - MetaCubeX 官方中国大陆服务域名
  cn_ip.mrs          - MetaCubeX 官方中国大陆 IP 网段
  fakeip_filter.mrs  - Fake-IP 白名单过滤
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

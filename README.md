# flclash-script

FlClash 与 Mihomo (Clash Meta) 精简配置覆写脚本。

[简体中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Runtime: JavaScript](https://img.shields.io/badge/Runtime-JavaScript-yellow.svg)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)

---

## 脚本订阅 RAW 直链

在 FlClash、Clash Verge Rev 或 Mihomo Party 的配置覆写中填入以下任一链接即可：

```text
https://raw.githubusercontent.com/87730/flclash-script/main/flclash.js
```

或者：

```text
https://raw.githubusercontent.com/87730/flclash-script/main/mihomoScript.js
```

---

## 核心特性

- **专线机场私有 DNS 自动嗅探**：自动提取专线机场（如花云、百变小樱等）内置的私有鉴权 DNS，并与节点域名定向绑定，确保 100% 连入高速 BGP 入口，绝不降级为慢速透传 IP。
- **自定义 Hosts 智能继承**：安全继承合并原始订阅及本地设置的所有 Hosts 映射，防止自建内网或节点加速 IP 被覆盖丢失。
- **无死锁防泄漏 DNS 架构**：
  - 采用 Fake-IP 双栈虚拟地址池，本地查询 0 毫秒响应，物理级杜绝 DNS 泄漏与污染；
  - 国内域名使用阿里/腾讯 DNS 直连解析，国外域名使用 Cloudflare/Google DoH 加密代理通道解析；
  - 节点服务器域名独立直连解析，从根源打破启动死锁。
- **五大主力地区自动国旗**：自动将订阅节点归类为精炼的 5 大主力地区（香港、日本、美国、新加坡、台湾省），并自带国旗显示；其余冷门国家节点优雅归入其他节点。
- **高频服务精简分流**：剔除冗余冷门策略，只专注保留 YouTube、Google、AI（ChatGPT/Claude 等）、Telegram、TikTok 等核心常用服务，内存占用小、拉取速度快。
- **FlClash 专属节能优化**：
  - 测速地址全面升级为 0 字节轻量接口（`https://cp.cloudflare.com/generate_204`），后台测速毫秒级响应且零流量消耗；
  - 关闭无意义的系统进程高频扫描（`find-process-mode: off`），显著降低移动端发热与耗电；
  - 移除多余的外部 Web 控制台与 NTP 网络校时轮询，运行端口与代理模式完全遵从客户端图形界面设置。

---

## 策略拓扑一览

```text
  GLOBAL (全局兜底)
  默认代理 (主控选择)
  手动选择 / 自动选择 (基础手自选)
  YouTube / Google / AI / Telegram / TikTok (高频服务组)
  漏网之鱼 / 直连
  香港 / 日本 / 美国 / 新加坡 / 台湾省 (主力地区组)
  其他节点 (冷门地区兜底)
```

---

## 支持的客户端

- FlClash (Android / iOS / Windows / macOS / Linux)
- Clash Verge Rev
- Mihomo Party
- Clash Nyanpasu
- 任意支持 JavaScript (mihomoScript) 配置覆写的 Clash Meta 客户端

---

## 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。

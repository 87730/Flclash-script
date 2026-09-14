# FlClash Script 更新记录

## 2026-09-14：修复配置覆写问题

对应提交：`71da32a fix: improve hosts routing and config validation`

## 修复内容

### 1. 修复节点重名导致的配置加载失败

脚本会追加自己的直连节点和代理组。如果订阅中恰好存在同名节点，Mihomo 会拒绝加载整个配置。

现在会预留以下名称，在处理订阅节点时自动编号避免冲突：

- `默认代理`
- `直连`
- `DIRECT`
- `REJECT`
- `PASS`
- `GLOBAL`
- 脚本追加的 5 个直连节点

### 2. 修复境内 UDP/443 被错误拦截

QUIC 拦截规则原来排在中国大陆域名/IP规则之前。在 `no-resolve` 场景中，国内域名可能无法及时命中 `cn_ip`，从而被错误判定为境外流量并拒绝。

现在先匹配：

```text
cn
cn_ip
private_ip
```

再执行境外 UDP/443 拦截。

### 3. 修复 hosts 改写后的 WebSocket Host

当节点的 `server` 被 hosts 映射替换成另一个入口域名后，Mihomo 默认可能使用新的 `server` 作为 WebSocket Host，导致 CDN 或反向代理无法正确路由。

现在按传输类型写入正确字段：

- WebSocket：`ws-opts.headers.Host`
- H2：`h2-opts.host`
- HTTP：`http-opts.headers.Host`
- gRPC：不写入无效的 Host 字段

已有 Host 配置不会被覆盖。

### 4. 避免覆盖已有 SNI 的节点

如果节点已经配置了 `sni`，脚本不会再使用旧的 `server` 域名额外写入 `servername`，避免部分客户端优先使用错误的 TLS 名称。

### 5. 改进 IP 地址识别

修复了以下问题：

- `999.999.999.999` 不再被误判为合法 IPv4；
- 普通包含冒号的字符串不再直接被当成 IPv6 地址。

### 6. 修复单域名 DNS 策略被过度扩大

只有同一后缀下确实存在多个域名时，才合并成 `+.example.com`。单独的 `cdn.example.com` 会继续保持精确匹配，避免影响同域名下其他服务。

## Flowercloud hosts 说明

Flowercloud 配置中存在类似映射：

```yaml
hosts:
  fd025gz8-c617.aws-agent.org: b36d5gz0-2ac1.apt-agent.org
```

这表示节点实际连接入口从 `aws-agent.org` 切换到 `apt-agent.org`，并不代表修改 TLS SNI。原节点的 SNI 会继续保留，例如：

```yaml
server: b36d5gz0-2ac1.apt-agent.org
sni: m.ctrip.com
```

这类 hosts 映射看起来是服务商提供的国内优化或线路入口切换逻辑，因此脚本不会删除它。

## 真实配置验证

已使用 Mihomo Meta v1.19.13 对以下三份真实配置进行回归测试：

- `___.bin`：吹雪云配置
- `DoriyaNetwork.bin`：DoriyaNetwork 配置
- `Flowercloud.bin`：Flowercloud 配置

验证包括：

- JavaScript 语法检查；
- 节点重名处理；
- hosts 改写；
- SNI 保留；
- WS/H2/HTTP 字段生成；
- DNS 配置生成；
- Mihomo 配置结构校验。

三份配置均成功生成配置。Flowercloud 的 90 个原始节点中，过滤信息节点后保留 88 个有效节点，hosts 线路映射正常生效。

## 使用地址

```text
https://raw.githubusercontent.com/87730/Flclash-script/main/flclash.js
```

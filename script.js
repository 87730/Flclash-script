/**
 * Mihomo & FlClash 极简配置覆写脚本
 * https://raw.githubusercontent.com/87730/Flclash-script/main/script.js
 */

// ================================================================
//  可调开关（改这里就够了）
// ================================================================
// 内核兼容：产出的配置同时适用于 mihomo 与 Concord（FlClash 的新内核）。
// 按 Concord 官方 docs/compatibility.md：App 内嵌时 external-controller / secret 被忽略并告警，
// external-ui 永不打开，bind-address 不受支持；path-in-bundle 据 MyClash 实测会让整份配置被拒绝。
// 本脚本不写 path-in-bundle，其余四个默认都会剔除，所以两种内核下都是干净配置。

// 深度配置清洗安全控制开关
// true: 启用纯净化清洗（剔除局域网绑定穿透、多余分离端口、冲突网卡与底层探测，完全归还控制权给客户端 GUI）
// false: 保持原始机场下发参数（100% 原始放行，无损还原基线）
const ENABLE_CONFIG_CLEANUP = true;

// 远程控制面板开关
// false: 把控制权整个交还客户端——订阅里的 secret / external-controller / external-ui 全部删除（默认）
// true: 完整保留 secret、监听地址，并在缺失时补上 zashboard 面板，适合自己远程管理（请务必设密码）
const ALLOW_REMOTE_CONTROLLER = false;

// 未在配置中声明 ipv6 时的默认值（无 IPv6 的网络下开启会多一轮 AAAA 等待）
const DEFAULT_IPV6 = false;

// 额外 hosts 修正：默认值可整段删除或按需增删
const EXTRA_HOSTS = {
  // 修复 Google Play 能打开但下载卡住（.cn 域名映射到 .com）
  'services.googleapis.cn': 'services.googleapis.com',
  // 屏蔽 B 站等 PCDN 上传（不需要可删掉这四条）
  '+.mcdn.bilivideo.com': ['0.0.0.0'],
  '+.mcdn.bilivideo.cn': ['0.0.0.0'],
  '+.edge.mountaintoys.cn': ['0.0.0.0'],
  '+.h2.smtcdns.net': ['0.0.0.0'],
};

// 判定"机场信息节点"用的三组特征：强信息词 > 节点线索（地区/协议/倍率）> 弱信息词，
// 目的是「宁可漏杀，不可误杀」——一条正常节点被吞掉比多留一条广告节点更难受
const NODE_HINT =
  /香港|台湾|台北|日本|新加坡|美国|韩国|英国|德国|法国|加拿大|澳大利亚|印度|俄罗斯|土耳其|越南|泰国|马来|菲律宾|印尼|荷兰|瑞典|瑞士|意大利|西班牙|波兰|乌克兰|迪拜|阿联酋|以色列|巴西|南非|阿根廷|澳门|\b(?:HK|TW|JP|SG|US|KR|UK|DE|FR|CA|AU|IN|RU|TR|VN|TH|MY|PH|ID|AR|NL|SE|CH|IT|ES|PL|UA|AE|IL|BR|ZA|CN2|GIA|BGP|IEPL|IPLC|H2|VLESS|VMess|Trojan|SS|SSR|TUIC|AnyTLS|Reality|gRPC|WS|TLS|Hysteria2?)\b|\d+(?:\.\d+)?\s*[xX倍]/i;

// 强信息特征：即使名字里带地区词（如「HK Expire 2026-12-01」）也应判定为信息节点
const INFO_STRONG =
  /剩余流量|套餐到期|距离下次|下次重置|到期时间|已用流量|官网|网址导航|导航网址|\b(?:channel|panel|expire|expired|traffic|used|total)\b/i;

// provider 节点在内核下载后才可见，无法在这里执行完整的 JS 四层判定；
// 至少用强信息特征排除常见的套餐/官网节点，避免把带地区词的正常节点误删。
// 用 scoped (?i:...) 而非前缀 (?i)：Go RE2、.NET regexp2、Rust regex 均支持，
// 且只让本段大小写不敏感，不会外溢到用户原有的 exclude-filter 片段。
const PROVIDER_INFO_EXCLUDE_FILTER = `(?i:${INFO_STRONG.source})`;

// 弱信息特征：仅在名字没有任何地区/协议/倍率线索时才参与判定，避免误杀（如「香港 hk.example.net」）
const INFO_WEAK =
  /群组|返利|循环|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|地址|频道|电报|无法|说明|使用|提示|访问|支持|教程|关注|更新|作者|加入|超时|收藏|优惠|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|禁止|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|建议|重置|以下|过滤|免费|试用|应急|⚠️|t\.me\/\+|\bexpire\b|\bhttps?:\/\/|\bwww\.|\btraffic\b/iu;

// 裸域名样式的信息节点（如「官网 example.com」）
const DOMAIN_LIKE =
  /(?:[a-z0-9-]+\.)+(?:com|net|cn|io|cc|me|xyz|top|vip|club|site|link)(?:\/|$|[\s|])/i;

// 零宽/不可见字符：机场常在节点名里逐字插入这类字符（如「剩\u200B余流量」），
// 显示上看不出差别，但会让关键词正则整条失配，信息节点因此漏杀、地区识别因此失效。
// 刻意保留 U+200C/U+200D（ZWNJ/ZWJ）与 U+FE00–U+FE0F（变体选择符）：它们参与 emoji 连字，删掉会改字形。
const INVISIBLE_CHARS = /[\u00AD\u180E\u200B\u200E\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u115F\u1160\u3164\uFFA0]/g;

// 仅用于匹配的规范化名称，不修改节点显示名
function matchableName(name) {
  return typeof name === 'string' ? name.replace(INVISIBLE_CHARS, '') : '';
}

function isInfoNode(name) {
  const probe = matchableName(name);
  if (probe.trim() === '') return false;
  if (INFO_STRONG.test(probe)) return true;
  if (NODE_HINT.test(probe)) return false;
  return INFO_WEAK.test(probe) || DOMAIN_LIKE.test(probe);
}

// mihomo 内置出站名。节点一旦与之同名，内核会以
// "proxy DIRECT is the duplicate name" 拒绝整份配置（config.go:909），必须改名
const RESERVED_PROXY_NAMES = new Set([
  'DIRECT',
  'REJECT',
  'REJECT-DROP',
  'COMPATIBLE',
  'PASS',
  'PASS-RULE',
  'GLOBAL',
]);

// 手动策略组名。节点与组同名会让内核报 "proxy group X: the duplicate name"（config.go:961）
const NODE_GROUP_NAME = '节点选择';

// 屏蔽国外 QUIC（UDP 443 -> REJECT）。
// 国内域名由前置 cn 规则直连，国内 IP 由紧随其前的 cn_ip 规则直连；
// 这里只需拦截剩余 UDP 443。cn_ip 的 no-resolve 不会为了匹配该规则主动解析域名，
// 但若之前已经取得真实 IP，仍可使用该结果匹配。
const blockForeignQuic = ['AND,((NETWORK,UDP),(DST-PORT,443)),REJECT'];

const ruleProviderCommonDomain = {
  type: 'http',
  format: 'mrs',
  interval: 86400,
  behavior: 'domain',
};

const ruleProviderCommonIpcidr = {
  type: 'http',
  format: 'mrs',
  interval: 86400,
  behavior: 'ipcidr',
};

const RS_BASE = 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo';

const ruleProviders = {
  private: {
    ...ruleProviderCommonDomain,
    url: `${RS_BASE}/geosite/private.mrs`,
    path: './ruleset/private.mrs',
  },
  fakeip_filter: {
    ...ruleProviderCommonDomain,
    url: `${RS_BASE}/geosite/fakeip-filter.mrs`,
    path: './ruleset/fakeip-filter.mrs',
  },
  private_ip: {
    ...ruleProviderCommonIpcidr,
    url: `${RS_BASE}/geoip/private.mrs`,
    path: './ruleset/private_ip.mrs',
  },
  apple_cn: {
    ...ruleProviderCommonDomain,
    url: `${RS_BASE}/geosite/apple@cn.mrs`,
    path: './ruleset/apple@cn.mrs',
  },
  microsoft_cn: {
    ...ruleProviderCommonDomain,
    url: `${RS_BASE}/geosite/microsoft@cn.mrs`,
    path: './ruleset/microsoft@cn.mrs',
  },
  steam_cn: {
    ...ruleProviderCommonDomain,
    url: `${RS_BASE}/geosite/steam@cn.mrs`,
    path: './ruleset/steam@cn.mrs',
  },
  ads: {
    ...ruleProviderCommonDomain,
    url: `${RS_BASE}/geosite/category-ads-all.mrs`,
    path: './ruleset/category-ads-all.mrs',
  },
  cn: {
    ...ruleProviderCommonDomain,
    url: `${RS_BASE}/geosite/cn.mrs`,
    path: './ruleset/cn.mrs',
  },
  cn_ip: {
    ...ruleProviderCommonIpcidr,
    url: `${RS_BASE}/geoip/cn.mrs`,
    path: './ruleset/cn_ip.mrs',
  },
};

const selectBaseOption = {
  type: 'select',
  url: 'https://www.gstatic.com/generate_204',
  'expected-status': 204,
};

// 识别常见公共解析器；域名边界同时允许点号与连字符，避免漏掉 cloudflare-dns.com 等官方端点。
const commonDnsRegex =
  /(?:^|[.-])(?:d(?:ns|oh|ot)\.pub|one\.one\.one\.one|(?:alidns|tencent|dnspod|baidu|onedns|360|cloudflare|google|quad9|opendns|nextdns|adguard|smartdns))(?:[.-]|$)/i;

const commonDnsIps = new Set([
  '223.5.5.5', '223.6.6.6', '119.29.29.29', '1.12.12.12', '120.53.53.53',
  '114.114.114.114', '180.76.76.76', '1.2.4.8', '116.116.116.116',
  '101.226.4.6', '123.125.81.6', '180.184.1.1', '180.184.2.2',
  '2400:3200::1', '2400:3200:baba::1', '2402:4e00::', '2400:da00::6666',
  '1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4', '9.9.9.9', '149.112.112.112',
  '208.67.222.222', '208.67.220.220', '2606:4700:4700::1111',
  '2606:4700:4700::1001', '2001:4860:4860::8888', '2001:4860:4860::8844',
  '2620:fe::fe', '2620:fe::9', '2620:119:35::35', '2620:119:53::53',
]);

const chinaBootstrapDNS = ['223.5.5.5', '119.29.29.29'];
// 节点域名解析兜底：加密 DoH，避免明文 UDP 被污染/篡改导致节点解析失败
const chinaProxyServerDNS = [
  'https://223.5.5.5/dns-query',
  'https://1.12.12.12/dns-query',
];
// DIRECT 直连域名解析同样使用加密 DoH（内网私有域名仍走 system，属于合理例外）
const chinaDirectDNS = [
  'https://223.5.5.5/dns-query',
  'https://1.12.12.12/dns-query',
];
const chinaDNS = [
  'https://223.5.5.5/dns-query#DIRECT',
  'https://1.12.12.12/dns-query#DIRECT',
];
const foreignDNS = [
  `https://8.8.8.8/dns-query#${NODE_GROUP_NAME}`,
  `https://1.1.1.1/dns-query#${NODE_GROUP_NAME}`,
];

function hostSpecificity(pattern) {
  if (pattern.startsWith('+.')) return 2;
  if (pattern.startsWith('.')) return 1;
  if (pattern.includes('*')) return 0;
  return 3;
}

function matchDomainPattern(pattern, domains) {
  pattern = pattern.toLowerCase();

  if (!pattern.includes('*') && !pattern.startsWith('+.') && !pattern.startsWith('.')) {
    return typeof domains === 'string'
      ? domains.toLowerCase() === pattern
      : [...domains].some((d) => d.toLowerCase() === pattern);
  }

  const domainList = typeof domains === 'string' ? [domains.toLowerCase()] : [...domains].map((d) => d.toLowerCase());

  if (pattern.includes('*')) {
    // Mihomo 域名树中 * 只匹配单级标签（component/trie/domain.go），这里保持一致
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^.]+');
    const regex = new RegExp(`^${escaped}$`, 'i');
    return domainList.some((d) => regex.test(d));
  }

  if (pattern.startsWith('+.')) {
    const suffix = pattern.slice(2);
    return domainList.some((d) => d === suffix || d.endsWith(`.${suffix}`));
  }

  if (pattern.startsWith('.')) {
    const suffix = pattern.slice(1);
    return domainList.some((d) => d.endsWith(`.${suffix}`));
  }

  return false;
}

function hasNonEmptyHeader(headers, name) {
  if (!isPlainObject(headers)) return false;
  const key = Object.keys(headers).find((item) => item.toLowerCase() === name.toLowerCase());
  if (!key) return false;
  const value = headers[key];
  if (Array.isArray(value)) return value.some((item) => typeof item === 'string' && item.trim() !== '');
  return typeof value === 'string' ? value.trim() !== '' : value !== null && value !== undefined;
}

// 把节点 server 改成 IP 后，必须单独保留传输层 Host；顶层 proxy.host 不是 Mihomo 的通用字段。
function transportHostPatch(proxy, server) {
  const network = String(proxy.network ?? '').toLowerCase();

  if (network === 'ws' || network === 'http') {
    const optionName = network === 'ws' ? 'ws-opts' : 'http-opts';
    const options = isPlainObject(proxy[optionName]) ? proxy[optionName] : {};
    const headers = isPlainObject(options.headers) ? options.headers : {};
    if (hasNonEmptyHeader(headers, 'host')) return {};

    // HTTP 头大小写不敏感：剔除残留的 host 空键，避免与 Host 并存产生两个 Host 头
    const cleaned = Object.fromEntries(
      Object.entries(headers).filter(([name]) => name.toLowerCase() !== 'host'),
    );

    return {
      [optionName]: {
        ...options,
        headers: {
          ...cleaned,
          // WS 使用字符串；HTTP 传输的 headers 值是字符串数组。
          Host: network === 'ws' ? server : [server],
        },
      },
    };
  }

  if (network === 'h2') {
    const options = isPlainObject(proxy['h2-opts']) ? proxy['h2-opts'] : {};
    if (toStringList(options.host).length > 0) return {};
    return { 'h2-opts': { ...options, host: [server] } };
  }

  // gRPC 的 authority/SNI 由 servername 或 sni 保留，不需要额外的 Host 字段。
  return {};
}

function applyHostsToProxies(proxies, hosts) {
  if (!hosts || typeof hosts !== 'object') return proxies;

  const hostEntries = Object.entries(hosts)
    .filter(
      ([, value]) => (typeof value === 'string' && value.length > 0) || (Array.isArray(value) && value.length > 0),
    )
    .sort((a, b) => hostSpecificity(b[0]) - hostSpecificity(a[0]));

  if (hostEntries.length === 0) return proxies;

  const targetOf = (value) => {
    if (Array.isArray(value)) value = value.find((v) => typeof v === 'string' && v.length > 0);
    return typeof value === 'string' && value.length > 0 ? value : null;
  };

  const resolveCache = new Map();
  const resolveTarget = (pattern, value, stack = []) => {
    if (resolveCache.has(pattern)) return resolveCache.get(pattern);
    if (stack.includes(pattern)) return null;

    let target = targetOf(value);
    if (!target) return null;

    if (hosts[target] && !isIpAddress(target)) {
      stack.push(pattern);
      target = resolveTarget(target, hosts[target], stack);
      stack.pop();
    }

    resolveCache.set(pattern, target);
    return target;
  };

  const domainEntries = [];
  const wildcardEntries = [];

  for (const [pattern, value] of hostEntries) {
    const resolvedTarget = resolveTarget(pattern, value);
    if (!resolvedTarget) continue;

    if (pattern.includes('*') || pattern.startsWith('+.') || pattern.startsWith('.')) {
      wildcardEntries.push([pattern, resolvedTarget]);
    } else {
      domainEntries.push([pattern.toLowerCase(), resolvedTarget]);
    }
  }

  const domainMap = new Map(domainEntries);

  return proxies.map((proxy) => {
    const server = proxy.server;
    if (typeof server !== 'string' || isIpAddress(server)) return proxy;

    const lowerServer = server.toLowerCase();

    let target = domainMap.get(lowerServer);

    if (!target) {
      for (const [pattern, resolvedTarget] of wildcardEntries) {
        if (matchDomainPattern(pattern, lowerServer)) {
          target = resolvedTarget;
          break;
        }
      }
    }

    if (!target) return proxy;

    const proxyType = String(proxy.type ?? '').toLowerCase();
    const isTrojanLike = ['trojan', 'hysteria', 'hysteria2', 'tuic', 'anytls'].includes(proxyType);
    const isVmessLike = ['vless', 'vmess'].includes(proxyType);

    return {
      ...proxy,
      server: target,
      ...(isVmessLike && !proxy.servername && { servername: server }),
      ...(isTrojanLike && !proxy.sni && { sni: server }),
      ...transportHostPatch(proxy, server),
    };
  });
}

function stripDnsSuffix(dns) {
  const str = String(dns);
  const hashIndex = str.indexOf('#');
  if (hashIndex === -1) return str;

  const prefix = str.slice(0, hashIndex).trim();
  const rawTarget = str.slice(hashIndex + 1).trim();
  // mihomo 允许 `#DIRECT&ecs=...` 这类组合后缀；只取首个策略 token，
  // 不把 ecs/h3 等参数误当成策略名，也不使用会误中 indirect 的 includes('direct')。
  const policy = rawTarget.split('&')[0];

  if (/^(direct|直连)$/i.test(policy)) return prefix + '#DIRECT';
  if (policy === NODE_GROUP_NAME) return `${prefix}#${NODE_GROUP_NAME}`;

  return prefix;
}

function isIpAddress(server) {
  return (
    /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(server) ||
    server.includes(':')
  );
}

// 统一提取 DNS 服务器主机名：兼容协议头、端口、路径及 #DIRECT/#策略组 后缀。
// 只返回需要继承 hosts 的域名；IP、system、dhcp、rcode 等端点返回 null。
function extractDnsHost(dns) {
  // 先剥 # 后缀再判断 system/dhcp/rcode，否则 system#DIRECT 会把 system 当成主机名返回
  let raw = String(dns ?? '').trim().split('#', 1)[0].trim();
  if (!raw || /^(?:system|dhcp|rcode)(?::|$)/i.test(raw)) return null;
  raw = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  raw = raw.split(/[/?]/, 1)[0].trim();
  if (!raw) return null;

  let host;
  if (raw.startsWith('[')) {
    const closingBracket = raw.indexOf(']');
    if (closingBracket === -1) return null;
    host = raw.slice(1, closingBracket);
  } else {
    // 仅在“非冒号主机 + 数字端口”时移除端口，避免截断裸 IPv6。
    host = /^[^:]+:\d+$/.test(raw) ? raw.replace(/:\d+$/, '') : raw;
  }

  host = host.trim().toLowerCase().replace(/\.$/, '');
  return host && !isIpAddress(host) ? host : null;
}

// 判断是否是"本地/任意地址"监听：127.0.0.1、0.0.0.0、::、:53 等都应视为机场私有 DNS 入口
function isLocalDnsEndpoint(value) {
  if (typeof value !== 'string') return false;
  // 先剥掉协议头与 #DIRECT/#策略组 后缀，避免 udp://0.0.0.0:53、0.0.0.0:53#DIRECT 等写法漏判
  let v = value.trim().toLowerCase().split('#', 1)[0].trim();
  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split(/[/?]/, 1)[0].trim();
  if (v === '') return false;
  if (v.includes('127.0.0.1') || v.includes('localhost') || v.includes('[::1]')) return true;
  return /^(?::\d+|0\.0\.0\.0(?::\d+)?|\[::\](?::\d+)?|::(?::\d+)?)$/.test(v);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

// 订阅里同一字段可能出现字符串或数组两种写法；统一成非空字符串数组，
// 避免对字符串调用 some/filter，或把字符串展开成逐字符 DNS 列表。
function toStringList(value) {
  const list = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
  return list.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
}

/**
 * 合并 DNS 策略里同一机场的节点域名：
 * hk1.airport.com / hk2.airport.com / jp3.airport.com 指向同一解析器时收敛成一条 `+.airport.com`，
 * 避免几十个节点各占一条 nameserver-policy。
 * 只合并「≥3 段 + 同后缀 + 解析器完全一致 + 至少 2 条」，其余原样保留。
 */
function simplifyDomainPolicy(policy) {
  // DoH/DoT/DoQ 服务器自身的主机名也由同一个 resolver 解析：
  // 一旦把含它的后缀合并成 `+.suffix`，就会变成「用自己的域名解析自己」，启动即卡死，故这类后缀不合并
  const resolverHosts = new Set();
  for (const dns of Object.values(policy)) {
    for (const item of Array.isArray(dns) ? dns : [dns]) {
      const host = extractDnsHost(item);
      if (host) resolverHosts.add(host);
    }
  }
  const coversResolver = (suffix) =>
    [...resolverHosts].some((host) => host === suffix || host.endsWith(`.${suffix}`));

  const groups = new Map();

  for (const [domain, dns] of Object.entries(policy)) {
    const dnsKey = JSON.stringify(Array.isArray(dns) ? [...dns].sort() : dns);
    const parts = domain.split('.');
    const keep = domain.startsWith('+.') || domain.startsWith('.') || domain.includes('*') || parts.length < 3;
    const key = keep ? `keep:${domain}` : parts.slice(-2).join('.');

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ domain, dns, dnsKey });
  }

  const result = {};
  for (const [key, entries] of groups) {
    const sameDns = entries.every(({ dnsKey }) => dnsKey === entries[0].dnsKey);
    if (!key.startsWith('keep:') && entries.length >= 2 && sameDns && !coversResolver(key)) {
      result[`+.${key}`] = entries[0].dns;
    } else {
      for (const { domain, dns } of entries) result[domain] = dns;
    }
  }

  return result;
}

function buildDnsAndHostsConfig(config, filteredProxies, isIpv6, hasUsableProxy) {
  const originalDnsConfig = isPlainObject(config.dns) ? config.dns : {};

  const proxyServerNameservers = toStringList(originalDnsConfig['proxy-server-nameserver']);
  const listenValue = originalDnsConfig['listen'];

  // 兼容嗅探：若上游配置定义了本地回环/任意地址 DNS 监听，或 proxy-server 指向该地址，则自动按 hosts 映射重写节点 server
  const shouldRewriteByHosts =
    isLocalDnsEndpoint(listenValue) ||
    proxyServerNameservers.some((dns) => isLocalDnsEndpoint(String(dns)));

  const mappedProxies = shouldRewriteByHosts ? applyHostsToProxies(filteredProxies, config.hosts) : filteredProxies;

  const activeNodeServers = new Set([
    ...filteredProxies
      .filter((proxy) => typeof proxy.server === 'string')
      .map((proxy) => proxy.server.toLowerCase())
      .filter((server) => !isIpAddress(server)),
    ...mappedProxies
      .filter((proxy) => typeof proxy.server === 'string')
      .map((proxy) => proxy.server.toLowerCase())
      .filter((server) => !isIpAddress(server)),
  ]);

  const isCommonDns = (dns) => {
    // 先剥掉 #DIRECT/#策略组 等后缀再判断，避免 system#DIRECT、2400:3200::1#DIRECT 失配
    let raw = String(dns ?? '').trim().split('#', 1)[0].trim().toLowerCase();
    if (!raw || /^(?:system|dhcp|rcode)(?::|$)/i.test(raw)) return true;
    if (commonDnsIps.has(raw)) return true;

    raw = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split(/[/?]/, 1)[0].trim();
    let host;
    if (raw.startsWith('[')) {
      const end = raw.indexOf(']');
      host = end === -1 ? raw : raw.slice(1, end);
    } else {
      // 仅在「非冒号主机 + 数字端口」时移除端口，避免把裸 IPv6 截断
      host = /^[^:]+:\d+$/.test(raw) ? raw.replace(/:\d+$/, '') : raw;
    }
    host = host.replace(/\.$/, '');
    return commonDnsIps.has(host) || commonDnsRegex.test(host);
  };

  const privateProxyServerNameservers = shouldRewriteByHosts
    ? []
    : proxyServerNameservers.map(stripDnsSuffix).filter((dns) => dns.length > 0 && !isCommonDns(dns));

  // 触发本地嗅探重写时，机场声明的本地回环 DNS 已随 listen 一并失效，不能再写回任何解析策略
  const isDeadLocalResolver = (dns) => shouldRewriteByHosts && isLocalDnsEndpoint(dns);

  const privateDNS = [
    ...new Set(
      [...toStringList(originalDnsConfig['nameserver']), ...privateProxyServerNameservers]
        .map(stripDnsSuffix)
        .filter((dns) => dns.length > 0 && !isCommonDns(dns) && !isDeadLocalResolver(dns)),
    ),
  ];

  const matchedProxyPolicy = {};
  for (const [domain, dns] of Object.entries({
    ...(isPlainObject(originalDnsConfig['nameserver-policy']) ? originalDnsConfig['nameserver-policy'] : {}),
    ...(isPlainObject(originalDnsConfig['proxy-server-nameserver-policy'])
      ? originalDnsConfig['proxy-server-nameserver-policy']
      : {}),
  })) {
    if (!matchDomainPattern(domain, activeNodeServers)) continue;

    const stripedDns = Array.isArray(dns)
      ? toStringList(dns)
          .map(stripDnsSuffix)
          .filter(Boolean)
          .filter((item) => !isDeadLocalResolver(item))
      : typeof dns === 'string' && !isDeadLocalResolver(stripDnsSuffix(dns))
        ? stripDnsSuffix(dns)
        : '';
    if ((Array.isArray(stripedDns) && stripedDns.length === 0) || stripedDns === '') continue;

    matchedProxyPolicy[domain] = stripedDns;
  }

  if (privateDNS.length > 0 && Object.keys(matchedProxyPolicy).length === 0) {
    for (const domain of activeNodeServers) {
      matchedProxyPolicy[domain] = privateDNS;
    }
  }

  // 只有策略精确覆盖全部活动节点域名时才压缩；部分覆盖若合并成 +.suffix，
  // 会把原本没有私有 DNS 策略的其他节点也扩进去，改变解析路径。
  const matchedPolicyDomains = Object.keys(matchedProxyPolicy);
  const coversAllNodeDomains =
    activeNodeServers.size === matchedPolicyDomains.length &&
    matchedPolicyDomains.every((domain) => activeNodeServers.has(domain.toLowerCase()));
  const proxyServerPolicy = coversAllNodeDomains ? simplifyDomainPolicy(matchedProxyPolicy) : matchedProxyPolicy;

  // 输出固定为 blacklist。原配置若是 rule 模式，即使条目长得像普通域名，
  // 其含义也相反（rule 模式命中用 fake-ip，blacklist 命中用真实 IP），因此不能继承。
  const sourceFilterMode = originalDnsConfig['fake-ip-filter-mode'];
  const canInheritFilter =
    sourceFilterMode === undefined ||
    (typeof sourceFilterMode === 'string' && sourceFilterMode.trim().toLowerCase() === 'blacklist');
  const originalFakeIpFilter = canInheritFilter ? toStringList(originalDnsConfig['fake-ip-filter']) : [];
  const proxyFakeIpFilter = originalFakeIpFilter.filter((pattern) => {
    // 旧 rule-set 引用可能指向已被本脚本重建掉的 provider，不能带入新配置
    if (/^(?:rule-set:|RULE-SET,|GEOSITE,|DOMAIN(?:-SUFFIX|-KEYWORD|-REGEX)?,|IP-CIDR6?,|MATCH,)/i.test(pattern)) {
      return false;
    }
    return matchDomainPattern(pattern, activeNodeServers);
  });

  const dns = {
    enable: true,
    ipv6: isIpv6,
    'respect-rules': true,
    'use-hosts': true,
    'cache-algorithm': 'arc',
    'cache-max-size': 4096,
    'use-system-hosts': true,
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/15',
    'fake-ip-range6': '2001:2::1/48',
    'fake-ip-filter-mode': 'blacklist',
    'fake-ip-filter': [
      ...new Set([
        'rule-set:private',
        'rule-set:fakeip_filter',
        'localhost.ptlogin2.qq.com',
        '+.lan',
        '+.local',
        'time.*.com',
        'time.*.apple.com',
        '+.pool.ntp.org',
        ...proxyFakeIpFilter,
      ]),
    ],
    // 节点服务器域名解析：优先继承专线专属私有 DNS，未提供时由加密 DoH 兜底（防明文污染）
    'proxy-server-nameserver':
      privateProxyServerNameservers.length > 0
        ? [...new Set([...privateProxyServerNameservers, ...chinaProxyServerDNS])]
        : chinaProxyServerDNS,
    ...(Object.keys(proxyServerPolicy).length > 0 && {
      'proxy-server-nameserver-policy': proxyServerPolicy,
    }),
    // 引导 DNS：纯明文 IP，无证书校验与时钟死锁隐患，冷启动一毫秒秒开
    'default-nameserver': chinaBootstrapDNS,
    // 无可用节点时（订阅为空或全被过滤）不要指向代理组，否则等于「直连 8.8.8.8 的 DoH」，国内必然解析失败
    nameserver: hasUsableProxy ? foreignDNS : chinaDNS,
    'nameserver-policy': {
      'rule-set:private': 'system',
      // 这些域名在路由中固定 DIRECT；首次真实解析也使用国内 DNS，避免 GeoDNS 结果与出口区域相反。
      // 每个 rule-set 单独成键：Mihomo 下与逗号多值写法等价，Concord 等内核不依赖多值解析更稳。
      'rule-set:cn': chinaDNS,
      'rule-set:apple_cn': chinaDNS,
      'rule-set:microsoft_cn': chinaDNS,
      'rule-set:steam_cn': chinaDNS,
      'time.*.com': chinaDNS,
      'time.*.apple.com': chinaDNS,
      '+.pool.ntp.org': chinaDNS,
    },
    'direct-nameserver': chinaDirectDNS,
    'direct-nameserver-follow-policy': true,
  };

  const targetHostDomains = new Set([
    ...filteredProxies
      .filter((proxy) => typeof proxy.server === 'string')
      .map((proxy) => proxy.server.toLowerCase())
      .filter((server) => !isIpAddress(server)),
    ...activeNodeServers,
  ]);
  const extractResolvers = [
    ...Object.values(matchedProxyPolicy).flatMap(toStringList),
    ...(isPlainObject(originalDnsConfig['proxy-server-nameserver-policy'])
      ? Object.values(originalDnsConfig['proxy-server-nameserver-policy']).flatMap(toStringList)
      : []),
    ...privateProxyServerNameservers,
  ];
  extractResolvers.forEach((resolver) => {
    const host = extractDnsHost(resolver);
    if (host) targetHostDomains.add(host);
  });

  const rawHosts = isPlainObject(config.hosts) ? config.hosts : {};
  const projectedHosts = {};
  for (const [hPattern, hValue] of Object.entries(rawHosts)) {
    if (matchDomainPattern(hPattern, targetHostDomains)) {
      projectedHosts[hPattern] = hValue;
    }
  }

  const hosts = {
    ...EXTRA_HOSTS,
    ...projectedHosts,
  };

  return { dns, hosts, proxies: mappedProxies };
}

function main(config) {
  // 异常输入兜底：客户端桥接异常时宁可产出一份保底配置，也不要让脚本抛错导致整个配置覆写失败
  if (!isPlainObject(config)) config = {};
  const originalProxies = Array.isArray(config.proxies) ? config.proxies : [];

  const rawFiltered = originalProxies.filter((proxy) => {
    if (!isPlainObject(proxy)) return false;
    const type = String(proxy.type ?? '').toLowerCase();
    if (type === 'direct' || type === 'reject' || type === 'rematch') return false;
    // 无名节点保留会生成非法策略组配置，直接跳过
    if (typeof proxy.name !== 'string' || proxy.name.trim() === '') return false;
    return !isInfoNode(proxy.name);
  });

  // 节点名去重与改名：
  // 1) 与内核内置名/策略组名同名 → 必须改，否则内核拒绝整份配置
  // 2) 机场重复下发同名节点 → 加序号，保证组内引用唯一
  // 3) 改名会打断 dialer-proxy（链式代理）的按名引用，最后统一修正或摘除
  const takenNames = new Set(rawFiltered.map((p) => p.name));
  const reservedNames = new Set([NODE_GROUP_NAME, ...RESERVED_PROXY_NAMES]);
  const assignedNames = new Set();
  const renameMap = new Map();
  const filteredProxies = [];
  let renamedCount = 0;

  const freeName = (base) => {
    let count = 2;
    while (
      takenNames.has(`${base} ${count}`) ||
      assignedNames.has(`${base} ${count}`) ||
      reservedNames.has(`${base} ${count}`)
    ) {
      count++;
    }
    return `${base} ${count}`;
  };

  for (const proxy of rawFiltered) {
    const name = proxy.name;

    if (reservedNames.has(name)) {
      const newName = freeName(name);
      // 只记首个映射：多个同名节点被改时，引用方跟随先出现的那个
      if (!renameMap.has(name)) renameMap.set(name, newName);
      assignedNames.add(newName);
      filteredProxies.push({ ...proxy, name: newName });
      renamedCount++;
      continue;
    }

    if (!assignedNames.has(name)) {
      assignedNames.add(name);
      filteredProxies.push({ ...proxy });
      continue;
    }

    const newName = freeName(name);
    assignedNames.add(newName);
    filteredProxies.push({ ...proxy, name: newName });
    renamedCount++;
  }

  // dialer-proxy 指向的节点若被过滤或改名，内核会以
  // "dialer-proxy [X] not found"（config/utils.go:158）拒绝整份配置，这里逐条修正或摘除
  const finalNames = new Set(filteredProxies.map((p) => p.name));
  let dialerFixed = 0;
  for (const proxy of filteredProxies) {
    const target = proxy['dialer-proxy'];
    if (typeof target !== 'string' || target === '') continue;
    if (finalNames.has(target)) continue;
    // DIRECT / REJECT 等内置出站永远有效，不要因为「恰好有个同名节点被改名」就把引用带偏
    if (RESERVED_PROXY_NAMES.has(target)) continue;
    if (renameMap.has(target)) {
      proxy['dialer-proxy'] = renameMap.get(target);
    } else {
      delete proxy['dialer-proxy'];
    }
    dialerFixed++;
  }

  // 链式代理成环（自指 A→A，或 A→B→A）会被内核以 "circular dialer-proxy dependency" 拒绝。
  // 沿链走访，发现回到当前路径上的节点时摘掉该节点的 dialer-proxy 以破环
  const byName = new Map(filteredProxies.map((p) => [p.name, p]));
  const dialerOf = new Map();
  for (const proxy of filteredProxies) {
    const target = proxy['dialer-proxy'];
    if (typeof target === 'string' && target !== '' && byName.has(target)) {
      dialerOf.set(proxy.name, target);
    }
  }
  const visitState = new Map(); // 1=在当前走访路径上 2=已确认无环
  for (const start of dialerOf.keys()) {
    if (visitState.has(start)) continue;
    const path = [];
    let cursor = start;
    while (dialerOf.has(cursor) && !visitState.has(cursor)) {
      visitState.set(cursor, 1);
      path.push(cursor);
      cursor = dialerOf.get(cursor);
    }
    if (visitState.get(cursor) === 1) {
      // cursor 在当前路径上 → 存在环，摘掉环入口节点的 dialer-proxy
      dialerOf.delete(cursor);
      delete byName.get(cursor)['dialer-proxy'];
      dialerFixed++;
    }
    for (const name of path) visitState.set(name, 2);
  }

  const isIpv6 =
    config['ipv6'] !== undefined
      ? Boolean(config['ipv6'])
      : (config.dns && config.dns['ipv6'] !== undefined ? Boolean(config.dns['ipv6']) : DEFAULT_IPV6);

  const proxyProviders = isPlainObject(config['proxy-providers']) ? config['proxy-providers'] : {};
  const hasProviders = Object.keys(proxyProviders).length > 0;
  // 有内联节点或有 provider，才算"有可用出口"，供 DNS 决定是否把解析交给代理组
  const hasUsableProxy = filteredProxies.length > 0 || hasProviders;

  const { dns, hosts, proxies: mappedProxies } = buildDnsAndHostsConfig(
    config,
    filteredProxies,
    isIpv6,
    hasUsableProxy,
  );

  // uTLS 指纹只对基于 TCP 的 TLS 生效；hysteria2 / tuic 走 QUIC，不适用
  const fpTypes = ['trojan', 'vless', 'vmess'];
  for (let i = 0; i < mappedProxies.length; i++) {
    // 复制一份再修改，避免改动原始订阅对象
    const proxy = { ...mappedProxies[i] };
    mappedProxies[i] = proxy;
    // 清理节点中的 null/undefined 异常键值（如某些 Hysteria2 节点下发的 up: null, down: null）
    for (const [k, v] of Object.entries(proxy)) {
      if (v === null || v === undefined) {
        delete proxy[k];
      }
    }

    const proxyType = String(proxy.type ?? '').toLowerCase();
    if (fpTypes.includes(proxyType) && !proxy['client-fingerprint']) {
      // 普通 TLS（含 trojan 默认 TLS）补 Chrome 指纹；
      // Reality 必须依赖 uTLS，最新 Mihomo 已移除 global-client-fingerprint，缺指纹会直接报错，故同样补上；已有指纹则不覆盖
      if (proxyType === 'trojan' || proxy.tls || proxy['reality-opts']) {
        proxy['client-fingerprint'] = 'chrome';
      }
    }
  }

  const proxyNames = mappedProxies.map((p) => p.name);

  // 诊断输出：在客户端日志里能看到本次覆写到底做了什么，避免"节点莫名少了几个"只能靠猜
  if (typeof console !== 'undefined' && typeof console.log === 'function') {
    console.log(
      `[覆写] 节点 ${originalProxies.length} → ${finalNames.size}` +
        `｜剔除 ${originalProxies.length - rawFiltered.length}` +
        `｜改名 ${renamedCount}｜dialer 修正 ${dialerFixed}` +
        `｜provider ${Object.keys(proxyProviders).length}`,
    );
  }

  const nodeGroup = {
    ...selectBaseOption,
    name: NODE_GROUP_NAME,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png',
  };

  if (proxyNames.length > 0) {
    nodeGroup.proxies = proxyNames;
  } else if (!hasProviders) {
    nodeGroup.proxies = ['DIRECT'];
  }

  if (hasProviders) {
    nodeGroup.use = Object.keys(proxyProviders);
  }

  const proxyGroups = [nodeGroup];

  // 规则链：内网/系统协议直连 -> DoT 拦截 -> 广告拦截 -> 国内直连 -> 国外QUIC拦截 -> 兜底出海
  const rules = [
    // TUN 虚拟网卡保留网段（新版 Mihomo 已内置跳过 TUN 地址段转发，此处为冗余兜底，兼容旧内核）
    'IP-CIDR,198.18.0.0/30,REJECT,no-resolve',
    'AND,((DST-PORT,123),(NETWORK,udp)),DIRECT',
    'RULE-SET,private,DIRECT',
    'RULE-SET,private_ip,DIRECT',
    // DoT 拦截放到内网规则之后，避免把路由器/自建 AdGuard 的内网 DoT 一起掐掉
    'DST-PORT,853,REJECT',
    'RULE-SET,apple_cn,DIRECT',
    'RULE-SET,microsoft_cn,DIRECT',
    'RULE-SET,steam_cn,DIRECT',
    'RULE-SET,ads,REJECT',
    'RULE-SET,cn,DIRECT',
    'RULE-SET,cn_ip,DIRECT,no-resolve',
    // 国内域名/IP 已在上面直连，此处拦截剩余的国外 QUIC
    ...blockForeignQuic,
    `MATCH,${NODE_GROUP_NAME}`,
  ];

  const newConfig = {
    ...config,
    dns,
    hosts,
    'unified-delay': true,
    'tcp-concurrent': true,
    'keep-alive-idle': 300,
    'keep-alive-interval': 30,
    profile: {
      'store-selected': true,
      'store-fake-ip': true,
      // 用户/客户端已声明的 profile 选项优先，避免把界面上关掉的开关又打开
      ...(isPlainObject(config.profile) ? config.profile : {}),
    },
    proxies: [...mappedProxies],
    'proxy-groups': proxyGroups,
    'rule-providers': ruleProviders,
    rules,
  };

  // 尊重客户端与上游设置：未提供时才赋予安全保底，不强行覆盖用户在界面自定义的端口与偏好
  newConfig['ipv6'] = isIpv6;
  if (!newConfig['mode']) {
    newConfig['mode'] = 'rule';
  }
  if (!newConfig['log-level']) {
    newConfig['log-level'] = 'warning';
  }

  if (ENABLE_CONFIG_CLEANUP) {
    // 1. 局域网控制权归还客户端 GUI：剔除 bind-address 与硬编码网卡，恢复界面开关绝对控制
    delete newConfig['bind-address'];
    delete newConfig['allow-lan'];
    delete newConfig['interface-name'];
    delete newConfig['routing-mark'];

    // 2. 端口收敛：剔除多余分离端口，统一使用 mixed-port
    delete newConfig['port'];
    delete newConfig['socks-port'];
    delete newConfig['redir-port'];
    delete newConfig['tproxy-port'];

    // 确保混合端口保底存在
    if (!newConfig['mixed-port']) {
      newConfig['mixed-port'] = 7890;
    }

    // 3. 控制面板：默认把控制器整个交还给客户端
    //    - FlClash 会自己接管监听地址；订阅里写死的 external-controller 会被忽略，
    //      在 Concord 内核下还会多一条 host_owned_key 告警
    //    - 机场下发的 secret 常与客户端面板设置冲突，导致「面板连不上」
    //    需要第三方面板/远程管理时把 ALLOW_REMOTE_CONTROLLER 设为 true，
    //    secret、监听地址与面板 UI 都会完整保留
    if (!ALLOW_REMOTE_CONTROLLER) {
      delete newConfig['secret'];
      delete newConfig['external-controller'];
      delete newConfig['external-controller-tls'];
      delete newConfig['external-ui'];
      delete newConfig['external-ui-url'];
    }

    // 4. 底层探测保护：消除移动端无权限时的频繁日志与发热
    delete newConfig['tun'];
    delete newConfig['sniffer'];
    delete newConfig['experimental'];
    delete newConfig['ebpf'];
    delete newConfig['find-process-mode'];
    delete newConfig['geodata-mode'];
    delete newConfig['geox-url'];

    // 5. 客户端历史残留参数清理
    delete newConfig['url-rewrite'];
    delete newConfig['script'];
    delete newConfig['clash-for-android'];
    // 面板 UI：FlClash 本地没有 ui 目录，带 external-ui 会直接报错；
    // 只有在显式开放远程控制时才补齐 zashboard，否则一律剔除
    if (ALLOW_REMOTE_CONTROLLER) {
      if (!newConfig['external-ui']) newConfig['external-ui'] = 'ui';
      if (!newConfig['external-ui-url']) {
        newConfig['external-ui-url'] = 'https://github.com/Zephyruso/zashboard/releases/latest/download/dist.zip';
      }
    }
    delete newConfig['global-client-fingerprint'];

    for (const key of Object.keys(newConfig)) {
      if (key.startsWith('cfw-') || key.startsWith('clash-')) {
        delete newConfig[key];
      }
    }
  } else {
    // 安全兜底还原模式：未开启清洗时仅清理 tun 与会导致客户端报错的专有 UI 杂项，其余原样保留
    if (!newConfig['mixed-port'] && !newConfig['port']) {
      newConfig['mixed-port'] = 7890;
    }
    delete newConfig['tun'];
    delete newConfig['clash-for-android'];
    if (!ALLOW_REMOTE_CONTROLLER) {
      delete newConfig['external-ui'];
      delete newConfig['external-ui-url'];
    }
    for (const key of Object.keys(newConfig)) {
      if (key.startsWith('cfw-')) {
        delete newConfig[key];
      }
    }
  }

  // 控制器安全：显式开放远程控制却没设密码时，仍收敛到回环——没有密码的控制器等于把面板裸奔在局域网
  const controller = newConfig['external-controller'];
  if (ALLOW_REMOTE_CONTROLLER && !newConfig['secret'] && typeof controller === 'string' && controller.length > 0) {
    const portMatch = controller.match(/:(\d+)$/);
    const isLoopback = /^(?:127\.0\.0\.1|localhost|\[::1\]):/i.test(controller);
    if (!isLoopback) {
      newConfig['external-controller'] = `127.0.0.1:${portMatch ? portMatch[1] : '9090'}`;
    }
  }

  // 拔除 provider 健康检查，并过滤强特征信息节点（复制后再改，不动原始对象）
  if (newConfig['proxy-providers']) {
    if (!isPlainObject(newConfig['proxy-providers'])) {
      // 非对象形态（字符串/数组）的 proxy-providers 是废数据，直接剔除，
      // 否则会被逐字符展开成一批不存在的 provider，内核直接拒绝整份配置
      delete newConfig['proxy-providers'];
    } else {
      const providers = {};
      for (const [key, provider] of Object.entries(newConfig['proxy-providers'])) {
        const { 'health-check': _healthCheck, ...rest } = provider || {};
        const existing = typeof rest['exclude-filter'] === 'string' ? rest['exclude-filter'].trim() : '';
        if (!existing || !existing.includes(PROVIDER_INFO_EXCLUDE_FILTER)) {
          // 用 | 连接而非反引号分段：Mihomo v1.19.34 源码两种写法都支持（按 ` 逐段编译），
          // 但按单条正则编译的内核会把反引号当字面量；新增段自带 scoped (?i:...)，
          // 用户原有片段保持大小写敏感，原有反引号分段拆开各自包组，保持「任一段命中即排除」语义。
          const segments = existing
            ? existing.split('`').map((item) => item.trim()).filter(Boolean)
            : [];
          rest['exclude-filter'] = [...segments.map((item) => `(?:${item})`), PROVIDER_INFO_EXCLUDE_FILTER].join('|');
        }
        providers[key] = rest;
      }
      newConfig['proxy-providers'] = providers;
    }
  }

  return newConfig;
}

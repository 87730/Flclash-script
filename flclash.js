/**
 * FlClash & Mihomo 极简配置覆写脚本  (fixed)
 * https://github.com/87730/Flclash-script
 */

const excludeFilter =
  /群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|电报|无法|说明|使用|提示|访问|支持|教程|关注|更新|作者|加入|超时|收藏|优惠|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|禁止|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|建议|重置|以下|过滤|⚠️|@|t\.me\/\+|\bexpire\b|\bhttps?:\/\/|\.com|\btraffic\b/iu;

// [FIX] 组名 / 直连出站名 / 内核保留字，订阅节点不得占用，否则内核会直接拒绝加载
const RESERVED_NAMES = new Set(['默认代理', '直连', 'DIRECT', 'REJECT', 'PASS', 'GLOBAL']);

// [FIX] 原来放在第一条（RULE-SET,cn 之前）：no-resolve 下用域名/fake-ip 无法命中 cn_ip，
// 实测连 www.baidu.com:443 都会被 REJECT。移到 CN 规则之后，只兜住真正的境外 QUIC。
const blockForeignQuic = [
  'AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((RULE-SET,cn_ip,no-resolve)))),REJECT',
];

const directProxies = [
  {
    name: '🇨🇳 直连 | 双栈',
    type: 'direct',
  },
  {
    name: '🇨🇳 直连 | IPv4优先',
    type: 'direct',
    'ip-version': 'ipv4-prefer',
  },
  {
    name: '🇨🇳 直连 | IPv6优先',
    type: 'direct',
    'ip-version': 'ipv6-prefer',
  },
  {
    name: '🇨🇳 直连 | 仅IPv4',
    type: 'direct',
    'ip-version': 'ipv4',
  },
  {
    name: '🇨🇳 直连 | 仅IPv6',
    type: 'direct',
    'ip-version': 'ipv6',
  },
];

for (const p of directProxies) RESERVED_NAMES.add(p.name);

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

const ruleProviders = {
  private: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/private.mrs',
    path: './ruleset/private.mrs',
    'path-in-bundle': 'geo/geosite/private.mrs',
  },
  private_ip: {
    ...ruleProviderCommonIpcidr,
    url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/private.mrs',
    path: './ruleset/private_ip.mrs',
    'path-in-bundle': 'geo/geoip/private.mrs',
  },
  cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/cn.mrs',
    path: './ruleset/cn.mrs',
    'path-in-bundle': 'geo/geosite/cn.mrs',
  },
  cn_ip: {
    ...ruleProviderCommonIpcidr,
    url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geoip/cn.mrs',
    path: './ruleset/cn_ip.mrs',
    'path-in-bundle': 'geo/geoip/cn.mrs',
  },
  fakeip_filter: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/fakeip-filter.mrs',
    path: './ruleset/fakeip-filter.mrs',
    'path-in-bundle': 'geo/geosite/fakeip-filter.mrs',
  },
};

const selectBaseOption = {
  type: 'select',
  interval: 600,
  timeout: 3000,
  url: 'https://cp.cloudflare.com/generate_204',
  lazy: true,
  'max-failed-times': 3,
};

const commonDnsList = [
  '223.5.5.5',
  '223.6.6.6',
  '119.29.29.29',
  '1.12.12.12',
  '120.53.53.53',
  '114.114.114.114',
  '180.76.76.76',
  '1.2.4.8',
  '116.116.116.116',
  '101.226.4.6',
  '123.125.81.6',
  '180.184.1.1',
  '180.184.2.2',
  '2400:3200::1',
  '2400:3200:baba::1',
  '2402:4e00::',
  '2400:da00::6666',
  '1.1.1.1',
  '1.0.0.1',
  '8.8.8.8',
  '8.8.4.4',
  '9.9.9.9',
  '149.112.112.112',
  '208.67.222.222',
  '208.67.220.220',
  '2606:4700:4700::1111',
  '2606:4700:4700::1001',
  '2001:4860:4860::8888',
  '2001:4860:4860::8844',
  '2620:fe::fe',
  '2620:fe::9',
  '2620:119:35::35',
  '2620:119:53::53',
];

// [FIX] 原来把 47 个条目拼成一条无边界正则去 test 整串，私有解析器会被误杀：
//   https://adguard.mydomain.net/dns-query  (含 adguard)
//   https://smartdns.home.lan/dns-query     (含 smartdns)
//   https://1.1.1.1.mydomain.net/dns-query  (含 1.1.1.1)
// 全部被当成“公共 DNS”丢掉，订阅里想给节点用的私有解析器就失效了。
// 改成先取出 host，再分两路判定：IP 精确相等 / 域名后缀匹配。
const commonDnsDomains = [
  'alidns.com',
  'doh.pub',
  'dns.pub',
  'dot.pub',
  'dnspod.cn',
  'dnspod.com',
  'dns.360.cn',
  'dns.baidu.com',
  'onedns.net',
  '114dns.com',
  'cloudflare-dns.com',
  'cloudflare.com',
  'dns.google',
  'google.com',
  'googleapis.com',
  'dns.quad9.net',
  'quad9.net',
  'opendns.com',
  'nextdns.io',
  'adguard-dns.com',
  'adguard-dns.io',
  'cleanbrowsing.org',
  'dns.apple.com',
  'apple.com',
];

// 取 DNS 服务器串里的主机名：去 scheme / path / #tag / 端口 / IPv6 方括号
function dnsHost(server) {
  const str = String(server)
    .trim()
    .replace(/^[a-z0-9+.-]+:\/\//i, '')
    .split(/[/?#]/)[0];

  const bracket = str.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracket) return bracket[1].toLowerCase();
  if ((str.match(/:/g) || []).length > 1) return str.toLowerCase(); // 裸 IPv6，没有端口

  return str.replace(/:\d+$/, '').toLowerCase();
}

const chinaDNS = ['223.5.5.5#DIRECT', '119.29.29.29#DIRECT'];
// [FIX] 原来只有两条 DoH，443 被 reset / 被墙时节点域名解析全灭，整条链路跟着挂。
// batchExchange 是并发取最快，加明文兜底不增加正常路径的延迟。
const chinaDohDNS = [
  'https://223.5.5.5/dns-query#DIRECT',
  'https://1.12.12.12/dns-query#DIRECT',
  '223.5.5.5#DIRECT',
];
// [FIX] 去掉 'system'：FlClash 的 core 用 tags=with_gvisor 编译，且全程没有调用
// UpdateSystemDNS，走的是读 /etc/resolv.conf 的分支；Android 上读不到就落到内核写死的
// 114.114.114.114 + 8.8.8.8（明文 UDP）。直连域名解析于是变成“114 明文 vs 223 明文”的
// 随机赛跑，答案质量不可控。要兜底就用明确的国内明文 + 一条 DoH。
const directDNS = ['223.5.5.5#DIRECT', '119.29.29.29#DIRECT', 'https://223.5.5.5/dns-query#DIRECT'];
const foreignDNS = ['https://cloudflare-dns.com/dns-query#默认代理', 'https://dns.google/dns-query#默认代理'];

// 手写配置里 dns.nameserver / proxy-server-nameserver 写成裸字符串并不罕见，
// 直接 .filter / spread 会炸或展开成单个字符，这里统一归一化成数组。
function asArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).filter((v) => v.length > 0);
  }
  if (typeof value === 'string' || typeof value === 'number') return [String(value)];
  return [];
}

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
    const regex = new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`, 'i');
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

  const hasHostHeader = (headers) =>
    !!headers && Object.keys(headers).some((k) => k.toLowerCase() === 'host');

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

    const patched = {
      ...proxy,
      server: target,
      // [FIX] 已有 sni 时不要再写入旧入口域名作为 servername，避免客户端优先使用错误的 SNI。
      ...(!proxy.servername && !proxy.sni && { servername: server }),
      ...(!proxy.sni && { sni: server }),
    };

    // [FIX] mihomo 的 vmess/vless/trojan 结构体里没有顶层 host 字段，写了会被静默忽略；
    // ws 的 Host 头默认取 server 字段，所以 server 换成 IP 后 Host 头会跟着变成 IP，CDN 节点会挂。
    // 要保留原域名必须写进对应的 *-opts。
    const network = String(proxy.network ?? '').toLowerCase();

    if (network === 'ws') {
      const wsOpts = { ...(proxy['ws-opts'] || {}) };
      if (!hasHostHeader(wsOpts.headers)) {
        wsOpts.headers = { ...(wsOpts.headers || {}), Host: server };
      }
      patched['ws-opts'] = wsOpts;
    } else if (network === 'h2') {
      const h2Opts = { ...(proxy['h2-opts'] || {}) };
      if (!h2Opts.host || h2Opts.host.length === 0) {
        h2Opts.host = [server];
      }
      patched['h2-opts'] = h2Opts;
    } else if (network === 'http') {
      const httpOpts = { ...(proxy['http-opts'] || {}) };
      if (!hasHostHeader(httpOpts.headers)) {
        httpOpts.headers = { ...(httpOpts.headers || {}), Host: [server] };
      }
      patched['http-opts'] = httpOpts;
    }

    return patched;
  });
}

function stripDnsSuffix(dns) {
  const str = String(dns);
  const hashIndex = str.indexOf('#');
  if (hashIndex === -1) return str;

  const prefix = str.slice(0, hashIndex).trim();
  const suffix = str
    .slice(hashIndex + 1)
    .toLowerCase()
    .trim();

  if (suffix.includes('direct') || suffix.includes('直连')) return prefix + '#DIRECT';

  return prefix;
}

function isIpAddress(server) {
  if (typeof server !== 'string') return false;
  const value = server.trim();
  // [FIX] 原来的 /^\d{1,3}(\.\d{1,3}){3}$/ 会把 999.999.999.999 也当成 IP
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
    return value.split('.').every((part) => Number(part) <= 255);
  }
  return value.includes(':') && /^[0-9a-f:.]+$/i.test(value);
}

function simplifyDomainPolicy(policy) {
  const groups = new Map();

  for (const [domain, dns] of Object.entries(policy)) {
    const dnsKey = JSON.stringify(Array.isArray(dns) ? [...dns].sort() : dns);

    if (domain.startsWith('+.') || domain.startsWith('.') || domain.includes('*')) {
      groups.set(`keep:${domain}`, [{ domain, dns, dnsKey }]);
      continue;
    }

    const parts = domain.split('.');
    if (parts.length < 3) {
      groups.set(`keep:${domain}`, [{ domain, dns, dnsKey }]);
      continue;
    }

    const suffix = parts.slice(1).join('.');
    const key = `${suffix}|${dnsKey}`;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ domain, dns, dnsKey, suffix });
  }

  const simplifiedPolicy = {};

  for (const [key, items] of groups.entries()) {
    if (key.startsWith('keep:')) {
      simplifiedPolicy[items[0].domain] = items[0].dns;
      continue;
    }

    // [FIX] 原来哪怕只有 cdn.front.com 一个域名，也会被合并成 +.front.com，
    // 把策略放大到整个 front.com 的所有子域。只有同后缀下确有多个域名时才合并。
    const uniqueDomains = new Set(items.map((item) => item.domain));
    if (uniqueDomains.size < 2) {
      simplifiedPolicy[items[0].domain] = items[0].dns;
      continue;
    }

    simplifiedPolicy[`+.${items[0].suffix}`] = items[0].dns;
  }

  return simplifiedPolicy;
}

function buildDnsAndHostsConfig(config, filteredProxies) {
  const originalDnsConfig = config.dns || {};

  const proxyServerNameservers = asArray(originalDnsConfig['proxy-server-nameserver']);
  const listenValue = originalDnsConfig['listen'];

  const listenHost = typeof listenValue === 'string' ? dnsHost(listenValue) : '';

  // [FIX] 回环 / fake-ip 段 / TUN 自身 DNS 都不是“别人的 DNS”。订阅在这些情况下
  // 会把它们写成解析器：dns.listen 缺省、或 TUN 自带 DNS（FlClash 是 172.19.0.2）。
  // 一旦被塞进 proxy-server-nameserver-policy，内核就是拿自己的 DNS 解析自己的节点域名：
  // fake-ip 模式下节点会被解析成 198.18.x.x → 所有节点失联。
  const isLocalDns = (dns) => {
    const host = dnsHost(dns);
    if (!host) return false;
    if (host === 'localhost' || host === '::1' || host === '172.19.0.2' || host === '198.18.0.2') return true;
    if (/^127\./.test(host) || /^198\.18\./.test(host) || /^2001:2:/.test(host)) return true;
    return listenHost.length > 0 && host === listenHost;
  };

  // [FIX] 原来是 `shouldRewriteByHosts ? applyHostsToProxies(...) : filteredProxies`，
  // 而 shouldRewriteByHosts 要求「proxy-server-nameserver 恰好一条且与 listen 文本互相包含」。
  // 这个条件太窄，而且根子上是错的：内核解析节点域名走的是 component/resolver 的
  // LookupIPWithResolver，那里对「域名→域名」型 hosts 返回 ok=false（见 Hosts.Search 的
  // isDomain 分支），也就是 hosts 的 CNAME 只在「客户端连接」和「内置 DNS 服务器」两条路径生效，
  // 对「用外部 DoH/公共 DNS 解析节点域名」这条路径完全无效。
  //
  // 结果：订阅一旦不是「单条 proxy-server-nameserver 指向自己」的形态（两条 PSNS、没有 listen、
  // 或覆写把 PSNS 换成公共 DoH），机场写在 hosts 里的「马甲域名 → 真入口域名」就不生效，
  // 节点域名被公共 DNS 解析成透传 IP —— 能连上，但走的不是专线入口。
  //
  // 修法：只要 hosts 能匹配到节点 server，就无条件把映射展开（等价于提前做掉 CNAME）。
  // 这样与 listen / PSNS 形态完全解耦，且能让下面的 fake-ip-filter 匹配到目标域名。
  const mappedProxies = applyHostsToProxies(filteredProxies, config.hosts);

  const proxyDomains = new Set(
    mappedProxies
      .filter((proxy) => typeof proxy.server === 'string')
      .map((proxy) => proxy.server.toLowerCase())
      .filter((server) => !isIpAddress(server)),
  );

  // [FIX] 原文是 `shouldRewriteByHosts ? [] : proxyServerNameservers`：走上 hosts 重写分支时，
  // 订阅自带的 proxy-server-nameserver 会被整段丢掉。中转/专线机场的入口往往只有它们自己的
  // 解析器才给得对，丢掉 = 静默掉到“透传 IP”。改成只剔除回环/本地项（真·自环），其余一律保留，
  // 稍后写进 proxy-server-nameserver-policy。
  const privateProxyServerNameservers = proxyServerNameservers.filter((dns) => !isLocalDns(dns));

  const isCommonDns = (dns) => {
    const value = String(dns).trim().toLowerCase();
    if (value === 'system' || value === 'system://') return true;

    const host = dnsHost(value);
    if (!host) return false;
    if (isIpAddress(host)) return commonDnsList.includes(host);

    return commonDnsDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
  };

  const privateDNS = [
    ...new Set(
      [...asArray(originalDnsConfig['nameserver']), ...privateProxyServerNameservers]
        .map(stripDnsSuffix)
        .filter((dns) => dns.length > 0 && !isCommonDns(dns) && !isLocalDns(dns)),
    ),
  ];

  const matchedProxyPolicy = {};
  const policyOf = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});
  for (const [domain, dns] of Object.entries({
    ...policyOf(originalDnsConfig['nameserver-policy']),
    ...policyOf(originalDnsConfig['proxy-server-nameserver-policy']),
  })) {
    if (!matchDomainPattern(domain, proxyDomains)) continue;

    const stripedDns = Array.isArray(dns) ? dns.map(stripDnsSuffix).filter((d) => d.length > 0) : stripDnsSuffix(dns);
    if (Array.isArray(stripedDns) && stripedDns.length === 0) continue;

    matchedProxyPolicy[domain] = stripedDns;
  }

  if (privateDNS.length > 0 && Object.keys(matchedProxyPolicy).length === 0) {
    for (const domain of proxyDomains) {
      matchedProxyPolicy[domain] = privateDNS;
    }
  }

  const matchedPolicyDomains = Object.keys(matchedProxyPolicy);
  const proxyServerPolicy =
    proxyDomains.size === matchedPolicyDomains.length &&
    matchedPolicyDomains.every((domain) => proxyDomains.has(domain.toLowerCase()))
      ? simplifyDomainPolicy(matchedProxyPolicy)
      : matchedProxyPolicy;

  const originalFakeIpFilter = asArray(originalDnsConfig['fake-ip-filter']);

  // [FIX] 原文只拿 proxyDomains（改写后的节点 server）去筛订阅的 fake-ip-filter。
  // 但订阅里的排除项经常写的是 hosts 映射的「目标域名」（花云就是 +.apt-agent.org），
  // 一旦 server 因故没被改写（历史逻辑里 PSNS 多条的形态），这条就被丢掉，
  // 节点域名解析就会拿到 fake-ip 假地址。这里把 hosts 的域名型目标也算进来。
  const hostsDomainTargets = new Set();
  for (const value of Object.values(config.hosts || {})) {
    const list = Array.isArray(value) ? value : [value];
    for (const item of list) {
      if (typeof item === 'string' && item.length > 0 && !isIpAddress(item)) {
        hostsDomainTargets.add(item.toLowerCase());
      }
    }
  }

  const fakeIpMatchDomains = new Set([...proxyDomains, ...hostsDomainTargets]);
  const proxyFakeIpFilter = originalFakeIpFilter.filter((pattern) => {
    const p = String(pattern);
    return matchDomainPattern(p, fakeIpMatchDomains);
  });

  // [FIX] 原文把 dns.ipv6 硬写成 true，会把订阅里明确关掉的 IPv6 重新打开：顶层 ipv6: false
  // 的订阅仍会下发 fake AAAA（2001:2::/48），设备/VPN 没有 IPv6 时应用会先试 IPv6 再回落，
  // 表现为"偶发解析/连接变慢"。改成跟随订阅（顶层 ipv6 > dns.ipv6 > false）。
  const ipv6Enabled =
    typeof config['ipv6'] === 'boolean' ? config['ipv6'] : originalDnsConfig['ipv6'] === true;

  const dns = {
    enable: true,
    ipv6: ipv6Enabled,
    'use-hosts': true,
    'cache-algorithm': 'arc',
    'use-system-hosts': true,
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/15',
    ...(ipv6Enabled && { 'fake-ip-range6': '2001:2::1/48' }),
    'fake-ip-filter': ['rule-set:private', 'rule-set:fakeip_filter', 'rule-set:cn', ...proxyFakeIpFilter],
    'proxy-server-nameserver': chinaDohDNS,
    ...(Object.keys(proxyServerPolicy).length > 0 && {
      'proxy-server-nameserver-policy': proxyServerPolicy,
    }),
    'default-nameserver': chinaDohDNS,
    nameserver: foreignDNS,
    'nameserver-policy': {
      'rule-set:cn': chinaDNS,
    },
    'direct-nameserver': directDNS,
  };

  const hosts = {
    ...(config.hosts || {}),
    'cloudflare-dns.com': ['1.1.1.1', '1.0.0.1'],
    'dns.google': ['8.8.8.8', '8.8.4.4'],
    'services.googleapis.cn': 'services.googleapis.com',
    '+.mcdn.bilivideo.com': ['0.0.0.0'],
    '+.mcdn.bilivideo.cn': ['0.0.0.0'],
    '+.edge.mountaintoys.cn': ['0.0.0.0'],
    '+.h2.smtcdns.net': ['0.0.0.0'],
  };

  return { dns, hosts, proxies: mappedProxies };
}

function main(config) {
  const originalProxies = config.proxies || [];

  const rawFiltered = originalProxies.filter((proxy) => {
    const type = String(proxy.type ?? '').toLowerCase();
    if (type === 'direct' || type === 'reject' || type === 'rematch') return false;
    return !excludeFilter.test(String(proxy.name ?? ''));
  });

  // [FIX] 去重时把脚本自己追加的直连节点名和组名一起算进去，
  // 否则订阅里出现同名节点（或叫“直连”的节点）会让内核报
  // "duplicate name" / "loop is detected in ProxyGroup" 直接拒绝加载。
  const uniqueNames = new Set(RESERVED_NAMES);
  const filteredProxies = [];
  for (const proxy of rawFiltered) {
    let name = proxy.name;
    if (!uniqueNames.has(name)) {
      uniqueNames.add(name);
      filteredProxies.push(proxy);
    } else {
      let count = 2;
      while (uniqueNames.has(`${name} ${count}`)) {
        count++;
      }
      const newName = `${name} ${count}`;
      uniqueNames.add(newName);
      filteredProxies.push({ ...proxy, name: newName });
    }
  }

  const { dns, hosts, proxies: mappedProxies } = buildDnsAndHostsConfig(config, filteredProxies);
  const proxyNames = mappedProxies.map((p) => p.name);

  // [FIX] 原文只看 config.proxies：订阅如果是 proxy-providers（Provider 党手撸配置的常态），
  // proxyNames 为空 → '默认代理' 退化成一个只含 DIRECT 的组，机场节点一个都进不来，等于全直连。
  // 这里把 provider 名字挂到组的 use 上。
  const providerNames = Object.keys(config['proxy-providers'] || {}).filter((name) => name.length > 0);
  const providerUse = providerNames.length > 0 ? { use: providerNames } : {};

  const proxyGroups = [
    {
      ...selectBaseOption,
      ...providerUse,
      name: '默认代理',
      proxies: proxyNames.length > 0 ? proxyNames : providerNames.length > 0 ? [] : ['DIRECT'],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png',
    },
    {
      ...selectBaseOption,
      name: '直连',
      proxies: directProxies.map((p) => p.name),
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/China.png',
    },
  ];

  const rules = [
    'RULE-SET,private,直连',
    'RULE-SET,cn,直连',
    'RULE-SET,cn_ip,直连',
    'RULE-SET,private_ip,直连',
    ...blockForeignQuic,
    'MATCH,默认代理',
  ];

  const newConfig = {
    ...config,
    dns,
    hosts,
    mode: config['mode'] || 'rule',
    'log-level': 'info',
    'unified-delay': true,
    'tcp-concurrent': true,
    'keep-alive-interval': 60,
    'find-process-mode': 'off',
    profile: {
      'store-selected': true,
      'store-fake-ip': true,
    },
    proxies: [...mappedProxies, ...directProxies],
    'proxy-groups': proxyGroups,
    'rule-providers': ruleProviders,
    rules,
  };

  delete newConfig['tun'];
  delete newConfig['mixed-port'];
  delete newConfig['external-controller'];
  delete newConfig['external-ui'];
  delete newConfig['external-ui-url'];

  return newConfig;
}

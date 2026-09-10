/**
 * mihomo / Clash 极简自适应覆写脚本 (Flclash 安卓极简版)
 * 仓库地址：https://github.com/87730/Flclash-script
 *
 * 核心设计：
 * 1. 【真·极简配置】：无任何花里胡哨的地区组与应用分流组，界面仅保留【默认代理】、【漏网之鱼】、【直连】3 个卡片。
 * 2. 【国内走国内，国外走国外】：纯粹可靠的三段式分流（内网直连 -> 国内域名/IP直连 -> 国外全部走代理）。
 * 3. 【专线机场自适应与防透传】：100% 完整保留原作者私有 DNS 嗅探算法体系，自动继承原订阅 hosts，保证专线/中转连入 BGP 入口，绝不降级为慢速透传 IP。
 * 4. 【严密防 DNS 泄露】：Fake-IP 双栈虚拟地址池 + 国外域名走节点远端 DoH 解析 + 国内走阿里/腾讯直连解析。
 * 5. 【Android Flclash 优化】：移除桌面端系统参数，关闭无意义的后台进程扫描，轻量、节能、省电。
 */

// 排除非节点的垃圾广告正则
const excludeFilter =
  /群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|电报|无法|说明|使用|提示|访问|支持|教程|关注|更新|作者|加入|超时|收藏|优惠|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|禁止|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|建议|重置|以下|过滤|⚠️|@|t\.me\/\+|\bexpire\b|\bhttps?:\/\/|\.com|\btraffic\b/iu;

// 屏蔽国外QUIC（带 no-resolve 与 cn_additional，防止误触发解析与断流）
const blockForeignQuic = [
  'AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((OR,((RULE-SET,cn_additional),(RULE-SET,cn_ip,no-resolve)))))),REJECT',
];

// 直连节点
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

// 核心 Rule Providers（轻量高效 MRS 规则集）
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
  'geolocation-cn': {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/geolocation-cn.mrs',
    path: './ruleset/geolocation-cn.mrs',
    'path-in-bundle': 'geo/geosite/geolocation-cn.mrs',
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
  cn_additional: {
    ...ruleProviderCommonDomain,
    url: 'https://static-file-global.353355.xyz/rules/cn-additional-list.mrs',
    path: './ruleset/cn-additional-list.mrs',
    'path-in-bundle': 'geo/geosite/cn.mrs',
  },
  cn: {
    ...ruleProviderCommonDomain,
    url: 'https://fastly.jsdelivr.net/gh/appshubcc/bett-rules@meta/geo/geosite/cn.mrs',
    path: './ruleset/cn.mrs',
    'path-in-bundle': 'geo/geosite/cn.mrs',
  },
};

// 策略组通用配置（采用 Cloudflare 204 轻量接口，0 流量快速测速）
const selectBaseOption = {
  type: 'select',
  interval: 600,
  timeout: 3000,
  url: 'https://cp.cloudflare.com/generate_204',
  lazy: true,
  'max-failed-times': 3,
};

// =============================================================================
// --- 以下为原作者完整的 DNS 和 Hosts 处理系统（100% 原始算法未做任何删改） ---
// =============================================================================

// 常见的公共 DNS，用于过滤订阅中的公共 DNS
const commonDnsList = [
  // IPv4（国内）
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

  // IPv6（国内）
  '2400:3200::1',
  '2400:3200:baba::1',
  '2402:4e00::',
  '2400:da00::6666',

  // IPv4（国外）
  '1.1.1.1',
  '1.0.0.1',
  '8.8.8.8',
  '8.8.4.4',
  '9.9.9.9',
  '149.112.112.112',
  '208.67.222.222',
  '208.67.220.220',

  // IPv6（国外）
  '2606:4700:4700::1111',
  '2606:4700:4700::1001',
  '2001:4860:4860::8888',
  '2001:4860:4860::8844',
  '2620:fe::fe',
  '2620:fe::9',
  '2620:119:35::35',
  '2620:119:53::53',

  // 关键词（国内）
  'alidns',
  'tencent',
  'dnspod',
  'baidu',
  'onedns',
  '360',

  // 关键词（国外）
  'cloudflare',
  'google',
  'quad9',
  'opendns',
  'nextdns',
  'adguard',
  'smartdns',
  'cleanbrowsing',
  'apple',
];

// 预编译公共 DNS 正则
const commonDnsRegex = new RegExp(
  commonDnsList.map((dns) => dns.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i',
);

// 国内外 DNS 定义
const chinaDNS = ['223.5.5.5#DIRECT', '119.29.29.29#DIRECT'];
const chinaDohDNS = ['https://223.5.5.5/dns-query#DIRECT', 'https://1.12.12.12/dns-query#DIRECT'];
const foreignDNS = ['https://cloudflare-dns.com/dns-query#默认代理', 'https://dns.google/dns-query#默认代理'];

/**
 * hosts 匹配优先级：精确 > +. > . > *（同级按出现顺序）
 */
function hostSpecificity(pattern) {
  if (pattern.startsWith('+.')) return 2;
  if (pattern.startsWith('.')) return 1;
  if (pattern.includes('*')) return 0;
  return 3;
}

/**
 * 判断域名规则（精确/通配）是否匹配节点域名集合，忽略大小写
 */
function matchDomainPattern(pattern, domains) {
  pattern = pattern.toLowerCase();

  // 精确匹配
  if (!pattern.includes('*') && !pattern.startsWith('+.') && !pattern.startsWith('.')) {
    return typeof domains === 'string'
      ? domains.toLowerCase() === pattern
      : [...domains].some((d) => d.toLowerCase() === pattern);
  }

  const domainList = typeof domains === 'string' ? [domains.toLowerCase()] : [...domains].map((d) => d.toLowerCase());

  // 通配符匹配
  if (pattern.includes('*')) {
    const regex = new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`, 'i');
    return domainList.some((d) => regex.test(d));
  }

  // +. 匹配（匹配自身及所有子域名）
  if (pattern.startsWith('+.')) {
    const suffix = pattern.slice(2);
    return domainList.some((d) => d === suffix || d.endsWith(`.${suffix}`));
  }

  // . 匹配（仅匹配子域名）
  if (pattern.startsWith('.')) {
    const suffix = pattern.slice(1);
    return domainList.some((d) => d.endsWith(`.${suffix}`));
  }

  return false;
}

/**
 * 应用 hosts 配置改写节点 server
 */
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

    // 1. 精确匹配
    let target = domainMap.get(lowerServer);

    // 2. 通配符匹配
    if (!target) {
      for (const [pattern, resolvedTarget] of wildcardEntries) {
        if (matchDomainPattern(pattern, lowerServer)) {
          target = resolvedTarget;
          break;
        }
      }
    }

    if (!target) return proxy;

    return {
      ...proxy,
      server: target,
      ...(!proxy.servername && { servername: server }),
      ...(!proxy.sni && { sni: server }),
      ...(!proxy.host &&
        ['ws', 'http', 'h2', 'grpc'].includes(proxy.network) && {
          host: server,
        }),
    };
  });
}

/**
 * 去除 DNS 地址的策略组后缀
 */
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

/**
 * 判断字符串是否为 IP 地址（IPv4 或 IPv6）
 */
function isIpAddress(server) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(server) || server.includes(':');
}

/**
 * 简化节点域名策略：将相同 DNS 的节点域名按后缀归类，至少三段的域名可合并为 +. 后缀形式
 */
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

    simplifiedPolicy[`+.${items[0].suffix}`] = items[0].dns;
  }

  return simplifiedPolicy;
}

/**
 * 生成 DNS 和 hosts 相关配置（完全保持原作者 100% 原始逻辑 + 原订阅 hosts 智能继承）
 */
function buildDnsAndHostsConfig(config, filteredProxies) {
  const originalDnsConfig = config.dns || {};

  const proxyServerNameservers = originalDnsConfig['proxy-server-nameserver'] || [];
  const listenValue = originalDnsConfig['listen'];

  const shouldRewriteByHosts =
    proxyServerNameservers.length === 1 &&
    typeof listenValue === 'string' &&
    listenValue.length > 0 &&
    (proxyServerNameservers.some((dns) => String(dns).toLowerCase().includes(listenValue.toLowerCase())) ||
      (listenValue.includes('0.0.0.0') &&
        proxyServerNameservers.some((dns) => String(dns).toLowerCase().includes('127.0.0.1'))));

  const mappedProxies = shouldRewriteByHosts ? applyHostsToProxies(filteredProxies, config.hosts) : filteredProxies;

  const proxyDomains = new Set(
    mappedProxies
      .filter((proxy) => typeof proxy.server === 'string')
      .map((proxy) => proxy.server.toLowerCase())
      .filter((server) => !isIpAddress(server)),
  );

  const privateProxyServerNameservers = shouldRewriteByHosts ? [] : proxyServerNameservers;

  const isCommonDns = (dns) => {
    const value = String(dns).trim().toLowerCase();
    if (value === 'system' || value === 'system://') return true;

    return commonDnsRegex.test(value);
  };

  const privateDNS = [
    ...new Set(
      [...(originalDnsConfig['nameserver'] || []), ...privateProxyServerNameservers]
        .map(stripDnsSuffix)
        .filter((dns) => dns.length > 0 && !isCommonDns(dns)),
    ),
  ];

  const matchedProxyPolicy = {};
  for (const [domain, dns] of Object.entries({
    ...originalDnsConfig['nameserver-policy'],
    ...originalDnsConfig['proxy-server-nameserver-policy'],
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

  const originalFakeIpFilter = originalDnsConfig['fake-ip-filter'] || [];
  const proxyFakeIpFilter = originalFakeIpFilter.filter((pattern) => {
    const p = String(pattern);
    return matchDomainPattern(p, proxyDomains);
  });

  const dns = {
    enable: true,
    ipv6: true,
    'use-hosts': true,
    'cache-algorithm': 'arc',
    'use-system-hosts': true,
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/15',
    'fake-ip-range6': '2001:2::1/48',
    'fake-ip-filter': [
      'rule-set:private',
      'rule-set:fakeip_filter',
      'rule-set:geolocation-cn',
      ...proxyFakeIpFilter,
    ],
    'proxy-server-nameserver': chinaDohDNS,
    ...(Object.keys(proxyServerPolicy).length > 0 && {
      'proxy-server-nameserver-policy': proxyServerPolicy,
    }),
    'default-nameserver': chinaDohDNS,
    nameserver: foreignDNS,
    'nameserver-policy': {
      'rule-set:cn': chinaDNS,
    },
    'direct-nameserver': ['system', ...chinaDNS],
  };

  const hosts = {
    ...(config.hosts || {}),
    'cloudflare-dns.com': ['1.1.1.1', '1.0.0.1'],
    'dns.google': ['8.8.8.8', '8.8.4.4'],

    // 解决谷歌商店无法下载的问题
    'services.googleapis.cn': 'services.googleapis.com',

    // 屏蔽哔哩哔哩PCDN，解决访问视频/直播卡顿问题
    '+.mcdn.bilivideo.com': ['0.0.0.0'],
    '+.mcdn.bilivideo.cn': ['0.0.0.0'],
    '+.edge.mountaintoys.cn': ['0.0.0.0'],
    '+.h2.smtcdns.net': ['0.0.0.0'],
  };

  return { dns, hosts, proxies: mappedProxies };
}

// =============================================================================
// --- 主入口：真·极简分流与策略生成 ---
// =============================================================================

function main(config) {
  const originalProxies = config.proxies || [];

  // 1. 过滤垃圾/广告节点，保留真实有效节点
  const filteredProxies = originalProxies.filter((proxy) => {
    const type = String(proxy.type ?? '').toLowerCase();
    if (type === 'direct' || type === 'reject' || type === 'rematch') return false;
    return !excludeFilter.test(proxy.name);
  });

  // 2. 调用 100% 原始算法生成 DNS、Hosts 和映射后的节点列表
  const { dns, hosts, proxies: mappedProxies } = buildDnsAndHostsConfig(config, filteredProxies);
  const proxyNames = mappedProxies.map((p) => p.name);

  // 3. 构建真·极简策略组（仅 3 个组，极致清晰、省电、不卡手）
  const proxyGroups = [
    {
      ...selectBaseOption,
      name: '默认代理',
      proxies: proxyNames.length > 0 ? proxyNames : ['DIRECT'],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png',
    },
    {
      ...selectBaseOption,
      name: '漏网之鱼',
      proxies: ['默认代理', '直连'],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Stack.png',
    },
    {
      ...selectBaseOption,
      name: '直连',
      proxies: directProxies.map((p) => p.name),
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/China.png',
    },
  ];

  // 4. 构建三段式极简规则：内网直连 -> QUIC拦截 -> 国内直连 -> 兜底代理
  const rules = [
    // 内网直连
    'RULE-SET,private,直连',

    // 屏蔽国外 QUIC（带 no-resolve 与 cn_additional，防止误触发解析与断流）
    ...blockForeignQuic,

    // 国内直连 (域名 + IP)
    'RULE-SET,geolocation-cn,直连',
    'RULE-SET,cn_ip,直连',
    'RULE-SET,private_ip,直连',

    // 兜底全走代理
    'MATCH,漏网之鱼',
  ];

  // 5. 组合最终配置
  const newConfig = {
    ...config,
    dns,
    hosts,
    mode: config['mode'] || 'rule',
    'log-level': 'info',
    'unified-delay': true,
    'tcp-concurrent': true,
    'find-process-mode': 'off',
    proxies: [...mappedProxies, ...directProxies],
    'proxy-groups': proxyGroups,
    'rule-providers': ruleProviders,
    rules,
  };

  // 6. 移除桌面端强行绑定的参数，由 Android Flclash 自身安全管理 VPNService
  delete newConfig['tun'];
  delete newConfig['mixed-port'];
  delete newConfig['external-controller'];
  delete newConfig['external-ui'];
  delete newConfig['external-ui-url'];

  return newConfig;
}

/**
 * FlClash & Mihomo 极简配置覆写脚本
 * https://github.com/87730/Flclash-script
 */

const excludeFilter =
  /群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|电报|无法|说明|使用|提示|访问|支持|教程|关注|更新|作者|加入|超时|收藏|优惠|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|禁止|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|建议|重置|以下|过滤|⚠️|@|t\.me\/\+|\bexpire\b|\bhttps?:\/\/|\.com|\btraffic\b/iu;

// 组名 / 直连出站名 / 内核保留字，订阅节点不得占用
const RESERVED_NAMES = new Set(['默认代理', '直连', 'DIRECT', 'REJECT', 'PASS', 'GLOBAL']);

// 阻断海外 UDP 443（置于国内规则之后，强制回退 TCP 并防止误杀国内流量）
const blockForeignQuic = [
  'AND,((NETWORK,UDP),(DST-PORT,443)),REJECT',
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
  '94.140.14.14',
  '94.140.15.15',
  '76.76.2.0',
  '76.76.10.0',
  '185.228.168.9',
  '185.228.169.9',
  '77.88.8.8',
  '77.88.8.1',
  '156.154.70.1',
  '156.154.71.1',
  '2a10:50c0::ad1:ff',
  '2a10:50c0::ad2:ff',
  '2a10:50c0::bad1:ff',
  '2a10:50c0::bad2:ff',
  '2a02:6b8::feed:0ff',
  '2a02:6b8:0:1::feed:0ff',
  '2610:a1:1018::1',
  '2610:a1:1019::1',
];

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
  'one.one.one.one',
  'dns.cloudflare.com',
  'mozilla.cloudflare-dns.com',
  'doh.360.cn',
];

function dnsHost(server) {
  const str = String(server)
    .trim()
    .replace(/^[a-z0-9+.-]+:\/\//i, '')
    .split(/[/?#]/)[0];

  const bracket = str.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracket) return bracket[1].toLowerCase();
  if ((str.match(/:/g) || []).length > 1) return str.toLowerCase();

  return str.replace(/:\d+$/, '').toLowerCase();
}

// 引导 DNS 必须是纯 IP，用于解析 DoH 等解析器自己的域名
const bootstrapDNS = ['223.5.5.5', '119.29.29.29', '1.12.12.12'];

const chinaDNS = ['223.5.5.5#DIRECT', '119.29.29.29#DIRECT'];
const chinaDohDNS = [
  'https://223.5.5.5/dns-query#DIRECT',
  'https://1.12.12.12/dns-query#DIRECT',
  '223.5.5.5#DIRECT',
];
const directDNS = ['223.5.5.5#DIRECT', '119.29.29.29#DIRECT', 'https://223.5.5.5/dns-query#DIRECT'];
const foreignDNS = ['https://cloudflare-dns.com/dns-query#默认代理', 'https://dns.google/dns-query#默认代理'];

function asArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).filter((v) => v.length > 0);
  }
  if (typeof value === 'string' || typeof value === 'number') return [String(value)];
  return [];
}

// hosts 的 0.0.0.0 / 回环值是“屏蔽”语义，不能当节点地址
function isBlackholeTarget(target) {
  const value = String(target).trim().toLowerCase();
  return value === '0.0.0.0' || value === '::' || value === '::0' || value === 'localhost' || /^127\./.test(value);
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
    if (isBlackholeTarget(target)) return proxy;

    const patched = {
      ...proxy,
      server: target,
      ...(!proxy.servername && !proxy.sni && { servername: server }),
      ...(!proxy.sni && { sni: server }),
    };

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

  const isLocalDns = (dns) => {
    const host = dnsHost(dns);
    if (!host) return false;
    if (host === 'localhost' || host === '::1' || host === '172.19.0.2' || host === '198.18.0.2') return true;
    if (/^127\./.test(host) || /^198\.18\./.test(host) || /^2001:2:/.test(host)) return true;
    return listenHost.length > 0 && host === listenHost;
  };

  const mappedProxies = applyHostsToProxies(filteredProxies, config.hosts);

  const proxyDomains = new Set(
    mappedProxies
      .filter((proxy) => typeof proxy.server === 'string')
      .map((proxy) => proxy.server.toLowerCase())
      .filter((server) => !isIpAddress(server)),
  );

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
    'fake-ip-filter': ['rule-set:private', 'rule-set:fakeip_filter', ...proxyFakeIpFilter],
    'proxy-server-nameserver': chinaDohDNS,
    ...(Object.keys(proxyServerPolicy).length > 0 && {
      'proxy-server-nameserver-policy': proxyServerPolicy,
    }),
    'default-nameserver': bootstrapDNS,
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
  const originalProxies = Array.isArray(config.proxies) ? config.proxies : [];

  const rawFiltered = originalProxies.filter((proxy) => {
    // 订阅里出现 null / 字符串 / 缺 name、type 的条目时，与其产出一份内核拒收的配置，不如丢掉
    if (!proxy || typeof proxy !== 'object') return false;
    if (typeof proxy.name !== 'string' || proxy.name.length === 0) return false;
    if (typeof proxy.type !== 'string' || proxy.type.length === 0) return false;

    const type = proxy.type.toLowerCase();
    if (type === 'direct' || type === 'reject' || type === 'rematch') return false;
    return !excludeFilter.test(proxy.name);
  });

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

  const providers = config['proxy-providers'];
  const providerNames =
    providers && typeof providers === 'object' && !Array.isArray(providers)
      ? Object.keys(providers).filter((name) => name.length > 0)
      : [];
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
    sniffer: {
      enable: true,
      'parse-pure-ip': true,
      sniff: {
        TLS: { ports: [443, 8443] },
        HTTP: { ports: [80, '8080-8880'], 'override-destination': true },
      },
    },
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

/**
 * FlClash & Mihomo 极简配置覆写脚本
 * https://raw.githubusercontent.com/87730/Flclash-script/main/flclash.js
 */

const excludeFilter =
  /群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|电报|无法|说明|使用|提示|访问|支持|教程|关注|更新|作者|加入|超时|收藏|优惠|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|禁止|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|建议|重置|以下|过滤|⚠️|@|t\.me\/\+|\bexpire\b|\bhttps?:\/\/|\.com|\btraffic\b/iu;

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

const RS_BASE = 'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo';

const ruleProviders = {
  private: {
    ...ruleProviderCommonDomain,
    url: `${RS_BASE}/geosite/private.mrs`,
    path: './ruleset/private.mrs',
  },
  private_ip: {
    ...ruleProviderCommonIpcidr,
    url: `${RS_BASE}/geoip/private.mrs`,
    path: './ruleset/private_ip.mrs',
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
  fakeip_filter: {
    ...ruleProviderCommonDomain,
    url: 'https://testingcf.jsdelivr.net/gh/wwqgtxx/clash-rules@release/fakeip-filter.mrs',
    path: './ruleset/fakeip-filter.mrs',
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
  'alidns',
  'tencent',
  'dnspod',
  'baidu',
  'onedns',
  '360',
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

const commonDnsRegex = new RegExp(
  commonDnsList.map((dns) => dns.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i',
);

const chinaDNS = ['223.5.5.5#DIRECT', '119.29.29.29#DIRECT'];
const chinaDohDNS = ['https://223.5.5.5/dns-query#DIRECT', 'https://1.12.12.12/dns-query#DIRECT'];
const foreignDNS = ['https://cloudflare-dns.com/dns-query#节点选择', 'https://dns.google/dns-query#节点选择'];

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
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
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

function stripDnsSuffix(dns) {
  const str = String(dns);
  const hashIndex = str.indexOf('#');
  if (hashIndex === -1) return str;

  const prefix = str.slice(0, hashIndex).trim();
  const rawTarget = str.slice(hashIndex + 1).trim();

  if (/^(direct|直连)$/i.test(rawTarget)) return prefix + '#DIRECT';
  if (rawTarget === '节点选择') return prefix + '#节点选择';

  return prefix;
}

function isIpAddress(server) {
  return (
    /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(server) ||
    server.includes(':')
  );
}

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
    if (!matchDomainPattern(domain, activeNodeServers)) continue;

    const stripedDns = Array.isArray(dns) ? dns.map(stripDnsSuffix).filter((d) => d.length > 0) : stripDnsSuffix(dns);
    if (Array.isArray(stripedDns) && stripedDns.length === 0) continue;

    matchedProxyPolicy[domain] = stripedDns;
  }

  if (privateDNS.length > 0 && Object.keys(matchedProxyPolicy).length === 0) {
    for (const domain of activeNodeServers) {
      matchedProxyPolicy[domain] = privateDNS;
    }
  }

  const proxyServerPolicy = matchedProxyPolicy;

  const originalFakeIpFilter = originalDnsConfig['fake-ip-filter'] || [];
  const proxyFakeIpFilter = originalFakeIpFilter.filter((pattern) => {
    const p = String(pattern);
    return matchDomainPattern(p, activeNodeServers);
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
    ...Object.values(matchedProxyPolicy).flat(),
    ...Object.values(originalDnsConfig['proxy-server-nameserver-policy'] || {}).flat(),
    ...privateProxyServerNameservers,
  ];
  extractResolvers.forEach((resolver) => {
    const raw = String(resolver).trim();
    let host = '';
    const m = raw.match(/^(?:https?|tls|udp|tcp):\/\/([A-Za-z0-9.-]+)/i);
    if (m) {
      host = m[1];
    } else if (!isIpAddress(raw)) {
      host = raw;
    }
    if (host && !isIpAddress(host)) {
      targetHostDomains.add(host.toLowerCase());
    }
  });

  const rawHosts = config.hosts || {};
  const projectedHosts = {};
  for (const [hPattern, hValue] of Object.entries(rawHosts)) {
    if (matchDomainPattern(hPattern, targetHostDomains)) {
      projectedHosts[hPattern] = hValue;
    }
  }

  const hosts = {
    ...projectedHosts,
    'doh.pub': ['1.12.12.12', '120.53.53.53'],
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
    return !excludeFilter.test(proxy.name);
  });

  const uniqueNames = new Set();
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

  const fpTypes = ['trojan', 'vless', 'vmess'];
  for (const proxy of mappedProxies) {
    if (!('ip-version' in proxy)) {
      proxy['ip-version'] = 'dual';
    }
    if (fpTypes.includes(proxy.type) && !proxy['client-fingerprint']) {
      if (proxy.tls || proxy['reality-opts']) {
        proxy['client-fingerprint'] = 'chrome';
      }
    }
  }

  const proxyNames = mappedProxies.map((p) => p.name);

  const proxyProviders = config['proxy-providers'] || {};
  const hasProviders = Object.keys(proxyProviders).length > 0;

  const proxyGroups = [
    {
      ...selectBaseOption,
      name: '节点选择',
      proxies: proxyNames.length > 0 ? proxyNames : (hasProviders ? [] : ['DIRECT']),
      ...(hasProviders && { use: Object.keys(proxyProviders) }),
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png',
    },
  ];

  const rules = [
    'AND,((DST-PORT,123),(NETWORK,udp)),DIRECT',
    'RULE-SET,private,DIRECT',
    'RULE-SET,private_ip,DIRECT',
    'RULE-SET,cn,DIRECT',
    'RULE-SET,cn_ip,DIRECT,no-resolve',
    'MATCH,节点选择',
  ];

  const newConfig = {
    ...config,
    dns,
    hosts,
    'mixed-port': config['mixed-port'] || 7890,
    mode: 'rule',
    'log-level': 'warning',
    'unified-delay': true,
    'tcp-concurrent': true,
    'keep-alive-idle': 300,
    'keep-alive-interval': 30,
    'find-process-mode': 'off',
    profile: {
      'store-selected': true,
      'store-fake-ip': true,
    },
    proxies: [...mappedProxies],
    'proxy-groups': proxyGroups,
    'rule-providers': ruleProviders,
    rules,
  };

  if (config['external-controller']) {
    newConfig['external-controller'] = config['external-controller'];
  }

  delete newConfig['tun'];
  delete newConfig['external-ui'];
  delete newConfig['external-ui-url'];

  return newConfig;
}

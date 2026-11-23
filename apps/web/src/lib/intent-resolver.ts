/**
 * Resolves user commands to web URLs, search queries, and target browser engines.
 * Handles YouTube, Google, Chrome, Edge, Brave, GitHub, ChatGPT, etc.
 */
export interface ResolvedIntent {
  isBrowserAction: boolean;
  siteName: string;
  browserEngine: 'chromium' | 'chrome' | 'msedge' | 'brave';
  searchQuery?: string;
  targetUrl: string | null;
}

export function resolveWebIntent(input: string): ResolvedIntent {
  const raw = (input || '').trim();
  const lower = raw.toLowerCase();

  // Determine browser engine preference
  let browserEngine: 'chromium' | 'chrome' | 'msedge' | 'brave' = 'chromium';
  if (/\b(crome|chrome)\b/i.test(lower)) {
    browserEngine = 'chrome';
  } else if (/\b(msedge|edge)\b/i.test(lower)) {
    browserEngine = 'msedge';
  } else if (/\bbrave\b/i.test(lower)) {
    browserEngine = 'brave';
  }

  // 1. Explicit compound commands:
  // e.g. "goto google and search something", "open the youtube and search react hooks", "goto crome and search something"
  const compoundMatch = lower.match(
    /(?:goto|go\s+to|open)\s+(?:the\s+)?(youtube|yt|google|chrome|crome|edge|msedge|brave(?:\s+browser)?|github|chatgpt)\s+(?:and\s+)?(?:search|find|play|look\s+up)\s+(?:for\s+)?(.+)/i
  );

  if (compoundMatch) {
    const siteRaw = compoundMatch[1].toLowerCase();
    let query = compoundMatch[2].trim();
    // Clean leading prepositions
    query = query.replace(/^(?:for\s+|about\s+|term\s+)/i, '').trim();

    if (siteRaw.includes('youtube') || siteRaw === 'yt') {
      return {
        isBrowserAction: true,
        siteName: 'YouTube',
        browserEngine,
        searchQuery: query,
        targetUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      };
    }
    if (siteRaw.includes('brave')) {
      return {
        isBrowserAction: true,
        siteName: 'Brave',
        browserEngine: 'brave',
        searchQuery: query,
        targetUrl: `https://search.brave.com/search?q=${encodeURIComponent(query)}`,
      };
    }
    if (siteRaw.includes('edge') || siteRaw.includes('msedge')) {
      return {
        isBrowserAction: true,
        siteName: 'Microsoft Edge',
        browserEngine: 'msedge',
        searchQuery: query,
        targetUrl: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
      };
    }
    if (siteRaw.includes('github')) {
      return {
        isBrowserAction: true,
        siteName: 'GitHub',
        browserEngine,
        searchQuery: query,
        targetUrl: `https://github.com/search?q=${encodeURIComponent(query)}`,
      };
    }
    // google / chrome / crome
    return {
      isBrowserAction: true,
      siteName: 'Google',
      browserEngine: siteRaw.includes('cr') ? 'chrome' : browserEngine,
      searchQuery: query,
      targetUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    };
  }

  // 2. Pattern: "search <query> on/in <site>"
  const onSiteMatch = lower.match(
    /(?:search|find|play|look\s+up)\s+(?:for\s+)?(.+?)\s+(?:on|in|using|with)\s+(?:the\s+)?(youtube|yt|google|chrome|crome|edge|msedge|brave(?:\s+browser)?|github)\b/i
  );
  if (onSiteMatch) {
    const query = onSiteMatch[1].trim();
    const siteRaw = onSiteMatch[2].toLowerCase();

    if (siteRaw.includes('youtube') || siteRaw === 'yt') {
      return {
        isBrowserAction: true,
        siteName: 'YouTube',
        browserEngine,
        searchQuery: query,
        targetUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      };
    }
    if (siteRaw.includes('brave')) {
      return {
        isBrowserAction: true,
        siteName: 'Brave',
        browserEngine: 'brave',
        searchQuery: query,
        targetUrl: `https://search.brave.com/search?q=${encodeURIComponent(query)}`,
      };
    }
    if (siteRaw.includes('edge') || siteRaw.includes('msedge')) {
      return {
        isBrowserAction: true,
        siteName: 'Microsoft Edge',
        browserEngine: 'msedge',
        searchQuery: query,
        targetUrl: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
      };
    }
    if (siteRaw.includes('github')) {
      return {
        isBrowserAction: true,
        siteName: 'GitHub',
        browserEngine,
        searchQuery: query,
        targetUrl: `https://github.com/search?q=${encodeURIComponent(query)}`,
      };
    }
    return {
      isBrowserAction: true,
      siteName: 'Google',
      browserEngine: siteRaw.includes('cr') ? 'chrome' : browserEngine,
      searchQuery: query,
      targetUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    };
  }

  // 3. YouTube specific general triggers
  if (lower.includes('youtube') || lower.includes('yt')) {
    const qMatch = lower.match(/(?:search|find|play|look\s+up)\s+(?:for\s+)?(.+)/i);
    const query = qMatch ? qMatch[1].replace(/\s+(?:on|in)\s+youtube/i, '').trim() : undefined;
    return {
      isBrowserAction: true,
      siteName: 'YouTube',
      browserEngine,
      searchQuery: query,
      targetUrl: query
        ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        : 'https://www.youtube.com',
    };
  }

  // 4. Brave specific
  if (lower.includes('brave')) {
    const qMatch = lower.match(/(?:search|find|look\s+up)\s+(?:for\s+)?(.+)/i);
    const query = qMatch ? qMatch[1].replace(/\s+(?:on|in)\s+brave(?:\s+browser)?/i, '').trim() : undefined;
    return {
      isBrowserAction: true,
      siteName: 'Brave',
      browserEngine: 'brave',
      searchQuery: query,
      targetUrl: query
        ? `https://search.brave.com/search?q=${encodeURIComponent(query)}`
        : 'https://search.brave.com',
    };
  }

  // 5. Edge specific
  if (lower.includes('edge') || lower.includes('msedge')) {
    const qMatch = lower.match(/(?:search|find|look\s+up)\s+(?:for\s+)?(.+)/i);
    const query = qMatch ? qMatch[1].replace(/\s+(?:on|in)\s+edge/i, '').trim() : undefined;
    return {
      isBrowserAction: true,
      siteName: 'Microsoft Edge',
      browserEngine: 'msedge',
      searchQuery: query,
      targetUrl: query
        ? `https://www.bing.com/search?q=${encodeURIComponent(query)}`
        : 'https://www.bing.com',
    };
  }

  // 6. Chrome / Google
  if (lower.includes('google') || lower.includes('chrome') || lower.includes('crome')) {
    const qMatch = lower.match(/(?:search|find|look\s+up)\s+(?:for\s+)?(.+)/i);
    const query = qMatch ? qMatch[1].replace(/\s+(?:on|in)\s+(?:google|chrome|crome)/i, '').trim() : undefined;
    return {
      isBrowserAction: true,
      siteName: 'Google',
      browserEngine: lower.includes('chrome') || lower.includes('crome') ? 'chrome' : browserEngine,
      searchQuery: query,
      targetUrl: query
        ? `https://www.google.com/search?q=${encodeURIComponent(query)}`
        : 'https://www.google.com',
    };
  }

  // 7. GitHub
  if (lower.includes('github')) {
    const qMatch = lower.match(/(?:search|find|look\s+up)\s+(?:for\s+)?(.+)/i);
    const query = qMatch ? qMatch[1].replace(/\s+(?:on|in)\s+github/i, '').trim() : undefined;
    return {
      isBrowserAction: true,
      siteName: 'GitHub',
      browserEngine,
      searchQuery: query,
      targetUrl: query
        ? `https://github.com/search?q=${encodeURIComponent(query)}`
        : 'https://github.com',
    };
  }

  // 8. ChatGPT / OpenAI
  if (lower.includes('chatgpt') || lower.includes('openai')) {
    return {
      isBrowserAction: true,
      siteName: 'ChatGPT',
      browserEngine,
      targetUrl: 'https://chat.openai.com',
    };
  }

  // 9. Generic search ("search ...", "find ...")
  if (lower.startsWith('search ') || lower.startsWith('find ') || lower.startsWith('look up ')) {
    const query = raw.replace(/^(?:search|find|look up)\s+(?:for\s+)?/i, '').trim();
    if (query) {
      return {
        isBrowserAction: true,
        siteName: 'Google',
        browserEngine: 'chromium',
        searchQuery: query,
        targetUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      };
    }
  }

  // 10. Direct URL
  if (/^https?:\/\//i.test(raw)) {
    return {
      isBrowserAction: true,
      siteName: 'Web Browser',
      browserEngine,
      targetUrl: raw,
    };
  }

  return {
    isBrowserAction: false,
    siteName: 'DeVis Agent',
    browserEngine: 'chromium',
    targetUrl: null,
  };
}

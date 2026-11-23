import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import { chromium, Browser } from 'playwright';

export interface AutomationResult {
  isBrowserAction: boolean;
  siteName: string;
  browserEngine: 'chromium' | 'chrome' | 'msedge' | 'brave';
  searchQuery?: string;
  targetUrl: string | null;
  pageTitle?: string;
  screenshot?: string;
  openedOnDesktop?: boolean;
}

@Injectable()
export class BrowserAutomationService {
  private readonly logger = new Logger(BrowserAutomationService.name);

  // Standard Windows install paths for Brave browser
  private readonly bravePaths = [
    'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    process.env.LOCALAPPDATA
      ? `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`
      : '',
  ].filter(Boolean);

  /**
   * Resolves text command into web intent, search query, target URL, and browser engine.
   */
  resolveIntent(input: string) {
    const raw = (input || '').trim();
    const lower = raw.toLowerCase();

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
          browserEngine: 'brave' as const,
          searchQuery: query,
          targetUrl: `https://search.brave.com/search?q=${encodeURIComponent(query)}`,
        };
      }
      if (siteRaw.includes('edge') || siteRaw.includes('msedge')) {
        return {
          isBrowserAction: true,
          siteName: 'Microsoft Edge',
          browserEngine: 'msedge' as const,
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
        browserEngine: siteRaw.includes('cr') ? ('chrome' as const) : browserEngine,
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
          browserEngine: 'brave' as const,
          searchQuery: query,
          targetUrl: `https://search.brave.com/search?q=${encodeURIComponent(query)}`,
        };
      }
      if (siteRaw.includes('edge') || siteRaw.includes('msedge')) {
        return {
          isBrowserAction: true,
          siteName: 'Microsoft Edge',
          browserEngine: 'msedge' as const,
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
        browserEngine: siteRaw.includes('cr') ? ('chrome' as const) : browserEngine,
        searchQuery: query,
        targetUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      };
    }

    // 3. YouTube specific
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
        browserEngine: 'brave' as const,
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
        browserEngine: 'msedge' as const,
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
        browserEngine: lower.includes('chrome') || lower.includes('crome') ? ('chrome' as const) : browserEngine,
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

    // 8. ChatGPT
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
          browserEngine: 'chromium' as const,
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
      browserEngine: 'chromium' as const,
      targetUrl: null,
    };
  }

  /**
   * Executes Playwright browser automation & opens native desktop browser.
   */
  async executeAutomation(input: string): Promise<AutomationResult> {
    const intent = this.resolveIntent(input);

    if (!intent.isBrowserAction || !intent.targetUrl) {
      return {
        isBrowserAction: false,
        siteName: 'DeVis Agent',
        browserEngine: 'chromium',
        targetUrl: null,
      };
    }

    const { targetUrl, browserEngine, siteName, searchQuery } = intent;
    this.logger.log(`Executing browser automation: engine=${browserEngine}, site=${siteName}, url=${targetUrl}`);

    // 1. Launch on Windows Desktop asynchronously
    this.launchDesktopBrowser(targetUrl, browserEngine);

    // 2. Run Playwright automation to verify page, fetch title & capture thumbnail
    let pageTitle = `${siteName} Search`;
    let screenshot: string | undefined;

    let browser: Browser | null = null;
    try {
      browser = await this.launchPlaywrightBrowser(browserEngine);
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

      await page.goto(targetUrl, {
        waitUntil: 'commit',
        timeout: 6000,
      });

      // Brief rendering pause for title and preview
      await page.waitForTimeout(1000);

      const title = await page.title();
      if (title && title.trim()) {
        pageTitle = title.trim();
      }

      // Small preview screenshot for task step log
      try {
        const buf = await page.screenshot({ type: 'jpeg', quality: 40 });
        screenshot = `data:image/jpeg;base64,${buf.toString('base64')}`;
      } catch (shotErr) {
        this.logger.debug(`Could not take screenshot: ${shotErr}`);
      }
    } catch (err: any) {
      this.logger.warn(`Playwright navigation warning: ${err?.message || err}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch {}
      }
    }

    return {
      isBrowserAction: true,
      siteName,
      browserEngine,
      searchQuery,
      targetUrl,
      pageTitle,
      screenshot,
      openedOnDesktop: true,
    };
  }

  /**
   * Launch appropriate Playwright browser instance based on user engine preference.
   */
  private async launchPlaywrightBrowser(engine: 'chromium' | 'chrome' | 'msedge' | 'brave'): Promise<Browser> {
    if (engine === 'brave') {
      const bravePath = this.bravePaths.find((p) => fs.existsSync(p));
      if (bravePath) {
        try {
          return await chromium.launch({ executablePath: bravePath, headless: true });
        } catch (e) {
          this.logger.warn(`Brave executable launch failed, falling back to standard Chromium`);
        }
      }
    }

    if (engine === 'chrome') {
      try {
        return await chromium.launch({ channel: 'chrome', headless: true });
      } catch (e) {
        this.logger.warn(`Chrome channel launch failed, falling back to standard Chromium`);
      }
    }

    if (engine === 'msedge') {
      try {
        return await chromium.launch({ channel: 'msedge', headless: true });
      } catch (e) {
        this.logger.warn(`MSEdge channel launch failed, falling back to standard Chromium`);
      }
    }

    // Default Playwright Chromium
    return await chromium.launch({ headless: true });
  }

  /**
   * Launches the native Windows browser so the user sees the page directly.
   */
  private launchDesktopBrowser(url: string, engine: 'chromium' | 'chrome' | 'msedge' | 'brave') {
    if (process.platform !== 'win32') return;

    let cmd = `cmd /c start "" "${url}"`;

    if (engine === 'chrome') {
      cmd = `cmd /c start chrome "${url}" || start "" "${url}"`;
    } else if (engine === 'msedge') {
      cmd = `cmd /c start msedge "${url}" || start "" "${url}"`;
    } else if (engine === 'brave') {
      cmd = `cmd /c start brave "${url}" || start "" "${url}"`;
    }

    exec(cmd, (err) => {
      if (err) {
        // Fallback to default start
        exec(`cmd /c start "" "${url}"`);
      }
    });
  }
}

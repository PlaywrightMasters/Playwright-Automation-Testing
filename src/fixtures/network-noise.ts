import type { BrowserContext } from '@playwright/test';

/**
 * Ad, consent and analytics hosts injected into the practice store. Their
 * full-screen vignettes and iframes are the main source of flakiness, so they
 * are aborted before they load instead of being dismissed after the fact.
 */
const BLOCKED_HOSTS = [
  'googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'adservice.google.com',
  'adtrafficquality.google',
  'fundingchoicesmessages.google.com',
  'googletagmanager.com',
  'google-analytics.com',
];

function isBlocked(url: URL): boolean {
  return BLOCKED_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

export async function blockThirdPartyNoise(context: BrowserContext): Promise<void> {
  await context.route(isBlocked, (route) => route.abort('blockedbyclient'));
}

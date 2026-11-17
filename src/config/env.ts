/**
 * Runtime configuration. Every value can be overridden through environment
 * variables so the same suite can target another deployment of the store.
 */
export const env = {
  baseURL: process.env.BASE_URL ?? 'https://automationexercise.com',
  isCI: Boolean(process.env.CI),
} as const;

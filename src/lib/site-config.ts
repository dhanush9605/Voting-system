// Site configuration - centralized settings
export const SITE_CONFIG = {
  name: "Let's Vote",
  tagline: 'Secure Democratic Voting',
  description: 'A modern voting platform designed for transparent and secure elections.',
  contactEmail: 'elections@civicpulse.app',
} as const;

export const SITE_NAME = SITE_CONFIG.name;

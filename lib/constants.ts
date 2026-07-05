export const APP_NAME = "CardVault";
export const APP_TAGLINE =
  "Where business cards become business opportunities.";
export const APP_DESCRIPTION = APP_TAGLINE;
export const PWA_SHORT_NAME = "CardVault";
export const BULK_SCAN_MAX_CARDS = 10;

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  profile: "/profile",
  dashboard: "/dashboard",
  cards: "/dashboard/cards",
  cardsNew: "/dashboard/cards/new",
  cardDetail: (id: string) => `/dashboard/cards/${id}`,
  cardEdit: (id: string) => `/dashboard/cards/${id}/edit`,
  upload: "/dashboard/upload",
  search: "/dashboard/search",
  categories: "/dashboard/categories",
  categoryDetail: (id: string) => `/dashboard/categories/${id}`,
  categoryUncategorized: "/dashboard/categories/uncategorized",
  export: "/dashboard/export",
  ai: "/dashboard/ai",
  settings: "/dashboard/settings",
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.profile,
  ROUTES.dashboard,
  ROUTES.cards,
  ROUTES.cardsNew,
  ROUTES.upload,
  ROUTES.search,
  ROUTES.categories,
  ROUTES.export,
  ROUTES.ai,
  ROUTES.settings,
] as const;

export const AUTH_ROUTES = [ROUTES.login, ROUTES.signup] as const;

export const GOOGLE_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true" ||
  (Boolean(process.env.GOOGLE_CLIENT_ID) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET));

export const DASHBOARD_NAV = [
  { title: "Home", href: ROUTES.dashboard, segment: "home" },
  { title: "All Cards", href: ROUTES.cards, segment: "cards" },
  { title: "Upload", href: ROUTES.upload, segment: "upload" },
  { title: "Search", href: ROUTES.search, segment: "search" },
  { title: "Categories", href: ROUTES.categories, segment: "categories" },
  { title: "Export", href: ROUTES.export, segment: "export" },
  { title: "AI Assistant", href: ROUTES.ai, segment: "ai" },
  { title: "Settings", href: ROUTES.settings, segment: "settings" },
] as const;

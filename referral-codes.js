/* Refined Cost Segregation — valid referral / discount codes.
   SINGLE SOURCE OF TRUTH for the whole site. To add a partner:
   add ONE line below and push. Keys must be UPPERCASE (matching is
   case-insensitive); `code` is the canonical form recorded in the
   submission; `pct` is the discount percent. Two distinct valid codes
   stack additively, capped at 20. The order form itself only ever
   sees the numeric discountTier (10 or 20) — never edit Jotform
   conditions for new codes. */
window.RCS_CODES = {
  "ROOTRIVERREALTY": { code: "RootRiverRealty", label: "Root River Realty", pct: 10 },
  "PORTFOLIO10":     { code: "PORTFOLIO10",     label: "Multi-property",    pct: 10 }
};

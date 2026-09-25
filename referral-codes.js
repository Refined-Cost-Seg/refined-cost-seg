/* Refined Cost Segregation — referral/discount code fingerprints.
   Codes are stored as SHA-256 hashes of the UPPERCASE code, so the actual
   code strings are never visible in site source. To add a partner:
   1) hash it:  node -e "console.log(require('crypto').createHash('sha256').update('NEWCODEUPPERCASE').digest('hex'))"
   2) add one line below and push. (Or just tell Claude the code + percent.)
   Matching is case-insensitive. Two distinct valid codes stack additively,
   capped at 20%. The order form only ever receives the numeric discountTier.

   LABELS ARE PUBLIC TEXT. The hashes are safe, but a label is rendered on the
   page and read by anyone who opens the file, so the two no-payment lanes carry
   neutral names — a reader must not be able to learn from this file what a
   valid code buys. The `paid` and `admin` flags still drive the behaviour; the
   bridge verifies the lane server-side against these same hashes.

   2026-09-14: the admin lane was rotated. It used to double as the /qq-x7k4
   access code, so one string both opened the internal calculator and switched
   off payment on the order form — and the old value is in this repo's git
   history. The page gate now pins its own fingerprint (see GATE_FINGERPRINTS
   in qq-x7k4.html) and this lane is a separate high-entropy code that is not
   typed by hand. Never merge them again, and never rotate one expecting the
   other to follow.

   2026-09-25: `flat: <dollars>` = flat-price lane. The page prefills the
   hidden radio flatPrice403=<dollars> and presets Audit Support to None; the
   form charges exactly that amount (+ Audit Support only if the client
   re-selects it) and cancels any percentage code. The form only knows 1000 —
   a different amount needs a new radio option + formula change first. */
window.RCS_CODES = {
  "932c319f3ff6596ff79b69cf6c60f4124f6e971ff226e2d37cdec2dd481b1285": { label: "Partner A", pct: 0, paid: true },
  "f842c68c8e8b9c56dd7b3bc4d8b928e28d47a0cde6f078e437e70b42d9a0b66d": { label: "Partner B", pct: 0, admin: true },
  "6147a5d0e81da119302759100e6f3b3d39fdc1f3cf1da8522c56b821dc1486de": { label: "Root River Realty", pct: 10 },
  "24656b413306a8dbf2f4fb8f36e2d5e99de9929b346c546cace2e660c51940a4": { label: "Magnolia Tax Services", pct: 10 },
  "b6a5e8289b2577df99a2a539f7fecf0000695f20ad336a0dc1f729491d25b77b": { label: "Multi-property", pct: 10 },
  "bbab94e84fef703ed65593676e9d2250606df1ee2889add43d187a6986a56a04": { label: "Refined Mortgage Group", pct: 10 },
  "8fd172ddf478f8e2c1e7fe08d1580391adc3b81b9ffe46e51803b81893aa965f": { label: "Partner C", pct: 0, flat: 1000 }
};

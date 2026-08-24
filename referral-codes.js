/* Refined Cost Segregation — referral/discount code fingerprints.
   Codes are stored as SHA-256 hashes of the UPPERCASE code, so the actual
   code strings are never visible in site source. To add a partner:
   1) hash it:  node -e "console.log(require('crypto').createHash('sha256').update('NEWCODEUPPERCASE').digest('hex'))"
   2) add one line below and push. (Or just tell Claude the code + percent.)
   Matching is case-insensitive. Two distinct valid codes stack additively,
   capped at 20%. The order form only ever receives the numeric discountTier. */
window.RCS_CODES = {
  "932c319f3ff6596ff79b69cf6c60f4124f6e971ff226e2d37cdec2dd481b1285": { label: "Prepaid order", pct: 0, paid: true },
  "349edfb76aa08685541b5e7324028de3dc17b89888c747d628919d671b6e1c1a": { label: "Internal test", pct: 0, admin: true },
  "6147a5d0e81da119302759100e6f3b3d39fdc1f3cf1da8522c56b821dc1486de": { label: "Root River Realty", pct: 10 },
  "b6a5e8289b2577df99a2a539f7fecf0000695f20ad336a0dc1f729491d25b77b": { label: "Multi-property", pct: 10 }
};

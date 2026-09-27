// Shared entitlement helpers used by backend functions.
// Entitlements (piano, anno_gratuito, anni_licenza, ads_removed) and the admin
// disable flag live in the Entitlement entity — NOT in caller-writable user.data —
// so a user cannot self-grant licenses or clear their own suspension via updateMe.

// School year (1 Sep - 31 Aug) containing the given date.
export function schoolYearFromDate(d = new Date()) {
  const y = d.getFullYear();
  const m = d.getMonth(); // 0-11
  return m >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

// School-year format: YYYY/YYYY+1 (e.g. "2025/2026")
export function isValidAnno(anno) {
  const m = /^(\d{4})\/(\d{4})$/.exec(String(anno || ''));
  if (!m) return false;
  return parseInt(m[2], 10) === parseInt(m[1], 10) + 1;
}

// Find the caller's entitlement record (service role bypasses RLS).
export async function getEntitlementRecord(base44, userId) {
  const list = await base44.asServiceRole.entities.Entitlement.filter({ created_by_id: userId });
  return (list && list[0]) || null;
}

// Find or create the default entitlement record for a user.
export async function ensureEntitlementRecord(base44, userId) {
  let ent = await getEntitlementRecord(base44, userId);
  if (!ent) {
    ent = await base44.asServiceRole.entities.Entitlement.create({
      piano: 'free',
      anno_gratuito: schoolYearFromDate(),
      anni_licenza: [],
      ads_removed: false,
      disabled: false,
    });
  }
  return ent;
}

// Server-side paywall check — the single source of truth for whether a user may
// create/use a given school year. Client-side canCreateYear is UX only.
export function canCreateYear(anno, ent) {
  if (!ent) return false;
  if (ent.piano === 'permanente') return true;
  if (anno === ent.anno_gratuito) return true;
  if (Array.isArray(ent.anni_licenza) && ent.anni_licenza.includes(anno)) return true;
  return false;
}
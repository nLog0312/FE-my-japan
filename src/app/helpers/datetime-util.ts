// ===============================
// 🕒 Datetime Utilities (Ionic + MongoDB)
// ===============================

// --- Helpers ---
function pad(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

// --- Conversion between UTC and local (JST) ---
/**
 * Convert từ UTC ISO string (từ Mongo)
 * sang local format "YYYY-MM-DDTHH:mm:ss" để IonDatetime hiển thị đúng.
 */
export function utcToLocalInput(utcIso?: string | null): string | null {
  if (!utcIso) return null;
  const d = new Date(utcIso);
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${y}-${m}-${day}T${hh}:${mm}:${ss}`;
}

/**
 * Convert từ local string (IonDatetime value)
 * về UTC ISO string để gửi lên backend.
 */
export function localInputToUTCIso(localString?: string | null): string | null {
  if (!localString) return null;

  // Nếu có timezone hoặc Z, chỉ normalize
  if (/[Zz]$/.test(localString) || /[+\-]\d{2}:\d{2}$/.test(localString)) {
    return new Date(localString).toISOString();
  }

  // Nếu là local format "YYYY-MM-DDTHH:mm(:ss)"
  const [datePart, timePart = '00:00:00'] = localString.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mi, ss = '0'] = timePart.split(':');
  const localDate = new Date(y, m - 1, d, Number(hh), Number(mi), Number(ss));
  return localDate.toISOString();
}

// --- Formatting ---
/**
 * Format ISO string (UTC hoặc local) thành "HH:mm"
 * Dùng cho hiển thị giờ làm, break, v.v.
 */
export function formatTimeHHmm(dateString?: string | null): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${hh}:${mm}`;
}

/**
 * Format ISO string thành "YYYY-MM-DD HH:mm"
 */
export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

// --- Time calculations ---
/**
 * Tính số giờ (float) giữa hai thời điểm ISO.
 * @example diffHours("2025-10-25T08:00:00Z", "2025-10-25T17:30:00Z") = 9.5
 */
export function diffHours(startIso?: string | null, endIso?: string | null): number {
  if (!startIso || !endIso) return 0;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return (end - start) / (1000 * 60 * 60);
}

/**
 * Cộng thêm phút vào ISO string
 * @example addMinutes("2025-10-25T08:00:00Z", 30)
 */
export function addMinutes(isoString: string, minutes: number): string {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

/**
 * Cộng thêm giờ vào ISO string
 * @example addHours("2025-10-25T08:00:00Z", 2)
 */
export function addHours(isoString: string, hours: number): string {
  const d = new Date(isoString);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

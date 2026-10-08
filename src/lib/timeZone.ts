/**
 * The store time zone if Intl accepts it, else undefined (the device zone).
 * stores.timezone is owner-editable text, and one bad value must not make
 * every date on the records screens throw a RangeError.
 */
export function safeTimeZone(timeZone: string | null | undefined): string | undefined {
  if (!timeZone) return undefined;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return timeZone;
  } catch {
    return undefined;
  }
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_TOTAL = 100;

/** Prosty limiter w pamięci pojedynczego procesu Node. */
export function createRateLimiter(clock) {
  const requestsByIp = new Map();
  let allRequests = [];

  return (ip) => {
    const now = clock();
    const earliest = now - WINDOW_MS;
    const recent = (requestsByIp.get(ip) || []).filter((time) => time > earliest);
    allRequests = allRequests.filter((time) => time > earliest);

    if (recent.length >= MAX_PER_IP || allRequests.length >= MAX_TOTAL) return false;

    recent.push(now);
    allRequests.push(now);
    requestsByIp.set(ip, recent);

    // Zwalniamy pamięć zajmowaną przez nieaktywne adresy.
    if (requestsByIp.size > 2000) {
      for (const [key, times] of requestsByIp) {
        if (times.every((time) => time <= earliest)) requestsByIp.delete(key);
      }
    }

    return true;
  };
}

/**
 * Get current time in India (IST) as minutes since midnight.
 * IST = UTC + 5:30. Market open/close times in DB are in IST.
 */
function getCurrentMinutesIST() {
  const now = new Date();
  const utcMs = now.getTime();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcMs + istOffsetMs);
  const h = istDate.getUTCHours();
  const m = istDate.getUTCMinutes();
  const s = istDate.getUTCSeconds();
  return h * 60 + m + s / 60;
}

function parseTimeToMinutes(timeStr) {
  const parts = String(timeStr).trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const s = parseInt(parts[2], 10) || 0;
  return h * 60 + m + s / 60;
}

/**
 * Get market status: is_online, open_status, close_status (all in IST)
 * - open_status: true when open_time NOT yet crossed (market not opened)
 * - close_status: true when close_time NOT yet crossed (market not closed)
 * - is_online: true only when open_time crossed AND close_time not crossed
 */
function getMarketStatus(openTime, closeTime) {
  if (!openTime || !closeTime) {
    return { is_online: false, open_status: false, close_status: false };
  }
  const current = getCurrentMinutesIST();
  const openMin = parseTimeToMinutes(openTime);
  const closeMin = parseTimeToMinutes(closeTime);

  let open_status;
  let close_status;
  let is_online;

  if (openMin <= closeMin) {
    open_status = current < openMin;
    close_status = current < closeMin;
    is_online = current >= openMin && current <= closeMin;
  } else {
    open_status = current < openMin && current > closeMin;
    close_status = current <= closeMin || current >= openMin;
    is_online = current >= openMin || current <= closeMin;
  }

  return { is_online, open_status, close_status };
}

/**
 * Check if a market is currently online (within open_time - close_time window)
 */
function isMarketOnline(openTime, closeTime, now = new Date()) {
  const { is_online } = getMarketStatus(openTime, closeTime);
  return is_online;
}

module.exports = {
  getCurrentMinutesIST,
  getMarketStatus,
  isMarketOnline,
};

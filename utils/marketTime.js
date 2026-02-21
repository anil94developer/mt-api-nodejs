/**
 * Get current time in India (IST) as minutes since midnight.
 * IST = UTC + 5:30. Market open/close times in DB are in IST.
 */
function getCurrentMinutesIST() {
  const now = new Date();
  const utcMin = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60;
  const istMin = utcMin + 5 * 60 + 30;
  const minutesPerDay = 24 * 60;
  const wrapped = ((istMin % minutesPerDay) + minutesPerDay) % minutesPerDay;
  return wrapped;
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
function getCurrentMinutesIST() {
  const now = new Date();

  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  return istTime.getHours() * 60 + istTime.getMinutes();
}

function parseTimeToMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function getCurrentMinutesIST() {
  const now = new Date();

  // Convert to IST safely
  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  return ist.getHours() * 60 + ist.getMinutes();
}

function parseTimeToMinutes(time) {
  // Expecting 24-hour format: "HH:mm"
  const [hours, minutes] = time.split(":").map(Number);

  if (
    isNaN(hours) || isNaN(minutes) ||
    hours < 0 || hours > 23 ||
    minutes < 0 || minutes > 59
  ) {
    throw new Error("Invalid 24-hour time format. Use HH:mm");
  }

  return hours * 60 + minutes;
}

function getMarketStatus(openTime, closeTime) {
  if (!openTime || !closeTime) {
    return { is_online: false, open_status: false, close_status: false };
  }

  const current = getCurrentMinutesIST();
  const openMin = parseTimeToMinutes(openTime);
  const closeMin = parseTimeToMinutes(closeTime);

  let is_online=true;

  // Normal timing (example: 10:00 → 18:00)
  // if (openMin < closeMin) {
  //   is_online = current < openMin && current < closeMin;
  // }
  // // Overnight timing (example: 22:00 → 02:00)
  // else {
    is_online = current < closeMin;
  // }
console.log(is_online,current, openMin, closeMin);
  return {
    is_online,
    open_status: current < openMin,
    close_status: current < closeMin
  };
}
/**
 * Check if a market is currently online (within open_time - close_time window)
 */
function isMarketOnline(openTime, closeTime, now = new Date()) {
  const { is_online } = getMarketStatus(openTime, closeTime);
  console.log(is_online);
  return is_online;
}

module.exports = {
  getCurrentMinutesIST,
  getMarketStatus,
  isMarketOnline,
};

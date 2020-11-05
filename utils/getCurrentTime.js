// returns current local ISO time
function getCurrentISOTime(timezoneOffset = -32400000) { // offset in milliseconds (default to KOR)
  // return format: yyyy-mm-dd hh:mm:ss
  return (new Date(Date.now() - timezoneOffset)).toISOString().replace('T', ' ').slice(0, 19);
}

module.exports = getCurrentISOTime;
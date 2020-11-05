// returns current local ISO time
function getCurrentISOTime(timezoneOffset) { // offset in milliseconds
  // return format: yyyy-mm-dd hh:mm:ss
  return (new Date(Date.now() - timezoneOffset)).toISOString().replace('T', ' ').slice(0, 19);
}

module.exports = getCurrentISOTime;
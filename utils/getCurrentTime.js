// returns current local ISO time
function getCurrentISOTime() {
  const timezoneOffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  // return format: yyyy-mm-dd hh:mm:ss
  return (new Date(Date.now() - timezoneOffset)).toISOString().replace('T', ' ').slice(0, 19);
}

module.exports = getCurrentISOTime;
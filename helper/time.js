const moment = require("moment");

module.exports = {
  addExpirey: (time, minutes) => {
    return moment(time).add(minutes, "minute");
  },
  isTimeExp: (exptime, createdtime) => {
    return moment(createdtime).isAfter(exptime);
  },
};

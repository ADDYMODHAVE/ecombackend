const moment = require("moment-timezone");

module.exports = {
  response: (responseData, responseCode, responseMessage) => {
    return {
      responseMessage,
      responseCode,
      responseStatus: responseCode === 1 ? "Success" : "Error",
      showMessage: true,
      response: responseData,
    };
  },

  time: () => {
    return moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
  },
};

const mongoose = require("mongoose");

async function connectToDb() {
  await mongoose
    .connect(`${process.env.MONGO_URL}`, {
      authSource: "admin",
    })
    .then(() => {
      console.log("Mongo DB is connected=>ecom");
    })
    .catch(() => {
      console.log("Failed to connect DB");
    });
}

module.exports = connectToDb;

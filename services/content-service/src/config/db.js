const mongoose = require("mongoose");
const { env } = require("./env");

async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI, {
    autoIndex: true
  });
  console.log("[mongo] connected");
}

async function disconnectDb() {
  await mongoose.disconnect();
  console.log("[mongo] disconnected");
}

module.exports = { connectDb, disconnectDb };

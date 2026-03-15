// src/config/db.js
const mongoose = require("mongoose");

async function connectMongo(uri) {
  if (!uri) throw new Error("MONGO_URI is required");

  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    console.log("[mongo] connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[mongo] error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[mongo] disconnected");
  });

  await mongoose.connect(uri, {
    autoIndex: true,  
    serverSelectionTimeoutMS: 10000
  });

  return mongoose.connection;
}

async function disconnectMongo() {
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
}

module.exports = { connectMongo, disconnectMongo };

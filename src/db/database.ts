import mongoose from "mongoose";

export async function connectToDb() {
  if (process.env.DB_CONNECTION_STRING === undefined) {
    throw new Error(
      "DB_CONNECTION_STRING is not defined in environment variables",
    );
  }
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("Database connected successfully");
  } catch (err) {
    throw new Error(`Connecting to database failed: ${err}`);
  }
}

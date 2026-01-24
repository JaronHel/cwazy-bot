import mongoose from "mongoose";

export default async function connectToDb() {
  if (process.env.DB_CONNECTION_STRING === undefined) {
    throw new Error(
      "DB_CONNECTION_STRING is not defined in environment variables",
    );
  }
  await mongoose.connect(process.env.DB_CONNECTION_STRING);
}

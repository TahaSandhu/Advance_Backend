import mongoose from "mongoose";
import { DATABASE_NAME } from "../constants.js";

// mongo db return object please console connectioninstant for better knowledge
const connectDataBase = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DATABASE_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST:${connectionInstance.connection.host}  `
    );
  } catch (error) {
    console.error("MONGO DB connection error", error);
    process.exit(1);
  }
};

export default connectDataBase;

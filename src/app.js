import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// read more about cors for further info
// now set configration when i get data from url
// use when we need some pdf or images so here it is store

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

export default app;

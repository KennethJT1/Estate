import express from "express";
import cors from "cors";
import morgan from "morgan";
import { DATABASE } from "./config";
import mongoose from "mongoose";
import authRoute from "./routes/auth"
import adRoute from "./routes/ad"


const app = express();

mongoose.set("strictQuery", false);
mongoose
  .connect(DATABASE)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error(err));

app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(cors());

app.use("/", authRoute)
app.use("/", adRoute)

const port = process.env.PORT || 3166;

app.listen(port, () =>
  console.log(`Estate server listening on http://localhost:${port}`)
);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/api", routes);       


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

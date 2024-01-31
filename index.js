import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./connectMongoDB.js";
import userRoutes from "./routes/userRoutes.js"
import notesRoutes from "./routes/notesRoutes.js"

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/user',userRoutes);
app.use('/notes',notesRoutes);

// app.use('/',(req, res) => {
//     res.send("This is an Note Application Project !!!")
// })

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
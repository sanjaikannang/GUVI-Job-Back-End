import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Import the User model

const auth = async (req, res, next) => {
  let token;
  if (req.headers) {
    try {
      token = req.headers["x-auth-token"];
      const decodeData = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decodeData?.id;
      req.user = await User.findById(req.userId); // Use the correct model name
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error!!!" });
    }
  }
};

export default auth;

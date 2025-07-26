import  jwt  from 'jsonwebtoken';
import ApiError from '../utils/apiErrors.js';

export const VerifyUser = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized Request" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    req.user = decoded;
    next();
  } catch (error) {
    throw new ApiError(403,error?.message ||"Invalid token");
  }
}


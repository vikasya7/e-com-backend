import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";



export const verifyAdmin = asyncHandler(async (req, res, next) => {

  if (!req.user) {
    throw new ApiError(401, "Not logged in");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin only access");
  }

  next();
});
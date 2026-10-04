import { Router } from "express";
import {
  register,
  login,
  uploadProfilePicture,
  updateUserProfile,
  getUserAndProfile,
  updateProfileData,
  getAllUserProfile,
  downloadProfile,
  ConnectionRequest,
  getMyConnectionsRequests,
  whatAreMyConnection,
  acceptConnectionRequest,
  getUserProfileAndUserBasedOnUsername,
} from "../controllers/user.controller.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router
  .route("/update_profile_picture")
  .post(upload.single("profile_picture"), uploadProfilePicture);

router.post("/register", register);
router.post("/login", login);
router.post("/user_update", updateUserProfile);
router.get("/get_user_and_profile", getUserAndProfile);
router.post("/update_profile_data", updateProfileData);
router.get("/user/get_all_users", getAllUserProfile);
router.get("/user/download_resume", downloadProfile);
router.post("/user/send_connection_request", ConnectionRequest);
router.get("/user/user_connection_request", getMyConnectionsRequests);
router.get("/user/getConnectionRequests", whatAreMyConnection);
router.post("/user/accept_connection_request", acceptConnectionRequest);
router.get("/user/get_profile_based_on_username", getUserProfileAndUserBasedOnUsername);



export default router;

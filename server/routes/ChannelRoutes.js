import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  createChannel,
  getChannelMessages,
  getUserChannels,
  joinChannel,
  leaveChannel,
  getAllChannels,
  getChannelDetails,
} from "../controllers/ChannelController.js";
const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);
channelRoutes.get(
  "/get-channel-messages/:channelId",
  verifyToken,
  getChannelMessages
);
channelRoutes.post("/join-channel/:channelId", verifyToken, joinChannel);
channelRoutes.post("/leave-channel/:channelId", verifyToken, leaveChannel);
channelRoutes.get("/get-all-channels", verifyToken, getAllChannels);
channelRoutes.get(
  "/get-channel-details/:channelId",
  verifyToken,
  getChannelDetails
);

export default channelRoutes;

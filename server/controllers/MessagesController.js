import Message from "../models/MessagesModel.js";
import { mkdirSync, renameSync } from "fs";

export const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 20;
    const skip = (page - 1) * limit;

    if (!user1 || !user2) {
      return res.status(400).send("Both user ID's are requried.");
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    });

    const hasMore = skip + messages.length < totalMessages;

    return res.status(200).json({
      messages: messages.reverse(),
      hasMore,
      currentPage: page,
      totalMessages,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required.");
    }

    const date = Date.now();
    let fileDir = `uploads/files/${date}`;

    mkdirSync(fileDir, { recursive: true });

    const sanitizedFileName = req.file.originalname.replace(/\s+/g, "_");
    const fileName = `uploads/files/${date}/${sanitizedFileName}`;

    // mkdirSync(fileDir, { recursive: true });

    renameSync(req.file.path, fileName);

    return res.status(200).json({ filePath: fileName });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

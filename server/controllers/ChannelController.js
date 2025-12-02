import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";
import Message from "../models/MessagesModel.js";

export const createChannel = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;

    const admin = await User.findById(userId);

    if (!admin) {
      return res.status(400).send("Admin user not found.");
    }

    const validMembers = await User.find({ _id: { $in: members } });

    if (validMembers.length !== members.length) {
      return res.status(400).send("Some members are not valid users.");
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();

    return res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserChannels = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    })
      .populate("admin", "firstName lastName email _id image color")
      .populate("members", "firstName lastName email _id image color")
      .sort({ updatedAt: -1 });

    // Add memberCount for each channel
    const channelsWithCount = channels.map((channel) => ({
      ...channel.toObject(),
      memberCount: channel.members.length + 1, // +1 for admin
    }));

    return res.status(201).json({ channels: channelsWithCount });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).send("Channel not found.");
    }

    const messages = await Message.find({ _id: { $in: channel.messages } })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "firstName lastName email _id image color");

    const totalMessages = channel.messages.length;
    const hasMore = skip + messages.length < totalMessages;

    return res.status(201).json({
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

export const joinChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.userId;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).send("Channel not found.");
    }

    if (channel.members.includes(userId)) {
      return res.status(400).send("User is already a member of this channel.");
    }

    channel.members.push(userId);
    await channel.save();

    const updatedChannel = await Channel.findById(channelId)
      .populate("members", "firstName lastName email _id image color")
      .populate("admin", "firstName lastName email _id image color");

    const channelWithCount = {
      ...updatedChannel.toObject(),
      memberCount: updatedChannel.members.length + 1, // +1 for admin
    };

    return res.status(200).json({ channel: channelWithCount });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const leaveChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.userId;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).send("Channel not found.");
    }

    if (channel.admin.toString() === userId) {
      return res
        .status(400)
        .send(
          "Admin cannot leave the channel. Transfer admin rights or delete the channel."
        );
    }

    if (!channel.members.includes(userId)) {
      return res.status(400).send("User is not a member of this channel.");
    }

    channel.members = channel.members.filter(
      (member) => member.toString() !== userId
    );
    await channel.save();

    return res.status(200).json({ message: "Successfully left the channel" });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getAllChannels = async (req, res, next) => {
  try {
    const channels = await Channel.find({})
      .populate("members", "firstName lastName email _id image color")
      .populate("admin", "firstName lastName email _id image color")
      .sort({ createdAt: -1 });

    return res.status(200).json({ channels });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getChannelDetails = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.userId;

    const channel = await Channel.findById(channelId)
      .populate("members", "firstName lastName email _id image color")
      .populate("admin", "firstName lastName email _id image color");

    if (!channel) {
      return res.status(404).send("Channel not found.");
    }

    const isUserMember =
      channel.members.some((member) => member._id.toString() === userId) ||
      channel.admin._id.toString() === userId;

    const channelData = {
      _id: channel._id,
      name: channel.name,
      admin: channel.admin,
      memberCount: channel.members.length + 1, // +1 for admin
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
      isUserMember,
      isUserAdmin: channel.admin._id.toString() === userId,
      members: isUserMember ? channel.members : null, // Only show members if user is a member
    };

    return res.status(200).json({ channel: channelData });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

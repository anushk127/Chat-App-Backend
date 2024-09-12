import { TryCatch } from '../middlewares/error.js';
import { Chat } from '../models/chat.js';
import { Message } from '../models/message.js';
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import { cookieOptions } from '../utils/features.js';
import { adminSecretKey } from '../app.js';

const adminLogin = TryCatch(async (req, res, next) => {
  const { secretKey } = req.body;

  const isMatch = secretKey === adminSecretKey;

  if (!isMatch) {
    return next(new Error('Invalid Secret Key', 401));
  }

  const token = jwt.sign(secretKey, process.env.JWT_SECRET);

  return res
    .status(200)
    .cookie('anushk-admin-token', token, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 15,
    })
    .json({
      success: true,
      message: 'Authenticated Succesfully',
    });
});

const allUsers = TryCatch(async (req, res) => {
  const users = await User.find({});

  const transformedUsers = await Promise.all(
    users.map(async ({ name, username, avatar, _id }) => {
      const [groups, friends] = await Promise.all([
        Chat.countDocuments({ groupChat: true, members: _id }),
        Chat.countDocuments({ groupChat: false, members: _id }),
      ]);

      return {
        name,
        username,
        avatar: avatar.url,
        _id,
        groups,
        friends,
      };
    })
  );

  return res.status(200).json({
    success: true,
    users: transformedUsers,
  });
});

const allChats = TryCatch(async (req, res) => {
  const chats = await Chat.find({})
    .populate('members', 'name avatar')
    .populate('creator', 'name avatar');

  const tranformedChats = await Promise.all(
    chats.map(async ({ members, _id, groupChat, name, creator }) => {
      const totalMessages = await Message.countDocuments({ chat: _id });

      return {
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map((member) => member.avatar.url),
        members: members.map(({ _id, name, avatar }) => ({
          _id,
          name,
          avatar: avatar.url,
        })),
        creator: {
          name: creator?.name || 'None',
          avatar: creator?.avatar.url || '',
        },
        totalMembers: members.length,
        totalMessages,
      };
    })
  );

  return res.status(200).json({
    success: true,
    tranformedChats,
  });
});

const allMessages = TryCatch(async (req, res) => {
  const messages = await Message.find({})
    .populate('sender', 'name avatar')
    .populate('chat', 'groupChat');

  const transformedMessages = messages.map(
    ({ _id, sender, chat, content, createdAt, attachments }) => ({
      _id,
      attachments,
      sender: {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar.url,
      },
      chat: chat._id,
      groupChat: chat.groupChat,
      content,
      createdAt,
    })
  );

  return res.status(200).json({
    success: true,
    transformedMessages,
  });
});

const getDashboardStats = TryCatch(async (req, res) => {
  const [groupsCount, usersCount, messagesCount, totalChatsCount] =
    await Promise.all([
      Chat.countDocuments({ groupChat: true }),
      User.countDocuments(),
      Message.countDocuments(),
      Chat.countDocuments(),
    ]);

  const today = new Date();

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const lastWeekMessages = await Message.find({
    createdAt: { $gte: lastWeek, $lte: today },
  }).select('createdAt');

  const messages = new Array(7).fill(0);

  lastWeekMessages.forEach((message) => {
    const index = Math.floor(
      (today.getTime() - message.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    messages[6 - index]++;
  });

  const stats = {
    groupsCount,
    usersCount,
    messagesCount,
    totalChatsCount,
    messagesChart: messages,
  };
  return res.status(200).json({
    success: true,
    stats,
  });
});

const adminLogout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie('anushk-admin-token', '', {
      ...cookieOptions,
      maxAge: 0,
    })
    .json({ success: true, message: 'Logged Out Successfully' });
});

const getAdminData = TryCatch(async (req, res, next) => {
  return res.status(200).json({
    admin: true,
  });
});

export {
  allUsers,
  allChats,
  allMessages,
  getDashboardStats,
  adminLogin,
  adminLogout,
  getAdminData,
};

import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/utility.js';
import { adminSecretKey } from '../app.js';
import { ANUSHK_TOKEN } from '../constants/config.js';
import { User } from '../models/user.js';

const isAuthenticated = async (req, res, next) => {
  const token = req.cookies[ANUSHK_TOKEN];

  if (!token) {
    return next(new ErrorHandler('Please login to access this route', 401));
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodedData._id;

  next();
};

const admin = async (req, res, next) => {
  const token = req.cookies['anushk-admin-token'];

  if (!token) {
    return next(new ErrorHandler('Only Admin can access this route', 401));
  }
  const secretKey = jwt.verify(token, process.env.JWT_SECRET);

  const isMatch = secretKey === adminSecretKey;

  if (!isMatch) {
    return next(new Error('Only Admin can access this route', 401));
  }

  next();
};

const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authToken = socket.request.cookies[ANUSHK_TOKEN];

    if (!authToken) {
      return next(new ErrorHandler('Please login to access this route', 401));
    }

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await User.findById(decodedData._id);

    if (!user) {
      return next(new ErrorHandler('Please login to access this route', 401));
    }

    socket.user = user;

    return next();
  } catch (error) {
    return next(new ErrorHandler('Please login to access this route', 401));
  }
};

export { isAuthenticated, admin, socketAuthenticator };

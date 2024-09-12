import express from 'express';
import {
  acceptRequest,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendRequest,
} from '../controllers/user.js';
import {
  acceptRequestValidator,
  loginValidator,
  registerValidator,
  sendRequestValdiator,
  validateHandler,
} from '../lib/validators.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { singleAvatar } from '../middlewares/multer.js';

const app = express.Router();

app.post('/new', singleAvatar, registerValidator(), validateHandler, newUser);

app.post('/login', loginValidator(), validateHandler, login);

// user must be logged in to access this route
app.use(isAuthenticated);

app.get('/me', getMyProfile);

app.get('/logout', logout);

app.get('/search', searchUser);

app.put('/sendrequest', sendRequestValdiator(), validateHandler, sendRequest);

app.put(
  '/acceptrequest',
  acceptRequestValidator(),
  validateHandler,
  acceptRequest
);

app.get('/notifications', getMyNotifications);

app.get('/friends', getMyFriends);

export default app;

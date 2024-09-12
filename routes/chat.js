import express from 'express';

import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachments,
} from '../controllers/chat.js';
import {
  addMemberValidator,
  chatIdValidator,
  newGroupValidator,
  removeMemberValidator,
  renameValidator,
  sendAttachmentsValidator,
  validateHandler,
} from '../lib/validators.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { attachmentsMulter } from '../middlewares/multer.js';

const app = express.Router();

// user must be logged in to access this route
app.use(isAuthenticated);

app.post('/new', newGroupValidator(), validateHandler, newGroupChat);

app.get('/my', getMyChats);

app.get('/my/groups', getMyGroups);

app.put('/addmembers', addMemberValidator(), validateHandler, addMembers);

app.put(
  '/removemember',
  removeMemberValidator(),
  validateHandler,
  removeMember
);

app.delete('/leave/:id', leaveGroup);

app.post(
  '/message',
  attachmentsMulter,
  sendAttachmentsValidator(),
  validateHandler,
  sendAttachments
);

app.get('/message/:id', chatIdValidator(), validateHandler, getMessages);

app
  .route('/:id')
  .get(chatIdValidator(), validateHandler, getChatDetails)
  .put(renameValidator(), validateHandler, renameGroup)
  .delete(chatIdValidator(), validateHandler, deleteChat);

export default app;

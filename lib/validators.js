import { body, param, validationResult } from 'express-validator';
import { ErrorHandler } from '../utils/utility.js';

const validateHandler = (req, res, next) => {
  const errors = validationResult(req);

  const errorMessage = errors
    .array()
    .map((error) => error.msg)
    .join(', ');

  if (errors.isEmpty()) {
    return next();
  } else next(new ErrorHandler(errorMessage, 400));
};

const registerValidator = () => [
  body('name', 'Please Enter Name').notEmpty(),
  body('username', 'Please Enter Username').notEmpty(),
  body('bio', 'Please Enter Bio').notEmpty(),
  body('password', 'Please Enter Password').notEmpty(),
];

const loginValidator = () => [
  body('username', 'Please Enter Username').notEmpty(),

  body('password', 'Please Enter Password').notEmpty(),
];

const newGroupValidator = () => [
  body('name', 'Please Enter Name').notEmpty(),

  body('members')
    .notEmpty()
    .withMessage('Please Enter Message')
    .isArray({ min: 2, max: 100 })
    .withMessage('Members should be between 2 and 100'),
];

const addMemberValidator = () => [
  body('chatId', 'Please Enter Chat ID').notEmpty(),
  body('members')
    .notEmpty()
    .withMessage('Please Enter Message')
    .isArray({ min: 1, max: 97 })
    .withMessage('Members should be between 1 and 97'),
];

const removeMemberValidator = () => [
  body('chatId', 'Please Enter Chat ID').notEmpty(),
  body('userId', 'Please Enter User ID').notEmpty(),
];

const sendAttachmentsValidator = () => [
  body('chatId', 'Please Enter Chat ID').notEmpty(),
];

const chatIdValidator = () => [param('id', 'Please Enter Chat ID').notEmpty()];

const renameValidator = () => [
  param('id', 'Please Enter Chat ID').notEmpty(),
  body('name', 'Please Enter New Name').notEmpty(),
];

const sendRequestValdiator = () => [
  body('userId', 'Please Enter User ID').notEmpty(),
];

const acceptRequestValidator = () => [
  body('requestId', 'Please Enter Request ID').notEmpty(),
  body('accept')
    .notEmpty('Please Add Accept')
    .withMessage()
    .isBoolean()
    .withMessage('Accept should be a boolean'),
];

const adminLoginValidator = () => [
  body('secretKey', 'Please Enter Secret Key').notEmpty(),
];

export {
  acceptRequestValidator,
  addMemberValidator,
  adminLoginValidator,
  chatIdValidator,
  loginValidator,
  newGroupValidator,
  registerValidator,
  removeMemberValidator,
  renameValidator,
  sendAttachmentsValidator,
  sendRequestValdiator,
  validateHandler,
};

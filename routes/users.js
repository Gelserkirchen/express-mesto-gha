const userRouter = require('express').Router();
const {
  getUsers, getUsersById, updateAvatar, updateProfile, getMe,
} = require('../controllers/users');

userRouter.get('/', getUsers);
userRouter.get('/me', getMe);
userRouter.get('/:userId', getUsersById);

userRouter.patch('/me', updateProfile);
userRouter.patch('/me/avatar', updateAvatar);

module.exports = userRouter;

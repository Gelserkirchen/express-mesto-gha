const userRouter = require('express').Router();
const {
  getUsers, getUsersById, createUser, updateAvatar, updateProfile,
} = require('../controllers/users');

userRouter.post('/users', createUser);
userRouter.get('/users', getUsers);
userRouter.get('/users/:userId', getUsersById);

userRouter.patch('/users/me', updateProfile);
userRouter.patch('/users/me/avatar', updateAvatar);

module.exports = userRouter;

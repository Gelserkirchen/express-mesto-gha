const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const express = require('express');

const {
  getUsers, getUsersById, updateAvatar, updateProfile, getMe,
} = require('../controllers/users');

userRouter.get('/', getUsers);
userRouter.get('/me', getMe);
userRouter.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUsersById);

userRouter.patch('/me', express.json(), celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  }),
}), updateProfile);

userRouter.patch('/me/avatar', express.json(), celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().uri({ scheme: ['http', 'https'] }),
  }),
}), updateAvatar);

module.exports = userRouter;

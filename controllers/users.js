const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const user = require('../models/user');
const {
  OK, SERVER_ERROR,
} = require('../utils/constants');
const ConflictError = require('../errors/ConflictError');

exports.getUsers = (req, res, next) => {
  user.find({}).then((users) => {
    res.status(OK).send(users);
  }).catch(next);
};

exports.getMe = (req, res, next) => {
  // eslint-disable-next-line consistent-return
  user.findOne({ _id: req.user._id }).then((userData) => {
    if (!userData) {
      return next(new NotFoundError('Пользователь не найден.'));
    }
    res.status(OK).send(userData);
  }).catch((err) => {
    if (err.name === 'CastError') {
      next(new BadRequestError('Некорректный id'));
    } else {
      next(err);
    }
  });
};

exports.getUsersById = (req, res, next) => {
  // eslint-disable-next-line consistent-return
  user.findOne({ _id: req.params.userId }).then((userData) => {
    if (!userData) {
      return next(new NotFoundError('Пользователь по указанному _id не найден.'));
    }
    res.status(OK).send(userData);
  }).catch((err) => {
    if (err.name === 'CastError') {
      next(new BadRequestError('Некорректный id'));
    } else {
      next(err);
    }
  });
};

exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email,
  } = req.body;

  bcrypt.hash(req.body.password, 10).then((hash) => user.create({
    name, about, avatar, email, password: hash,
  }))
    .then((userData) => {
      res.send({
        name: userData.name,
        about: userData.about,
        avatar: userData.avatar,
        email: userData.email,
        // id: userData._id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      } else if (err.code === 11000) {
        next(new ConflictError('Такой email уже используется'));
      } else {
        res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  user.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((userData) => {
      if (!userData) {
        next(new NotFoundError('Пользователь с указанным _id не найден.'));
      } else {
        res.status(OK).send({ data: userData });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      } else {
        res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  user.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((userData) => {
      if (!userData) {
        next(new NotFoundError('Пользователь с указанным _id не найден.'));
      } else {
        res.send({ data: userData });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении аватара.'));
      } else {
        res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return user.findUserByCredentials(email, password)
    .then((userData) => {
      const token = jwt.sign(
        { _id: userData._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );

      res.cookie('jwt', token, {
        maxAge: 3600000 * 161,
        httpOnly: true,
        sameSite: true,
      }).send({ message: 'Вы авторизовались' });
    })
    .catch(() => {
      next(new UnauthorizedError('Некорректные почта или пароль'));
    });
};

const jwt = require('jsonwebtoken');
const user = require('../models/user');
const {
  OK, BAD_REQUEST, SERVER_ERROR, NOT_FOUND,
} = require('../utils/constants');

exports.getUsers = (req, res) => {
  user.find({}).then((users) => {
    res.status(OK).send(users);
  }).catch((err) => res.status(SERVER_ERROR).send({ message: err.message }));
};

exports.getUsersById = (req, res) => {
  user.findOne({ _id: req.params.userId }).then((userData) => {
    if (!userData) { res.status(NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден.' }); } else {
      res.status(OK).send(userData);
    }
  }).catch((err) => {
    if (err.name === 'CastError') {
      res.status(BAD_REQUEST).send({ message: 'Пользователь по указанному _id не найден.' });
    } else {
      res.status(SERVER_ERROR).send({ message: err.message });
    }
  });
};

exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  user.create({
    name, about, avatar, email, password,
  })
    .then((userData) => {
      res.send({ data: userData });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

exports.updateProfile = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  user.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((userData) => {
      if (!userData) {
        res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      } else {
        res.status(OK).send({ data: userData });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  user.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((userData) => {
      if (!userData) {
        res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      } else {
        res.send({ data: userData });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      } else {
        res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  return user.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );

      res.send({ token });
    })
    .catch((err) => {
      // ошибка аутентификации
      res
        .status(401)
        .send({ message: err.message });
    });
};

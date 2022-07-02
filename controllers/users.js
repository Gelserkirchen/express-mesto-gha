const user = require('../models/user');

exports.getUsers = (req, res) => {
  user.find({}).then((users) => {
    res.status(200).send(users)
  }).catch(err => res.status(500).send({ message: err.message }));
};

exports.getUsersById = (req, res) => {
  user.findOne({ _id: req.params.userId }).then((userData) => {
    if (!userData) { res.status(404).send({ message: 'Пользователь по указанному _id не найден.' }) } else {
      res.status(200).send(userData);
    }
  }).catch(err => res.status(500).send({ message: err.message }));
};

exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  user.create({ name, about, avatar })
    .then(userData => {
      res.send({ data: userData })
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

exports.updateProfile = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  user.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then(userData => {
      if (!userData) {
        res.status(404).send({ message: 'Пользователь с указанным _id не найден.' });
      } else {
        res.send({ data: userData })
      }
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  user.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then(userData => {
      if (!userData) {
        res.status(404).send({ message: 'Пользователь с указанным _id не найден.' });
      } else {
        res.send({ data: userData })
      }
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};
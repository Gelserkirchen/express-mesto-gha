const { ObjectId } = require('mongoose').Types;
const card = require('../models/card');
const {
  BAD_REQUEST, NOT_FOUND, OK, SERVER_ERROR,
} = require('../utils/constants');

exports.createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;

  card.create({ name, link, owner })
    .then((createdCard) => res.status(OK).send({ data: createdCard }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

exports.getCards = (req, res) => {
  card.find({}).then((cards) => {
    res.status(OK).send(cards);
  }).catch((err) => {
    res.status(SERVER_ERROR).send({ message: err.message });
  });
};

exports.deleteCardById = (req, res) => {
  const { cardId } = req.params;

  card.findByIdAndRemove(cardId).then((deletedCard) => {
    if (!deletedCard) {
      res.status(NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
    } else {
      res.status(OK).send({ deletedCard });
    }
  }).catch((err) => {
    if (!ObjectId.isValid(cardId)) {
      res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для удаления карточки' });
    } else {
      res.status(SERVER_ERROR).send({ message: err.message });
    }
  });
};

exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  const { _id } = req.user;

  card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: _id } },
    { new: true, runValidators: true },
  )
    .orFail(() => { throw new Error('ReferenceError'); })
    .then((cardData) => res.status(200).send({ cardData }))
    .catch((err) => {
      if (!ObjectId.isValid(cardId)) {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
      } else if (err.name === 'ReferenceError') {
        res.status(NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
      } else {
        res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  const { _id } = req.user;

  card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: _id } }, // убрать _id из массива
    { new: true, runValidators: true },
  )
    .orFail(() => { throw new Error('ReferenceError'); })
    .then((cardData) => { res.status(OK).send({ cardData }); })
    .catch((err) => {
      if (!ObjectId.isValid(cardId)) {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
      } else if (err.name === 'ReferenceError') {
        res.status(NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
      } else {
        res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

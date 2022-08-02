const { ObjectId } = require('mongoose').Types;
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const card = require('../models/card');
const {
  OK, SERVER_ERROR,
} = require('../utils/constants');

exports.createCard = (req, res, next) => {
  const owner = req.user._id;
  const { name, link } = req.body;

  card.create({ name, link, owner })
    .then((createdCard) => res.status(OK).send({ data: createdCard }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки.'));
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

exports.deleteCardById = (req, res, next) => {
  const { cardId } = req.params;

  card.findByIdAndRemove(cardId).then((deletedCard) => {
    if (!deletedCard) {
      next(new NotFoundError('Карточка с указанным _id не найдена.'));
    } else if (deletedCard.owner !== req.user._id) {
      next(new ConflictError('У вас нет прав удалять карточку.'));
    } else {
      res.status(OK).send({ deletedCard });
    }
  }).catch((err) => {
    if (!ObjectId.isValid(cardId)) {
      next(new BadRequestError('Переданы некорректные данные для удаления карточки'));
    } else {
      res.status(SERVER_ERROR).send({ message: err.message });
    }
  });
};

exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;
  const { _id } = req.user;

  card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: _id } },
    { new: true, runValidators: true },
  )
    .orFail(() => { throw new Error('ReferenceError'); })
    // eslint-disable-next-line consistent-return
    .then((cardData) => {
      if (!cardData) { return next(new NotFoundError('Передан несуществующий _id карточки')); }
      res.status(200).send({ cardData });
    })
    .catch((err) => {
      if (!ObjectId.isValid(cardId)) {
        next(new BadRequestError('Переданы некорректные данные для постановки лайка'));
      } else if (err.name === 'ReferenceError') {
        next(new NotFoundError('Передан несуществующий _id карточки'));
      } else {
        res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  const { _id } = req.user;

  card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: _id } },
    { new: true, runValidators: true },
  )
    .orFail(() => { throw new Error('ReferenceError'); })
    // eslint-disable-next-line consistent-return
    .then((cardData) => {
      if (!cardData) { return next(new NotFoundError('Передан несуществующий _id карточки')); }
      res.status(OK).send({ cardData });
    })
    .catch((err) => {
      if (!ObjectId.isValid(cardId)) {
        next(new BadRequestError('Переданы некорректные данные для постановки лайка'));
      } else if (err.name === 'ReferenceError') {
        next(new NotFoundError('Передан несуществующий _id карточки'));
      } else {
        res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

const { ObjectId } = require('mongoose').Types;
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
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
        next();
      }
    });
};

exports.getCards = (req, res) => {
  card.find({}).then((cards) => {
    res.status(OK).send(cards);
  }).catch((err) => {
    next();
  });
};

exports.deleteCardById = (req, res, next) => {
  const { cardId } = req.params;

  card.findById(cardId).then((deletedCard) => {
    if (!deletedCard) {
      next(new NotFoundError('Карточка с указанным _id не найдена.'));
    } else if (deletedCard.owner.toString() !== req.user._id) {
      next(new ForbiddenError('У вас нет прав удалять карточку.'));
    } else {
      card.findByIdAndRemove(cardId).then(
        () => {
          res.status(OK).send({ deletedCard });
        },
      );
    }
  }).catch((err) => {
    if (!ObjectId.isValid(cardId)) {
      next(new BadRequestError('Переданы некорректные данные для удаления карточки'));
    } else {
      next();
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
    .orFail(() => { next(new NotFoundError('Передан несуществующий _id карточки')); })
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
        next();
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
    .orFail(() => {
      next(new NotFoundError('Передан несуществующий _id карточки'));
    })
    // eslint-disable-next-line consistent-return
    .then((cardData) => {
      if (!cardData) { return next(new NotFoundError('Передан несуществующий _id карточки')); }
      res.status(OK).send({ cardData });
    })
    .catch((err) => {
      if (!ObjectId.isValid(cardId)) {
        next(new BadRequestError('Переданы некорректные данные для постановки лайка'));
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Передан несуществующий _id карточки'));
      } else {
        next();
      }
    });
};

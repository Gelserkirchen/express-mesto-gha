const card = require('../models/card');
const { ObjectId } = require('mongoose').Types;

exports.createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;

  card.create({ name, link, owner })
    .then(card => res.status(200).send({ data: card }))
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

exports.getCards = (req, res) => {
  card.find({}).then((cards) => {
    res.status(200).send(cards)
  }).catch(err => {
    res.status(500).send({ message: err.message });
  })
};

exports.deleteCardById = (req, res) => {
  const { cardId } = req.params;

  card.findByIdAndRemove(cardId).then((deletedCard) => {
    if (!deletedCard) {
      res.status(404).send( { message: 'Карточка с указанным _id не найдена.' } );
    } else {
      res.status(200).send( { deletedCard });
    }
  }).catch(err => {
    if (!ObjectId.isValid(cardId)) {
      res.status(400).send({ message: 'Переданы некорректные данные для удаления карточки'}) }
    else {
      res.status(500).send({ message: err.message });
    }
  })
};


exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  const { _id } = req.user;

  card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: _id} },
    { new: true, runValidators: true })
  .orFail(() => { throw new Error('ReferenceError')  })  
  .then(cardData => res.status(200).send( { cardData }))
  .catch(err => {
    if (!ObjectId.isValid(cardId)) {
      res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка'}) 
    } else if (err.name = 'ReferenceError') {
      res.status(404).send({ message: 'Передан несуществующий _id карточки' })
    } else {
      res.status(500).send({ message: err.message })
    }
  })
}

exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  const { _id } = req.user;

  card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: _id } }, // убрать _id из массива
    { new: true, runValidators: true })
    .orFail(() => { throw new Error('ReferenceError'); })  
    .then(cardData => { res.status(200).send( { cardData }) })
    .catch(err => {
      if (!ObjectId.isValid(cardId)) {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка'}) 
      } else if (err.name = 'ReferenceError') {
        res.status(404).send({ message: 'Передан несуществующий _id карточки' })
      } else {
        res.status(500).send({ message: err.message })
      }
    })
}
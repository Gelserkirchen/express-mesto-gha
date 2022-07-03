const card = require('../models/card');

exports.createCard = (req, res) => {
  const { name, link, owner } = req.body;

  card.create({ name, link, owner })
    .then(card => res.status(200).send({ card }))
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
    res.status(500).send({ message: err.message });
  })
};


exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  const { _id } = req.user;

  card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: _id} },
    { new: true, runValidators: true })
  .orFail(() => { throw new Error('ReferenceError'); })  
  .then(cardData => res.status(200).send( { cardData }))
  .catch(err => {
    if (err.name = 'ReferenceError') {
      res.status(404).send({ message: 'Передан несуществующий _id карточки' })
    } else if (err.name = 'CastError') {
      res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка'  })
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
    .then(cardData => { 
      if (cardData) { res.status(200).send( { cardData }) }
    })
    .catch(err => {
    if (err.name = 'ReferenceError') {
      res.status(404).send({ message: 'Передан несуществующий _id карточки' })
    } else if (err.name = 'CastError') {
      res.status(400).send({ message: 'Переданы некорректные данные для снятия лайка'  })
    } else {
      res.status(500).send({ message: err.message })
    }
  })
}
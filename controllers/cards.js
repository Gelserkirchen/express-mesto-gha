const card = require('../models/card');

exports.createCard = (req, res) => {
  const { name, link, owner } = req.body;

  card.create({ name, link, owner })
    .then(user => res.send({ data: user }))
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

exports.getCardById = (req, res) => {
  card.findOne({ _id: req.params.id }).then((selectedCard) => {
    res.status(200).send(selectedCard);
  })
};

exports.likeCard = (req, res) => card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
  { new: true },
)

exports.dislikeCard = (req, res) => card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } }, // убрать _id из массива
  { new: true },
)
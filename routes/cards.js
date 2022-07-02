const cardsRouter = require('express').Router();
const {
  createCard, getCards, getCardById, likeCard, dislikeCard,
} = require('../controllers/cards');

cardsRouter.post('/cards', createCard);
cardsRouter.get('/cards', getCards);
cardsRouter.delete('/card/:cardId', getCardById);

cardsRouter.put('/cards/:cardId/likes', likeCard);
cardsRouter.delete('/cards/:cardId/likes', dislikeCard)

module.exports = cardsRouter
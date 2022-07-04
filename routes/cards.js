const cardsRouter = require('express').Router();
const {
  createCard, getCards, deleteCardById, likeCard, dislikeCard,
} = require('../controllers/cards');

cardsRouter.post('/cards', createCard);
cardsRouter.get('/cards', getCards);
cardsRouter.delete('/cards/:cardId', deleteCardById);

cardsRouter.put('/cards/:cardId/likes', likeCard);
cardsRouter.delete('/cards/:cardId/likes', dislikeCard);

module.exports = cardsRouter;

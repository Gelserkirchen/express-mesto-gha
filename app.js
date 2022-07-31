const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const userRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const NotFoundError = require('./errors/NotFoundError');
const auth = require('./middlewares/auth');
const {
  createUser, login,
} = require('./controllers/users');

const app = express();
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use('/', auth, userRouter);
app.use('/', auth, cardsRouter);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate(
  {
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().regex(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/),
      email: Joi.string().min(2).email(),
      password: Joi.string().min(2).min(2),
    }),
  },
), createUser);

app.use('*', (err, res, next) => {
  next(new NotFoundError('Карточка или пользователь на нейдены!'));
});

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

async function main() {
  await mongoose.connect('mongodb://localhost:27017/mestodb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app.listen(PORT, () => {
    // eslint-disable-next-line
    console.log(`App listening on port ${PORT}`);
  });
}

main();

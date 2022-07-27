const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const { NOT_FOUND } = require('./utils/constants');
const {
  createUser, login,
} = require('./controllers/users');

const app = express();
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = {
    _id: '62be69cfc11a786457b325a9',
  };

  next();
});

app.use('/', userRouter);
app.use('/', cardsRouter);
app.post('/signin', login);
app.post('/signup', createUser);

app.use((err, res) => {
  res.status(NOT_FOUND).send({ message: 'Карточка или пользователь на нейдены!' });
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

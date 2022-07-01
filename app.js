const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const userRouter = require('./routes/users');

const app = express();
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
// app.use(express.static(path.resolve(__dirname, 'build')));

app.use('/', userRouter);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});
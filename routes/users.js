const router = require('express').Router();
const path = require('path');
const fs = require('fs/promises');
const User = require('../models/user');

router.post('/users', (req, res) => { 
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .catch(err => res.status(500).send({ message: 'Произошла ошибка' }));
})

router.get('/users', (req, res) => {
  User.find({}).then((users) => {
    res.status(200).send(users)
  })
})

router.get('/users/:id', (req, res) => {
  User.findOne({ _id: req.params.id }).then((user) => {
    res.status(200).send(user)
  })
})

router.post('/users/', (req, res) => {
  console.log('reqbody: ', req.body);
})

module.exports = router
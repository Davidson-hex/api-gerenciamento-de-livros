const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/usuariosC');

router.post('/cadastro', usuariosController.postCadastro);

router.post('/login', usuariosController.postLogin);

module.exports = router;
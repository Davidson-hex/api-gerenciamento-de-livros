const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const livrosController = require('../controllers/livrosC');

router.get('/', livrosController.getLivros);

router.post('/', login, livrosController.postLivros);

router.get('/:id_livro', login, livrosController.getUmLivro);

router.post('/inativar/:id_livro', login, livrosController.postInativarLivro);

router.post('/ativar/:id_livro', login, livrosController.postAtivarLivro);

router.post('/locar/:id_livro', login, livrosController.postLocarLivro);

router.post('/devolver/:id_livro', login, livrosController.postDevolverLivro);

router.get('/historico/:id_usuario', login, livrosController.getHistoricoUm);

router.get('/movimentacao/todos', login, livrosController.getHistorico);

module.exports = router; 
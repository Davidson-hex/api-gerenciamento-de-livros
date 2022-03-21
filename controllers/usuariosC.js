const mysql = require("../mysql");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



exports.postCadastro = (req, res, next) => {
    if(req.body.nome == '' || typeof(req.body.nome) === 'undefined' || req.body.email == '' || typeof(req.body.email) === 'undefined' || req.body.senha == '' || typeof(req.body.senha) === 'undefined'){
        return res.status(422).send({
            error: 'Preencha os campos OBRIGATÓRIOS!'
        });
    }
    mysql.exec('SELECT * FROM usuarios WHERE email = ?', [req.body.email]).then((result) => {
        if (result.length > 0) {
            res.status(401).send({
                mensagem: 'Usuário já cadastrado',
                url: 'http://localhost:3000/usuarios/login'
            })
        }else {
            bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                if (errBcrypt) { return res.status(500).send({ error: errBcrypt})}
                mysql.exec(`INSERT INTO usuarios (nome, email, senha) VALUES (?,?,?)`, [req.body.nome, req.body.email, hash]).then((result) => {
                    response = {
                        mensagem: "Usuário criado com sucesso!",
                        nome: req.body.nome,
                        email: req.body.email,
                        id_usuario: result.insertId,
                        url: 'http://localhost:3000/usuarios/login'
                    }
                    return res.status(201).send({response});
                }).catch((error) =>{
                    return res.status(500).send({
                        error: error
                    });
                });
            });
        }
    }).catch((error) =>{
        return res.status(500).send({
            error: error
        });
    });

}

exports.postLogin = (req, res, next) => {
    if(req.body.email == '' || typeof(req.body.email) === 'undefined' || req.body.senha == '' || typeof(req.body.senha) === 'undefined'){
        return res.status(422).send({
            error: 'Preencha os campos OBRIGATÓRIOS!'
        });
    }
    mysql.exec('SELECT * FROM usuarios WHERE email = ?;', [req.body.email]).then((result) => {
        if(result.length < 1){
            return res.status(401).send({
                error: 'Dados incorretos, tente novamente!'
            });
        }
        bcrypt.compare(req.body.senha, result[0].senha, (err, results) =>{
            if(err){
                console.log(err)
                return res.status(401).send({
                    error: err
                });
            }
            if(results){
                const token = jwt.sign({ 
                    id: result[0].id,
                    email: result[0].email,
                    nome: result[0].nome
                },'secret', {
                    expiresIn: '1h'
                });
                return res.status(200).send({
                    mensagem: 'Autenticado com sucesso',
                    token: token
                });
            }
            return res.status(401).send({
                error: 'Dados incorretos, tente novamente!'
            });
        });
    }).catch((error) =>{
        console.log(error)
        return res.status(500).send({
            error: error
        });
    });
}
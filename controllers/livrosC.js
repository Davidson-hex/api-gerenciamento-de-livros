const mysql = require('../mysql');
const moment = require('moment');

const data = moment().format("YYYY-MM-DD");


exports.getLivros = async (req, res, next) => {
    try {
        await mysql.exec('SELECT * FROM livros;').then((result) => {
            if(result.length == 0) {
                return res.status(200).send({
                    mensagem: 'Não possui nenhum livro em estoque!'
                });
            } else {
                const response = {
                    total: result.length,
                    livros: result.map(livro => {
                        return {
                            id: livro.id,
                            autor: livro.autor,
                            titulo: livro.titulo
                        }
                    })
                }
                return res.status(200).send(response);
            }
        }).catch((error) =>{
            console.log(error)
            return res.status(500).send({
                error: error
            });
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            error: error
        });
    }
}

exports.postLivros = async (req, res, next) => {
    if(req.body.autor == '' || typeof(req.body.autor) === 'undefined' || req.body.titulo == '' || typeof(req.body.titulo) === 'undefined'){  
        return res.status(402).send({
            error: 'Preencha os campos OBRIGATÓRIOS!'
        });
    }
    mysql.exec(
        'INSERT INTO livros (titulo, autor, id_usuario_cadastro, ativo) VALUES (?,?,?, 1);',
        [req.body.titulo,req.body.autor,req.usuario.id]
    ).then((result) => {
        console.log(result)
        if (result) {
            res.status(201).send({
                mensagem: "Livro inserido com sucesso!",
                id_livro: result.insertId
            });
        }
    }).catch((error) =>{
        console.log(error)
        return res.status(500).send({
            error: error
        });
    });
}

exports.getUmLivro = (req, res, next) => {
    mysql.exec(
        'SELECT * FROM livros WHERE id = ?;',
        [req.params.id_livro]
    ).then((result) => {
        if (result.length == 0) {
            return res.status(404).send({
                mensagem: "Livro não encontrado!"
            });
        }
        const response = {
            id: result[0].id,
            autor: result[0].autor,
            titulo: result[0].titulo,
            data_de_criacao: result[0].dar_criacao,
            ativo: result[0].ativo,
            id_usuario_cadastro: result[0].id_usuario_cadastro
        }
        return res.status(200).send(response)
    }).catch((error) =>{
        console.log(error)
        return res.status(500).send({
            error: error
        });
    });
}

exports.postInativarLivro = (req, res, next) => {
    if(req.params.id_livro == '' || typeof(req.params.id_livro) === 'undefined'){
        return res.status(422).send({
            error: 'Preencha os campos OBRIGATÓRIOS!'
        });
    }
    mysql.exec(
        'SELECT * FROM livros WHERE id = ? ;',
        [req.params.id_livro]
    ).then((result) => {
        if (result[0].id_usuario_cadastro !== req.usuario.id) {
            return res.status(422).send({
                error: 'Você não possui permissão para inativá-lo!'
            });
        }
        mysql.exec(
            'SELECT * FROM movimentos WHERE id_livro = ? AND devolucao is null;',
            [req.params.id_livro]
        ).then((result) => {
            if(result.length > 0){
                return res.status(422).send({
                    error: 'O livro está alugado no momento!'
                });
            } else {
                mysql.exec(
                    'UPDATE livros SET ativo = 0 WHERE id = ?;',
                    [req.params.id_livro]
                ).then((result) => {
                    if (result) {
                        return res.status(200).send({
                            mensagem: 'Livro inativado com sucesso!'
                        })
                    }
                }).catch((error) =>{
                    console.log(error)
                    return res.status(500).send({
                        error: error
                    });
                });
            }
        }).catch((error) =>{
            console.log(error)
            return res.status(500).send({
                error: error
            });
        });
    }).catch((error) =>{
        console.log(error)
        return res.status(500).send({
            error: error
        });
    });
}

exports.postAtivarLivro = (req, res, next) => {
    if(req.params.id_livro == '' || typeof(req.params.id_livro) === 'undefined'){
        return res.status(422).send({
            error: 'Preencha os campos OBRIGATÓRIOS!'
        });
    }
    mysql.exec(
        'SELECT * FROM livros WHERE id = ?;',
        [req.params.id_livro]
    ).then((result) => {
        if (result.length < 1){
            return res.status(404).send({
                mensagem: 'Livro não encontrado!'
            });
        }else {
            if (result[0].id_usuario_cadastro !== req.usuario.id) {
                return res.status(422).send({
                    mensagem: 'Você não possui permissão para ativá-lo!'
                });
            }
        }  
        mysql.exec(
            'UPDATE livros SET ativo = 1 WHERE id = ?;',
            [req.params.id_livro]
        ).then((result) => {
            if (result) {
                return res.status(200).send({
                    mensagem: 'Livro ativado com sucesso!'
                })
            }
        }).catch((error) =>{
            console.log(error)
            return res.status(500).send({
                error: error
            });
        });
    }).catch((error) =>{
        console.log(error)
        return res.status(500).send({
            error: error
        });
    });

}

exports.postLocarLivro = (req, res, next) => {
    if(req.body.previsao_devolucao == '' || typeof(req.body.previsao_devolucao) === 'undefined' || req.params.id_livro == '' || typeof(req.params.id_livro) === 'undefined') {
        return res.status(402).send({
            error: 'Preencha os campos OBRIGATÓRIOS!'
        });
    }
    mysql.exec(
        'SELECT * FROM livros WHERE id = ? ;',
        [req.params.id_livro]
    ).then((result) => {
        if(result.length < 1){
            return res.status(404).send({
                mensagem: 'Livro não encontrado!'
            });
        } else {
            if (result[0].ativo != 1) {
                return res.status(422).send({
                    mensagem: 'O livro está inativo, não foi possível locar!'
                });
            }
            mysql.exec(
                'SELECT * FROM locar WHERE id_usuario = ?;',
                [req.usuario.id]
            ).then((result) => {
                if(result.length > 0) {
                    return res.status(422).send({
                        mensagem: 'Você já está com um livro locado!'
                    });
                } else {
                    mysql.exec(
                        'SELECT * FROM locar WHERE id_livro = ? AND devolucao is null;',
                        [req.params.id_livro]
                    ).then((result) => {
                        if(result.length > 0) {
                            return res.status(422).send({
                                mensagem: "O livro já está alugado, tente outro!"
                            });
                        } else {
                            const dataFormatada = moment(req.body.previsao_devolucao).format("YYYY-MM-DD");
                            if(dataFormatada <= data) {
                                return res.status(422).send({
                                    mensagem: 'Este dia já passou! Ou ainda estamos nela!'
                                });
                            } else {
                                mysql.exec(
                                    'INSERT INTO locar (id_usuario, id_livro, locacao, dt_locacao, previsao_devolucao, status) VALUES (?,?,1,?,?,\'ABERTO\');',
                                    [req.usuario.id, req.params.id_livro, data, req.body.previsao_devolucao]
                                ).then((result) => {
                                    if (result) {
                                        return res.status(200).send({ mensagem: 'Livro locado com sucesso!' });
                                    }
                                }).catch((error) =>{
                                    console.log(error)
                                    return res.status(500).send({
                                        error: error
                                    });
                                });
                                mysql.exec(
                                    'INSERT INTO movimentos (id_usuario, id_livro, locacao, dt_locacao, previsao_devolucao, status) VALUES (?,?,1,?,?,\'ABERTO\');',
                                    [req.usuario.id, req.params.id_livro, data, req.body.previsao_devolucao]
                                ).then((result) => {
                                    if (result) {
                                        return;
                                    }
                                }).catch((error) =>{
                                    console.log(error)
                                    return res.status(500).send({
                                        error: error
                                    });
                                });
                            }
                            
                        }
                    }).catch((error) =>{
                        console.log(error)
                        return res.status(500).send({
                            error: error
                        });
                    });
                }
            }).catch((error) =>{
                console.log(error)
                return res.status(500).send({
                    error: error
                });
            });
        }
    }).catch((error) =>{
        console.log(error)
        return res.status(500).send({
            error: error
        });
    });
}

exports.postDevolverLivro = (req, res, next) => {
    if(req.params.id_livro == '' || typeof(req.params.id_livro) === 'undefined'){
        return res.status(422).send({
            mensagem: 'Preencha os campos OBRIGATÓRIOS!'
        });
    }
    mysql.exec(
        'SELECT * FROM livros WHERE id = ?;',
        [req.params.id_livro]
    ).then((result) => {
        if(result.length < 1){
            return res.status(404).send({
                mensagem: 'Livro não encontrado!'
            });
        } else {
            mysql.exec(
                'SELECT * FROM locar WHERE id_livro = ? AND id_usuario = ? AND dt_devolucao is null;',
                [req.params.id_livro,req.usuario.id]
            ).then((result) => {
                if(result.length < 1){
                    return res.status(422).send({
                        mensagem: 'Você não locou este livro!'
                    });
                } else {
                    mysql.exec(
                        'DELETE FROM locar WHERE id_usuario = ?;',
                        [req.usuario.id]
                    ).then((result) => {
                        if (result) {
                            return res.status(204).send({mensagem: 'Livro devolvido com sucesso!'});
                        }
                    }).catch((error) =>{
                        console.log(error)
                        return res.status(500).send({
                            error: error
                        });
                    });
                }
            }).catch((error) =>{
                console.log(error)
                return res.status(500).send({
                    error: error
                });
            });
            mysql.exec(
                'UPDATE movimentos SET dt_devolucao = ?, devolucao = 1, status = \'CONCLUIDO\' WHERE id_usuario;',
                [data, req.usuario.id]
            ).then((result) => {
                if (result) {
                    return;
                }
            }).catch((error) =>{
                console.log(error)
                return res.status(500).send({
                    error: error
                });
            });
        }
    }).catch((error) =>{
        console.log(error)
        return res.status(500).send({
            error: error
        });
    });
}

exports.getHistoricoUm = (req, res, next) => {
    if(req.params.id_usuario == '' || typeof(req.params.id_usuario) === 'undefined'){
        return res.status(422).send({
            mensagem: 'Preencha os campos OBRIGATÓRIOS!'
        });
    }
    mysql.exec('SELECT * FROM movimentos WHERE id_usuario = ?;', [req.params.id_usuario]).then((result) =>{
        if (result.length < 1) {
            console.log(result)
            return res.status(404).send({
                mensagem: 'Usuário não encontrado!'
            })
        } else {
            if (result[0].id_usuario == req.usuario.id) {
                console.log(result[0].id_usuario)
                return res.status(200).send(result);
            } else {
                return res.status(422).send({
                    error: 'Você não possui permissão para buscar este histórico!'
                });
            }
        }
    }).catch((error) =>{
        console.log(error)
        return res.status(500).send({
            error: error
        });
    });
}

exports.getHistorico = (req, res, next) => {
    mysql.exec('SELECT * FROM movimentos;').then((result) => {
        const response = {
            total: result.length,
            movimentacao: result.map(movi => {
                return {
                    id: movi.id,
                    id_usuario: movi.id_usuario,
                    id_livro: movi.id_livro,
                    locacao: movi.locacao,
                    dt_locacao: movi.dt_locacao,
                    previsao_devolucao: movi.previsao_devolucao,
                    devolucao: movi.devolucao,
                    dt_devolucao: movi.dt_devolucao,
                    status: movi.status
                }
            })
        }
        return res.status(200).send(response);
    }).catch((error) =>{
        console.log(error)
        return res.status(500).send({
            error: error
        });
    });
}
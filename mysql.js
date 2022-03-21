const mysql = require('mysql2');

const pool = mysql.createPool({
    "user" : "root",
    "password" : "admin",
    "database" : "biblioteca",
    "host" : "localhost",
    "port" : 3306
});

exports.exec = (query, params) => {
    return new Promise((resolve, reject) =>{
        pool.getConnection((error, conn) =>{
            if(error){
                reject(error);
            }else{
                conn.query(query, params, (error, result, fields) => {
                    conn.release();
                    if (error) {
                        reject(error);
                    }else{
                        resolve(result);
                    }
                });
            }
        });
    });
}

exports.pool = pool;
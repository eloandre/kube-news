// server.js

 

// 1. Usar var ao invés de let/const (escopo confuso) 

var express = require("express");
var helmet = require("helmet");
var app = express();
app.use(helmet());

 

// 2. Colocar a porta fixa no código (sem usar variável de ambiente)

var PORT = 3000;

 

// 3. Middleware sem tratamento de erros

app.use(function (req, res, next) {

    console.log("Request recebido: " + req.url);

    next(); // se esquecer de chamar, trava

});

 

// 4. Endpoint sem validação de entrada

app.post("/user", function (req, res) {

    // Acessando req.body sem body-parser configurado

    var username = req.body.username; // pode dar undefined

    var password = req.body.password;

 

    // 5. Guardar senha em texto plano (gravíssimo!)

    console.log("Usuário criado: " + username + " - senha: " + password);

 

    res.send("Usuário criado");

});

 

// 6. Função assíncrona mal feita (sem try/catch nem await)

app.get("/data", async function (req, res) {

    const data = fetch("https://api.exemplo.com/data") // esqueci await

    res.send(data); // vai mandar Promise, não o resultado

});

 

// 7. Não tratar erros globais

process.on("uncaughtException", function (err) {

    console.log("Erro ignorado: " + err); // apenas loga e ignora

});

 

app.listen(PORT, function () {

    console.log("Servidor rodando em http://localhost:" + PORT);

});

<<<<<<< HEAD
const express = require('express')   //pegando o express q eu baixei
const app = express()                //variavel q vai portar o express

//chamando o path pra não ter problema com o caminho dos arquivos, chamando o routes pra fazer o arquivo de rotas e o globalMiddleware pra fazer o middleware global
const path = require('path')
const routes = require('./routes')

//configurando a pasta publica e o bodyparser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//falando pro nosso servidor usar o views para renderizar um html

app.use(routes)

    app.listen(3000, () => {
        console.log('acessar: http://localhost:3000')
        console.log('Servidor executando na porta 3000')
    })
=======
const express = require('express')   //pegando o express q eu baixei
const app = express()                //variavel q vai portar o express

//chamando o path pra não ter problema com o caminho dos arquivos, chamando o routes pra fazer o arquivo de rotas e o globalMiddleware pra fazer o middleware global
const path = require('path')
const routes = require('./routes')

//configurando a pasta publica e o bodyparser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//falando pro nosso servidor usar o views para renderizar um html

app.use(routes)

    app.listen(3000, () => {
        console.log('acessar: http://localhost:3000')
        console.log('Servidor executando na porta 3000')
    })
>>>>>>> f42ebb8 (feat: estrutura de pastas)

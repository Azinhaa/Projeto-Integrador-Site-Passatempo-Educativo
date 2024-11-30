const express = require ('express')
const multer = require ('multer')
const cors = require ('cors')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()
app.use(express.json())
app.use(cors())

const adminSchema = mongoose.Schema({
    login: {type: String, required: true, unique: true},
    senha: {type: String, required: true}
})
adminSchema.plugin(uniqueValidator)
const Admin = mongoose.model("Admin", adminSchema)

// app.post("/signup", async(req, res) => {
//     try {
//         const login = req.body.login
//         const senha = req.body.senha
//         const senhaCriptografada = await bcrypt.hash(senha, 10)
//         const admin = new Admin({login: login, senha: senhaCriptografada})
//         const respMongo = await admin.save()
//         console.log(respMongo)
//         res.status(201).end()
//     }
//     catch (e) {
//         console.log(e)
//         res.status(409).end()
//     }
// })

app.post("/checarLogin", async(req, res) => {
    const token = req.body
    console.log(token)
    
    try {
        const tokenDecrypt = jwt.verify(token.token, "chave-secreta")
        if (tokenDecrypt.login == "admin") {
            res.status(200).json({login: true})
        }
    }
    catch (err) {
        res.status(400).json({login: false})
    }
})

app.post("/login", async(req, res) => {
    const login = req.body.login
    const senha = req.body.senha
    const usuarioExiste = await Admin.findOne({login: login})
    
    if (!usuarioExiste) {
        return res.status(401).json({mensagem: "Login inválido"})        
    }
    const senhaValida = await bcrypt.compare(senha, usuarioExiste.senha)
    if (!senhaValida) {
        return res.status(401).json({mensagem: "Senha inválida"})
    }

    const token = jwt.sign(
        {login: login},
        "chave-secreta",
        {expiresIn: "3h"}
    )

    res.status(200).json({token: token}).end()
})

async function conectarAoMongoDB() {
    await mongoose.connect(`mongodb+srv://pipassatempoeducativo:NEpraSmrLvJA0Yde@cluster0.3xws5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
}

app.listen(3000, () => {
    try {
        conectarAoMongoDB()
        console.log("Up and Running")
    }
    catch (e) {
        console.log("Erro de conexão", e)
    }
})
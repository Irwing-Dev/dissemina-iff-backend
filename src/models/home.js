const mongoose = require('mongoose');

const HomeSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: String
})

const Home = mongoose.model('Home', HomeSchema)

module.exports = Home
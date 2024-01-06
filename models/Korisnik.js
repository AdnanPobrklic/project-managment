const mongoose = require("mongoose");

const korisnikSchema = new mongoose.Schema({
    ime: {
        type: String,
        required: true,
    },
    prezime: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    korisnickoIme: {
        type: String,
        required: true,
        unique: true,
    },
    sifra: {
        type: String,
        required: true,
    },
    uloga: {
        type: Number,
        required: true,
        enum: [0, 1, 2]
    },
    isOnline: {
        type: String,
        default: "0"
    },
    rooms: [{
            type: String
    }]
});

module.exports = mongoose.model("User", korisnikSchema);
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    naziv: {
        type: String,
        required: true,
        unique: true
    },
    opis: {
        type: String,
        required: true
    },
    startniDatum: {
        type: Date,
        required: true,
        default: Date.now
    },
    zavrsniDatum: {
        type: Date,
        required: true
    },
    zadaci: [{
        naslov: {
            type: String,
            required: true
        },
        opisZadatka: {
            type: String,
            required: true
        },
        dodijeljen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        zadanDatuma:{
            type: Date,
            required: true
        },
        krajniRok:{
            type: Date,
            required: true
        },
        izvrsen: { 
            type: Boolean,
            default: false
        },
        radnoVrijemeHr: {
            type: Number,
            default: 0
        },
        radnoVrijemeMin: {
            type: Number,
            default: 0
        },
        datumIzvrsetka:{
            type: Date,
        }
    }],
    radnici: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    menadzer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    statusProjekta: {
        type: Number,
        default: 0,
        enum: [0, 1, 2, 3]
    }
});

module.exports = mongoose.model("Project", projectSchema);


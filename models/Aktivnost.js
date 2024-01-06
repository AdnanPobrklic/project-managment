const mongoose = require('mongoose');
const options = { timeZone: 'Europe/Sarajevo', hour12: false };

const aktivnostSchema = new mongoose.Schema({
    vrsta: {
        type: 'String',
        required: true
    },
    korisnik: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    time: {
        type: Date,
        default: Date.now,
        get: (v) => v.toLocaleString('bs-BA', options)
    },
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
});

module.exports = mongoose.model('Activiti', aktivnostSchema);

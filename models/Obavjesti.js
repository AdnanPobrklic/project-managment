const mongoose = require('mongoose');

const obavjestiSchema = new mongoose.Schema({
    korisnik: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    time: {
        type: Date,
        default: Date.now,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isSeen: {
        type: String,
        required: true,
        enum: ["0", "1"],
        default: "0"
    }
});

module.exports = mongoose.model('Notification', obavjestiSchema);

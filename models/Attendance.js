const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    korisnik: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timeLogIn: {
        type: Date,
        default: Date.now,
    },
    timeLogOut: {
        type: Date,
    }
});

module.exports = mongoose.model('Attendance', attendanceSchema);

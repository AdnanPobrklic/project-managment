const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    },
    isRead:{
        type: String,
        default: "0"
    },
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    seen: {
        type: Boolean,
        default: false
    }
});


module.exports = mongoose.model("Chats", chatSchema);

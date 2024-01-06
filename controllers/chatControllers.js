const Chat = require("../models/Chat");

const deleteRazgovor = async(req, res) => {
    try {

        const chat = await Chat.find({
            $or: [
                {sender_id: req.session.userId, receiver_id: req.params.id},
                {sender_id: req.params.id, receiver_id: req.session.userId}
            ]
        });

        chat.forEach(msg => {
            msg.deletedFor.push(req.session.userId);
            msg.save();
        })

        res.status(200).json({message: "Razgovori su uspješno obrisani"});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Došlo je do greške prilikom brisanja razgovora"});
    }
};

module.exports = {
    deleteRazgovor,
}


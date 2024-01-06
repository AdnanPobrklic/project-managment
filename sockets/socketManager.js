const socketio = require("socket.io");
const sharedsession = require("express-socket.io-session");
const moment = require("moment");
const Chat = require("../models/Chat");
const Korisnik = require("../models/Korisnik");
const Attendance = require("../models/Attendance");
let lastPing = new Map();

let io;
function initializeSocket(server, sessionMiddleware){
    
    io = socketio(server);

    // Use the same session instance for Express and Socket.IO
    io.use(sharedsession(sessionMiddleware, {
        autoSave: true
    }));

    io.on("connection", socket => {

        // Access session userId
        const sessionUserId = socket.handshake.session.userId;
        const sessionKorisnickoIme = socket.handshake.session.korisnickoIme;


        // listen for onlineStatus
        socket.on("online", async msg => {

            const korisnik = await Korisnik.findById(sessionUserId);

            if(korisnik && korisnik.isOnline == "0"){
                korisnik.isOnline = "1";
                await korisnik.save();

                const loggedInKorisnici = await Korisnik.find({isOnline: "1"}).select('_id');
                const statusKorisnika = loggedInKorisnici.map(korisnik => korisnik._id);
                socket.broadcast.emit("log-in-message", {statusKorisnika, imePrezimeKorisnika: `${korisnik.ime} ${korisnik.prezime}`, vrsta: "log in"});

                const attendance = new Attendance({korisnik: sessionUserId, timeLogIn: Date.now()});
                await attendance.save();

                lastPing.set(sessionUserId, Date.now());
            }

        });

        // listen for ping
        socket.on("ping", msg => {
            // Update the time of the last ping
            lastPing.set(sessionUserId, Date.now());
        });

        // Check every second if each user has sent a ping in the last 5 seconds
        setInterval(async () => {
            const now = Date.now();
        
            for (let [userId, lastPingTime] of lastPing.entries()) {
                if (now - lastPingTime > 20000) {

                    const korisnik = await Korisnik.findById(userId);
        
                    if(korisnik && korisnik.isOnline == "1"){
                        korisnik.isOnline = "0";
                        await korisnik.save();
                
                        const setAttendanceLogOut = await Attendance.findOne({korisnik: userId, timeLogOut:undefined});
                        if(setAttendanceLogOut){
                            setAttendanceLogOut.timeLogOut = Date.now();
                            await setAttendanceLogOut.save();
                        }
        
                        const loggedOutKorisnici = await Korisnik.find({isOnline: "0"});
                        const statusKorisnika = loggedOutKorisnici.map(korisnik => korisnik._id);
                        socket.broadcast.emit("log-out-message", {statusKorisnika, imePrezimeKorisnika: `${korisnik.ime} ${korisnik.prezime}`, vrsta: "log out"});

                        lastPing.delete(userId);
                    }
                }

            }
        }, 15000);
        
        socket.on('joinAktivnosti', async userId => {
            socket.join('aktivnosti-room');
        });

        socket.on('joinMyRoom', async userId => {
            socket.join(userId);
        });
        
        let reciverId;
        socket.on('joinChatRoom', async ({reciverId: id}) => {
            reciverId = id;
            const roomId = [reciverId, sessionUserId].sort();
            const roomName = `${roomId[0]}-${roomId[1]}`;
            socket.join(roomName);

            let korisnik = await Korisnik.findById(sessionUserId);

            if(korisnik){
                if(!korisnik.rooms.includes(roomName)){
                    korisnik.rooms.push(roomName);
                    await korisnik.save();
                }
            }

            let prevSendMsgs = await Chat.find({sender_id: reciverId, receiver_id: sessionUserId, seen: false});
            prevSendMsgs.forEach(async msg => {
                msg.seen = true;
                msg.save();
            })

            // emit to everyone except the user who joined
            socket.broadcast.to(roomName).emit("user-join-message", "User joined the conversation");

            socket.on("disconnect", async msg => {
                const roomName = getRoomName(socket, reciverId);  
                let korisnik = await Korisnik.findById(sessionUserId);
                if(korisnik){
                    korisnik.rooms = korisnik.rooms.filter(room => room !== roomName);
                    await korisnik.save();
                }
            });
        });

        // listen for message
        socket.on("chatMessage", async msg => {
            const roomName = getRoomName(socket, msg.receiver_id);  
            const korisnikKomeSeSalje = await Korisnik.findById(msg.receiver_id);
            const chatMessage = new Chat({
                sender_id: msg.sender_id, 
                receiver_id: msg.receiver_id, 
                text: msg.text,
                seen: korisnikKomeSeSalje.rooms.includes(roomName) ? true : false
            });
            
            await chatMessage.save();

            io.to(roomName).emit("message", {
                msg: formatMessage(sessionKorisnickoIme, msg.text,  msg.receiver_id),
                isSeen: korisnikKomeSeSalje.rooms.includes(roomName) ? true : false
            });

            // If the receiver is not in the room, emit a notification
            if (!korisnikKomeSeSalje.rooms.includes(roomName)) {
                io.to(msg.receiver_id).emit('chat-notification', {text: `Nova poruka od ${sessionKorisnickoIme}!`,  receiver_id: msg.sender_id});
            }
        });
    });
}

function getRoomName(socket, reciverId) {
    const sessionUserId = socket.handshake.session.userId;
    const roomId = [reciverId, sessionUserId].sort();
    return `${roomId[0]}-${roomId[1]}`;
}

function formatMessage(username, text, reciverId){
    return {
        username,
        text,
        time: moment().format("DD. MM u H:mm"),
        reciverId
    }
}

module.exports = {
    initializeSocket,
    getIo: () => io,
}











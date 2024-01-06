require("dotenv").config();
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const server = http.createServer(app);
const { initializeSocket } = require("./sockets/socketManager");
const port = process.env.PORT || 3000;
const dbUri = process.env.DBURI || "mongodb://localhost:27017";
const Chat = require('./models/Chat');
const Obavjesti = require("./models/Obavjesti");
const prijavaRoutes = require("./routes/prijavaRoutes");
const radnaPovrsinaRoutes = require("./routes/radnaPovrsinaRoutes");
const korisnikRoutes = require("./routes/korisnikRoutes");
const projectRoutes = require("./routes/projectRoutes");
const chatRoutes = require("./routes/chatRoutes");
const korisnikControllers = require("./controllers/korisnikControllers");
const radnaPovrsinaControllers = require("./controllers/radnaPovrsinaControllers");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: dbUri,
    collection: 'sessions'
});

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: { 
        sameSite: true, 
        httpOnly: true,
        expires: false ,
        maxAge: 1000 * 60 * 15,
    },
    store
});

// middleware

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(sessionMiddleware);
app.use(async function(req, res, next) {
    res.locals.uloga = req.session.uloga;
    res.locals.korisnickoIme = req.session.korisnickoIme;
    const korisnikoviChatovi = await Chat.find({receiver_id: req.session.userId, seen: false});
    res.locals.unseenMsgs = korisnikoviChatovi.length != 0 ? true : false;
    res.locals.notifications = await Obavjesti.find({korisnik: req.session.userId}).sort({time: -1});
    const unseenNotifications = await Obavjesti.find({korisnik: req.session.userId, isSeen: "0"});
    res.locals.unseenNotifications = unseenNotifications.length;
    next();
});


// pokretanje servera i konektovanje na bazu

mongoose.connect(dbUri)
.then(() => {
    server.listen(port, () => {
        initializeSocket(server, sessionMiddleware);
        console.log(`Server listening on port ${port}`);
    })
})
.catch(err => {
    console.log(err);
})


// rute

app.get("/", (req, res) => res.redirect("/prijava"));
app.use("/prijava", prijavaRoutes);
app.use("/radna-povrsina", radnaPovrsinaControllers.checkForAuthentication ,radnaPovrsinaRoutes);
app.use("/korisnici", korisnikControllers.checkForAuthorizationKorisnik, korisnikRoutes);
app.use("/projekti", projectRoutes);
app.use("/razgovori", chatRoutes);
app.use("*", (req, res) => res.status(404).render("404", {title: "Ne postoji"}));



const bcrypt = require("bcrypt");
const Korisnik = require("../models/Korisnik");
const Aktivnost = require("../models/Aktivnost");
const Sessions = require("../models/Sessions");
const transporter = require("../service/mail-transporter"); 


const dodajKorisnika = async (req, res) => {
    try{
        const {ime, prezime, korisnickoIme, email, sifra, uloga} = req.body;
        
        if(!ime || !prezime || !korisnickoIme || !email || !sifra || uloga === undefined) return res.status(400).json({message: "Sva polja moraju biti unešena"});

        const korisnik = await Korisnik.findOne({korisnickoIme});
    
        if(korisnik) return res.status(400).json({message: "Korisničko ime zauzeto"});
    
        const noviKorisnik = new Korisnik({ime, prezime, korisnickoIme, email, sifra: hashPassword(sifra), uloga});
        const aktivnost = new Aktivnost({vrsta: "Korisnik dodan", korisnik: req.session.userId});

        const io = require("../sockets/socketManager").getIo();
        io.to('aktivnosti-room').emit("activity-notification", {aktivnost, korisnik: {ime: req.session.ime, prezime: req.session.prezime}});

        await noviKorisnik.save();
        await aktivnost.save();

                // Slanje e-maila
                transporter.sendMail({
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Dodani ste u sistem Evidencije Projekata",
                    html: `<h2> 
                                Poštovani ovaj mail vas obavještava da ste dodani u sistem Evidencije projekata. Prijavu na isti sistem možete izvršiti sa slijedećim podacima
                            </h2>
                            <h3>Korisničko ime: ${korisnickoIme}</h3>
                            <h3>Šifra: ${sifra}</h3>`,
                }, (error, info) => {
                    if (error) {
                        console.log(error);
                    }
                });

        return res.status(201).json({message: "Korisnik kreiran"});

    }catch(err){
        console.log(err);
        serverErrorHandler(res);
    }
}

const azurirajKorisnika = async (req, res) => {
    try {
        const {ime, prezime, email, korisnickoIme, sifra, uloga} = req.body;

        if(!ime && !prezime && !email && !korisnickoIme && !sifra && uloga === undefined) return res.status(400).json({message: "Sva polja ne smiju biti prazna"});

        const id = req.params.id;
        const korisnik = await Korisnik.findById(id);

        if(!korisnik) return res.status(404).json({message: "Korisnik ne postoji"});

        if(sifra){
            korisnik.sifra = hashPassword(sifra);
        }

        korisnik.ime = ime || korisnik.ime;
        korisnik.prezime = prezime || korisnik.prezime;
        korisnik.email = email || korisnik.email;
        korisnik.korisnickoIme = korisnickoIme || korisnik.korisnickoIme;
        korisnik.uloga = uloga || korisnik.uloga;

        await korisnik.save();

        res.status(200).json({message: "Korisnik ažuriran"})

    }catch(err){
        console.log(err);
        serverErrorHandler(res);
    }
}

const obrisiKorisnika = async (req, res) => {
    try{
        const id = req.params.id;
        const korisnik = await Korisnik.findById(id);

        if(!korisnik) return res.status(404).json({message: "Korisnik ne postoji"});

        await Korisnik.deleteOne({ _id: id});
        const aktivnost = new Aktivnost({vrsta: "Korisnik obrisan", korisnik: req.session.userId});
        const io = require("../sockets/socketManager").getIo();
        io.to('aktivnosti-room').emit("activity-notification", {aktivnost, korisnik: {ime: req.session.ime, prezime: req.session.prezime}});

        await aktivnost.save();

        await Sessions.deleteMany({'session.userId': id});

        return res.status(200).json({message: "Korisnik obrisan"});

    }catch(err){
        serverErrorHandler(res);
    }
}

function hashPassword(string){
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(string, salt);
    return hashedPassword;
}

const checkForAuthorizationKorisnik = (req, res, next) => {
    if(req.session.uloga === 0){
        next();
    }else{
        res.sendStatus(403);
    }
}

const checkIdValidityUser = async (req, res, next) => {
    const korisnikId = req.params.id;
    
    try{
        const korisnik = await Korisnik.findById(korisnikId);
        if(korisnik){
            next();
        }else{
            throw new Error();
        }
    }catch(err){
        res.redirect("/nepostojeća-stranica");
    }
}

function serverErrorHandler(res){
    res.status(500).json({message: "Interna greška server"});
}

module.exports = {
    checkForAuthorizationKorisnik,
    dodajKorisnika,
    obrisiKorisnika,
    azurirajKorisnika,
    checkIdValidityUser
}
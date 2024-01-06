const Korisnik = require("../models/Korisnik");
const bcrypt = require("bcrypt");

const getPrijava = (req, res) => {
    res.render("prijava", {title: "Prijava"});
}

const postPrijava = async (req, res) => {
    try{
        const {korisnickoIme, sifra} = req.body;
        
        const korisnik = await Korisnik.findOne({korisnickoIme});

        if(!korisnik) return res.status(401).json({message: "Nevalidna akredentacija"});

        bcrypt.compare(sifra, korisnik.sifra, function(err, result) {

            if(err) throw new Error(err);

            if(result){
                
                req.session.userId = korisnik.id;
                req.session.uloga = korisnik.uloga;
                req.session.korisnickoIme = korisnik.korisnickoIme;
                req.session.ime = korisnik.ime;
                req.session.prezime = korisnik.prezime;
                
                return res.status(200).json({message: "ok", userId: korisnik.id});
            }else{
                res.status(401).json({message: "Nevalidna akredentacija"});
            }
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Interna greška server"});
    }
}

const forbiddCache = (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
}

const checkIfAuthenticated = (req, res, next) => {
    if(req.session.korisnickoIme){
        res.redirect("/radna-povrsina");
    }else{
        next();
    }
}

module.exports = {
    getPrijava,
    postPrijava,
    forbiddCache,
    checkIfAuthenticated,
}
require("dotenv").config();
const Projekat = require("../models/Projekat");
const Aktivnost = require("../models/Aktivnost");
const Obavjest = require("../models/Obavjesti");
const Korisnik = require("../models/Korisnik");
const transporter = require("../service/mail-transporter"); 

const postDodajProjekat = async (req, res) => {
    try{
        const {naziv, opis, startniDatum, zavrsniDatum, zadaci, radnici, menadzer, statusProjekta} = req.body;

        if(!naziv || !opis || !startniDatum || !zavrsniDatum) return res.status(400).json({message: "Naziv, opis, startni i završni datum moraju biti proslijeđeni."});
    
        if(await Projekat.findOne({naziv})) return res.status(400).json({message: "Projekat sa tim nazivom već postoji"});
    
        const korisnici = await Korisnik.find({_id: {$in: radnici}});
        let emailList = korisnici.map(korisnik => korisnik.email).join(',');
        const menadzerEmail = await Korisnik.findOne({_id: menadzer}, "email");
        const projekat = new Projekat({naziv, opis, startniDatum, zavrsniDatum, zadaci, radnici, menadzer, statusProjekta});
        const aktivnost = new Aktivnost({vrsta: "Kreiran projekat", korisnik: req.session.userId});
        const io = require("../sockets/socketManager").getIo();
        io.to('aktivnosti-room').emit("activity-notification", {aktivnost, korisnik: {ime: req.session.ime, prezime: req.session.prezime}});

        await projekat.save();
        await aktivnost.save();

        if(req.session.userId != menadzer){
            let obavjest = new Obavjest({korisnik: menadzer, content: `${req.session.ime} ${req.session.prezime} vas je postavio/la na projekat kao menadžera`});
            await obavjest.save();
            io.to(menadzer).emit('notification', obavjest)
        };

        // Slanje e-maila
        transporter.sendMail({
            from: process.env.EMAIL,
            to: menadzerEmail.email,
            subject: "Postavljeni ste kao menadzer na novom projektu",
            html: `<p>Poštovani ovaj mail vas obavještava da ste postavljeni kao menadzer na novom projektu. Molimo provjerite vaše projekte na sistemu Evidencije projekata za više informacija.</p>`,
        }, (error, info) => {
            if (error) {
                console.log(error);
            }
        });

        setTimeout( () => {
            // Slanje e-maila
            transporter.sendMail({
                from: process.env.EMAIL,
                bcc: emailList,            
                subject: "Dodani ste na novi projekat",
                html: `<p>Poštovani ovaj mail vas obavještava da ste dodani na novi projekat. Molimo provjerite vaše projekte na sistemu Evidencije projekata za više informacija.</p>`,
            }, (error, info) => {
                if (error) {
                    console.log(error);
                }
            });
        }, 5000)

        korisnici.forEach(async korisnik => {
            if(req.session.userId != String(korisnik._id)){
                obavjest = new Obavjest({korisnik: korisnik._id, content: `${req.session.ime} ${req.session.prezime} vas je dodao/la na projekat`});
                await obavjest.save();
                io.to(String(korisnik._id)).emit('notification', obavjest)
            };
        })

        res.status(201).json({message: "Projekat kreiran"});

    }catch(err){
        console.log(err);
        errorHandler(res);
    }
}

const patchAzurirajProjekat = async (req, res) => {
    try{

        const projectId = req.params.id;
        const projekat = await Projekat.findById(projectId);

        if(!projekat) return res.status(404).json({message: "Projekat ne postoji"});

        const {menadzer, zavrsniDatum, statusProjekta, radnici} = req.body;
        
        if(!menadzer || !zavrsniDatum || !statusProjekta || !radnici) return res.status(400).json({message: "Sva polja moraju biti popunjena"});

        projekat.menadzer = menadzer || projekat.menadzer; 
        projekat.zavrsniDatum = zavrsniDatum || projekat.zavrsniDatum; 
        projekat.statusProjekta = statusProjekta || projekat.statusProjekta;
        projekat.radnici = radnici || projekat.radnici; 

        let aktivnost;
        const io = require("../sockets/socketManager").getIo();
        switch(statusProjekta){
            case "0":
                aktivnost = new Aktivnost({vrsta: "Projekat dodan na čekanje", korisnik: req.session.userId});
                io.to('aktivnosti-room').emit("activity-notification", {aktivnost, korisnik: {ime: req.session.ime, prezime: req.session.prezime}});
                break;
            case "1":
                aktivnost = new Aktivnost({vrsta: "Projekat dodan na izradu", korisnik: req.session.userId});
                io.to('aktivnosti-room').emit("activity-notification", {aktivnost, korisnik: {ime: req.session.ime, prezime: req.session.prezime}});
                break;
            case "2":
                aktivnost = new Aktivnost({vrsta: "Projekat završen", korisnik: req.session.userId});
                io.to('aktivnosti-room').emit("activity-notification", {aktivnost, korisnik: {ime: req.session.ime, prezime: req.session.prezime}});
                break;
            case "3":
                aktivnost = new Aktivnost({vrsta: "Projekat obustavljen", korisnik: req.session.userId});
                io.to('aktivnosti-room').emit("activity-notification", {aktivnost, korisnik: {ime: req.session.ime, prezime: req.session.prezime}});
        }

        await aktivnost.save();
        await projekat.save();

        return res.status(200).json({message: "Projekat ažuriran"});

    }catch(err){
        console.log(err);
        errorHandler(res);
    }
}

const deleteProjekat = async (req, res) => {
    try{
        const projectId = req.params.id;
        const projekat = await Projekat.findById(projectId);
    
        if(!projekat) return res.status(404).json({message: "Projekat ne postoji"});
    
        try{
            await projekat.deleteOne();
            const aktivnost = new Aktivnost({vrsta: "Projekat obrisan", korisnik: req.session.userId});
            const io = require("../sockets/socketManager").getIo();
            io.to('aktivnosti-room').emit("activity-notification", {aktivnost, korisnik: {ime: req.session.ime, prezime: req.session.prezime}});
            await aktivnost.save();
            res.status(200).json({message: "Projekat uspješno obrisan"});
        }catch(err){
            throw new Error();
        }
    }catch(err){
        errorHandler(res);
    }
}

const postDodajZadatakProjektu = async (req, res) => {
    const { naslov, opisZadatka, dodijeljen, zadanDatuma, krajniRok} = req.body;
    
    if(!naslov || !opisZadatka || !dodijeljen || !zadanDatuma || !krajniRok) return res.status(400).json({message: "Popunite sva polja"});
    const projectId = req.params.id;
    
    try{
        const projekat = await Projekat.findById(projectId);
        if(!projekat) return res.status(404).json({message: "Ne postoji projekat"});

        let postojiLi = false;
        projekat.zadaci.forEach(zadatak => {
            if(zadatak.naslov === naslov){
                postojiLi = true;
            }
        })

        if(postojiLi) return res.status(400).json({message: "Zadatak već postoji"});
        
        projekat.zadaci.push({naslov, opisZadatka, dodijeljen, zadanDatuma, krajniRok});
        const aktivnost = new Aktivnost({vrsta: "Zadatak dodan", korisnik: req.session.userId});
        const io = require("../sockets/socketManager").getIo();
        io.to('aktivnosti-room').emit("activity-notification", {aktivnost, korisnik: {ime: req.session.ime, prezime: req.session.prezime}});

        await projekat.save();
        await aktivnost.save();

        const dodijeljenKorisniku = await Korisnik.findById(dodijeljen, "email");
        // Slanje e-maila
        transporter.sendMail({
            from: process.env.EMAIL,
            to: dodijeljenKorisniku.email,
            subject: "Dodijeljen vam je novi zadatak",
            html: `<p>Poštovani ovaj mail vas obavještava da vam je dodijeljen novi zadatak. Molimo provjerite vaše zadatke na sistemu Evidencije projekata za više informacija.</p>`,
        }, (error, info) => {
            if (error) {
                console.log(error);
            }
        });

        if(req.session.userId != dodijeljen) {
            const obavjest = new Obavjest({korisnik: dodijeljen, content: `${req.session.ime} ${req.session.prezime} vam je dodijelio/la novi zadatak`});
            await obavjest.save();
            io.to(dodijeljen).emit('notification', obavjest)
        };        
        return res.status(201).json({message: "Zadatak dodan"});
    }catch(err){
        console.log(err);
        errorHandler(res);
    }
}

const deleteZadatakProjekta = async (req, res) => {
    const { naslov } = req.body;
    const projectId = req.params.id;

    try {
        const projekat = await Projekat.findById(projectId);
        if (!projekat) return res.status(404).json({message: "Ne postoji projekat"});

        const zadatak = projekat.zadaci.find(zadatak => zadatak.naslov === naslov);
        if (!zadatak) return res.status(404).json({message: "Ne postoji zadatak s tim naslovom"});

        projekat.zadaci = projekat.zadaci.filter(zadatak => zadatak.naslov !== naslov);
        const aktivnost = new Aktivnost({vrsta: "Zadatak obrisan", korisnik: req.session.userId});
        const io = require("../sockets/socketManager").getIo();
        io.to('aktivnosti-room').emit("activity-notification", {aktivnost, korisnik: {ime: req.session.ime, prezime: req.session.prezime}});

        await projekat.save();
        await aktivnost.save();

        return res.status(200).json({message: "Zadatak obrisan"});

    } catch(err) {
        console.log(err);
        errorHandler(res);
    }
}

const checkIfAdminOrManager = (req, res, next) => {        
    if(req.session.uloga === 0 || req.session.uloga === 1){
        next();
    }else{
        res.sendStatus(403);
    }
}

const checkIfAdminOrPM = async (req, res, next) => {
    const projectId = req.params.id;
    const projekat = await Projekat.findById(projectId);

    if(req.session.uloga === 0 || req.session.userId === projekat.menadzer){
        next();
    }else{
        res.sendStatus(403);
    }
}

const checkIdValidity = async (req, res, next) => {
    const projectId = req.params.id;

    try{
        const projekat = await Projekat.findById(projectId);
        if(projekat){
            next();
        }else{
            throw new Error();
        }
    }catch(err){
        res.redirect("/nepostojeća-stranica");
    }
}

const getZadatke = async (req, res) => {
    const projectId = req.params.id;
    const projekat = await Projekat.findById(projectId);

    const zadaci = projekat.zadaci.filter(zadatak => zadatak.dodijeljen == req.session.userId);

    res.status(200).json({data: zadaci})
}

const postZadatak = async (req, res) => {
    try{
        const { sati, minute } = req.body;

        if(sati === undefined || minute === undefined) return res.status(400).json({message: "Sati i minute moraju biti definisani"});
        if(sati % 1 != 0 || minute % 1 != 0) return res.status(400).json({message: "Sati i minute moraju biti cijelobrojni brojevi"});
        if(minute > 59 || minute < 0) return res.status(400).json({message: "Minute moraju biti između 0 i 59"});
        if(minute == 0 && sati == 0) return res.status(400).json({message: "I sati i minute ne smiju biti 0"});
    
        const zadatakId = req.params.id;
        if(!zadatakId) return res.status(400).json({message: "ID zadatka mora biti definisan"});
    
        const Projekti = await Projekat.find().populate("menadzer", "email");
        if(Projekti.length === 0) return res.status(400).json({message: "Nema projekata"});
    
        let zadatak, projekat;
    
        for (const p of Projekti) {
            for (const z of p.zadaci) {
                if (z._id.toString() === zadatakId) {
                    zadatak = z;
                    projekat = p;
                    break;
                }
            }
            if (zadatak) break;
        }
    
        if(!zadatak) return res.status(400).json({message: "Zadatak nije pronađen"});
    
        zadatak.izvrsen = true;
        zadatak.datumIzvrsetka = new Date();
        zadatak.radnoVrijemeHr += sati;
        zadatak.radnoVrijemeMin += minute;
    
        if(zadatak.radnoVrijemeMin >= 60){
            zadatak.radnoVrijemeHr += 1;
            zadatak.radnoVrijemeMin %= 60;
        }
    
        const aktivnost = new Aktivnost({vrsta: "Zadatak izvršen", korisnik: req.session.userId});
        const io = require("../sockets/socketManager").getIo();
        io.to('aktivnosti-room').emit("activity-notification", {aktivnost, korisnik: {ime: req.session.ime, prezime: req.session.prezime}});

        if(req.session.userId != String(projekat.menadzer._id)){
            let obavjest = new Obavjest({korisnik: projekat.menadzer._id, content: `${req.session.ime} ${req.session.prezime} je izvršio/la svoj zadatak`});
            await obavjest.save();
            io.to(String(projekat.menadzer._id)).emit('notification', obavjest); 
        }      

        // Slanje e-maila
        transporter.sendMail({
            from: process.env.EMAIL,
            to: projekat.menadzer.email,
            subject: "Zadatak na projektu je izvršen",
            html: `<p>Poštovani ovaj mail vas obavještava da je zadatak na projektu je izvršen. Molimo provjerite vaše zadatke na sistemu Evidencije projekata za više informacija.</p>`,
        }, (error, info) => {
            if (error) {
                console.log(error);
            }
        });
    
        await projekat.save();
        await aktivnost.save();
    
        res.status(200).json({message: "Zadatak unjet"});
    }catch(err){
        console.log(err);
    }
}



function errorHandler(res){
    res.status(500).json({message: "Interna greška servera"});
}

module.exports = {
    postDodajProjekat,
    checkIfAdminOrManager,
    checkIfAdminOrPM,
    patchAzurirajProjekat,
    deleteProjekat,
    postDodajZadatakProjektu,
    deleteZadatakProjekta,
    checkIdValidity,
    postZadatak,
    getZadatke,
}
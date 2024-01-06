const Korisnik = require("../models/Korisnik");
const Projekat = require("../models/Projekat");
const Chat = require("../models/Chat");
const Aktivnosti = require("../models/Aktivnost");
const Attendance = require("../models/Attendance");
const pdfService = require("../service/pdf-service");
const fs = require('fs');
const path = require('path');
const Obavjesti = require("../models/Obavjesti");
const transporter = require("../service/mail-transporter"); 


const getRadnaPovrsinaPocetna = async (req, res) => {
    const korisnici = await Korisnik.find();
    const admini = await Korisnik.find({ uloga: 0 });
    const menadzeri = await Korisnik.find({ uloga: 1 });
    const radnici = await Korisnik.find({ uloga: 2 });

    const projekti = await Projekat.find();
    const naCekanju = await Projekat.find({ statusProjekta: 0 });
    const uIzradiProjekti = await Projekat.find({ statusProjekta: 1 });
    const zavrseniProjekti = await Projekat.find({ statusProjekta: 2 });
    const obustavljeniProjekti = await Projekat.find({ statusProjekta: 3 });

    let brojMojihProjekataUkupno = 0;
    let brojMojihProjekataNaCekanju = 0;
    let brojMojihProjekataUIzradi = 0;
    let brojMojihProjekataZavrseno = 0;
    let brojMojihProjekataObustavljeno = 0;

    let brojZadataka = 0;
    let brojMojihZadataka = 0;
    let brojMojihIzvrsenihZadataka = 0;
    let brojMojihNeIzvrsenihZadataka = 0;
    let brojIzvrsenihZadataka = 0;
    let brojNeIzvrsenihZadataka = 0;

    projekti.forEach((projekat) => {

        if(projekat.radnici.includes(req.session.userId)){
            brojMojihProjekataUkupno++;

            switch(projekat.statusProjekta){
                case 0:
                    brojMojihProjekataNaCekanju++;
                    break;
                case 1:
                    brojMojihProjekataNaCekanju++;
                    break;
                case 2:
                    brojMojihProjekataZavrseno++;
                    break;
                case 3:
                    brojMojihProjekataObustavljeno++;
                    break;
            }
        }

        projekat.zadaci.forEach((zadatak) => {
            brojZadataka++;

            if(zadatak.dodijeljen == req.session.userId){
                brojMojihZadataka++;
                if (zadatak.izvrsen === true) {
                    brojMojihIzvrsenihZadataka++;
                } else {
                    brojMojihNeIzvrsenihZadataka++;
                }
            }

            if (zadatak.izvrsen === true) {
                brojIzvrsenihZadataka++;
            } else {
                brojNeIzvrsenihZadataka++;
            }
        });
    });

    res.render("pocetna", {
        title: "Radna povrsina",
        brojKorisnika: korisnici.length,
        brojAdmina: admini.length,
        brojMenadzera: menadzeri.length,
        brojRadnika: radnici.length,
        brojProjekata: projekti.length,
        brojnaCekanju: naCekanju.length,
        brojuIzradiProjekti: uIzradiProjekti.length,
        brojZavsrseniProjekti: zavrseniProjekti.length,
        brojObustavljeniProjekti: obustavljeniProjekti.length,
        brojZadataka,
        brojIzvrsenihZadataka,
        brojNeIzvrsenihZadataka,
        brojMojihZadataka,
        brojMojihIzvrsenihZadataka,
        brojMojihNeIzvrsenihZadataka,
        brojMojihProjekataUkupno,
        brojMojihProjekataNaCekanju,
        brojMojihProjekataUIzradi,
        brojMojihProjekataZavrseno,
        brojMojihProjekataObustavljeno,
    });
};


const getDodajKorisnika = (req, res) => {
    res.render("dodaj-korisnika", {title: "Dodaj korisnika"});
}

const getSviKorisnici = async (req, res) => {
    const korisnici = await Korisnik.find();
    res.render("svi-korisnici", {title: "Svi korisnici", korisnici});
}

const getKorisnik = async (req, res) => {
    const id = req.params.id;
    const korisnik = await Korisnik.findOne({_id: id});
    res.render("korisnik-uredi", {title: "Korisnik", korisnik});
}

const getDodajProjekat = async (req, res) => {
    const manageri = await Korisnik.find({uloga: 1});
    const radnici = await Korisnik.find({uloga: {$ne: 0}});
    res.render("dodaj-projekat", {title: "Dodaj projekat", manageri, radnici});
}

const getSviProjekti = async (req, res) => {
    let projekti = await Projekat.find()
        .populate('menadzer', 'ime prezime')
        .populate('radnici', 'ime prezime');
    projekti = projekti.map(projekat => ({...projekat._doc, menadzerIme: projekat.menadzer.ime + ' ' + projekat.menadzer.prezime}));
    res.render("svi-projekti", {title: "Svi projekti", projekti, user: req.session});
}

const getProjekatDetalji = async (req, res) => {
    const idProjekta = req.params.id;
    const radnici = await Korisnik.find({uloga: {$ne: 0}});
    const projekatPopulisanRadnicima = await Projekat.findById(idProjekta)        
        .populate("zadaci.dodijeljen", "ime prezime")
    const projekat = await Projekat.findById(idProjekta)
        .populate("menadzer", "ime prezime")

    const zadaci = projekatPopulisanRadnicima.zadaci.filter(zadatak => zadatak.izvrsen);
    let ukupniSati = 0;
    let ukupneMinute = 0;
    
    zadaci.forEach(zadatak => {
        ukupniSati += zadatak.radnoVrijemeHr;
        ukupneMinute += zadatak.radnoVrijemeMin;
    })

    while(ukupneMinute > 59){
        ukupniSati ++;
        ukupneMinute -= 60;
    }
    
    res.render("projekat-detalji", {title: `O projektu`, projekat, radnici, zadaci, ukupniSati, ukupneMinute});
}

const getProjekatPromjena = async (req, res) => {

    const idProjekta = req.params.id;
        
    const projekat = await Projekat.findById(idProjekta)
        .populate("menadzer", "ime prezime");
    const projekatPopulisanRadnicima = await Projekat.findById(idProjekta)
        .populate("radnici", "ime prezime");

    const formatZavrDatum = konvertujDatumProjekta(projekat, "zavrsniDatum");
    const formatMinDatum = konvertujDatumProjekta(projekat, "startniDatum");

    const manageri = await Korisnik.find({ uloga: 1 });
    const trenutniManagerId = projekatPopulisanRadnicima.menadzer;
    const radnici = await Korisnik.find({uloga: {$ne: 0}});

    res.render("projekat-uredi", {
        title: "Uredi projekat",
        projekat,
        formatZavrDatum,
        formatMinDatum,
        radnici,
        manageri,
        projekatPopulisanRadnicima,
        trenutniManagerId
    });
}

const getProjekatDodajZadatak = async (req, res) => {

    const idProjekta = req.params.id;
        
    const projekat = await Projekat.findById(idProjekta)
        .populate("menadzer", "ime prezime");
    const projekatPopulisanRadnicima = await Projekat.findById(idProjekta)
        .populate("radnici", "ime prezime");

    const formatZavrDatum = konvertujDatumProjekta(projekat, "zavrsniDatum");
    const formatMinDatum = konvertujDatumProjekta(projekat, "startniDatum");

    const manageri = await Korisnik.find({ uloga: 1 });
    const trenutniManagerId = projekatPopulisanRadnicima.menadzer;
    const radnici = await Korisnik.find({uloga: {$ne: 0}});

    res.render("dodaj-zadatak", {
        title: "Dodaj zadatak",
        projekat,
        formatZavrDatum,
        formatMinDatum,
        radnici,
        manageri,
        projekatPopulisanRadnicima,
        trenutniManagerId,
        idProjekta
    });
}

const getMojiZadaci = async (req, res) => {
    const projekti = await Projekat.find();
    const korisnikId = req.session.userId;
    const zadaci = [];

    projekti.forEach(projekat => {
        projekat.zadaci.forEach(zadatak => {
            if(zadatak.dodijeljen.toString() === korisnikId){
                zadatak.projekat = projekat.naziv;
                zadaci.push(zadatak)
            };
        })
    })

    res.render("moji-zadaci", {title: "Moji zadaci", zadaci})
}

const getUnosZadatka = async (req, res) => {
    const projekti = await Projekat.find();
    const korisnikId = req.session.userId;

    const filtriraniProjekti = projekti.filter(projekat => {
        return projekat.zadaci.some(zadatak => {
            return zadatak.dodijeljen.toString() === korisnikId;
        });
    });

    res.render("unos-zadatka", {title: "Unos zadatka", projekti: filtriraniProjekti})
}

const getDetaljiZadatka = async (req, res) => {
    const zadatakId = req.params.id;

    const projekati = await Projekat.find();
    let foundZadatak;

    projekati.forEach(projekat => {
        projekat.zadaci.forEach(zadatak => {
            if(zadatak._id.toString() === zadatakId){
                foundZadatak = zadatak;
            }
        })
    })
    
    res.render("zadatak-detalji", {
        title: "Detalji zadatka",
        zadatak: foundZadatak,
    })
}

const getUserSelection = async (req, res) => {
    const korisnici = await Korisnik.find();
    const filterKorisnike = korisnici.filter(korisnik => korisnik._id != req.session.userId);

    res.redirect(`poruke/${filterKorisnike[0]._id}`);
}

const getChat = async (req, res) => {
    const primaocId = req.params.id;
    const korisnici = await Korisnik.find();
    const filterKorisnike = korisnici.filter(korisnik => korisnik._id != req.session.userId);
    const primaoc = await Korisnik.findById(primaocId);
    let chatBetweenUsers = await Chat.find({
        $or: [
            {sender_id: req.session.userId, receiver_id: primaocId},
            {sender_id: primaocId, receiver_id: req.session.userId}
        ]
    });

    chatBetweenUsers = chatBetweenUsers.filter(chat => !chat.deletedFor.includes(req.session.userId));
    
    const unreadMsg = await Chat.find({receiver_id: req.session.userId, seen: false});

    const unreadMsgsUserIds = new Set();
    
    unreadMsg.forEach(message => {
        unreadMsgsUserIds.add(String(message.sender_id));
    })

    res.render("chat", {
        title: "Poruke",
        korisnici: filterKorisnike,
        primaoc,
        primaocId,
        chatBetweenUsers,
        unreadMsgsUserIds
    })
}

const getAktivnosti = async (req, res) => {
    
    const onlineKorisnici = await Korisnik.find({isOnline: "1", _id: {$nin: req.session.userId}});

    const aktivnosti = await Aktivnosti.find({
        deletedFor: {
            $nin: [req.session.userId]
        }
    }).populate("korisnik", "ime prezime")
    .sort({time: -1});

    
    res.render("aktivnosti", {
        title: "Aktivnosti",
        aktivnosti,
        onlineKorisnici
    })
}

const deleteAktivnost = async (req, res) => {
    try{
        const id = req.params.id;
        const aktivnost = await Aktivnosti.findById(id);

        if(!aktivnost) return res.status(404).json({message: "Aktivnost ne postoji"});

        aktivnost.deletedFor.push(req.session.userId);
        await aktivnost.save();

        return res.status(200).json({message: "Aktivnost obrisan"});

    }catch(err){
        return res.status(500).json({message: "Greška prilikom brisanje."});
    }
}

const getRadnoVrijemeRadnici = async (req, res) => {
    const trenutniDatum = new Date();
    const trenutniMjesec = trenutniDatum.getMonth();
    const trenutnaGodina = trenutniDatum.getFullYear();

    const projketi = await Projekat.find();
    const korisnici = await Korisnik.find({ uloga: { $ne: 0 } });

    korisnici.forEach(korisnik => {
        korisnik.radnoVrijemeHr = 0;
        korisnik.radnoVrijemeMin = 0;
        korisnik.radnoVrijemeHrMjesec = 0;
        korisnik.radnoVrijemeMinMjesec = 0;

        projketi.forEach(projekat => {
            projekat.zadaci.forEach(zadatak => {
                if(zadatak.dodijeljen.toString() === korisnik._id.toString() && zadatak.izvrsen){
                    const datumIzvrsetka = new Date(zadatak.datumIzvrsetka);

                    if(datumIzvrsetka.getFullYear() === trenutnaGodina){
                        korisnik.radnoVrijemeHr += zadatak.radnoVrijemeHr;
                        korisnik.radnoVrijemeMin += zadatak.radnoVrijemeMin;
                        if(korisnik.radnoVrijemeMin >= 60){
                            korisnik.radnoVrijemeHr++;
                            korisnik.radnoVrijemeMin %= 60;
                        }

                        if(datumIzvrsetka.getMonth() === trenutniMjesec && datumIzvrsetka.getFullYear() === trenutnaGodina){
                            korisnik.radnoVrijemeHrMjesec += zadatak.radnoVrijemeHr;
                            korisnik.radnoVrijemeMinMjesec += zadatak.radnoVrijemeMin;
                            if(korisnik.radnoVrijemeMinMjesec >= 60){
                                korisnik.radnoVrijemeHrMjesec++;
                                korisnik.radnoVrijemeMinMjesec %= 60;
                            }
                        }
                    }
                }
            })
        })
    })

    res.render("radnikRV", {
        title: "Radno vrijeme radnika",
        korisnici,
    })
}

const getRadnoVrijemeProjekti = async (req, res) => {

    const projekti = await Projekat.find();

    projekti.forEach(projekat => {
        projekat.radniSati = 0;
        projekat.radneMinute = 0;

        projekat.zadaci.forEach(zadatak => {
            if(zadatak.izvrsen){
                projekat.radniSati +=  zadatak.radnoVrijemeHr;
                projekat.radneMinute += zadatak.radnoVrijemeMin;
                if(projekat.radneMinute >= 60){
                    projekat.radniSati++;
                    projekat.radneMinute %= 60;
                }
            }
        })
    })

    res.render("projekatRV", {
        title: "Radno vrijeme projekata",
        projekti,
    })
}

const getIzvjestajMjesecniRadnika = (req, res) => {
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=mjesecno-radno-vrijeme-radnika.pdf'
    })

    pdfService.mjesecniIzvjestajRadnika(
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
}

const getIzvjestajGodisnjiRadnika = (req, res) => {
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=godisnje-radno-vrijeme-radnika.pdf'
    })

    pdfService.godisnjiIzvjestajRadnika(
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
}

const getIzvjestajUkupniRadnika = (req, res) => {
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=ukupno-radno-vrijeme-radnika.pdf'
    })

    pdfService.ukupniIzvjestajRadnika(
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
}

const getPrisustvoMjesecnoRadnika = (req, res) => {
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=ovomjesecno-prisustvo-radnika.pdf'
    })

    pdfService.izvjestaMjesecniPrisustva(
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
}

const getPrisustvoGodisnjeRadnika = (req, res) => {
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=ovogodisnje-prisustvo-radnika.pdf'
    })

    pdfService.izvjestaGodisnjegPrisustva(
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
}

const getPrisustvoUkupnoRadnika = (req, res) => {
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=ukupno-prisustvo-radnika.pdf'
    })

    pdfService.izvjestaUkupnogPrisustva(
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
}

const getIzvjestajProjekata = (req, res) => {
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=radno-vrijeme-po-projektima.pdf'
    })

    pdfService.izvjestajProjekti(
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
}

const postSlanjeIzvjestajaMail = async (req, res) => {
    const { receiverMail, vrstaIzvjestaja } = req.body;
    let subject = "";
    let html = "";
    let pdfFunction;

    if(vrstaIzvjestaja === "mjesecni-radno-vrijeme"){
        subject = "Mjesečni izvještaj radnog vremena";
        html += `Poštovani, u nastavku se nalazi pdf dokument koji sadrži izvještaj o radnom vremenu radnika tokom tekućeg mjeseca.`;
        pdfFunction = pdfService.mjesecniIzvjestajRadnika;
    }else if(vrstaIzvjestaja === "mjesecni-prisustvo"){
        subject = "Mjesečni izvještaj prisustva";
        html += `Poštovani, u nastavku se nalazi pdf dokument koji sadrži izvještaj o prisustvo radnika tokom tekućeg mjeseca.`;
        pdfFunction = pdfService.izvjestaMjesecniPrisustva;
    }else{
        subject = "Izvještaj radnog vremena projekata";
        html += `Poštovani, u nastavku se nalazi pdf dokument koji sadrži izvještaj o radnom vremenu na projektima u sistemu.`;
        pdfFunction = pdfService.izvjestajProjekti;
    }

    // Provjerite postoji li direktorij
    const dirPath = path.join(__dirname, '/tmp');
    if (!fs.existsSync(dirPath)){
        // Ako ne postoji, stvorite ga
        fs.mkdirSync(dirPath);
    }

    const pdfPath = path.join(dirPath, 'izvjestaj.pdf');
    const writeStream = fs.createWriteStream(pdfPath);
    pdfFunction(
        (chunk) => writeStream.write(chunk),
        () => {
            writeStream.end();

            // Slanje e-maila
            transporter.sendMail({
                from: process.env.EMAIL,
                to: receiverMail,
                subject: subject,
                html: html,
                attachments: [
                    {
                        filename: 'izvjestaj.pdf',
                        path: pdfPath,
                    }
                ]
            }, (error, info) => {
                if (error) {
                    res.status(500).json({error: 'There was an error sending the email'});
                } else {
                    res.status(200).json({message: "Poruka poslana"});
                }
            });
        }
    );
}



const getPrisustvoRadnika = async(req, res) => {

    const id = req.params.id;

    const korisnik = await Korisnik.findById(id);
    const prisustva = await Attendance.find({korisnik: id, timeLogOut: {$ne: undefined}});

    
    const prisustvoSaVremenom = prisustva.map(prisustvo => {
        const durationInMs = prisustvo.timeLogOut - prisustvo.timeLogIn;
        const durationInHours = durationInMs / 1000 / 60 / 60;
        const sati = Math.floor(durationInHours);
        const minute = Math.round((durationInHours - sati) * 60);
        return {...prisustvo._doc, sati, minute};
    });
    
    res.render("prisustvoRadnika", {
        title: "Prisustvo radnika",
        korisnik,
        prisustva: prisustvoSaVremenom
    })
}


const checkForAuthentication = (req, res, next) => {
    if(req.session.korisnickoIme){
        next();
    }else{
        res.status(403).redirect("/prijava");
    }
}

const logOut = (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return res.status(500).json({message: "Greška prilikom odjave."});
        }
        res.status(200).json({message: "ok"});
    });
    
}

const ocistiObavjesti = async (req, res) =>{
    try{
        const obavjesti = await Obavjesti.find({korisnik: req.session.userId, isSeen: "0"});
        obavjesti.forEach(async obavjest => {
            obavjest.isSeen = "1";
            await obavjest.save();
        });
        return res.status(200).json({message: "Obavjesti očiščene"});
    }catch(err){
        return res.status(500).json({message: "Nešto je krenulo po zlu"});
    }
}

const konvertujDatumProjekta = (projectObject, atribut) => {
    var datum = projectObject[atribut];
    var dan = ("0" + datum.getDate()).slice(-2);
    var mjesec = ("0" + (datum.getMonth() + 1)).slice(-2);
    var godina = datum.getFullYear();
    return formatiraniDatum = godina + "-" + mjesec + "-" + dan;
}

module.exports = {
    getRadnaPovrsinaPocetna,
    checkForAuthentication,
    logOut,
    getDodajKorisnika,
    getSviKorisnici,
    getKorisnik,
    getDodajProjekat,
    getSviProjekti,
    getProjekatDetalji,
    getProjekatPromjena,
    getProjekatDodajZadatak,
    getMojiZadaci,
    getUnosZadatka,
    getDetaljiZadatka,
    getChat,
    getUserSelection,
    getAktivnosti,
    deleteAktivnost,
    getRadnoVrijemeRadnici,
    getIzvjestajMjesecniRadnika,
    getIzvjestajGodisnjiRadnika,
    postSlanjeIzvjestajaMail,
    getRadnoVrijemeProjekti,
    getIzvjestajProjekata,
    getPrisustvoRadnika,
    getIzvjestajUkupniRadnika,
    getPrisustvoMjesecnoRadnika,
    getPrisustvoGodisnjeRadnika,
    getPrisustvoUkupnoRadnika,
    ocistiObavjesti,
}



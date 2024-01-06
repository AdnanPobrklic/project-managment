const PDFDocument = require("pdfkit");
const Korisnik = require("../models/Korisnik");
const Projekat = require("../models/Projekat");
const Attendance = require("../models/Attendance");

async function izvjestajRadnogVremena(projketi, korisnici, filterFunction) {
    korisnici.forEach(korisnik => {
        korisnik.radnoVrijemeHr = 0;
        korisnik.radnoVrijemeMin = 0;
        korisnik.zadaci = [];

        projketi.forEach(projekat => {
            projekat.zadaci.forEach(zadatak => {
                if (filterFunction(zadatak, korisnik)) {
                    korisnik.radnoVrijemeHr += zadatak.radnoVrijemeHr;
                    korisnik.radnoVrijemeMin += zadatak.radnoVrijemeMin;
                    if (korisnik.radnoVrijemeMin >= 60) {
                        korisnik.radnoVrijemeHr++;
                        korisnik.radnoVrijemeMin %= 60;
                    }

                    korisnik.zadaci.push({
                        naslov: zadatak.naslov,
                        radnoVrijemeHr: zadatak.radnoVrijemeHr,
                        radnoVrijemeMin: zadatak.radnoVrijemeMin
                    });
                }
            });
        });
    });
}

async function generisiPDF(dataCallback, endCallback, naslov, korisnici, datumLocalString) {
    const fs = require("fs");
    const doc = new PDFDocument();
    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    const fontThick = fs.readFileSync('./service/fonts/Roboto-Bold.ttf');
    const fontThin = fs.readFileSync('./service/fonts/Roboto-Medium.ttf');
    doc.registerFont('CustomFontThick', fontThick);
    doc.registerFont('CustomFontThin', fontThin);

    doc.image('./public/img/clipboard.png', {
        fit: [30, 30],
        align: 'center',
        valign: 'center'
    });

    doc
        .font('CustomFontThick')
        .fontSize(20)
        .text(naslov, 100, 125);

    doc
        .fontSize(12)
        .font('CustomFontThin')
        .text(`Izvještaj generisan datuma ${datumLocalString}.`, 50, 200);

        korisnici.forEach(korisnik => {
        // Provjeri da li radnik ima radno vrijeme
        if (korisnik.radnoVrijemeHr > 0 || korisnik.radnoVrijemeMin > 0) {
            doc
                .fontSize(12)
                .font('CustomFontThick')
                .text(`Radnik: ${korisnik.ime} ${korisnik.prezime}`, 50, 250);

            doc
                .fontSize(10)
                .font('CustomFontThin')
                .text(`Ukupno radno vrijeme: ${korisnik.radnoVrijemeHr} sati i ${korisnik.radnoVrijemeMin} minuta.`, 50, 270);

            // Dodaj sekciju sa zadacima samo ako radnik ima radno vrijeme po zadacima
            if (korisnik.zadaci.length > 0) {
                doc
                    .fontSize(10)
                    .font('CustomFontThin')
                    .text("Zadaci:", 50, 290);

                korisnik.zadaci.forEach(zadatak => {
                    doc
                        .fontSize(10)
                        .font('CustomFontThin')
                        .text(`- ${zadatak.naslov}: ${zadatak.radnoVrijemeHr} sati i ${zadatak.radnoVrijemeMin} minuta.`, 60, doc.y + 20);
                });

                doc.moveDown();
            }
        }else{
            doc
            .fontSize(10)
            .font('CustomFontThin')
            .text(`Radnik: ${korisnik.ime} ${korisnik.prezime} nema zabilježeno radno vrijeme.`, 50, doc.y + 25);
        }
    });

    doc.end();
}


async function mjesecniIzvjestajRadnika(dataCallback, endCallback) {
    const trenutniDatum = new Date();
    const datumLocalString = trenutniDatum.toLocaleDateString();
    const trenutniMjesec = trenutniDatum.getMonth();
    const trenutnaGodina = trenutniDatum.getFullYear();

    const projketi = await Projekat.find();
    const korisnici = await Korisnik.find({ uloga: { $ne: 0 } });

    await izvjestajRadnogVremena(projketi, korisnici, (zadatak, korisnik) => {
        const datumIzvrsetka = new Date(zadatak.datumIzvrsetka);
        return (zadatak.dodijeljen.toString() === korisnik._id.toString() && zadatak.izvrsen &&
            datumIzvrsetka.getMonth() === trenutniMjesec && datumIzvrsetka.getFullYear() === trenutnaGodina);
    });

    await generisiPDF(dataCallback, endCallback, "Izvještaj mjesečnog radnog vremena", korisnici, datumLocalString);
}

async function godisnjiIzvjestajRadnika(dataCallback, endCallback) {
    const trenutniDatum = new Date();
    const datumLocalString = trenutniDatum.toLocaleDateString();
    const trenutnaGodina = trenutniDatum.getFullYear();

    const projketi = await Projekat.find();
    const korisnici = await Korisnik.find({ uloga: { $ne: 0 } });

    await izvjestajRadnogVremena(projketi, korisnici, (zadatak, korisnik) => {
        const datumIzvrsetka = new Date(zadatak.datumIzvrsetka);
        return (zadatak.dodijeljen.toString() === korisnik._id.toString() && zadatak.izvrsen &&
            datumIzvrsetka.getFullYear() === trenutnaGodina);
    });

    await generisiPDF(dataCallback, endCallback, "Izvještaj godišnjeg radnog vremena", korisnici, datumLocalString);
}

async function ukupniIzvjestajRadnika(dataCallback, endCallback) {
    const trenutniDatum = new Date();
    const datumLocalString = trenutniDatum.toLocaleDateString();

    const projketi = await Projekat.find();
    const korisnici = await Korisnik.find({ uloga: { $ne: 0 } });

    await izvjestajRadnogVremena(projketi, korisnici, (zadatak, korisnik) => true); // Svi zadaci

    await generisiPDF(dataCallback, endCallback, "Izvještaj ukupnog radnog vremena", korisnici, datumLocalString);
}

async function izvjestajProjekti(dataCallback, endCallback){

    const trenutniDatum = new Date();
    const datumLocalString = trenutniDatum.toLocaleDateString();

    const projekti = await Projekat.find()
        .populate("menadzer", "ime prezime");

    projekti.forEach(projekat => {
        projekat.statusProjektaText = 
            projekat.statusProjekta == 0 ? "na čekanju" : 
            projekat.statusProjekta == 1 ? "u izradi" :
            projekat.statusProjekta == 2 ? "završen" :
            projekat.statusProjekta == 3 ? "obustavljen" :
            "nepoznato";
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

    const fs = require("fs");
    const doc = new PDFDocument();
    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    const fontThick = fs.readFileSync('./service/fonts/Roboto-Bold.ttf');
    const fontThin = fs.readFileSync('./service/fonts/Roboto-Medium.ttf');
    doc.registerFont('CustomFontThick', fontThick);
    doc.registerFont('CustomFontThin', fontThin);

    doc.image('./public/img/clipboard.png', {
        fit: [30, 30],
        align: 'center',
        valign: 'center'
    });

    doc
        .font('CustomFontThick')
        .fontSize(20)
        .text("Izvještaj radnog vremena po projektu", 100, 125)

        doc
        .fontSize(12)
        .font('CustomFontThin')
        .text(`Izvještaj generisan datuma ${datumLocalString}.`, 50, 200);
    
    let korisniciPositionY = 250;
    projekti.forEach(projekat => {
        doc
            .fontSize(10)
            .font('CustomFontThin')
            .text(`- Na projekatu "${projekat.naziv}" kojim rukovodi ${projekat.menadzer.ime} ${projekat.menadzer.prezime}, sa ${projekat.radnici.length} radnika, koji je trenutno označen kao "${projekat.statusProjektaText}" sa predviđenim rokom ${projekat.startniDatum.toLocaleDateString()}-${projekat.zavrsniDatum.toLocaleDateString()}, koji obuhvata ukupno ${projekat.zadaci.length} zadataka, zabilježeno je ukupno uloženih ${projekat.radniSati}h i ${projekat.radneMinute}minuta radnog vremena.`, 50, korisniciPositionY)
        korisniciPositionY += 80;
    });
    doc.end();
};

async function generateAttendanceReport(title, dataCallback, endCallback, startDate, endDate) {
    const korisnici = await Korisnik.find({ uloga: { $ne: 0 } });

    let prisustva = await Attendance.find({
        timeLogIn: {
            $gte: startDate,
            $lt: endDate
        },
        timeLogOut: {
            $ne: undefined
        }
    });

    korisnici.forEach(korisnik => {
        korisnik.prisustva = [];

        prisustva.forEach(prisustvo => {
            if (String(prisustvo.korisnik) === String(korisnik._id)) {
                let razlika = prisustvo.timeLogOut - prisustvo.timeLogIn;
                let sati = Math.floor(razlika / 1000 / 60 / 60);
                let minute = Math.floor((razlika / 1000 / 60) % 60);

                prisustvo.trajanjeSati = sati;
                prisustvo.trajanjeMinute = minute;

                korisnik.prisustva.push(prisustvo);
            }
        })
    })

    const trenutniDatum = new Date();
    const datumLocalString = trenutniDatum.toLocaleDateString();

    const fs = require("fs");
    const doc = new PDFDocument();
    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    const fontThick = fs.readFileSync('./service/fonts/Roboto-Bold.ttf');
    const fontThin = fs.readFileSync('./service/fonts/Roboto-Medium.ttf');
    doc.registerFont('CustomFontThick', fontThick);
    doc.registerFont('CustomFontThin', fontThin);

    doc.image('./public/img/clipboard.png', {
        fit: [30, 30],
        align: 'center',
        valign: 'center'
    });

    doc
        .font('CustomFontThick')
        .fontSize(20)
        .text(title, 100, 125)

    doc
        .fontSize(12)
        .font('CustomFontThin')
        .text(`Izvještaj generisan datuma ${datumLocalString}.`, 50, 200);

    let korisniciPositionY = 250;
    korisnici.forEach(korisnik => {
        doc
            .fontSize(12)
            .font('CustomFontThin')
            .text(`Prisustva korisnika ${korisnik.ime} ${korisnik.prezime}`, 50, korisniciPositionY)
        korisniciPositionY += 30;
        if(korisnik.prisustva.length > 0){
            korisnik.prisustva.forEach(prisustvo => {
                doc
                    .fontSize(10)
                    .font('CustomFontThin')
                    .text(`- Na dan ${prisustvo.timeLogIn.toLocaleString('bs-BA').substring(0, 10)} od ${prisustvo.timeLogIn.toLocaleString('bs-BA').substring(12)} do ${prisustvo.timeLogOut.toLocaleString('bs-BA').substring(12)} (ukupno vrijeme provedeno ~ ${prisustvo.trajanjeSati}h ${prisustvo.trajanjeMinute}min)`, 50, korisniciPositionY)
                korisniciPositionY += 30;
            })
        }else{
            doc
                .fontSize(10)
                .font('CustomFontThin')
                .text(`Ne postoji zabilježeno prisustvo`, 50, korisniciPositionY)
            korisniciPositionY += 30;
        }
    });
    doc.end();
}

async function izvjestaMjesecniPrisustva(dataCallback, endCallback) {
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(1);
    endDate.setHours(0, 0, 0, 0);

    await generateAttendanceReport("Izvještaj ovomjesečnog prisustva radnika", dataCallback, endCallback, startDate, endDate);
}

async function izvjestaGodisnjegPrisustva(dataCallback, endCallback) {
    const startDate = new Date();
    startDate.setMonth(0);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate.setMonth(0);
    endDate.setDate(1);
    endDate.setHours(0, 0, 0, 0);

    await generateAttendanceReport("Izvještaj ovogodišnjeg prisustva radnika", dataCallback, endCallback, startDate, endDate);
}

async function izvjestaUkupnogPrisustva(dataCallback, endCallback) {
    const startDate = new Date(0); 
    const endDate = new Date();

    await generateAttendanceReport("Izvještaj ukupnog prisustva radnika", dataCallback, endCallback, startDate, endDate);
}



module.exports = {
    mjesecniIzvjestajRadnika,
    godisnjiIzvjestajRadnika,
    ukupniIzvjestajRadnika,
    izvjestajProjekti,
    izvjestaMjesecniPrisustva,
    izvjestaGodisnjegPrisustva,
    izvjestaUkupnogPrisustva,
}



const { Router } = require("express");
const router = Router();
const radnaPovrsinaControllers = require("../controllers/radnaPovrsinaControllers");
const projectControllers = require("../controllers/projectControllers");
const korisnikControllers = require("../controllers/korisnikControllers")

router.get("/", (req, res) => res.redirect("/radna-povrsina/pocetna"))
router.get("/pocetna", radnaPovrsinaControllers.getRadnaPovrsinaPocetna);
router.get("/dodaj-korisnika", radnaPovrsinaControllers.getDodajKorisnika);
router.get("/svi-korisnici", radnaPovrsinaControllers.getSviKorisnici);
router.get("/svi-korisnici/korisnik/uredi/:id", korisnikControllers.checkIdValidityUser ,radnaPovrsinaControllers.getKorisnik);
router.get("/dodaj-projekat", radnaPovrsinaControllers.getDodajProjekat);
router.get("/svi-projekti", radnaPovrsinaControllers.getSviProjekti);
router.get("/svi-projekti/projekat/detalji/:id",projectControllers.checkIdValidity ,radnaPovrsinaControllers.getProjekatDetalji);
router.get("/svi-projekti/projekat/uredi/:id",projectControllers.checkIdValidity ,radnaPovrsinaControllers.getProjekatPromjena);
router.get("/svi-projekti/projekat/dodaj-zadatak/:id", projectControllers.checkIdValidity  ,radnaPovrsinaControllers.getProjekatDodajZadatak);
router.get("/moji-zadaci", radnaPovrsinaControllers.getMojiZadaci);
router.get("/unos-zadatka", radnaPovrsinaControllers.getUnosZadatka);
router.get("/detalji-zadatka/:id", radnaPovrsinaControllers.getDetaljiZadatka);
router.get("/poruke", radnaPovrsinaControllers.getUserSelection);
router.get("/poruke/:id", radnaPovrsinaControllers.getChat);
router.get("/aktivnosti", radnaPovrsinaControllers.getAktivnosti);
router.delete("/aktivnosti/obrisi/:id", radnaPovrsinaControllers.deleteAktivnost);
router.get("/radno-vrijeme/radnici", radnaPovrsinaControllers.getRadnoVrijemeRadnici);
router.get("/radno-vrijeme/projekti", radnaPovrsinaControllers.getRadnoVrijemeProjekti);
router.get("/radno-vrijeme/radnici/mjesecni/izvjestaj", radnaPovrsinaControllers.getIzvjestajMjesecniRadnika);
router.get("/radno-vrijeme/radnici/godisnji/izvjestaj", radnaPovrsinaControllers.getIzvjestajGodisnjiRadnika);
router.get("/radno-vrijeme/radnici/ukupni/izvjestaj", radnaPovrsinaControllers.getIzvjestajUkupniRadnika);
router.get("/prisustvo/radnici/mjesecni/izvjestaj", radnaPovrsinaControllers.getPrisustvoMjesecnoRadnika);
router.get("/prisustvo/radnici/godisnji/izvjestaj", radnaPovrsinaControllers.getPrisustvoGodisnjeRadnika);
router.get("/prisustvo/radnici/ukupni/izvjestaj", radnaPovrsinaControllers.getPrisustvoUkupnoRadnika);
router.get("/radno-vrijeme/projekti/izvjestaj", radnaPovrsinaControllers.getIzvjestajProjekata);
router.post("/radno-vrijeme/mailto/izvjestaj", radnaPovrsinaControllers.postSlanjeIzvjestajaMail);
router.get("/radno-vrijeme/prisustvo-radnika/:id", radnaPovrsinaControllers.getPrisustvoRadnika);
router.post("/obavjesti/ocisti-obavjesti", radnaPovrsinaControllers.ocistiObavjesti);
router.post("/odjava", radnaPovrsinaControllers.logOut);


module.exports = router;
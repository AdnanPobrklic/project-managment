const korisnikControllers = require("../controllers/korisnikControllers");
const { Router } = require("express");
const router = Router();

router.post("/dodaj-korisnika", korisnikControllers.dodajKorisnika);
router.patch("/azuriraj-korisnika/:id", korisnikControllers.checkIdValidityUser  ,korisnikControllers.azurirajKorisnika);
router.delete("/obrisi-korisnika/:id",korisnikControllers.checkIdValidityUser ,korisnikControllers.obrisiKorisnika);

module.exports = router;
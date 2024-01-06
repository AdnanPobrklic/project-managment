const { Router } = require("express");
const router = Router();
const projectControllers = require("../controllers/projectControllers");

router.post("/dodaj-projekat", projectControllers.checkIfAdminOrManager, projectControllers.postDodajProjekat);
router.patch("/azuriraj-projekat/:id",projectControllers.checkIdValidity ,projectControllers.checkIfAdminOrManager ,projectControllers.patchAzurirajProjekat);
router.post("/dodaj-zadatak-projekatu/:id", projectControllers.checkIdValidity,projectControllers.checkIfAdminOrManager, projectControllers.postDodajZadatakProjektu);
router.delete("/izbrisi-projekat/:id", projectControllers.checkIdValidity,projectControllers.checkIfAdminOrManager, projectControllers.deleteProjekat);
router.delete("/izbrisi-zadatak-projekatu/:id", projectControllers.checkIdValidity,projectControllers.checkIfAdminOrManager, projectControllers.deleteZadatakProjekta);
router.get("/zadaci/:id", projectControllers.getZadatke);
router.post("/unos-zadatka/:id", projectControllers.postZadatak);

module.exports = router;
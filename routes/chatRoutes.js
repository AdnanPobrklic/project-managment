const chatControllers = require("../controllers/chatControllers");
const { Router } = require("express");
const router = Router();

router.delete("/obrisi-razgovor/:id", chatControllers.deleteRazgovor);

module.exports = router;
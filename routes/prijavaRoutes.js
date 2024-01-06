const { Router } = require("express");
const router = Router();
const prijavaControllers = require("../controllers/prijavaControllers");

router.get("/", prijavaControllers.checkIfAuthenticated, prijavaControllers.forbiddCache ,prijavaControllers.getPrijava);
router.post("/", prijavaControllers.postPrijava);

module.exports = router;
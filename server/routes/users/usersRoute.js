const router = require("express").Router();
const passport = require("passport");
const validation = require("../../middleware/users/usersValidation");
const controller = require("../../routesControllers/users/usersController");

//User register
router.post("/register", validation.register, controller.register);

//User login
router.post("/login", validation.login, controller.login);

//User logout
router.get("/logout", controller.logout);

//! with authenticate ---------------------------
router.use(passport.authenticate("jwt", { session: false }));

//Profile
router.get("/profile", controller.profile);

//update username
router.patch("/profile/username", controller.updateUsername);

//update email
router.patch("/profile/email", controller.updateEmail);

//delete account
router.post("/profile/delete", controller.deleteAccount);

module.exports = router;

const router = require("express").Router();
const {
  ensureAuthenticated,
  ensureAuthorized,
} = require("../middleware/auth-middleware");
const { register } = require("../controllers/auth-controller");

const { getAll, getOne } = require("../controllers/admin-controller");

//this a route for all admin users
router.get(
  "/users",
  ensureAuthenticated,
  ensureAuthorized(["admin"]),
  async (req, res) => {
    /*
        #swagger.tags = ['Admin']
        #swagger.security = [{
            "Authorization": []
        }]
    */
    await getAll(req, res);
  }
);

// this is a route for one admin user when id is passed
router.get(
  "/users/:id",
  ensureAuthenticated,
  ensureAuthorized(["admin"]),
  async (req, res) => {
    /*
        #swagger.tags = ['Admin']
        #swagger.security = [{
            "Authorization": []
        }]
    */
    await getOne(req, res);
  }
);

router.get("/seed", async (req, res) => {
  //#swagger.tags = ['Admin']
  const admin = {
    name: "Administrator",
    email: "admin@markscodingspot.com",
    password: "Password123#",
  };

  await register(admin, "admin", res);
});

module.exports = router;

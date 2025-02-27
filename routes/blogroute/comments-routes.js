const router = require("express").Router();
const { ensureAuthenticated, ensureAuthorized, } = require("../../middleware/auth-middleware");
const {
  validationRules,
  validate,
} = require("../../validations/comment-validator");
const {
  addOne,
  removeOne,
} = require("../../controllers/blogcontrollers/comments-controller");

router.post(
  "/comments",
  ensureAuthenticated,
  validationRules(),
  validate,
  async (req, res) => {
    /*  #swagger.tags = ['Posts']
        #swagger.security = [{
        "Authorization": []
        }]
    	#swagger.parameters['obj'] = {
            in: 'body',
            required: true,
            schema: { $ref: "#/definitions/CommentModel" }
    } */
    await addOne(req, res);
  }
);

router.delete("/comments/:id", ensureAuthenticated, ensureAuthorized(["admin"]), async (req, res) => {
  /*  #swagger.tags = ['Posts']
        #swagger.security = [{
        "Authorization": []
        }]
    */
  await removeOne(req, res);
});
module.exports = router;

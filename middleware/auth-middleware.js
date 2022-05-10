const passport = require("passport");
// this check if the user is authenticated
const ensureAuthenticated = passport.authenticate("jwt", { session: false });
// this check if a user is authorized to access the the route needing authorization
// this (req, res, next) os to check if a user has multiple roles after authentication
const ensureAuthorized = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    return next();
  }
  return res.status(401).json({
    message: "Unauthorized",
    success: false,
  });
};

module.exports = {
  ensureAuthenticated,
  ensureAuthorized,
};

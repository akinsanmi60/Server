const router = require("express").Router();

const rootRoutes = require("./root");
const authRoutes = require("./auth");
const refreshRoutes = require("./refresh");
const logoutRoutes = require("./logout");
const adminRoutes = require("./admin-routes");
const categoriesRoutes = require("./blogroute/categories-routes");
const commentsRoutes = require("./blogroute/comments-routes");
const profileRoutes = require("./blogroute/profile-routes");
const storiesRoutes = require("./blogroute/stories-routes");
const videosRoutes = require("./blogroute/videos-routes");

router.use("/root", rootRoutes);
router.use("/auth", authRoutes);
router.use("/refresh", refreshRoutes);
router.use("/logout", logoutRoutes);
router.use("/api", adminRoutes);
router.use("/api", categoriesRoutes);
router.use("/api", commentsRoutes);
router.use("/api", profileRoutes);
router.use("/api", storiesRoutes);
router.use("/api", videosRoutes);

module.exports = router;

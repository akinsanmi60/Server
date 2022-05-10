const User = require("../model/user");

const getAllUsers = async (req, res) => {
  try {
    const [users, itemCount] = await Promise.all([
      User.find({})
        .sort({ createdAt: -1 })
        .limit(req.query.limit)
        .skip(req.skip)
        .lean()
        .exec(),
      User.count({}),
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    return res.status(201).json({
      object: "list",
      has_more: paginate.hasNextPages(req)(pageCount),
      data: users,
      pageCount,
      itemCount,
      currentPage: req.query.page,
      pages: paginate.getArrayPages(req)(3, pageCount, req.query.page),
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (!req?.params?.id)
      return res
        .status(400)
        .json({ message: "User ID required", success: false });
    const removeUser = await User.findOne({ _id: req.params.id }).exec();
    if (!removeUser) {
      return res.status4(04).json({
        message: `User ID ${req.params.id} not found`,
        success: false,
      });
    }
    return res.status(204).json({
      message: "User ID successfully deleted",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.params.id} not found` });
  }
  res.json(user);
};

module.exports = {
  getAllUsers,
  deleteUser,
  getUser,
};

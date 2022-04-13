const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { user, email, password } = req.body;
  if (!user || !email || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  // check for duplicate usernames in the db
  const duplicateName = await User.findOne({ username: user }).exec();
  if (duplicateName) return res.sendStatus(409); //Conflict

  // check for duplicate usernames in the db
  const duplicateEmail = await User.findOne({ userEmail: email }).exec();
  if (duplicateEmail) return res.sendStatus(409); //Conflict

  try {
    //encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create and store the new user
    const result = await User.create({
      username: user,
      userEmail: email,
      password: hashedPassword,
    });

    console.log(result);

    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };

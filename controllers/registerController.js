const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "email and password are required." });

  // check for duplicate usernames in the db
  const duplicateEmail = await User.findOne({
    userEmail: email.toLowerCase,
  }).exec();
  if (duplicateEmail) return res.sendStatus(409); //Conflict

  try {
    //encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create and store the new user
    const result = await User.create({
      firstname: firstname,
      lastname: lastname,
      userEmail: email,
      password: hashedPassword,
    });

    console.log(result);

    res.status(201).json({ success: `New user with ${email} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };

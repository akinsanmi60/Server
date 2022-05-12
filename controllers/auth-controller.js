const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../model/user");
const { welcomeSender, forgotPasswordSender } = require("../mailers/senders");

const register = async (data, role, res) => {
  try {
    let { firstname, lastname, email } = data;
    const userTaken = await validateEmail(email.toLowerCase);
    if (userTaken) {
      return res.status(400).json({
        email: "Email is already taken",
        message: "Registration failure",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(data.password, 16);
    // this create a round integer for email verification
    const code = crypto.randomInt(100000, 1000000);
    const newUser = new User({
      firstname: firstname,
      lastname: lastname,
      password: hashedPassword,
      verificationCode: code,
      role,
    });

    // this will create and store new array for the new user
    await newUser.save();
    welcomeSender(
      newUser.email,
      newUser.lastname,
      newUser.firstname,
      newUser.verificationCode
    );
    return res.status(201).json({
      message: "Account successfully created",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

// Login controller
const login = async (data, res) => {
  try {
    const { email, password } = data;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Username and password are required." });

    //checking if the email exist in the db
    const user = await User.findOne({ email });

    // if no user with the same email found
    if (!user) {
      res.status(404).json({
        message: "Failed login attempt",
        email: "Incorrect email",
        success: false,
      });
    }
    // evaluate password if the user with same email is found
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      let accessToken = jwt.sign(
        {
          user_id: user._id,
          role: user.role,
          email: user.email,
          name: user.name,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "60s",
        }
      );

      let refreshToken = jwt.sign(
        {
          user_id: user._id,
          role: user.role,
          email: user.email,
          name: user.name,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      // Saving refreshToken with current user
      user.refreshToken = refreshToken;
      let tokenedUser = await user.save();
      console.log(tokenedUser);

      // storing the token in cookie
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      }); //secure: true,

      // this can be send to FE as show the user details but is optional
      let profile = {
        email: user.email,
        role: user.role,
        name: user.name,
      };
      // combing the token and profile, and can be send back as response to the FE
      let result = {
        user: profile,
        token: accessToken,
        expiresIn: 168,
      };
      return res.status(200).json({
        ...result,
        message: "Login success",
        success: true,
      });
    } else {
      return res.status(403).json({
        message: "Failed login attempt",
        email: "Incorrect password",
        success: false,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

// Email verification
const verify = async (data, res) => {
  try {
    let { code } = data;
    const user = await User.findOne({ verificationCode: code });
    if (!user) {
      return res.status(404).json({
        message: "Invalid code",
        success: false,
      });
    } else if (user.isEmailVerified) {
      return res.status(404).json({
        message: "Email already verified",
        success: false,
      });
    }
    await user.update({ isEmailVerified: true });
    return res.status(201).json({
      message: "Email verification success",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

// Enables the user to  password
const forgotPassword = async (data, res) => {
  try {
    let { email } = data;
    // to check if user exist
    const user = await User.findOne({ email: email });
    // if not existing
    if (!user) {
      return res.status(404).json({
        message: "Invalid email",
        success: false,
      });
    }
    // new code for email verification is generated
    const code = crypto.randomInt(100000, 1000000);
    // here the code is hashed for protecting
    const passwordResetCode = await bcrypt.hash(code.toString(), 16);
    await user.update({ passwordResetCode: passwordResetCode });
    forgotPasswordSender(user.email, user.name, code);
    return res.status(404).json({
      message: "Verication code sent to your email",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

// Enables the user to reset password
const resetPassword = async (data, res) => {
  try {
    let { email, code, newPassword } = data;
    // to check if user exist
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        message: "Invalid email",
        success: false,
      });
    }
    // if user is found, then we try to match with it the available email data
    let isMatch = await bcrypt.compare(code.toString(), user.passwordResetCode);
    // if the match is true, the password will be updated
    if (isMatch) {
      const hashedPassword = await bcrypt.hash(newPassword, 16);
      await user.update(
        { password: hashedPassword },
        { passwordResetCode: "" }
      );
      return res.status(201).json({
        message: "Your password has been successfully reset",
        success: true,
      });
    } else {
      return res.status(404).json({
        message: "Invalid code",
        success: false,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

// Enables the user to change password while logged in
const changePassword = async (req, res) => {
  try {
    // wiil request for the data destructure below to ascertain user
    let { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    // if user is found, then we try to match the oldpassword
    let isMatch = await bcrypt.compare(oldPassword, user.password);
    if (isMatch) {
      const hashedPassword = await bcrypt.hash(newPassword, 16);
      await user.update({ password: hashedPassword });
      return res.status(201).json({
        message: "Your password has been successfully reset",
        success: true,
      });
    } else {
      return res.status(404).json({
        message: "Your old password is incorrect",
        success: false,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const refreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  //so if it exist, it will be set to refreshToken
  const storeRefreshToken = cookies.jwt;

  const user = await User.findOne({ storeRefreshToken }).exec();
  if (!user) return res.sendStatus(403); //Forbidden
  // evaluate jwt
  jwt.verify(storeRefreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || user.email !== decoded.email) return res.sendStatus(403);
    const roles = Object.values(user.role);
    const accessToken = jwt.sign(
      {
        user_id: user._id,
        role: roles,
        email: user.email,
        name: user.name,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    res.json({ accessToken });
  });
};


const logout = async (req, res) => {
  // On client, also delete the accessToken
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //successful
  const logoutRefreshToken = cookies.jwt;
  
  // Is logoutRefreshToken in db?
  const foundUser = await User.findOne({ logoutRefreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true }); // this clear the cookie
    return res.sendStatus(204); //successful
  }

  // Delete logoutRefreshToken in db
  foundUser.logoutRefreshToken = "";
  const result = await foundUser.save();
  console.log(result);

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};


//this check if the email has been taken
const validateEmail = async (email) => {
  let user = await User.findOne({ email });
  if (user) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  login,
  register,
  verify,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logout,
};

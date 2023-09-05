const express = require('express');
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const JWT_SECRET = "YouCanLogInNow";
const fetchUser = require("../middleware/fetchUser")

//Routes:1 create a user using : POST "/api/auth/createuser" . No Login Required

router.post('/createuser', [

  //validation for form

  body("name", "Enter a Valid Name").isLength({ min: 3 }),
  body("email", "Enter a Valid Email").isEmail(),
  body("password", "Password Must be 8 Characters").isLength({ min: 8 }),

], async (req, res) => {

  let success = false;

  //If there are error then return bad request and the errors

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() })
  }

  //check wheatear the email is already exists

  try {

    let user = await User.findOne({ email: req.body.email })

    if (user) {
      return res.status(400).json({ success, error: "Email already Exists" })
    }

    //create hash password by encrypt

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt)

    //create user 

    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
    })

    // provide token by using user id

    const data = {
      user: {
        id: user.id
      }
    }

    const authToken = jwt.sign(data, JWT_SECRET)

    res.status(200).send({ success: true, authtoken: authToken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error")
  }
})

//Routes:2 Authenticate user using: POST "/api/auth/Login" . No Login Required

router.post('/login', [

  //validation for form

  body("email", "Enter a Valid Email").isEmail(),
  body("password", "Password Can't be Blank").exists(),

], async (req, res) => {

  //If there are error then return bad request and the errors

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body;

  try {

    //Find email on database 

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Please try to login with correct credentials" })
    }

    //compare password on database 

    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
      return res.status(400).json({ error: "Please try to login with correct credentials" })
    }

    // provide token by using user id

    const data = {
      user: {
        id: user.id
      }
    }

    const authToken = jwt.sign(data, JWT_SECRET)
    console.log(authToken)
    res.status(200).send({ success: true, authtoken: authToken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error")
  }

})

//Routes:3 Get loggedIn user details using  : POST "/api/auth/getuser" .Login Required

router.post('/getuser', fetchUser, async (req, res) => {

  try {

    let userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error")
  }
})

module.exports = router;
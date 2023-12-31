const jwt = require('jsonwebtoken');
const JWT_SECRET = "YouCanLogInNow";

const fetchUser = (req, res ,next) => {

    //get the user from jwt token and add id to req object

    const token = req.header("auth-token");

    if (!token) {
        return res.status(401).json({ errors: "please authenticate using valid token" })
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user

        next()

    } catch (error) {
        return res.status(401).json({ errors: "please authenticate using valid token" })
    }

}

module.exports = fetchUser;
const jwt = require("jsonwebtoken");

require("dotenv").config();

const attachUser = async (req) => {
    const token = req.headers.authorization;
    if (token) {
        try {
            let { user } = await jwt.verify(token, process.env.JWT_SECRET);
            req.user = user;
        } catch (err) {
            console.log(err);
        }
    }

    req.next();
};

module.exports = attachUser;

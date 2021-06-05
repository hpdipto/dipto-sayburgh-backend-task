const jwt = require("jsonwebtoken");

const attachUser = async (req) => {
    const token = req.headers.authorization;
    try {
        let { user } = await jwt.verify(token, "secRet");
        req.user = user;
    } catch (err) {
        console.log(err);
    }

    req.next();
};

module.exports = attachUser;

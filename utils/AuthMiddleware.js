const jwt = require("jsonwebtoken")

module.exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({msg: "Authorization must be included in header"})
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        if(user.role !== "Staff") return res.sendStatus(403)
        req.user = user;
        next();
    });
};
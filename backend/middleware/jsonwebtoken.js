const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRETKEY;

const authenticateJWT = (req, res, next) => {
    const token = req.headers?.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token is not provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'JWT authentication failed' });
        } else {
            res.cookie('authToken', token, { httpOnly: true, maxAge: 86400000 });
            req.accountId = decoded.positionId;
            req.role = decoded.role;
            next();
        }
    });
};

module.exports = { authenticateJWT };
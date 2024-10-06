const jwt = require('jsonwebtoken');

const authHandler = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("here")
        return res.status(401).send({ message: 'Authorization required' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        req.user = user;
        next();
    });
};

const authorizeAdmin = (req, res, next) => {
    if (!req.user.role === 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

module.exports = { authHandler, authorizeAdmin };

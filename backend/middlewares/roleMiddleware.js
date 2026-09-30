const roleMiddleware = (... allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Недостатньо прав для цієї дії"
            })
        }
        next()
    }
};

module.exports = roleMiddleware;
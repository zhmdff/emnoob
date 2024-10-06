const authenticate = function (req, res, next) {
    const isAuthenticated = req.session.username ? true : false;
    const userType = req.session.userType;
    req.session.globalUserType = userType; // Store globalUserType in session

    if (isAuthenticated) {
        next();
    } else {
        if (req.url !== '/login' && req.url !== '/form-login') {
            return res.redirect('/login');
        } else {
            next();
        }
    }
};

module.exports = {
    authenticate
};

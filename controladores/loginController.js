const express = require('express');
const handlebars = require('express-handlebars');
const app = express();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const userModel = require('../model/model');

app.engine(
    "hbs", 
    handlebars({
        extname: ".hbs",
        defaultLayout: 'index.hbs',
    })
);

app.set("view engine", "hbs");
app.set("views", "./views");

app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

/* --------- email & sms config --------- */
// ethereal
//const ethereal = require('./email/ethereal');
//const twilio = require('./sms/twilio');

const adminEmail = 'kenyon.price7@ethereal.email';
const adminNumber = process.env.WHATSAPP_NUMBER;

/* ----------------------- SERIALIZE & DESERIALIZE ----------------------- */
passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

/* ----------------------- LOGIN ----------------------- */

const loginUser = (req, username, password, done) => {
    // ver en db si existe el username
    userModel.findOne({ 'username' : username },
        function(err, user) {
            // If there is an error
            if(err) {
                return done(err);
            }
            // If username does not exist on db
            if(!user) {
                loggerError.info(`Usuario "${username}" no encontrado`);
                loggerError.info('message', 'Usuario no encontrado');
                return done(null, false);
            }
            // User exists but wrong pwrd
            if(!isValidPassword(user, password)) {
                loggerError.info('Contrasena no valida');
                loggerError.info('message', 'Invalid Password');
                return done(null, false);
            }
            // si alles is goed
            return done(null, user);
        }
    )
}

/* -------------- check valid password -------------- */
const isValidPassword = function(user, password){        
    return bCrypt.compareSync(password, user.password);
} 
    
/* -------------- routes -------------- */

const LoginOk = (req, res, next) => {
    if(req.isAuthenticated()){
        res.render("welcome", { user: user});
    }
    else {
        res.sendFile(process.cwd() + '/public/login.html')
    }
}

const LoginFail = (req, res, next) => {
    res.render('login-error', {});
}

const Logout = (req, res, next) => {
    let nombre = req.user.name;

    req.logout();
    res.render("logout", { nombre });
}

const Redirect = (req, res, next) => {
    res.redirect('/');
}


module.exports = {
    loginUser,
    LoginOk,
    LoginFail,
    Logout,
    Redirect
};


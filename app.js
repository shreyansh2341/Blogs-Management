require('dotenv').config();
const express = require('express');
const expresslayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const connectDB = require('./server/config/db');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const mainrouter = require('./server/routes/mainRouter');
const adminrouter = require('./server/routes/admin');

const app = express();

connectDB();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir)); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DB_URI }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

app.use(expresslayouts);
app.set('layout', './layouts/body');
app.set('view engine', 'ejs');

app.use('/', mainrouter);
app.use('/admin', adminrouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`);
});

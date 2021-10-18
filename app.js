const express = require('express');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize'); 
const helmet = require("helmet"); 
const rateLimit = require("express-rate-limit"); 
const mongoose = require('mongoose');
require('dotenv').config();

const path = require('path');

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

// dotenv //
const Mongo_User = process.env.MDB_USER;
const Mongo_Password = process.env.MDB_PASSWORD;

// connect to database mongodb // 
mongoose.connect(`mongodb+srv://${Mongo_User}:${Mongo_Password}@cluster0.edtlf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

//express rate limiting
const limiter = rateLimit({ 
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // allow everyone to access // 
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // allow certain headers // 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // allow these requests //
    next();
  });


app.use(bodyParser.json());

// mongodb sanitize
app.use(bodyParser.urlencoded({ extended: true }));
app.use(mongoSanitize()); // to remove data, use:
app.use(                  // to replace prohibited characters with _, use:
  mongoSanitize({
    replaceWith: '_',
  }),
);

app.use(helmet()); // helmet injections
app.use(limiter); // express rate limiting

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);


module.exports = app;
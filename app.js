const express = require('express');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize'); 
const helmet = require("helmet"); 
const rateLimit = require("express-rate-limit"); 

const mongoose = require('mongoose');

const path = require('path');

const stuffRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');

mongoose.connect('mongodb+srv://teapiee:BaileysBeads28@cluster0.edtlf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

const limiter = rateLimit({ // express rate limiting
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(bodyParser.urlencoded({ extended: true })); // mongodb sanitize
app.use(bodyParser.json());

// To remove data, use:
app.use(mongoSanitize()); // mongodb sanitize

// Or, to replace prohibited characters with _, use:
app.use(                  // mongodb sanitize
  mongoSanitize({
    replaceWith: '_',
  }),
);

app.use(helmet()); // helmet

//  apply to all requests
app.use(limiter); // express rate limiting

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', stuffRoutes);
app.use('/api/auth', userRoutes);


module.exports = app;
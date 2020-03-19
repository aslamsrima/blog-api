const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const errorHandler = require('errorhandler');
const mongoose = require('mongoose');

mongoose.promise = global.Promise;

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'LightBlog', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if(!isProduction) {
  app.use(errorHandler());
}

// Load environment file
require('dotenv').config()

// mongoose.connect(process.env.MONGODB_URI);
// mongoose.set('debug', true);

console.log("Connecting MongoDB on: ", process.env.MONGODB_URI);


mongoose
  .connect(
    process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB Connected!');
    // Add models
    require('./models/Articles');
    // Add routes
    app.use(require('./routes'));

    app.use((req, res, next) => {
      const err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    if (!isProduction) {
      app.use((err, req, res) => {
        res.status(err.status || 500);

        res.json({
          errors: {
            message: err.message,
            error: err,
          },
        });
      });
    }

    app.use((err, req, res) => {
      res.status(err.status || 500);

      res.json({
        errors: {
          message: err.message,
          error: {},
        },
      });
    });

    app.listen(process.env.PORT, () => console.log(`Server started on ${process.env.PORT}`));
  })
  .catch(err => {
    console.log(`DB Connection Error: \n ${err}`);
  });
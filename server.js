const express = require('express');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('./configs/passport-config');
require('dotenv').config();

require('./configs/db-config'); // connect to DB

const app = express();
app.use(cors({
  origin: 'https://epiclogs.tk',
  methods: 'GET,POST,PUT,PATCH,DELETE',
  allowedHeaders: 'Content-Type,X-Requested-With',
  credentials: true,
  maxAge: 3600
}));
app.use(express.json({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', require('./routes/auth-route'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
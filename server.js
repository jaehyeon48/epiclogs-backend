const express = require('express');
const cors = require('cors');
require('./configs/passport-config');
require('dotenv').config();

require('./configs/db-config'); // connect to DB

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,PATCH,DELETE',
  allowedHeaders: 'Content-Type,X-Requested-With',
  credentials: true,
  maxAge: 3600
}));
app.use(express.json({ extended: false }));

app.use('/api/auth', require('./routes/auth-route'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
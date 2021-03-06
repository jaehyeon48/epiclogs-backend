const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
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

app.use('/api/auth', require('./routes/auth-route'));
app.use('/api/post', require('./routes/post-route'));
app.use('/api/user', require('./routes/user-route'));
app.use('/api/comment', require('./routes/comment-route'));
app.use('/api/reply', require('./routes/reply-route'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
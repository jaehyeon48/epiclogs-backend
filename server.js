const express = require('express');
require('dotenv').config();

require('./configs/db-config'); // connect to DB

const app = express();


app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
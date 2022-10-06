const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const app = express();
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');

// app.use(cors());
const corsOptions = {
    origin: '*',
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS', 'PUT']
}
app.use(cors(corsOptions));

dotenv.config({path: './config.env'});
require('./db/conn');


app.use(express.json());

app.use(require('./router/auth'));

//Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent Cross-site-scripting
app.use(xss());

const PORT = process.env.PORT;


app.listen(5000, () => {
    console.log(`Server is running in ${PORT}`);
})
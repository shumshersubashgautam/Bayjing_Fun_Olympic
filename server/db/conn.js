const mongoose = require('mongoose');

const DB = process.env.DATABASE;

mongoose.connect(DB).then(() => {
    console.log(`CONNECTED`);
}).catch((err) => {
    console.log(`Failed to connect`);
})
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv= require('dotenv');
dotenv.config({path: './config.env'}) 

const Tour = require('./../../model/tourModel');

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(con => {
    console.log('DB connections successfully established');  
});

// Reading the files
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));

//Import data from the database
const importData = async() => {
    try {
        await Tour.create(tours);
        console.log('Database created successfully');
    } catch (error) {
        console.log(error.message);
    }

    process.exit();
}

//DELETE ALL DATA FROM DATABASE

const deleteData = async() => {
    try {
        await Tour.deleteMany();
        console.log('Deleted successfully');
    } catch (error) {
        console.log(error);
    }

    process.exit();
}

if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
}

console.log(process.argv);

//command keys to run
// node dev-data/data/import-dev-data.js --import
// node dev-data/data/import-dev-data.js --delete
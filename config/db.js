const { Sequelize } = require('sequelize');


const createDB = new Sequelize('test-db', 'user', 'pass', {
    dialect: 'sqlite',
    host: './config/db.sqlite',
});

const connectDB = () => {
    createDB.sync().then((res)=> {
        console.log('connected to db');
    })
    .catch((e)=> {
        console.log('db connection failed', e);    })
}



module.exports = { createDB, connectDB };

const userModel = require('../models/userModel');
const orderModel = require('../models/orderModels');

orderModel.belongsTo(userModel, { foreignKey: "buyerId"});
userModel.hasMany(orderModel, { foreignKey: "id"});
// //aja

// const { Sequelize } = require("sequelize");

// //* Instantiates sequelize with the name of database, username, password and configuration options
// const createDB = new Sequelize("test-db", "user", "pass", {
//   dialect: "sqlite",
//   host: "./config/db.sqlite",
// });

// //* Connects the ExpressJS app to DB
// const connectToDB = () => {
//   createDB
//     .sync()
//     .then((res) => {
//       console.log("Successfully connected to database");
//     })
//     .catch((err) => console.log("Cannot connect to database due to:", err));
// };

// module.exports = { createDB, connectToDB };

// const userModel = require("../models/userModel");
// const orderModel = require("../models/orderModel");

// // Association to link userModel to orderModel
// orderModel.belongsTo(userModel, { foreignKey: "buyerID" });
// userModel.hasMany(orderModel, { foreignKey: "id" });
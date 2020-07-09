import accessEnv from "#root/helpers/accessEnv";

const DB_URI = accessEnv("DB_URI", "some_faulty_string");
var Sequelize = require('sequelize');

const db = new Sequelize(DB_URI, {
    dialectOptions: {
        charset: "utf8",
        multipleStatements: true
    },
    logging: false
});

export default db;

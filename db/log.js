const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('logstore', 'logstore', 'Logstore@1331', {
    host: '46.250.224.140',
    port: 5432,
    dialect: 'postgres',
});

const CheckScamLog = sequelize.define('CheckScamLog', {
    Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    FromIp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    TypeOfAction: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Value: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    Time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'CheckScamLog',
    timestamps: false,
});

const CheckScamVisitorLog = sequelize.define('CheckScamVisitorLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    visitDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
}, {
    tableName: 'CheckScamVisitorLog',
    timestamps: false,
});
const fs = require('fs');
const path = require('path');

// Define the log file path
const logFilePath = path.join(__dirname, 'logs.txt');

// Function to append logs to the file
const appendToFile = (message) => {
    fs.appendFile(logFilePath, message + '\n', (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
};

const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        appendToFile(`Connection to PostgreSQL has been established successfully.`);
        await CheckScamLog.sync({ alter: true });
        await CheckScamVisitorLog.sync({ alter: true });

        console.log('CheckScamLog table has been synchronized.');
    } catch (error) {
        appendToFile('Unable to connect to the database or synchronize the table:', error.message);
    }
};


const logRequest = async (fromIp, typeOfAction, action, value) => {
    try {
        // Check for recent log entries within the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentLog = await CheckScamLog.findOne({
            where: {
                FromIp: fromIp,
                Action: action,
                Value: value,
                TypeOfAction: typeOfAction,
                Time: {
                    [Op.gte]: fiveMinutesAgo
                }
            }
        });

        // If no recent log entry found, create a new log entry
        if (!recentLog) {
            await CheckScamLog.create({
                FromIp: fromIp,
                Action: action,
                Value: value,
                TypeOfAction: typeOfAction,
            });
            console.log('Log entry created:', { fromIp, action, value, typeOfAction });
        } else {
            console.log('Duplicate log entry detected, skipping:', { fromIp, action, value, typeOfAction });
        }
    } catch (error) {
        console.error('Error logging request:', error);
    }
};

module.exports = { sequelize, CheckScamLog, CheckScamVisitorLog, initializeDatabase, logRequest };

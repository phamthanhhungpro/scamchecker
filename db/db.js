const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('scamchecker', 'logstore', 'Logstore@1331', {
    host: '46.250.224.140',
    port: 5432,
    dialect: 'postgres',
});

const Reports = sequelize.define('Reports', {
    scammerName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bank: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reporterName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    reporterPhone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
    },
}, {
    timestamps: true, // Add createdAt and updatedAt fields
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
        await Reports.sync({ alter: true });
        console.log('Reports table has been synchronized.');
    } catch (error) {
        appendToFile('Unable to connect to the database or synchronize the table:', error.message);
    }
};

module.exports = { sequelize, Reports, initializeDatabase };

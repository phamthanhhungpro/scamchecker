const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('scamchecker', 'logstore', 'Logstore@1331', {
    host: '46.250.224.140',
    port: 5432,
    dialect: 'postgres',
});

const Reports = sequelize.define('Reports', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
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
    uploadFiles: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
}, {
    timestamps: true, // Add createdAt and updatedAt fields
});

const Scammers = sequelize.define('Scammers', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    money: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bankAccount: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    viewCount: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    time: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    fullName : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    phone : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'GDV', 'USER'),
        defaultValue: 'USER',
        allowNull: false,
    }
},
{
    timestamps: true,
});

// define table BaoHiem
const BaoHiem = sequelize.define('BaoHiem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    profilePicture: {
        type: DataTypes.STRING, // Assuming you'll store the file path
        allowNull: false,
    },
    coverPhoto: {
        type: DataTypes.STRING, // Assuming you'll store the file path
    },
    insurancePackage: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    website: {
        type: DataTypes.STRING,
    },
    category: {
        type: DataTypes.STRING,
    },
    zalo: {
        type: DataTypes.STRING,
    },
    facebook: {
        type: DataTypes.STRING,
    },
    address: {
        type: DataTypes.STRING,
    },
    telegram: {
        type: DataTypes.STRING,
    },
    introduction: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bankAccount: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    accountHolder: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // The table name
            key: 'id',
        },
    },
});

User.hasOne(BaoHiem, {
    foreignKey: 'userId',
    as: 'baohiem',
});

BaoHiem.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
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
        sequelize.sync({ force: false }).then(() => {
            console.log('Database & tables created!');
        });

    } catch (error) {
        appendToFile('Unable to connect to the database or synchronize the table:', error.message);
    }
};

module.exports = { sequelize, Reports, Scammers, User, BaoHiem, initializeDatabase };

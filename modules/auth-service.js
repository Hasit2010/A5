require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Add debugging
console.log("Current working directory:", process.cwd());
console.log("Environment variables:", {
    MONGODB_URI: process.env.MONGODB_URI,
    DB_USER: process.env.DB_USER
});

let User; // to be defined on new connection

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

function initialize() {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGODB_URI);

        db.on('error', (err) => {
            reject(err);
        });

        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
}

function registerUser(userData) {
    return new Promise(async (resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
            return;
        }

        try {
            const hash = await bcrypt.hash(userData.password, 10);
            userData.password = hash;

            let newUser = new User(userData);
            await newUser.save();
            resolve();
        } catch (err) {
            if (err.code === 11000) {
                reject("User Name already taken");
            } else {
                reject(`There was an error creating the user: ${err}`);
            }
        }
    });
}

function checkUser(userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .exec()
            .then(async users => {
                if (users.length === 0) {
                    reject(`Unable to find user: ${userData.userName}`);
                    return;
                }

                const match = await bcrypt.compare(userData.password, users[0].password);
                if (!match) {
                    reject(`Incorrect Password for user: ${userData.userName}`);
                    return;
                }

                if (users[0].loginHistory.length === 8) {
                    users[0].loginHistory.pop();
                }

                users[0].loginHistory.unshift({
                    dateTime: new Date().toString(),
                    userAgent: userData.userAgent
                });

                User.updateOne(
                    { userName: users[0].userName },
                    { $set: { loginHistory: users[0].loginHistory } }
                )
                .exec()
                .then(() => {
                    resolve(users[0]);
                })
                .catch(err => {
                    reject(`There was an error verifying the user: ${err}`);
                });
            })
            .catch(() => {
                reject(`Unable to find user: ${userData.userName}`);
            });
    });
}

module.exports = {
    initialize,
    registerUser,
    checkUser
};

console.log("MongoDB Connection String:", process.env.MONGODB_URI);


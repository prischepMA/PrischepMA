const fs = require('fs');
const crypto = require('crypto');

const verification = (function verification() {
    const genRandomString = function (length) {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0, length); /** return required number of characters */
    };

    const sha512 = function (password, salt) {
        let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
        hash.update(password);
        let value = hash.digest('hex');
        return {
            salt: salt,
            passwordHash: value,
        };
    };

    const saltHashPassword = function (userpassword) {
        let salt = genRandomString(16); /** Gives us salt of length 16 */
        return sha512(userpassword, salt);
    };

    function readFile(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    const getUserPassword = async function (login) {
        const data = await readFile('./data/passwords.json');
        const users = new Map(JSON.parse(data));
        const password = users.get(login);
        if (password !== undefined) {
            return password;
        }
        return false;
    };

    const verifyPassword = async function (login, password) {
        const userPassword = await getUserPassword(login);
        if (!userPassword) {
            return false;
        }
        const hashPassword = sha512(password, userPassword.salt);
        if (hashPassword.passwordHash !== userPassword.passwordHash) {
            return false;
        }
        return {username: login, password: password };
    };

    return {
        verifyPassword,
        saltHashPassword,
    };
}());

module.exports = verification;


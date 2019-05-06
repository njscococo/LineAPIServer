const otplib = require('otplib');
const redis = require('redis');


/* #region  Connect to Redis */
let redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

redisClient.on("error", function (err) {
    console.log("Error:" + err);
});
redisClient.auth(process.env.REDIS_PW);

/* #endregion */

const genOTP = function () {
    otplib.authenticator.options = {
        step: 20,
        window: 1
    };
    return new Promise((resolve, reject) => {
        const secret = otplib.authenticator.generateSecret();
        const token = otplib.authenticator.generate(secret);
        resolve(token);
    })
}

const validateOTP = function (token, secret) {
    const isValid = otplib.authenticator.check(token, secret);
    console.log('otp:', isValid, secret, token);

}

module.exports = {
    genOTP,
    validateOTP
}
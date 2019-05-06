const otplib = require('otplib');
const redis = require('redis');

/* #region  Connect to Redis */
let redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

redisClient.on("error", function (err) {
    console.log("Error:" + err);
});
redisClient.auth(process.env.REDIS_PW);

/* #endregion */

const genOTP = function (tmnewaid) {
    otplib.authenticator.options = {
        step: 20,
        window: 1
    };
    
    return new Promise((resolve, reject) => {
        const secret = otplib.authenticator.generateSecret();
        const token = otplib.authenticator.generate(secret);

        redisClient.SETEX(tmnewaid, 620, secret);

        resolve(token);
    })
}

const validateOTP = function (token, tmnewaid) {
    let secret = redisClient.GET(tmnewaid);
    console.log('otp1:',  secret, token);
    const isValid = otplib.authenticator.check(token, secret);
    console.log('otp2:', isValid, secret, token);
    return isValid;

}



module.exports = {
    genOTP,
    validateOTP
}
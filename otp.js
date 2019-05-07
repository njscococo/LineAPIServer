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
    let isValid = false;
    redisClient.get(tmnewaid, (err, reply) => {
        if(err){
            console.log('redis get key err:', err);
            throw err;
        }
        console.log('otp1:', reply, token);
        isValid = otplib.authenticator.check(token, reply.toString());
        console.log('otp2:', isValid, reply, token);
        if(isValid){
            redisClient.del(tmnewaid, (error, result) => {
                if(error){
                    console.log('redis del key err:', error);
                    throw error;
                }
                console.log('redis del done:', result);
            });
        }

        return isValid;
    });
}

module.exports = {
    genOTP,
    validateOTP
}
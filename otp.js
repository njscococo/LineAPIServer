const otplib = require('otplib');


const genOTP = function (tmnewaid) {
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
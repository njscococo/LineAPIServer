const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
//const redis = require('redis');

const oauth2Client = new OAuth2(
    process.env.GMAILID,
    process.env.GMAILSECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

async function sendMail(receivers, otpToken) {
    const tokens = await oauth2Client.refreshAccessToken();
    const accessToken = tokens.credentials.access_token;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: "OAuth2",
            user: "voyagerlin@gmail.com",
            clientId: process.env.GMAILID,
            clientSecret: process.env.GMAILSECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            accessToken: accessToken
        }
    });

    let info = await transporter.sendMail({
        from: '"TMNEWA" <foo@example.com>', // sender address
        to: receivers, // list of receivers
        subject: "帳號綁定驗證碼", // Subject line
        text: `驗證碼：${otpToken}`, // plain text body
        html: `<b>驗證碼：${otpToken}</b>` // html body
    }, (err, response) => {
        err ? console.log('mail err:', err) : console.log('mail done:');
        transporter.close();
    });


}

module.exports = sendMail;

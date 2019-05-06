const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const redis = require('redis');


const oauth2Client = new OAuth2(
    process.env.GMAILID,
    process.env.GMAILSECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

async function sendMail(receivers) {
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
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>" // html body
    }, (err, response) => {
        err ? console.log('mail err:', err) : console.log('mail done:', response);
        transporter.close();
    });


}

module.exports = sendMail;

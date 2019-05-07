const Pool = require('pg').Pool;
const otp = require('./otp');

const sendEmail = require('./mailer');

//const dbconfig = require('./config.json');
let port = process.env.PORT;
const pool = new Pool({
    user: process.env.DB_USER,
    ssl: true,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    password: process.env.DB_PW,
    port: process.env.DB_PORT
});


//console.log('dbconfig:', dbconfig.herokudb.linetest);
const insertImage = (req, res) => {
    const { userId, drawImage } = req.body;
    //console.log('UserID:', userId)
    pool.query('insert into lineimage ( "userid","image") values ($1 , $2) returning id', [userId, drawImage], (err, results) => {
        if (err) {
            throw err;
        }
        //console.log('result userId:', userId, results);
        res.status(201).json(results.rows[0])

    }
    )
}

const queryProductImageById = (req, res) => {
    const prodId = req.params.prodId;
    pool.query('select image from products where "id"= $1 ', [prodId], (err, results) => {
        if (err) {
            throw err;
        }

        var img = Buffer.from(results.rows[0].image.split(',')[1], 'base64');

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': img.length
        });
        res.end(img);

    })
}

const queryImageById = (req, res) => {
    const userId = req.params.userId;
    const id = req.params.id;
    console.log('queryImage:', userId, id)
    pool.query('select "image" from lineimage where "userid"= $1 and id=$2 order by id desc limit 1', [userId, id], (err, results) => {
        if (err) {
            throw err;
        }

        var img = Buffer.from(results.rows[0].image.split(',')[1], 'base64');

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': img.length
        });
        res.end(img);

    })
}

const queryAllLineId = (req, res) => {
    pool.query('select email, lineuserid from users where lineuserid is not null', (err, result) => {
        if (err) {
            throw err;
        }
        res.status(201).json(result.rows)
    })
}

const queryIsTmnewa = (req, res) => {
    const userId = req.params.userId;
    console.log(req.params)
    checkDBIsTmnewa(userId).then(result => {
        res.json({ 'isTmnewa': result })
    })
}

const checkDBIsTmnewa = (lineUserId) => {
    console.log('checkDBIsTmnewa', lineUserId);
    return new Promise((resolve, reject) => {
        pool.query('select count(*) from todolist.users where lineuserid=$1', [lineUserId], (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            //console.log('queryIsTmnewa', '1' > 0);
            resolve(result.rows[0].count > 0 ? true : false);
        })
    })
}

const linkTmnewaAccount = (req, res) => {
    const { tmnewaid, userid } = req.body;
    //console.log('linktmnewa', tmnewaid, userid)
    pool.query('insert into users (email, lineuserid) values ($1, $2) returning id', [tmnewaid, userid], (err, result) => {
        if (err) {
            throw err;
        }
        //console.log(result)
        res.status(201).json(result.rows[0])
    })
}

const queryProducts = (req, res) => {
    pool.query('select id, title, price from products limit 3', (err, result) => {
        if (err) {
            throw err;
        }
        //console.log('queryProducts', result)
        res.status(201).json(result.rows)
    })
}

/* #region  Line link TMNEWA demo */

//判斷是否已經綁定帳號
const queryIsLinked = (lineUserId) => {
    return new Promise((resolve, reject) => {
        pool.query('select memberid, lineuserid from usermapping where lineuserid=$1', [lineUserId], (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            //console.log('queryIsLinked', result);
            resolve(result.rows);
        })
    })
}

//用帳號及EMAIL進行驗證，產生OTP CODE
const genOTPByAccount = (req, res) => {
    const { tmnewaid, email } = req.body;
    //console.log('genOTPByAccount:', tmnewaid, `${email}@tmnewa.com.tw`);
    pool.query('select * from tmnewamember where memberid=$1 and LOWER(email)=LOWER($2)', [tmnewaid, `${email}@tmnewa.com.tw`], (err, result) => {
        if (err) {
            reject(err);
            return;
        }

        if (result.rows[0]) {
            otp.genOTP(tmnewaid).then((resp) => {
                //console.log('otp token:', resp);

                sendEmail(result.rows[0].email, resp);

                res.cookie('memberid', result.rows[0].memberid);
                res.status(200).json({ 'token': resp });
            });
            //res.status(201).json(result.rows[0]);

        } else {
            res.status(200).json({ 'error': 'account or email is invalid' });
        }
    })
}

//驗證OTP CODE是否正確,  add tmnewaid to cookie
const validateOTP = (req, res) => {
    const { code } = req.body;
    console.log('validateOTP:', req.cookies.memberid, code);
    const isValid = otp.validateOTP(code, req.cookies.memberid);
    res.status(200).json({
        "isValid": isValid,
        "redirect": `https://access.line.me/dialog/bot/accountLink?linkToken=${link token}&nonce={nonce}`
    })
    
}

/* #endregion */


//Todo List db API
const queryProject = (req, res) => {
    pool.query('select * from ')


}



module.exports = {
    linebot: {
        insertImage,
        queryImageById,
        queryIsTmnewa,
        linkTmnewaAccount,
        queryAllLineId,
        queryProducts,
        queryProductImageById,
        checkDBIsTmnewa,
        queryIsLinked,
        genOTPByAccount,
        validateOTP
    },
    todolist: {

    }

}
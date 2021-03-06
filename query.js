const Pool = require('pg').Pool;
const otp = require('./otp');

const sendEmail = require('./mailer');
const redis = require('redis');
const fs = require('fs');
const imageThumbnail = require('image-thumbnail');
const dotenv = require('dotenv');
dotenv.config();
/* #region  Connect to Redis */
let redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

redisClient.on("error", function (err) {
    console.log("Error:" + err);
});
redisClient.auth(process.env.REDIS_PW);

/* #endregion */

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
console.log('db setting:', process.env.DB_HOST)

//console.log('dbconfig:', dbconfig.herokudb.linetest);
const insertImage = (req, res) => {
    //console.log('req', req);
    const { image, filename } = req.body;
    //console.log('drawImage:', userId, drawImage)
    const options = { percentage: 25, responseType: 'base64' }
    let base64Data = image.split(',');
    imageThumbnail(base64Data[1], options)    
        .then(tb => {
            //console.log('nail', tb);
            pool.query(`insert into tmnewaimages ( "image", "thumbnail",  "filename") 
                        values ($1, $2, $3) returning id`, [base64Data[1], tb, filename], (err, results) => {
                    if (err) {
                        throw err;
                    }
                    //console.log('result userId:', userId, results);
                    res.status(201).json(results.rows[0]);
                }
            )
        })
        .catch(err => console.log('thumbnail err:', err));
}

const queryProductImageById = (req, res) => {
    console.log('queryProductImageById', req.params.prodId);
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
        pool.query('SELECT a.memberid, a.lineuserid, b.email, b.name FROM public.usermapping a, public.tmnewamember b where a.memberid = b.memberid and a.lineuserid=$1', [lineUserId], (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            //console.log('queryIsLinked', result);
            resolve(result.rows);
        })
    })
}

//將LINE USERID和自己的MEMBERID實際做綁定
const linkMember = (lineUserId, nonce) => {
    return new Promise((resolve, reject) => {
        redisClient.get(nonce, (err, result) => {
            if (err) {
                console.log('linkMember err:', err);
                throw err;
            }
            console.log('tmnewaid:', result);
            pool.query('insert into usermapping (memberid, lineuserid, createddt) values ($1, $2, $3) ', [result, lineUserId, 'now()'], (errs, res) => {
                if (errs) {
                    throw errs;
                }
                //console.log(result)
                resolve(res.rows)
            })
        })
    })
}

//用帳號及EMAIL進行驗證，產生OTP CODE
const genOTPByAccount = (req, res) => {
    const { tmnewaid, email } = req.body;
    //console.log('genOTPByAccount:', tmnewaid, `${email}@tmnewa.com.tw`);
    console.log('genOTPByAccount:', tmnewaid, email);
    pool.query('select * from tmnewamember where memberid=$1 and LOWER(email)=LOWER($2)', [tmnewaid, `${email}@tmnewa.com.tw`], (err, result) => {
        if (err) {
            reject(err);
            return;
        }

        if (result.rows[0]) {
            otp.genOTP(tmnewaid).then((resp) => {
                sendEmail(result.rows[0].email, resp);

                res.cookie('memberid', result.rows[0].memberid);
                res.status(200).json({ 'genOTP': 'ok' });
            });

        } else {
            res.status(200).json({ 'error': 'account or email is invalid' });
        }
    })
}

//驗證OTP CODE是否正確
const validateOTP = (req, res) => {
    const { code, linkToken } = req.body;
    //console.log('validateOTP:', req.cookies.memberid, code);
    otp.validateOTP(code, req.cookies.memberid).then((resp) => {
        console.log('validObj:', resp);
        res.status(200).json(
            resp.isValid ?
                {
                    "isValid": resp.isValid,
                    "redirect": `https://access.line.me/dialog/bot/accountLink?linkToken=${linkToken}&nonce=${resp.nonce}`
                } : {
                    "isValid": resp.isValid
                })
    });
}


//查詢已綁定帳號之使用者
const queryLinkedUser = (req, res) => {
    pool.query(`SELECT a.memberid, a.lineuserid, b.email, b.name
	            FROM public.usermapping a, public.tmnewamember b where a.memberid = b.memberid`, (err, result) => {
            if (err) {
                throw err;
            }
            res.status(201).json(result.rows)
        })
}

//
const getImageById = (req, res) => {
    const id = req.params.id;
    pool.query(`select image from tmnewaimages where id=$1`,[id], (err, result) => {
        if (err) {
            throw err;
        }
        var image = Buffer.from(result.rows[0].image, 'base64');
        //var thumbnail = Buffer.from(results.rows[0].thumbnail, 'base64');

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': image.length
        });
        res.end(image);
    })
}

const getThumbnailById = (req, res) => {
    const id = req.params.id;
    pool.query(`select  thumbnail from tmnewaimages where id=$1`,[id], (err, result) => {
        if (err) {
            throw err;
        }
        var thumbnail = Buffer.from(result.rows[0].thumbnail, 'base64');

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': thumbnail.length
        });
        res.end(thumbnail);
    })
}

/* #endregion */


//Todo List db API
const queryProject = (req, res) => {
    pool.query('select * from ')


}

function toBuffer(ab) {
    var buf =  Buffer.from(ab ,0, ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
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
        validateOTP,
        linkMember,
        queryLinkedUser,
        getImageById,
        getThumbnailById
    },
    todolist: {

    }

}
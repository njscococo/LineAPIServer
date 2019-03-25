const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'ubxeypnqtxjfat',
    host: 'ec2-50-19-109-120.compute-1.amazonaws.com',
    database: 'dddbu83hpf94v5',
    password: 'e82a641952012059ce136a382771f31b8d0c9011087864d59dbff074f570c804',
    port: 5432,
    ssl: true
});

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

const queryImageById = (req, res) => {
    const userId = req.params.userId;
    const id = req.params.id;
    console.log('queryImage:', userId, id)
    pool.query('select "image" from lineimage where "userid"= $1 and id=$2 order by id desc limit 1', [userId, id], (err, results) => {
        if (err) {
            throw err;
        }
        
        //console.log(results.rows[0].drawImage.split(',')[1])
        
        var img =  Buffer.from(results.rows[0].image.split(',')[1], 'base64');

        //console.log('select result:', img)

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': img.length
        });
        res.end(img);

    })
}

const queryAllLineId = (req, res) =>{

}

const queryIsTmnewa = (req, res)=>{
    const userId = req.params.userId;
    console.log(req.params)
    pool.query('select count(*) from users where lineuserid=$1', [userId], (err, result)=>{
        if(err){
            throw err;
        }
        //console.log('queryIsTmnewa', '1' > 0);
        let isTmnewa = result.rows[0].count > 0 ? true : false;
        res.json({'isTmnewa':isTmnewa})

    })
}

const linkTmnewaAccount = (req, res)=>{
    const {tmnewaid, userid} = req.body;
    //console.log('linktmnewa', tmnewaid, userid)

    pool.query('insert into users (email, lineuserid) values ($1, $2) returning id', [tmnewaid, userid], (err, result)=>{
        if(err){
            throw err;
        }
        //console.log(result)
        res.status(201).json(result.rows[0])

    })

}


module.exports = {
    insertImage,
    queryImageById,
    queryIsTmnewa,
    linkTmnewaAccount

}
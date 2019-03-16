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
    pool.query('insert into lineimage ( "userId","drawImage") values ($1 , $2) returning id', [userId, drawImage], (err, results) => {
        if (err) {
            throw err;
        }
        console.log('result userId:', userId, results);
        res.status(201).json(results.rows[0])

    }

    )
    
}

const queryImageById = (req, res) => {
    const userId = req.params.userId;
    const id = req.params.id;
    console.log('queryImage:', userId, id)
    pool.query('select "drawImage" from lineimage where "userId"= $1 order by id desc limit 1', [userId], (err, results) => {
        if (err) {
            throw err;
        }
        
        //console.log(results.rows[0].drawImage.split(',')[1])
        
        var img =  Buffer.from(results.rows[0].drawImage.split(',')[1], 'base64');

        //console.log('select result:', img)

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': img.length
        });
        res.end(img);

    })


}


module.exports = {
    insertImage,
    queryImageById

}
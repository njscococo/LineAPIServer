const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'ubxeypnqtxjfat',
    host: 'ec2-50-19-109-120.compute-1.amazonaws.com',
    database: 'dddbu83hpf94v5',
    password: 'e82a641952012059ce136a382771f31b8d0c9011087864d59dbff074f570c804',
    port: 5432
});

const insertImage = (req, res) => {
    const { userId, drawImage } = req.body;
    console.log('UserID:', userId)
    pool.query('insert into lineimage ( "userId","drawImage") values ($1 , $2)', [userId,drawImage], (err, results) => {
        if (err) {
            throw err;
        }
        console.log('result:', results);
        res.status(201).send('image added with userId:')

    }

    )

}


module.exports = {
    insertImage

}
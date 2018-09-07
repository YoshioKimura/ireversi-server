const router = require('express').Router();

const PlayingModel = require('../../../../models/homework/PlayingModel.js');

const propfilter = '-_id -__v';

// function findTarget(copyData,nx,ny,result){
//     return copyData.find(el => el["x"] === nx && el["y"] === ny && el["userId"] !== result["userId"]);
// }

function findMine(data, nx,ny,result){
    return data.find(el => el["x"] === nx && el["y"] === ny && el["userId"] === result["userId"]);   
}

function checkTurnOver (result, data) {
    let arry = [];
        for (let dx = -1; dx <= 1; dx+=1) {//x座標の左右範囲
            for(let dy = -1; dy <= 1; dy+=1) {//y座標の上下範囲
                let nx = result["x"] + dx; //確認するx座標
                let ny = result["y"] + dy; //確認するy座標
                let copyData = [...data]; //参照渡し防止
                let target = copyData.find(el => el["x"] === nx && el["y"] === ny && el["userId"] !== result["userId"]);
                if (dx === 0 && dy === 0) {//中央（自身）はスキップ
                    continue;
                } else {
                    if (target){
                        nx += dx;
                        ny += dy;
                        let mine = data.find(el => el["x"] === nx && el["y"] === ny && el["userId"] === result["userId"]);   
                        if (mine){
                            let flipped = JSON.parse(JSON.stringify(target)); //参照渡し防止
                            flipped["userId"] = result["userId"];
                            arry.push([target,flipped]);
                            // console.log(result,flipped, mine, "test");
                        }
                    }
                }
            }
        } 
    return arry;
};

router.route('/')

    .post(async (req, res) => {
        let data = await PlayingModel.find({}, propfilter);
        const result = {
            x: +req.body.x,
            y: +req.body.y,
            userId: +req.body.userId,
        }

        //めくる処理

        let flipArry = checkTurnOver(result, data);
        for (let i =0; i<flipArry.length;i+=1){
            if (flipArry.length !== 0){
                // console.log(flipArry[0], "function");
                const add = {//追加する対象の指定
                    x: flipArry[i][1]["x"],
                    y: flipArry[i][1]["y"],
                    userId: flipArry[i][1]["userId"],
                }
                const remove = {//削除する対象の指定
                    x: flipArry[i][0]["x"],
                    y: flipArry[i][0]["y"],
                    userId: flipArry[i][0]["userId"],
                }
                await PlayingModel.remove(remove);
                await new PlayingModel(add).save(); // 今置いたピースのコピー
            }   
        }


        // console.log(data);
    
        const Piece = new PlayingModel(result); // 今置いたピースのコピー
        await Piece.save();

        res.json(await PlayingModel.find({}, propfilter)); // 全体のデータを取ってくる
    });



module.exports = router;



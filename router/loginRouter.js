const express = require("express");
const router = express.Router();
const db = require("../mysql/mysql");
const sqlSeach1 = "select * from login where userName = ? and password = ?"
// const roommodel = require("../db/model/roommodel")
/**
 * @api {post} /room/airCondition 设备信息表
 * @apiVersion 0.0.1
 * @apiName 获取登录信息
 * @apiGroup 登录信息
 *
 * @apiParam {String} userName 用户名*
 * @apiParam {String} passward 密码
 *
 * @apiSuccess {Array} inf 登录信息
 */
router.post("/login", (req, res) => {
    const {
        userName,
        password
    } = req.body;

    const params = [
        userName,
        password
    ];
    db.exec(sqlSeach1, params, (err, data, fields) => {
        console.log(req.body)
        console.log(params)
        if (err) {
            res.send({
                mes: "sql语句错误",
                inf: err,
                err: -1,
            });
        } else if (data.lenght >= 1) {
            res.send({
                mes: "登录成功",
                inf: "",
                err: 0,
            });
        } else {
            res.send({
                mes: "账号或密码错误",
                inf: "",
                err: -2,
            });
        }
    })
})
module.exports = router;

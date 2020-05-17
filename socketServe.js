const webSocket = require("ws");
const db = require("./mysql/mysql");
const wss = new webSocket.Server({ port: 8081 });
let receiveVal = [];
let Data = [];
let check = "";
let init = 1;
const sqlTable = ["aircondition", "door", "heater", "lamp", "sound"];
console.log("开始建立连接...");
function sql(sql, message) {
  return new Promise((resolve, reject) => {
    db.exec(
      `select * from ${sql} where name = ?`,
      [message],
      (err, data, fields) => {
        if (err) {
          console.log(err);
        } else {
          let JsonData = JSON.parse(JSON.stringify(data));
          resolve(JsonData)
        }
      }
    );
  })
}
function forEachSql(message,client) {
    Data = []
    sqlTable.forEach((item, index) => {
      sql(item, message).then((res) => {
        if (res.length == 1) {
          Data.push(res[0]);
        } else if (res.length >= 1) {
          res.forEach(data => {
            Data.push(data)
          })
        }
        if (receiveVal.length == Data.length) {
          receiveVal.forEach((item, index) => {
            for (let element in item) {
              if (receiveVal[index][element] != Data[index][element]) {
                status = 1;
              }
            }
          });
        } else {
          status = 1;
        }
        if (!init && status == 1) {
          client.send(JSON.stringify(Data));
          receiveVal = Data;
        } else if (init) {
          client.send(JSON.stringify(Data));
          init = 0
          receiveVal = Data;
        }
      })
    });
  }
wss.on("connection", (client) => {
  client.on("message", (message) => {
    if (message) {
      init = 1
    }
    clearInterval(check);
    check = setInterval(() => {
      let status = 0;
      forEachSql(message, client)}
      ,1000);
    });
    client.on("close", () => {
      clearInterval(check);
      console.log("关闭服务器");
    });
  });

const webSocket = require("ws");
const db = require("./mysql/mysql");
const wss = new webSocket.Server({ port: 8081 });
let receiveVal = [];
let Data = [];
let check = "";
let status = 0;
let init = 1;
let iniDate = [];
let index = 1;
const sqlTable = ["aircondition", "door", "heater", "lamp", "sound"];
console.log("开始建立连接...");
// 查询数据
function sql(sql, message) {
  return new Promise((resolve, reject) => {
    db.exec(`select * from ${sql} where name = ?`, [message], (err, data, fields) => {
      if (err) {
        console.log(err);
      } else {
        Data = JSON.parse(JSON.stringify(data));//查询所得数据
        if (Data.length && init) {
          iniDate = [...Data, ...iniDate]//初始化数据
          console.log(iniDate, index++)
        }
        resolve()
      }
    })
  })

}
//查询五个表数据，是否含有
function forEachSql(message,client) {
  sqlTable.forEach((item, index) => {
    console.log(item, message)
    sql(item, message).then(() => {
      // 初始化后监听数据库的变化
      //判断查询是否只有一项
      if (!init && Data.length == 1) {
        for(let data in Data[0]){
          if (data != receiveVal[index][0][data]) {
            client.send(JSON.stringify(Data));
            break;
          }
        }
      } 
      //查询有多项时
      else {
        Data.forEach((data,i) => {
          for(let element in data){
            if (element != receiveVal[index][i][element]) {
              client.send(JSON.stringify(Data));
              break;
            }
          }
        })
      }
      receiveVal[index] = Data
    });

  });
}
wss.on("connection", (client) => {
  client.on("message", (message) => {
    clearInterval(check);
    check = setInterval(() => {
      forEachSql(message,client)
      if (init) {
        //传输初始化数据
        client.send(JSON.stringify(iniDate));
        init = 0
      }
    }, 1000);
  });
  client.on("close", () => {
    clearInterval(check);
    console.log("关闭服务器");
  });
});

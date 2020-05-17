const webSocket = require("ws");
const db = require("./mysql/mysql");
const wss = new webSocket.Server({ port: 8081 });
let receiveVal = [];
let Data = [];
let check = "";
const sqlTable = ["aircondition", "door", "heater", "lamp", "sound"];
console.log("开始建立连接...");
function sql(sql,message) {
  db.exec(
    `select * from ${sql} where name = ?`,
    [message],
    (err, data, fields) => {
      if (err) {
        console.log(err);
      } else {
        if(sql == "aircondition"){
          Data = []
        }
        let JsonData = JSON.parse(JSON.stringify(data));
        Data = [...JsonData, ...Data];
      }
    }
  );
}
function forEachSql(message){
  sqlTable.forEach((item) => {
    sql(item,message);
  });
}
wss.on("connection", (client) => {
  client.on("message", (message) => {
    clearInterval(check);
    check = setInterval(() => {
      forEachSql(message)  
        client.send(JSON.stringify(Data));
    }, 1000);
  });
  client.on("close", () => {
    clearInterval(check);
    console.log("关闭服务器");
  });
});

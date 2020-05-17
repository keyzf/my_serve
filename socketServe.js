const webSocket = require("ws");
const db = require("./mysql/mysql");
const wss = new webSocket.Server({ port: 8081 });
let receiveVal = [];
let Data = [];
let check = "";
let JsonData = [];
let init = 1;
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
        JsonData = JSON.parse(JSON.stringify(data));
      }
    }
  );
}
function forEachSql(message){
  Data = []
  sqlTable.forEach((item,index) => {
    sql(item,message);
    if(JsonData.length == 1){
      Data.push(JsonData[0]);
    }else{
      JsonData.forEach(data=>{
        Data.push(data)
      })
    }
  });
}
wss.on("connection", (client) => {
  client.on("message", (message) => {
    if(message){
      init = 1
    }
    clearInterval(check);
    check = setInterval(() => {
      let status = 0; 
      forEachSql(message)  
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
      if ( !init &&status == 1) {
        client.send(JSON.stringify(Data));
        receiveVal = Data;
      }else if(init){
        client.send(JSON.stringify(Data));
        init = 0
        receiveVal = Data;
      }
    }, 1000);
  });
  client.on("close", () => {
    clearInterval(check);
    console.log("关闭服务器");
  });
});
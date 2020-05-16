const webSocket = require("ws");
const db = require("./mysql/mysql");
const wss = new webSocket.Server({ port: 8081 });
let receiveVal = [];
let Data = [];
let check = "";
let status = 0
const sqlTable = ["aircondition", "door", "heater", "lamp", "sound"];
console.log("开始建立连接...");
function sql(sql,message) {
  db.exec(`select * from ${sql} where name = ?`,[message],(err, data, fields) => {
      if (err) {
        console.log(err);
      } else {
         Data = JSON.parse(JSON.stringify(data));
      }
    }
  );
}
function forEachSql(message){
  sqlTable.forEach((item,index) => {
    sql(item,message);
    if(Data.length >=1 && receiveVal[index].length >=1){
      Data.forEach((data)=>{
        if (receiveVal[index][data] != data) {
          status = 1;
        }
      })      
    } else{
      status = 1;
      receiveVal[index] = Data
    }
  });
}
wss.on("connection", (client) => {
  client.on("message", (message) => {
    // console.log("received: %s", message);
    if(message){

    }
    clearInterval(check);
    check = setInterval(() => {
      status = 0; 
      forEachSql(message)  
      if (status == 1) {
        client.send(JSON.stringify(Data));
        receiveVal = Data;
      }
    }, 1000);
  });
  client.on("close", () => {
    clearInterval(check);
    console.log("关闭服务器");
  });
});

const webSocket = require("ws");
const db = require("./mysql/mysql");
const wss = new webSocket.Server({ port: 8081 });
let receiveVal = [];
let Data = [];
let check = "";
const sqlTable = ["aircondition", "door", "heater", "lamp", "sound"];
console.log("开始建立连接...");
function sql(sql,message) {
  db.exec(`select * from ${sql} where name = ?`,[message],(err, data, fields) => {
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
    console.log(item,Data)
    sql(item,message);
  });
}
wss.on("connection", (client) => {
  client.on("message", (message) => {
    // console.log("received: %s", message);
    clearInterval(check);
    check = setInterval(() => {
      let status = 0; 
      forEachSql(message)  
      if (receiveVal.length == Data.length) {
        console.log(receiveVal.length,"receiveVal.length")
        receiveVal.forEach((item, index) => {
          for (let element in item) {
            if (receiveVal[index][element] != Data[index][element]) {
              // console.log(receiveVal[index][element],"receiveVal[index][element]");
              // console.log(Data[index][element],"Data[index][element]");
              status = 1;
            }
          }
        });
      } else {
        status = 1;
      }
      if (status == 1) {
        client.send(JSON.stringify(Data));
        receiveVal = Data;
      }
    }, 5000);
  });
  client.on("close", () => {
    clearInterval(check);
    console.log("关闭服务器");
  });
});

const webSocket = require("ws");
const db = require("./mysql/mysql");
const wss = new webSocket.Server({ port: 8081 });
let receiveVal = [];
let Data = [];
let check = "";
let status = 0;
let init = 1;
let iniDate = [];
const sqlTable = ["aircondition", "door", "heater", "lamp", "sound"];
console.log("开始建立连接...");
// 查询数据
function sql(sql,message) {
  db.exec(`select * from ${sql} where name = ?`,[message],(err, data, fields) => {
      if (err) {
        console.log(err);
      } else {
         Data = JSON.parse(JSON.stringify(data));//查询所得数据
         console.log(Data)
         if(Data.length) {
          iniDate = [...Data,...iniDate]//初始化数据
         }
      }
    }
  );
}
//查询五个表数据，是否含有
function forEachSql(message){
  sqlTable.forEach((item,index) => {
    sql(item,message);
    //初始化后监听数据库的变化
    // if(!ini && Data.length >=1){
    //   Data[0].forEach(data=>{
    //     //判断查询是否只有一项
    //     if(Data.length == 1 ){
    //       if(data != receiveVal[index][data]){
    //         status = 1
    //       }
    //     }else{
    //       if(data != receiveVal[index][data]){
    //         status = 1
    //       }
    //     }
    //   })
  // }
      receiveVal[index] = Data
  });
}
wss.on("connection", (client) => {
  client.on("message", (message) => {
    clearInterval(check);
    check = setInterval(() => {
      status = 0; 
      forEachSql(message)  
      if (status == 1 && !init) {
        client.send(JSON.stringify(Data));
        receiveVal = Data;
      }else if(init){
        //传输初始化数据
        client.send(JSON.stringify(iniDate));
      }
    }, 1000);
  });
  client.on("close", () => {
    clearInterval(check);
    console.log("关闭服务器");
  });
});

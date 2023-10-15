const WebSocket = require("ws");
const os = require("os");
// const Controller = require("./controller.js");
const config = require("./data.js");
const { User } = require("./User.js");
const Room = require("./Room.js");
// Lấy địa chỉ IP của máy tính hiện tại
const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (let address of addresses) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }
  return "127.0.0.1";
};

const ipAddress = getLocalIpAddress();
// const ipAddress = "127.0.0.1"
const port = 7203;
// const control = new Controller();
const listClient = new Set();
const listRoom = []

const wss = new WebSocket.Server({ host: ipAddress, port: port });

wss.on("listening", () => {
  console.log(`WebSocket server is running on ${ipAddress}:${port}`);
});

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    if (ws.userID == undefined) {     // kết nối user mới
      ws.userID = convertBytesToJSON(message).id;
      ws.room = convertBytesToJSON(message).room;

      let check = false;
      if (ws.room == 0) {
        listClient.add(ws)
        return;
      }

      for (let i = 0; i < listRoom.length; i++) {     // tìm phòng và thêm vào trong room
        if (ws.room == listRoom[i].id) {
          listRoom.listUser.push(ws.userID);
          listClient.add(ws)
          return
        }
      }

      let r = new Room();     // nếu như không thấy phòng thì tạo phòng mới và add vào
      r.id = ws.room;
      r.listUser.push(ws.userID);
      listClient.add(ws)
    }
    else
      handleMess(convertBytesToJSON(message));
  });

  ws.on("close", (ws) => {
    listClient.forEach(element => {     // tìm và xoá user trong list user
      if (ws.userID == element.userID)
        listClient.delete(element)
    });

    if (ws.room == 0) return;   // check có trong room không
    else {        // nếu có trong room
      listRoom.forEach(e => {       // tìm room
        if (e.id == ws.room)
          e.listClient.forEach(i => {       // tìm user
            if (i == ws.userID) e.listClient.delete(i)  //xoá user trong phòng
          })
      })
    }
  });
});

wss.on("error", () => {
  console.log(error);
});

handleMess = function (
  data //str dạng json
) {
  let dt = {};
  switch (data.type) {
    case config.typeMess.CreateRoom: // tạo room
      createRoom(data);
      break;
    case config.typeMess.OutRoom: // thông báo người chơi out room
      outRoom(data)
      break;
    case config.typeMess.Notic: // type là thông báo khi solo
      sendNotic(data)
    case config.typeMess.JoinRoom:    // yêu cầu join room
      joinRoom(data);
  }
};


createRoom = function (data) {
  let dt = {
    id: data.id,
    type: config.typeMess.CreateRoom,
    room: config.data.lastRoom,
  };

  // console.log(dt);

  for (let i = 0; i < listRoom.length; i++)
    if (listRoom[i].listUser.length == 0) {
      listRoom[i].listUser.push(dt.id)
      dt.room = i;
      sendToClient(dt);
      return;
    }

  let room = new Room();
  room.id = config.data.lastRoom;
  room.listUser.push(dt.id)
  config.data.lastRoom++;

  listClient.forEach(e => {
    if (e.userID == dt.id) {
      e.room = room.id;
    }
  })
  listRoom.push(room)

  sendToClient(dt)
}

outRoom = function (data) {   // user out room
  dt = {
    id: data.id,
    type: config.typeMess.OutRoom,
    room: data.room,
    content: "done"
  };

  let room = null;
  for (let i = 0; i < listRoom.length; i++) {
    if (listRoom[i].id == dt.room) room = listRoom[i];
  }
  if (room != null)
    for (let i = 0; i < room.listUser.length; i++) {
      if (dt.id == room.listUser[i]) {
        room.listUser.splice(i, 1);
        sendToBoad(dt)
        return
      }
    }
  dt.content = "fail";
  sendToBoad(dt)
}

sendNotic = function (data) {     // send notic khi solo đến các user khác trong phòng
  dt = {
    id: data.id,
    type: config.typeMess.Notic,
    username: data.username,
    room: data.room,
    progress: data.progress,
    content: data.content,
  };
  sendToBoad(dt);
}

joinRoom = function (data) {
  let dt = {
    id: data.id,
    type: config.typeMess.JoinRoom,
    room: data.room,
    content: "",
  }

  let room = null;
  for (let i = 0; i < listRoom.length; i++) {   // tìm phòng
    if (data.room == listRoom[i].id) {
      room = listRoom[i];
      break;
    }
  }

  if (room == null) {
    dt.content = "false";
  }
  else {
    room.listUser.push(dt.id)
    dt.content = "done"
  }
  // sendToBoad(dt)
  sendToClient(dt)
}

sendToBoad = function (data) {  // gửi tới tất cả server
  listClient.forEach((client) => {
    client.send(JSON.stringify(data));
  });
}


sendToClient = function (data) {  // gửi tới riêng client
  listClient.forEach(e => {
    if (e.userID == data.id)
      e.send(JSON.stringify(data));
  })
}



convertBytesToJSON = function (str) {
  return JSON.parse(str + "")
}
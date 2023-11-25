const WebSocket = require("ws");
const os = require("os");
const config = require("./data.js");
const { User } = require("./User.js");
const Room = require("./Room.js");
const DataBaseIO = require("./DatabaseIO.js");
const { stringify } = require("querystring");

const ipAddress = "0.0.0.0";
const port = 7203;
const listClient = new Set();
const listRoom = [];
const db = new DataBaseIO();


db.createTable()
  ;
const wss = new WebSocket.Server({ host: ipAddress, port: port });

wss.on("listening", () => {
  console.log(`WebSocket server is running on ${ipAddress}:${port}`);
  let r = new Room();
  r.id = 1;
  r.listUser = [];
  listRoom.push(r);
});

wss.on("connection", (ws) => {
  ws.firtConnect = true;
  ws.on("message", (message) => {
    let data = convertBytesToJSON(message);
    switch (data.type) {
      case config.typeMess.ReConnect:
        reConnect(ws, data);
        break;
      case config.typeMess.CreateRoom: // tạo room
        createRoom(ws, data);
        break;
      case config.typeMess.OutRoom: // thông báo người chơi out room
        outRoom(ws, data);
        break;
      case config.typeMess.Notic: // type là thông báo khi solo
        sendNotic(data);
        break;
      case config.typeMess.JoinRoom: // yêu cầu join room
        joinRoom(ws, data);
        break;
      case config.typeMess.Ready: // ng chơi sẵn sàng
        ready(ws, data);
        break;
      case config.typeMess.SignUp:
        signUp(ws, data);
        break;
      case config.typeMess.SignIn:
        signIn(ws, data);
        break;
      case config.typeMess.InfoMap: // nhận map ng solo
        infoMap(ws, data);
        break;
      case config.typeMess.TimeOut:
        timeOut(ws, data);
        break;
      case config.typeMess.showHint:
        showHint(ws, data);
        break;
      case config.typeMess.refreshMap:
        refreshMap(ws, data);
        break;
      case config.typeMess.updateLevel:
        updateLevel(ws, data);
        break;
      case config.typeMess.winSolo:
        winSolo(ws, data);
        break;
    }
  });

  ws.on("close", (call) => {
    listClient.forEach((element) => {
      // tìm và xoá user trong list user
      console.log("77 server", ws.userID == element.userID);
      if (ws.userID == element.userID) listClient.delete(element);
    });

    console.log("81 vserve, list client:", listClient.size);
    if (ws.room == 0) return; // check có trong room không
    else {
      // nếu có trong room
      listRoom.forEach((e) => {
        // tìm room
        console.log("87 server", e, ws.room, e.id === ws.room);
        if (e.id == ws.room) {
          for (let i = 0; i < e.listUser.length; i++) {
            if (e.listUser[i] == ws.userID) e.listUser.splice(i, 1);
          }
          console.log("93 server listUser in room", ws.room, e.listUser);
        }
      });

      listClient.forEach(e => {
        if (e.room == ws.room) {
          let dt = {
            type: config.typeMess.OutRoom,
            id: ws.userID,
            room: ws.room,
          }
          e.send(JSON.stringify(dt));
          return;
        }
      })
    }
  });
});

wss.on("error", (error) => {
  console.log("error", error);
});

signUp = function (ws, data) {
  db.getUserByUsername(data.username).then((user) => {
    let dt = {
      id: null,
      type: config.typeMess.SignUp,
      stage: null,
    };
    console.log("110 server", user);
    if (user == undefined) {
      db.addUser({ username: data.username, password: data.password })
        .then((e) => {
          dt.stage = "done";
          ws.send(JSON.stringify(dt));
        })
        .catch((err) => {
          dt.stage = "fail";
          ws.send(JSON.stringify(dt));
        });
    } else {
      dt.stage = "exist";
      ws.send(JSON.stringify(dt));
    }
  });
};



signIn = function (ws, data) {
  db.getUserLogin(data.username, data.password)
    .then((user) => {
      let dt = {
        id: null,
        type: config.typeMess.SignIn,
        username: "",
        done: true,
        level: 0,
        hint: 0,
        refresh: 0,
      };
      if (user != null) {
        ws.userID = user.id;
        ws.username = user.username;
        ws.ready = false;
        ws.hint = user.hint;
        ws.refresh = user.refresh;
        ws.level = user.level;

        dt.id = user.id;
        dt.username = user.username;
        dt.level = user.level;
        dt.hint = user.hint;
        dt.refresh = user.refresh;
        listClient.add(ws);
        ws.send(JSON.stringify(dt));
        listRoom.forEach((e) => {
          e.listUser.forEach((i) => {
            if (i == ws.userID) e.listUser.splice(i, 1);
          });
        });
        firtConnect = false;
      } else {
        dt.done = false;
        ws.send(JSON.stringify(dt));
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

reConnect = function (ws, data) {
  console.log("158 server reconnect", data);
  // kết nối user mới
  ws.userID = data.id;
  ws.room = data.room;
  ws.ready = data.ready;

  if (ws.room == 0) {
    // nếu user chưa có phòng
    listClient.add(ws);
    return;
  }

  listClient.forEach((e) => {
    console.log("171 server", e.userID, e.room);
  });

  for (let i = 0; i < listRoom.length; i++) {
    // tìm phòng và thêm vào trong room
    if (ws.room == listRoom[i].id) {
      listRoom[i].listUser.push(ws.userID);
      listClient.add(ws);
      listClient.forEach((e) => {
        console.log("180 server", e.userID, e.room, e.ready);
      });
      return;
    }
  }

  let r = new Room(); // nếu như không thấy phòng thì tạo phòng mới và add vào
  r.id = ws.room;
  r.listUser.push(ws.userID);
  listRoom.push(r);
  listClient.add(ws);
};

createRoom = function (ws, data) {
  // if (firtConnect == true) return
  let dt = {
    id: data.id,
    type: config.typeMess.CreateRoom,
    room: config.data.lastRoom,
  };
  let checkRoom = false;
  listRoom.forEach((e) => {
    console.log("201 server", e);
    // duyệt các room trong list
    if (e.listUser.length == 0) {
      // nếu listUser trogn room không có ai
      e.listUser.push(dt.id); // thêm vào
      dt.room = e.id; // cập nhật id room
      console.log("207 server", e, dt);
      ws.room = dt.room;
      listClient.forEach((ele) => {
        if (ele.userID == dt.id) ele.room = e.id;
      });
      checkRoom = true;
      sendToBoad(dt);
      return;
    }
  });
  if (checkRoom == true) return;
  let room = new Room(); // tạo nếu k có room nào trống
  room.id = config.data.lastRoom;
  room.listUser.push(dt.id);
  config.data.lastRoom++;

  listClient.forEach((e) => {
    if (e.userID == dt.id) {
      e.room = room.id;
    }
  });
  listRoom.push(room);
  console.log("229 server", listRoom);
  sendToClient(dt);
};

outRoom = function (ws, data) {
  if (firtConnect == true) return

  // user out room
  dt = {
    id: data.id,
    type: config.typeMess.OutRoom,
    room: data.room,
    content: "done",
  };

  let room = null;
  ws.room = 0;
  ws.ready = false;
  listRoom.forEach((e) => {
    if (e.id == dt.room) room = e;
  });

  if (room != null)
    for (let i = 0; i < room.listUser.length; i++) {
      if (dt.id == room.listUser[i]) {
        room.listUser.splice(i, 1);
        sendToBoad(dt);
        return;
      }
    }
  dt.content = "fail";
  sendToBoad(dt);
};

sendNotic = function (data) {
  if (firtConnect == true) return

  // send notic khi solo đến các user khác trong phòng
  dt = {
    id: data.id,
    type: config.typeMess.Notic,
    username: data.username,
    room: data.room,
    progress: data.progress,
    content: data.content,
  };
  sendToBoad(dt);
};

joinRoom = function (ws, data) {
  if (firtConnect == true) return
  let listUsername = []
  console.log("280", data);

  let dt = {
    id: data.id,
    type: config.typeMess.JoinRoom,
    room: parseInt(data.room),
    content: "",
    listUsername: listUsername,
  };

  let room = null;
  for (let i = 0; i < listRoom.length; i++) {
    // tìm phòng
    if (dt.room == listRoom[i].id) {
      room = listRoom[i];
      console.log("325 list user in room", dt.room, listRoom[i].listUser);
      if (room.listUser.length == 0) {
        dt.content = "false";
        ws.send(JSON.stringify(dt))
        return;
      }
      if (room.listUser.length == 2) {
        dt.content = "Room full";
        ws.send(JSON.stringify(dt))
        return;
      }
      else {
        room.listUser.push(ws.userID);    // them user vao room
        console.log("332 list user in room", dt.room, listRoom[i].listUser);
        ws.room = listRoom[i].id
        dt.content = "done";

        listClient.forEach(e => {
          if (e.userID == room.listUser[0]) listUsername.push(e.username)
        })

        listClient.forEach(e => {
          if (e.userID == room.listUser[1]) listUsername.push(e.username)
        })
        dt.listUsername = listUsername

        sendToBoad(dt);
        return;
      }
    }
  }

  if (room == null) {
    dt.content = "false";
  } else {
    room.listUser.push(dt.id);
    console.log("346 list user in room", dt.room, listRoom[i].listUser);
    dt.content = "done";
    ws.room = room.id;
  }
  sendToBoad(dt);
};

ready = function (ws, data) {
  if (firtConnect == true) return
  // send request gửi stage ready
  let countReady = 0;
  let dt = {
    id: data.id,
    room: parseInt(data.room),
    type: data.ready,
    action: "done",
  };
  listClient.forEach((e) => {
    // tìm user và sửa thông tin ở server, đồng thời gửi lại để set cho user
    if (e.userID == dt.id) {
      e.ready = !e.ready
      sendToRoom(ws, dt);
      console.log("351 server", e.ready, e.userID, e.room);
    }
  });

  dt = {
    id: data.id,
    room: data.room,
    type: config.typeMess.PlayGame,
    play: true,
  };

  listClient.forEach((e) => {
    // kiểm tra ready hết chưa để vào game
    if (e.room == data.room) {
      if (e.ready == false) dt.play = false;
      else countReady += 1;
    }
  });
  if (countReady == 2) {
    console.log("join solo game");
    sendToRoom(ws, dt);
  }

};

infoMap = function (ws, data) {
  if (firtConnect == true) return

  let dt = {
    id: ws.userID,
    type: config.typeMess.InfoMap,
    room: ws.room,
    info: data.info,
    username: data.username,
    score: data.score,
  };
  sendToBoad(dt)
};

showHint = function (ws) {
  if (firtConnect == true) return

  let dt = {
    type: config.typeMess.showHint,
    content: "false",
    hint: 0,
  }
  if (ws.hint >= 1) {
    ws.hint -= 1;
    dt.content = "done";
    dt.hint = ws.hint
    console.log("435", dt.hint);
    db.saveInfo(ws.userID, ws.hint, ws.refresh, ws.level)
    ws.send(JSON.stringify(dt));
  }
}

refreshMap = function (ws) {
  if (firtConnect == true) return
  let dt = {
    type: config.typeMess.refreshMap,
    content: "false",
    hint: 0,
  }
  if (ws.refresh >= 1) {
    ws.refresh = ws.refresh - 1;
    dt.content = "done";
    dt.refresh = ws.refresh
    db.saveInfo(ws.userID, ws.hint, ws.refresh, ws.level)
    ws.send(JSON.stringify(dt));
  }
}

updateLevel = function (ws, data) {
  ws.level = data.level + 1;

  db.getInfoLevel(data.level)
    .then((lv) => {
      db.saveInfo(ws.userID, ws.hint, ws.refresh, ws.level);
      let dt = {
        type: config.typeMess.updateLevel,
        level: ws.level,
        content: null,
        score: 0,
      }
      if (lv == null) {
        db.addLevel({ id: data.level, score: data.score });
        dt.content = "Highest";
        dt.score = data.score;
        ws.send(JSON.stringify(dt))
      }
      else if (lv.score < data.score) {
        db.saveLevel(data.level, data.score).then(() => {
          dt.content = "Highest"
          dt.score = data.score;
          ws.send(JSON.stringify(dt))
        });  // cập nhập lại inforLevel vừa win
      }
      else {
        dt.score = lv.score
        ws.send(JSON.stringify(dt))
      }
    })

}

winSolo = function (ws, data) {
  sendToRoom(ws, data)
}

timeOut = function (ws, data) {

}

sendToBoad = function (data) {
  // gửi tới tất cả server
  listClient.forEach((client) => {
    client.send(JSON.stringify(data));
  });
};

sendToClient = function (data) {
  // gửi tới riêng client
  listClient.forEach((e) => {
    if (e.userID == data.id) e.send(JSON.stringify(data));
  });
};

sendToRoom = function (ws, data) {
  listClient.forEach(e => {
    if (data.room == e.room)
      e.send(JSON.stringify(data))
  })
}

convertBytesToJSON = function (str) {
  return JSON.parse(str + "");
};

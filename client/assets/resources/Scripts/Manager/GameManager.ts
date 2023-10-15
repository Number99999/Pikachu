import {
  _decorator,
  AudioClip,
  AudioSource,
  Component,
  EditBox,
  find,
  Input,
  KeyCode,
  Label,
  log,
  Node,
  Prefab,
  sys,
  view,
} from "cc";
import UserData from "../data/UserData";
import { GamePlay } from "../UI/GamePlay";
import config from "../data/config";
import { MucsicManager } from "./MucsicManager";
import { Notication } from "../UI/Notication";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Node)
  gamePlay: Node;
  @property(Node)
  nodeAlertTouch: Node;
  @property(Node)
  nodeNotice: Node;
  @property(Label)
  lblUsername: Label;
  @property(Label)
  lblRoom: Label
  @property(EditBox)      // nhập username
  editBoxName: EditBox;
  @property(EditBox)  // nhập id phòng để join
  editBoxRoom: EditBox


  gamePlayScript: GamePlay;
  musicManager: MucsicManager;

  webSocket: WebSocket;
  firtTouch: boolean = false;
  start() {
    this.nodeAlertTouch.setSiblingIndex(
      this.node.children[1].children.length - 1
    );
    this.nodeAlertTouch.active = true;
  }

  init() {
    this.gamePlayScript = find("Canvas/GamePlay").getComponent(GamePlay);
    this.musicManager = MucsicManager.getInstance();
    this.createUser();
  }

  touch() {
    if (this.editBoxName.string.length < 6) {
      this.showNotice("Username can't shorter 6 character");
      return;
    }

    // this.webSocket = new WebSocket("ws://192.168.1.31:8080"); // server máy cá nhân cty
    this.webSocket = new WebSocket("ws://172.19.200.140:7203"); // server máy laptop
    this.webSocket.onopen = (event) => {
      // nếu connect được server thì mới vào
      this.webSocket.send(JSON.stringify({    // gửi thông tin người chơi lên server khi mới kết nối
        id: UserData.id,
        type: config.typeMess.UserInfo,
        username: UserData.username,
        room: UserData.room,
        firstConnect: true
      }))

      if (this.webSocket.readyState == 1 && this.firtTouch == false) {
        this.showNotice("Login successed");
        this.nodeAlertTouch.active = false;
        this.firtTouch = true;
        this.init();
      }

      this.webSocket.onmessage = (event) => {
        this.handleMess(event.data);
      };

      this.webSocket.onclose = (event) => {
        this.showNotice("Server disconnected");
      };
    };
    this.webSocket.onerror = (event) => {
      this.showNotice("Failed to connect to server");
    };
  }

  createUser() {
    if (this.editBoxName.string.length > 5) {
      UserData.username = "User name: " + this.editBoxName.string;
      this.lblUsername.string = UserData.username;
      this.lblUsername.node.active = true;
      if (UserData.room != 0) {
        this.lblRoom.string = "Room: " + UserData.room;
        this.lblRoom.node.active = true;
      }
      else this.lblRoom.node.active = false
      UserData.id = btoa(UserData.username);
      UserData.playing = true
    } else {
    }
  }

  showNotice(str: string) {
    this.nodeNotice.getComponent(Notication).show(str);
  }

  btnShowGamePlay() {
    this.gamePlay.active = true;
    this.gamePlayScript.init(14, 10);
  }

  playMusic(vol: number) {
    this.musicManager.setVolumeMusic(vol);
  }

  playSound(vol: number) {
    this.musicManager.setVolumeSound(vol);
  }

  handleMess(str) {   // nhận về id, tên request, kết quả
    let data = JSON.parse(str); // chuyển sang dạng json
    console.log(data);

    switch (data.type) {
      case config.typeMess.CreateRoom:    // nhạn yêu cầu tạo phòng từ server
        if (data.id == UserData.id) {
          UserData.room = data.room;
          this.lblRoom.string = "Room: " + UserData.room;
          this.lblRoom.node.active = true
        }
        break;

      case config.typeMess.OutRoom: // trường hợp người chơi out room
        if (data.id == UserData.id && data.content == "done") {
          UserData.room = 0;
          // update lại trong room
          this.showNotice("Outed room!!!")
          this.updateRoom();
        } else if (data.room == UserData.room && data.content == "fail") {
          this.showNotice("Out room failed!!!")
        }
        break;

      case config.typeMess.Notic: // hiển thị % người chơi đã ăn được khi đấu solo hoặc hơn
        if (data.id != UserData.id && data.room == UserData.room) {
          if (data.progress < 100)
            this.showNotice(data.content);
          else this.showNotice("You lose~~~")
        }
        break;

      case config.typeMess.JoinRoom:
        if (data.id == UserData.id) {
          console.log(data);

          if (data.content == "done") {
            UserData.room = data.room
            this.showNotice("Joined Room!!!");
            this.updateRoom();
          }
          else if (data.content == "false")
            this.showNotice("Done have room!!!")
        }
    }
  }

  updateRoom() {
    if (UserData.room == 0) this.lblRoom.node.active = false
    else this.lblRoom.node.active = true;
    this.lblRoom.string = "Room: " + UserData.room
  }

  btnCreateRoom() {
    if (UserData.room == 0) {
      let data = { id: UserData.id, type: config.typeMess.CreateRoom }; // truyền đi id và tên request
      this.webSocket.send(JSON.stringify(data));
    }
    else this.showNotice("you in other room");
  }



  btnOutRoom() {
    if (UserData.room != 0) {
      let data = {
        id: UserData.id,
        type: config.typeMess.OutRoom,
        room: UserData.room,
      };
      this.webSocket.send(JSON.stringify(data));
    }
  }

  btnJoinRoom() {
    if (this.editBoxRoom.string.length == 0) {
      this.showNotice("Enter the id room")
    }
    else {
      let dt = {
        id: UserData.id,
        type: config.typeMess.JoinRoom,
        room: this.editBoxRoom.string,
      }
      this.webSocket.send(JSON.stringify(dt))
      this.editBoxRoom.string = ""
    }
  }

  btnSolo() {

  }

  btnResume() {
    UserData.playing = false;
  }

  btnReconnect() {

    if (this.webSocket.readyState == this.webSocket.CLOSED) {
      // this.webSocket = new WebSocket("ws://192.168.1.31:8080"); // server máy cá nhân cty
      this.webSocket = new WebSocket("ws://172.19.200.140:7203");    // server máy local

      this.webSocket.onopen = (event) => {
        // nếu connect được server thì mới vào
        this.webSocket.send(JSON.stringify({    // gửi thông tin người chơi lên server khi mới kết nối
          id: UserData.id,
          type: config.typeMess.UserInfo,
          username: UserData.username,
          room: UserData.room,
          firstConnect: true
        }))

        this.showNotice("reconnect successed");
        if (this.webSocket.readyState == 1 && this.firtTouch == false) {
        }

        this.webSocket.onmessage = (event) => {
          this.handleMess(event.data);
        };

        this.webSocket.onclose = (event) => {
          this.showNotice("server disconnected");
        };
      };

      this.webSocket.onerror = (event) => {
        this.showNotice("Failed to connect to server");
      };
    }
  }

  update(deltaTime: number) { }
}

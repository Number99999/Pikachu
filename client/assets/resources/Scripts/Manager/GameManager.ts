import {
  _decorator,
  AudioClip,
  AudioSource,
  Component,
  EditBox,
  find,
  Input,
  instantiate,
  KeyCode,
  Label,
  log,
  Node,
  Prefab,
  sys,
  Vec3,
  view,
} from "cc";
import UserData from "../data/UserData";
import { GamePlay } from "../UI/GamePlay";
import config from "../data/config";
import { MucsicManager } from "./MucsicManager";
import { Notication } from "../UI/Notication";
import { GameSolo } from "../UI/GameSolo";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Node)
  gamePlay: Node;
  @property(Node)
  gameSolo: Node;
  @property(Node)
  nodeLogin: Node;
  @property(Node)
  nodeNotice: Node;
  @property(Label)
  lblUsername: Label;
  @property(Label)
  lblRoom: Label;
  @property(Label)
  lblReady: Label;
  @property(Label)
  lblOnline: Label;
  @property(EditBox) // nhập id phòng để join
  editBoxRoom: EditBox;

  @property(Prefab)
  signInPref: Prefab;

  gamePlayScript: GamePlay;
  gameSoloScript: GameSolo;
  musicManager: MucsicManager;

  webSocket: WebSocket;
  firtTouch: boolean = false;
  start() {
    this.nodeLogin.setSiblingIndex(this.node.children[1].children.length - 1);
    this.nodeLogin.active = true;
    this.connSocket();
  }

  init() {
    this.gamePlayScript = find("Canvas/GamePlay").getComponent(GamePlay);
    this.gameSoloScript = find("Canvas/GameSolo").getComponent(GameSolo);
    this.musicManager = MucsicManager.getInstance();
    this.createUser();
  }

  connSocket() {
    // this.webSocket = new WebSocket("ws://192.168.0.22:7203"); // server máy laptop
    // this.webSocket = new WebSocket("ws://172.19.200.213:7203");   //server máy ở duy tân
    this.webSocket = new WebSocket("ws://127.0.0.1:7203");
    this.webSocket.onopen = (event) => {
      if (this.webSocket.readyState == 1 && this.firtTouch == false) {
        this.lblOnline.string = "online";
        this.init();
      }

      this.webSocket.onmessage = (event) => {
        this.handleMess(event.data);
      };

      this.webSocket.onclose = (event) => {
        this.showNotice("Server disconnected");
        this.lblOnline.string = "offline";
      };
    };
    this.webSocket.onerror = (event) => {
      this.showNotice("Failed to connect to server");
    };
  }

  createUser() {
    this.lblUsername.string = UserData.username;
    this.lblUsername.node.active = true;
    if (UserData.room != 0) {
      this.lblRoom.string = "Room: " + UserData.room;
      this.lblRoom.node.active = true;
    } else this.lblRoom.node.active = false;
    UserData.playing = true;
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

  handleMess(str) {
    // nhận về id, tên request, kết quả
    let data = JSON.parse(str); // chuyển sang dạng json
    switch (data.type) {
      case config.typeMess.CreateRoom: // nhạn yêu cầu tạo phòng từ server
        if (data.id == UserData.id) {
          UserData.room = data.room;
          this.lblRoom.string = "Room: " + UserData.room;
          this.lblRoom.node.active = true;
        }
        break;

      case config.typeMess.OutRoom: // trường hợp người chơi out room
        if (data.id == UserData.id && data.content == "done") {
          UserData.room = 0;
          // update lại trong room
          this.showNotice("Outed room!!!");
          this.updateRoom();
        } else if (data.room == UserData.room && data.content == "fail") {
          this.showNotice("Out room failed!!!");
        }
        break;

      case config.typeMess.Notic: // hiển thị % người chơi đã ăn được khi đấu solo hoặc hơn
        if (data.id != UserData.id && data.room == UserData.room) {
          if (data.progress < 100) this.showNotice(data.content);
          else this.showNotice("You lose~~~");
        }
        break;

      case config.typeMess.JoinRoom: // user join room
        if (data.id == UserData.id) {
          if (data.content == "done") {
            UserData.room = data.room;
            this.showNotice("Joined Room!!!");
            this.updateRoom();
          } else if (data.content == "false")
            this.showNotice("Done have room!!!");
        }
        break;

      case config.typeMess.Ready: // sẵn sàng
        UserData.ready = data.ready;
        this.lblReady.string = UserData.ready ? "true" : "false";
        break;

      case config.typeMess.PlayGame:
        if (data.play == true) {
          UserData.playing = true;
          UserData.solo = true;
          this.gameSolo.active = true;
          this.gameSoloScript.init(14, 10);
        }
        break;

      case config.typeMess.SignIn: // trả yêu cầu đăng nhập
        if (data.done == false) {
          this.showNotice("Username or password incorrect!!!");
        } else {
          this.nodeLogin.active = false;
          UserData.username = data.username;
          UserData.id = data.id;
          this.init();
        }
        break;

      case config.typeMess.SignUp: // trả yêu cầu đăng kí
        if (data.stage == "done") {
          this.showNotice("Create account successfull!!!");
          find("Canvas/menu/SignIn/SignUp").active = false;
        } else if (data.stage == "fail") {
          this.showNotice("Create account failed~~~");
        } else if (data.stage == "exist")
          this.showNotice("Username has existed!!!");
        break;

      case config.typeMess.InfoMap:
        if (UserData.room == data.room && data.id != UserData.id)
          this.gameSoloScript.UpdateMiniMap(data);
        break;
    }
  }

  updateRoom() {
    if (UserData.room == 0) this.lblRoom.node.active = false;
    else this.lblRoom.node.active = true;
    this.lblRoom.string = "Room: " + UserData.room;
  }

  btnCreateRoom() {
    if (UserData.room == 0) {
      let data = { id: UserData.id, type: config.typeMess.CreateRoom }; // truyền đi id và tên request
      this.webSocket.send(JSON.stringify(data));
    } else this.showNotice("you in other room");
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
      this.showNotice("Enter the id room");
    } else {
      let dt = {
        id: UserData.id,
        type: config.typeMess.JoinRoom,
        room: this.editBoxRoom.string,
      };
      this.webSocket.send(JSON.stringify(dt));
      this.editBoxRoom.string = "";
    }
  }

  btnSolo() {}

  btnReady() {
    let data = {
      id: UserData.id,
      room: UserData.room,
      ready: !UserData.ready ? true : false,
      type: config.typeMess.Ready,
    };
    if (data.room != 0) {
      this.webSocket.send(JSON.stringify(data));
    }
  }

  btnResume() {
    UserData.playing = false;
  }

  btnReconnect() {
    if (this.webSocket.readyState == this.webSocket.CLOSED) {
      this.webSocket = new WebSocket("ws://127.0.0.1:7203");
      this.webSocket.onopen = (event) => {
        // nếu connect được server thì mới vào
        this.webSocket.send(
          JSON.stringify({
            // gửi thông tin người chơi lên server khi mới kết nối
            id: UserData.id,
            type: config.typeMess.ReConnect,
            username: UserData.username,
            room: UserData.room,
            ready: UserData.ready,
          })
        );
        this.lblOnline.string = "online";
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

  btnSignUp() {
    this.nodeLogin.active = true;
  }

  btnSignOut() {
    // this.webSocket.close();
    // let n = instantiate(this.signInPref);
    // n.parent = this.node.children[1];
    // n.position = new Vec3(0, -10  0);
  }

  update(deltaTime: number) {}
}

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
import { UserInfo } from "../UI/UserInfo";
import { Room } from "../UI/Room";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Node)
  gamePlay: Node;
  @property(Node)
  gameSolo: Node;
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
  connected: boolean = false

  webSocket: WebSocket;
  firtTouch: boolean = false;
  start() {
    this.connSocket();
    this.preLogin()
  }

  preLogin() {
    find("Canvas/RootUI/menu").active = true;
    find("Canvas/RootUI/nodeSignIned").active = false
    find("Canvas/RootUI/nodeUser").active = false
  }


  init() {
    this.gamePlayScript = find("Canvas/GamePlay").getComponent(GamePlay);
    this.gameSoloScript = find("Canvas/GameSolo").getComponent(GameSolo);
    this.musicManager = MucsicManager.getInstance();
    this.createUser();
  }

  connSocket() {
    this.webSocket = new WebSocket("ws://27.72.102.114:7203");
    this.webSocket.onopen = (event) => {
      console.log("connected");
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
    };
  };

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
    this.nodeNotice?.getComponent(Notication).show(str);
  }

  btnShowGamePlay() {
    if (UserData.room == 0) {
      this.gamePlay.active = true;
      this.gamePlayScript.init(14, 8);

    }
    else this.showNotice("You can't play because of you are in the room!!!")
  }

  handleMess(str) {
    // nhận về id, tên request, kết quả
    let data = JSON.parse(str); // chuyển sang dạng json

    switch (data.type) {
      case config.typeMess.CreateRoom: // nhạn yêu cầu tạo phòng từ server
        if (data.id == UserData.id) {
          UserData.room = data.room;
          let n = this.node.getChildByPath("RootUI/nodePrefab/Room");
          n.getComponent(Room).setInforEnemy("");
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
        else if (data.room == UserData.room && data.id != UserData.id) {  // event đối thủ out room
          let n = this.node.getChildByPath("RootUI/nodePrefab/Room");
          n.getComponent(Room).setInforEnemy("");
          if (this.gameSolo.active) {
            this.gameSolo.active = false;
            this.showNotice("You win~~~");
          }
        }
        break;

      case config.typeMess.Notic: // hiển thị % người chơi đã ăn được khi đấu solo hoặc hơn
        if (data.id != UserData.id && data.room == UserData.room) {
          if (data.progress < 100) this.showNotice(data.content);
          else {
            this.showNotice("You lose~~~");
            // this.gameSolo.active = false;
            // this.btnOutRoom()
            this.gameSoloScript.showResultGame(false)
          }
        }
        break;

      case config.typeMess.JoinRoom: // user join room
        console.log(data);
        if (data.id == UserData.id) {
          if (data.content == "done") {
            UserData.room = data.room;
            this.showNotice("Joined Room!!!");
            this.updateRoom();
            if (data.name != "") {
              let n = this.node.getChildByPath("RootUI/nodePrefab/Room");
              n.getComponent(Room).setInforEnemy(data.name);
            }
          } else if (data.content == "false")
            this.showNotice("Don't have room!!!");
          else if (data.content == "Room full")
            this.showNotice("Room fully!!!")
        }
        if (data.room == UserData.room && data.listUsername.length == 2) {
          let idx = data.listUsername.indexOf(UserData.username);
          let n = this.node.getChildByPath("RootUI/nodePrefab/Room");
          if (idx == 0) {
            this.showNotice(data.listUsername[1] + " joined room!!!")
            n.getComponent(Room).setInforEnemy(data.listUsername[1])
          }
          else {
            this.showNotice("Joined Room!!!");
            n.getComponent(Room).setInforEnemy(data.listUsername[0])
          }
        }
        break;

      case config.typeMess.Ready: // sẵn sàng
        UserData.ready = data.ready;
        this.lblReady.string = UserData.ready ? "true" : "false";
        break;

      case config.typeMess.PlayGame:
        if (data.play == true) {
          this.actionGameSolo()
        }
        break;

      case config.typeMess.SignIn: // trả yêu cầu đăng nhập
        if (data.done == false) {
          this.showNotice("Username or password incorrect!!!");
        } else {
          UserData.username = data.username;
          UserData.id = data.id;
          UserData.hint = data.hint;
          UserData.refresh = data.refresh;
          UserData.level = data.level;
          find("Canvas/RootUI/nodePrefab/SignIn").active = false
          find("Canvas/RootUI/menu").active = false
          find("Canvas/RootUI/nodeSignIned").active = true
          find("Canvas/RootUI/nodeUser").active = true
          this.init();
        }
        break;

      case config.typeMess.SignUp: // trả yêu cầu đăng kí
        if (data.stage == "done") {
          this.showNotice("Create account successfull!!!");
          // find("Canvas/RootUI/SignIn/SignUp").active = false;
        } else if (data.stage == "fail") {
          this.showNotice("Create account failed~~~");
        } else if (data.stage == "exist")
          this.showNotice("Username has existed!!!");
        break;

      case config.typeMess.InfoMap:
        if (UserData.room == data.room && data.id != UserData.id) {
          this.gameSoloScript.handleInfoUser(data);
        }
        break;

      case config.typeMess.showHint:
        if (data.content == "done") {
          UserData.hint = data.hint;
          if (this.gamePlay.active == true) {
            this.gamePlayScript.showHint();
          } else if (this.gameSolo.active == true) {
            this.gameSoloScript.showHint();
          }
        }
        break;

      case config.typeMess.refreshMap:
        if (data.content == "done") {
          UserData.refresh = data.refresh;
          if (this.gamePlay.active == true) {
            this.gamePlayScript.refresh();
          }
          else if (this.gameSolo.active == true) {
            this.gameSoloScript.refresh()
          }
        }
        break;

      case config.typeMess.updateLevel:
        this.updateLevel(data);

        break;

      case config.typeMess.winSolo:
        this.showNotice(data.content);
        break;

    }
  }

  actionGameSolo() {
    UserData.playing = true;
    UserData.solo = true;
    this.gameSolo.active = true;
    this.gameSoloScript.init(14, 8);
  }

  updateRoom() {
    if (UserData.room == 0) this.lblRoom.node.active = false;
    else this.lblRoom.node.active = true;
    this.lblRoom.string = "Room: " + UserData.room;
  }

  updateLevel(data) {
    // if (data.content == "Highest") {
    //   this.gamePlayScript.showWinGame(199)
    // }
    this.gamePlayScript.showWinGame(data.score)

  }

  btnCreateRoom() {
    if (UserData.room == 0) {
      let data = { id: UserData.id, type: config.typeMess.CreateRoom }; // truyền đi id và tên request
      this.webSocket.send(JSON.stringify(data));
    } else this.showNotice("You in other room");
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

  btnJoinRoom(str: string) {
    let dt = {
      id: UserData.id,
      name: UserData.username,
      type: config.typeMess.JoinRoom,
      room: str
    }
    this.webSocket.send(JSON.stringify(dt));
  }

  btnSolo() { }

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
    else this.showNotice("Can't ready because of you not in the room!!!")
  }

  btnResume() {
    UserData.playing = false;
  }

  btnReconnect() {
    if (this.webSocket.readyState == this.webSocket.CLOSED) {
      this.webSocket = new WebSocket("ws://27.72.102.114:7203");
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

  btnConnect() {

  }

  btnSignOut() {
    // this.webSocket.close();
    // let n = instantiate(this.signInPref);
    // n.parent = this.node.children[1];
    // n.position = new Vec3(0, -10  0);
  }

  update(deltaTime: number) { }
}

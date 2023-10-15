import {
  _decorator,
  Color,
  Component,
  find,
  Graphics,
  instantiate,
  Label,
  math,
  Node,
  Prefab,
  ProgressBar,
  Sprite,
  sys,
  Vec2,
  Vec3,
} from "cc";
import { UIManager } from "../Manager/UIManager";
import UserData from "../data/UserData";
import { Item } from "./Item";
import { GameManager } from "../Manager/GameManager";
import config from "../data/config";
const { ccclass, property } = _decorator;
@ccclass("GamePlay")
export class GamePlay extends Component {
  @property(Prefab)
  ItemPrefab: Prefab;

  @property(Prefab)
  UserInfo: Prefab;

  @property(Node)
  container: Node;

  @property(Label)
  lblCountLive: Label

  @property(Label)
  lblCountHint: Label

  @property(Label)
  lblCountRefresh: Label

  @property(Label)
  lblLevel: Label

  @property(ProgressBar)
  timeBar: ProgressBar

  @property(Graphics)
  nodeGraphics: Graphics;


  listItem = [];
  GameSize: Vec2;

  nodeClick = [];
  blockClick: boolean = false;
  count: number;
  progress: number;
  gameManager;

  listState = [30, 50, 70, 90, 100]
  state: number = 0;

  start() {
    this.gameManager = find("Canvas").getComponent(GameManager);
  }

  init(x: number, y: number) {
    this.listItem = [];
    this.nodeClick = [];
    this.state = 0;
    this.container.removeAllChildren();
    this.GameSize = new Vec2(x + 4, y + 4);
    for (let i = 0; i < this.GameSize.y; i++) {
      {
        let arr = [];
        for (let j = 0; j < this.GameSize.x; j++) {
          let node = instantiate(this.ItemPrefab);
          node.setPosition(
            new Vec3(
              (-40 * this.GameSize.x) / 2 + 40 * j,
              -20 + (40 * this.GameSize.y) / 2 - 40 * i
            )
          );
          if (
            // check các ô bao ở ngoài
            i == 0 ||
            i == 1 ||
            i == this.GameSize.y - 1 ||
            i == this.GameSize.y - 2 ||
            j == 0 ||
            j == 1 ||
            j == this.GameSize.x - 1 ||
            j == this.GameSize.x - 2
          )
            node.active = false;
          else node.active = true;
          this.container.addChild(node);
          arr.push(node);
        }
        this.listItem.push(arr);
      }
    }

    let listIndex = [];
    for (
      let i = 0;
      i < ((this.GameSize.x - 4) * (this.GameSize.y - 4)) / 2;
      i++
    )
      listIndex.push(Math.floor(Math.random() * 22) + 1);

    listIndex = listIndex.concat(listIndex);
    this.count = 0;
    for (let i = 0; i < this.GameSize.y; i++) {
      for (let j = 0; j < this.GameSize.x; j++) {
        if (this.listItem[i][j].active == true) {
          let indexRan = Math.floor(Math.random() * listIndex.length);
          this.listItem[i][j]
            .getComponent(Item)
            .init(new Vec2(i, j), listIndex[indexRan]);
          listIndex.splice(indexRan, 1);
        }
      }
    }
    this.lblCountLive.string = UserData.lives + ""
    this.lblCountHint.string = UserData.hint + ""
    this.lblCountRefresh.string = UserData.refresh + ""
    if (UserData.solo == false) {
      this.lblLevel.node.active = true;
      this.lblLevel.string = "LEVEL " + UserData.level;
    }
    else this.lblLevel.node.active = false;
  }

  findRoad(pos1: Vec2, pos2: Vec2) {
    // tim duong
    let connect = false;
    if (this.findVertical(pos1, pos2)) return true;
    if (this.findHorizontal(pos1, pos2)) return true;
    return connect;
  }

  findVertical(point1, point2) {
    //tìm theo chiều dọc
    let connect = false;
    let point3 = new Vec2(-1, -1);
    let point4 = new Vec2(-1, -1);
    point3.x = point1.x;
    point4.x = point2.x;

    for (let i = Math.min(point1.y, point2.y); i < this.GameSize.x; i++) {
      point3.y = i;
      point4.y = i;
      if (
        this.checkCanConnectOnArrow(point3, point4) &&
        this.checkCanConnectOnArrow(point1, point3) &&
        this.checkCanConnectOnArrow(point2, point4)
      ) {
        connect = true;
        this.drawLine(point1, point3, point4, point2);
        // console.log(point1, point2, point3, point4);
        return connect;
      }
    }
    for (let i = 1; i < Math.min(point1.y, point2.y); i++) {
      point3.y = i;
      point4.y = i;
      if (
        this.checkCanConnectOnArrow(point3, point4) &&
        this.checkCanConnectOnArrow(point1, point3) &&
        this.checkCanConnectOnArrow(point2, point4)
      ) {
        connect = true;
        this.drawLine(point1, point3, point4, point2);
        // console.log(point1, point2, point3, point4);
        return connect;
      }
    }
    // console.log(point3, point4, connect);

    return connect;
  }

  findHorizontal(point1, point2) {
    //tìm theo chiều ngang
    let connect = false;
    let point3 = new Vec2(-1, -1);
    let point4 = new Vec2(-1, -1);
    point3.y = point1.y;
    point4.y = point2.y;
    // console.log(point1, point2, point3, point4);

    for (let i = Math.min(point1.x, point2.x); i < this.GameSize.y; i++) {
      point3.x = i;
      point4.x = i;
      if (
        this.checkCanConnectOnArrow(point3, point4) &&
        this.checkCanConnectOnArrow(point1, point3) &&
        this.checkCanConnectOnArrow(point2, point4)
      ) {
        connect = true;
        this.drawLine(point1, point3, point4, point2);
        // console.log(point1, point2, point3, point4);
        return connect;
      }
    }

    for (let i = 1; i < this.GameSize.y; i++) {
      point3.x = i;
      point4.x = i;
      if (
        this.checkCanConnectOnArrow(point3, point4) &&
        this.checkCanConnectOnArrow(point1, point3) &&
        this.checkCanConnectOnArrow(point2, point4)
      ) {
        connect = true;
        this.drawLine(point1, point3, point4, point2);
        // console.log(point1, point2, point3, point4);
        return connect;
      }
    }

    // console.log(point3, point4, connect);

    return connect;
  }

  checkCanConnectOnArrow(pos1: Vec2, pos2: Vec2) {
    // kiểm tra connect 2 node được k
    let s = true;
    if (pos1.x == pos2.x && pos1.y == pos2.y) return true;
    if (
      this.listItem[pos1.x][pos1.y].active == true &&
      this.listItem[pos1.x][pos1.y] != this.nodeClick[0] &&
      this.listItem[pos1.x][pos1.y] != this.nodeClick[1]
    )
      return false;

    if (
      this.listItem[pos2.x][pos2.y].active &&
      this.listItem[pos2.x][pos2.y] != this.nodeClick[0] &&
      this.listItem[pos2.x][pos2.y] != this.nodeClick[1]
    )
      return false;
    if (pos1.x == pos2.x) {
      for (
        let i = Math.min(pos1.y, pos2.y) + 1;
        i < Math.max(pos1.y, pos2.y);
        i++
      ) {
        if (this.listItem[pos1.x][i].active == true) return false;
      }
    } else if (pos1.y == pos2.y) {
      for (
        let i = Math.min(pos1.x, pos2.x) + 1;
        i < Math.max(pos1.x, pos2.x);
        i++
      ) {
        if (this.listItem[i][pos1.y].active == true) return false;
      }
    }
    // console.log(pos1, pos2, s);
    return s;
  }

  btnClickItem(node: Node) {
    if (this.blockClick == false) {
      // check chọn node đầu
      node.children[0].getComponent(Sprite).color = new Color(
        parseInt("A2", 16),
        parseInt("73", 16),
        parseInt("73", 16)
      );
      if (this.nodeClick.length == 0) {
        this.nodeClick.push(node);
      } else if (this.nodeClick.length == 1) {
        // check chọn node 2
        this.blockClick = true;
        this.nodeClick.push(node);

        if (this.nodeClick[0] == this.nodeClick[1]) {
          // cùng là 1 node
          this.nodeClick[0].children[0].getComponent(Sprite).color = new Color(
            255,
            255,
            255
          );
          this.nodeClick = [];
          this.blockClick = false;
        } else if (
          this.nodeClick[0].getComponent(Item).index ==
          this.nodeClick[1].getComponent(Item).index
        ) {
          // 2 node cùng 1 index(cùng hình)
          if (
            this.findRoad(
              this.nodeClick[0].getComponent(Item).pos,
              this.nodeClick[1].getComponent(Item).pos
            )
          ) {
            setTimeout(() => {
              this.nodeClick[0].active = false;
              this.nodeClick[1].active = false;
              this.nodeClick = [];
              this.blockClick = false;
              this.nodeGraphics.clear();
              this.count += 2;

              this.progress = Math.floor(
                (this.count / ((this.GameSize.x - 4) * (this.GameSize.y - 4))) *
                100
              );

              if (this.progress >= this.listState[this.state] && UserData.solo == true) {
                this.state++;
                this.sendNoticToOtherPlayer()
              }
              if (this.progress == 100)
                this.gameManager.showNotice("Win game!!!");
            }, 300);
          } else {
            setTimeout(() => {
              this.nodeClick[0].children[0].getComponent(Sprite).color =
                new Color(255, 255, 255);
              this.nodeClick[1].children[0].getComponent(Sprite).color =
                new Color(255, 255, 255);
              this.nodeClick = [];
              this.blockClick = false;
            }, 300);
          }
        } else {
          setTimeout(() => {
            this.nodeClick[0].children[0].getComponent(Sprite).color =
              new Color(255, 255, 255);
            this.nodeClick[1].children[0].getComponent(Sprite).color =
              new Color(255, 255, 255);
            this.blockClick = false;
            this.nodeClick = [];
          }, 300);
        }
      }
    }
  }

  showWinGame() {
    this.gameManager.showNotice(config.notice.win);
  }

  sendNoticToOtherPlayer() {
    // thông báo tiến trình user đã chơi được
    let data = {
      id: UserData.id,
      username: UserData.username,
      type: config.typeMess.Notic,
      room: UserData.room,
      progress: this.progress,
      content: UserData.username + ": đã hoàn thành " + this.listState[this.state - 1] + "%",
    };

    this.gameManager.webSocket.send(JSON.stringify(data)); // gửi thông tin người chơi đến serverr
  }

  drawLine(p1: Vec2, p3: Vec2, p4: Vec2, p2: Vec2) {
    let n1 = this.listItem[p1.x][p1.y];
    let n2 = this.listItem[p2.x][p2.y];
    let n3 = this.listItem[p3.x][p3.y];
    let n4 = this.listItem[p4.x][p4.y];

    this.nodeGraphics.lineWidth = 5;
    this.nodeGraphics.strokeColor = new Color(parseInt("95", 16), parseInt("60", 16), parseInt("48", 16)) //#956048

    this.nodeGraphics.moveTo(n1.getPosition().x, n1.getPosition().y);
    this.nodeGraphics.lineTo(n3.getPosition().x, n3.getPosition().y);

    this.nodeGraphics.moveTo(n3.getPosition().x, n3.getPosition().y);
    this.nodeGraphics.lineTo(n4.getPosition().x, n4.getPosition().y);

    this.nodeGraphics.moveTo(n4.getPosition().x, n4.getPosition().y);
    this.nodeGraphics.lineTo(n2.getPosition().x, n2.getPosition().y);

    this.nodeGraphics.stroke();
    this.gameManager.playSound(
      parseInt(sys.localStorage.getItem(config.Name.PikachuSound))
    );
  }

  btnExit() {
    this.blockClick = false;
    this.node.active = false;
  }

  btnHint() {
    if (UserData.hint == 0) {
      this.gameManager.showNotice(config.notice.noHint)
      return 0;
    }
  }

  btnRefresh() {
    if (UserData.refresh == 0) {
      this.gameManager.showNotice(config.notice.noRefresh)
      return
    }
    let listIndex = []
    let size = (this.GameSize.x - 4) * (this.GameSize.y - 4)
    for (let i = 0; i < (size - this.count / 2); i++) {
      listIndex.push(Math.floor(Math.random() * 22) + 1);
    }

    listIndex = listIndex.concat(listIndex);

    for (let i = 0; i < this.GameSize.y; i++) {
      for (let j = 0; j < this.GameSize.x; j++) {
        if (this.listItem[i][j].active == true) {
          let indexRan = Math.floor(Math.random() * listIndex.length);
          this.listItem[i][j]
            .getComponent(Item)
            .refresh(listIndex[indexRan]);
          listIndex.splice(indexRan, 1);
        }
      }
    }

    UserData.refresh -= 1;
    this.lblCountRefresh.string = UserData.refresh + ""
    this.gameManager.showNotice(config.notice.doneRefresh)

  }

  update(deltaTime: number) { }
}


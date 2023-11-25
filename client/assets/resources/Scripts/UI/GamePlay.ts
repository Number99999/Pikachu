import {
  _decorator,
  AsyncDelegate,
  Color,
  Component,
  find,
  Graphics,
  instantiate,
  Label,
  Node,
  Prefab,
  ProgressBar,
  Sprite,
  tween,
  UITransform,
  Vec2,
  Vec3,
} from "cc";
import UserData from "../data/UserData";
import { Item } from "./Item";
import { GameManager } from "../Manager/GameManager";
import config from "../data/config";
const { ccclass, property } = _decorator;
@ccclass("GamePlay")
export class GamePlay extends Component {
  @property(Prefab)
  ItemPrefab: Prefab;

  @property(Node)
  container: Node;

  @property(Node)
  nodePause: Node;

  @property(Label)
  lblCountLive: Label;

  @property(Label)
  lblCountHint: Label;

  @property(Label)
  lblCountRefresh: Label;

  @property(Label)
  lblLevel: Label;

  @property(Label)
  lblScore: Label;

  @property(Label)
  lblTime: Label;

  @property(ProgressBar)
  timeBar: ProgressBar;

  @property(Graphics)
  nodeGraphics: Graphics;

  @property(Node)
  nodeGameResult: Node

  @property(Node)
  nodeProgressBest: Node

  blockHint: boolean = false;


  listItem = [];
  GameSize: Vec2;

  nodeClick = [];
  blockClick: boolean = false;
  count: number;
  progress: number;
  gameManager: GameManager;

  totalTime: number = 600;
  curTime: number = 600;

  start() {
    this.gameManager = find("Canvas").getComponent(GameManager);
    this.lblTime.string = this.convertTime(this.curTime);
    this.timeBar.progress = this.curTime / this.totalTime;
    this.schedule(this.countDown, 1);
  }

  init(x: number, y: number) {
    this.nodeGraphics.node.setPosition(this.container.getPosition())
    this.nodeGameResult.active = false
    this.listItem = [];
    this.nodeClick = [];
    this.lblScore.string = "0";
    this.container.removeAllChildren();
    this.GameSize = new Vec2(x + 4, y + 4);
    for (let i = 0; i < this.GameSize.y; i++) {
      {
        let arr = [];
        for (let j = 0; j < this.GameSize.x; j++) {
          let node = instantiate(this.ItemPrefab);
          node.setPosition(
            new Vec3(
              (52 + -52 * this.GameSize.x) / 2 + 52 * j,
              -26 + (52 * this.GameSize.y) / 2 - 52 * i
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
    this.lblCountLive.string = UserData.lives + "";
    this.lblCountHint.string = UserData.hint + "";
    this.lblCountRefresh.string = UserData.refresh + "";
    if (UserData.solo == false) {
      this.lblLevel.node.active = true;
      this.lblLevel.string = "LEVEL " + UserData.level;
    } else this.lblLevel.node.active = false;
    this.curTime = this.totalTime;

  }

  findRoad(pos1: Vec2, pos2: Vec2, draw) {
    // tim duong
    let connect = false;
    if (this.findVertical(pos1, pos2, draw)) return true;
    if (this.findHorizontal(pos1, pos2, draw)) return true;
    return connect;
  }

  findVertical(point1, point2, draw) {
    //tìm theo chiều dọc
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
        switch (draw) {
          case 1: // hint
            this.nodeClick[0].children[1].active = true;
            this.nodeClick[1].children[1].active = true;
            break;
          case 2: // an pikachu
            this.drawLine(point1, point3, point4, point2);
            break;
        }
        return true;
      }
    }
    for (let i = Math.min(point1.y, point2.y) - 1; i > 0; i--) {
      point3.y = i;
      point4.y = i;
      if (
        this.checkCanConnectOnArrow(point3, point4) &&
        this.checkCanConnectOnArrow(point1, point3) &&
        this.checkCanConnectOnArrow(point2, point4)
      ) {
        switch (draw) {
          case 1://hint
            this.nodeClick[0].children[1].active = true;
            this.nodeClick[1].children[1].active = true;
            console.log("212");

            break;
          case 2://an pikachu
            this.drawLine(point1, point3, point4, point2);
            console.log("217");
            break;
        }
        return true;
      }
    }
    return false;
  }

  findHorizontal(point1, point2, draw) {
    //tìm theo chiều ngang
    let point3 = new Vec2(-1, -1);
    let point4 = new Vec2(-1, -1);
    point3.y = point1.y;
    point4.y = point2.y;

    let i = Math.min(point1.x, point2.x)
    for (i; i < this.GameSize.y; i++) {
      point3.x = i;
      point4.x = i;
      if (
        this.checkCanConnectOnArrow(point3, point4) &&
        this.checkCanConnectOnArrow(point1, point3) &&
        this.checkCanConnectOnArrow(point2, point4)
      ) {
        switch (draw) {
          case 1: //hint
            this.nodeClick[0].children[1].active = true;
            this.nodeClick[1].children[1].active = true;
            break;
          case 2://an pikachu
            this.drawLine(point1, point3, point4, point2);
            break;
        }
        // console.log(point1, point2, point3, point4);
        return true;
      }
    }
    i = Math.min(point1.x, point2.x) - 1
    for (i; i > 0; i--) {
      point3.x = i;
      point4.x = i;
      if (
        this.checkCanConnectOnArrow(point3, point4) &&
        this.checkCanConnectOnArrow(point1, point3) &&
        this.checkCanConnectOnArrow(point2, point4)
      ) {
        switch (draw) {
          case 1: //hint
            this.nodeClick[0].children[1].active = true;
            this.nodeClick[1].children[1].active = true;
            break;
          case 2: //an pikachu
            this.drawLine(point1, point3, point4, point2);
            break;
        }
        return true;
      }
    }

    return false;
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
    if (this.nodeClick.length >= 2) this.nodeClick = []
    if (this.blockClick == false) {
      // check chọn node đầu
      node.getComponent(Item).avatar.color = new Color(
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
          this.nodeClick[0].getComponent(Item).avatar.color = new Color(
            255,
            255,
            255
          );
          this.nodeClick = [];
          this.blockClick = false;
          return;
        }
        if (
          this.nodeClick[0].getComponent(Item).index ==
          this.nodeClick[1].getComponent(Item).index
        ) {
          // 2 node cùng 1 index(cùng hình)
          if (
            this.findRoad(
              this.nodeClick[0].getComponent(Item).pos,
              this.nodeClick[1].getComponent(Item).pos,
              2
            )
          ) {
            setTimeout(() => {
              this.blockHint = false
              this.count += 2;
              this.lblScore.string = parseInt(this.lblScore.string) + 200 + "";
              this.progress = Math.floor(
                (this.count / ((this.GameSize.x - 4) * (this.GameSize.y - 4))) *
                100
              );

              this.nodeClick[0].active = false;
              this.nodeClick[1].active = false;
              this.nodeClick = [];


              this.blockClick = false;
              this.nodeGraphics.clear();

              if (this.progress == 100) {
                this.gameManager.showNotice("You win!!!");
                this.listItem.forEach((e) => {
                  e.forEach((i) => {
                    i.active = false;
                  });
                })

                let dt = {
                  level: UserData.level,
                  score: parseInt(this.lblScore.string),
                  type: config.typeMess.updateLevel,
                }
                this.gameManager.webSocket.send(JSON.stringify(dt))
                this.unschedule(this.countDown);
              }
              else if (this.checkDie() == true) this.refresh();


            }, 300);

          }
          else {
            setTimeout(() => {
              this.nodeClick[0].getComponent(Item).avatar.color =
                new Color(255, 255, 255);
              this.nodeClick[1].getComponent(Item).avatar.color =
                new Color(255, 255, 255);
              this.blockClick = false;
              this.nodeClick = [];
            }, 300);
          }
        }
        else {
          setTimeout(() => {
            this.nodeClick[0].getComponent(Item).avatar.color =
              new Color(255, 255, 255);
            this.nodeClick[1].getComponent(Item).avatar.color =
              new Color(255, 255, 255);
            this.blockClick = false;
            this.nodeClick = [];
          }, 300);
        }
      }
    }
  }

  checkDie() {
    for (let i = 1; i < this.GameSize.y - 1; i++)
      for (let j = 1; j < this.GameSize.x - 1; j++) {
        if (this.nodeClick.length >= 2) this.nodeClick = []
        for (let m = 1; m < this.GameSize.y - 1; m++)
          for (let n = 1; n < this.GameSize.x - 1; n++) {

            if (this.listItem[i][j].active == true && this.listItem[m][n].active == true
              && this.listItem[i][j].getComponent(Item).index == this.listItem[m][n].getComponent(Item).index
            ) {
              if (!(i == m && j == n)) {
                this.nodeClick.push(this.listItem[i][j], this.listItem[m][n])
                if (this.findRoad(new Vec2(i, j), new Vec2(m, n), 0) == true) {
                  this.nodeClick = []
                  return false
                }
              }
            }
          }
      }
    return true
  }

  showWinGame(best: number) {
    this.nodeGameResult.active = true;
    let n = this.nodeProgressBest.children[0]
    let w = this.nodeProgressBest.getComponent(UITransform).width - 20;
    n.setPosition(new Vec3(-w / 2, n.getPosition().y))

    if (best == this.count * 100) this.nodeGameResult.children[1].children[0].getComponent(Label).string = "HIGHEST SCORE"
    else this.nodeGameResult.children[1].children[0].getComponent(Label).string = "HIGH SCORE"
    this.nodeGameResult.children[1].children[1].children[1].getComponent(Label).string = this.count * 100 + "";
    this.nodeGameResult.children[1].children[2].children[1].getComponent(Label).string = best + "";
    tween(n)
      .to(0.5, { position: new Vec3(Math.random() * 100, n.getPosition().y) })
      .start()
  }

  drawLine(p1: Vec2, p3: Vec2, p4: Vec2, p2: Vec2) {
    let n1 = this.listItem[p1.x][p1.y];
    let n2 = this.listItem[p2.x][p2.y];
    let n3 = this.listItem[p3.x][p3.y];
    let n4 = this.listItem[p4.x][p4.y];

    this.nodeGraphics.lineWidth = 5;
    this.nodeGraphics.strokeColor = new Color(
      parseInt("95", 16),
      parseInt("60", 16),
      parseInt("48", 16)
    ); //#956048

    this.nodeGraphics.moveTo(n1.getPosition().x, n1.getPosition().y);
    if (n1 != n3)
      this.nodeGraphics.lineTo(n3.getPosition().x, n3.getPosition().y);

    if (n3 != n4)
      this.nodeGraphics.lineTo(n4.getPosition().x, n4.getPosition().y);

    if (n4 != n2)
      this.nodeGraphics.lineTo(n2.getPosition().x, n2.getPosition().y);

    this.nodeGraphics.stroke();
    this.gameManager.musicManager.playSound();
  }

  btnExit() {
    this.blockClick = false;
    this.node.active = false;
  }

  btnHint() {
    if (this.blockHint == false)
      if (UserData.hint == 0) {
        this.gameManager.showNotice(config.notice.noHint);
        return 0;
      }
      else {
        let dt = {
          type: config.typeMess.showHint,
        }
        this.gameManager.webSocket.send(JSON.stringify(dt))
      }
  }

  showHint() {
    this.blockHint = true
    this.lblCountHint.string = UserData.hint + ""
    for (let i = 1; i < this.GameSize.y - 1; i++)
      for (let j = 1; j < this.GameSize.x - 1; j++) {
        if (this.nodeClick.length >= 2) this.nodeClick = []
        for (let m = 1; m < this.GameSize.y - 1; m++)
          for (let n = 1; n < this.GameSize.x - 1; n++) {

            if (this.listItem[i][j].active == true && this.listItem[m][n].active == true
              && this.listItem[i][j].getComponent(Item).index == this.listItem[m][n].getComponent(Item).index
            ) {
              if (!(i == m && j == n)) {
                this.nodeClick.push(this.listItem[i][j], this.listItem[m][n])
                if (this.findRoad(new Vec2(i, j), new Vec2(m, n), 1) == true) {
                  this.nodeClick[0].children[1].active = true
                  this.nodeClick[1].children[1].active = true
                  this.nodeClick = []
                  return true
                }
              }
            }
          }
      }
  }

  btnRefresh() {
    if (UserData.refresh == 0) {
      this.gameManager.showNotice(config.notice.noRefresh);
      return;
    }
    if (this.blockClick == true) return;
    else {
      let dt = {
        type: config.typeMess.refreshMap,
      }
      this.gameManager.webSocket.send(JSON.stringify(dt))
    }
  }

  refresh() {
    let listIndex = [];
    this.lblCountRefresh.string = UserData.refresh + "";
    let size = (this.GameSize.x - 4) * (this.GameSize.y - 4);
    for (let i = 0; i < (size - this.count) / 2; i++) {
      listIndex.push(Math.floor(Math.random() * 22) + 1);
    }

    listIndex = listIndex.concat(listIndex);
    for (let i = 0; i < this.GameSize.y; i++) {
      for (let j = 0; j < this.GameSize.x; j++) {
        if (this.listItem[i][j].active == true) {
          let indexRan = Math.floor(Math.random() * listIndex.length);
          this.listItem[i][j].getComponent(Item).refresh(listIndex[indexRan], new Vec2(i, j));
          listIndex.splice(indexRan, 1);
          this.listItem[i][j].active = true
        }
      }
    }
    this.gameManager.showNotice(config.notice.doneRefresh);
  }

  btnPause() {
    this.nodePause.active = !this.nodePause.active;
    this.container.active = !this.container.active;
  }

  countDown() {
    if (this.curTime === 0) {
      this.unschedule(this.countDown);
    } else {
      if (this.container.active) {
        this.curTime -= 1;
        this.lblTime.string = this.convertTime(this.curTime);
        this.timeBar.progress = this.curTime / this.totalTime;
      }
    }
  }

  convertTime(time) {
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60;
    let s = "0" + minutes + ":";
    if (remainingSeconds < 10) s += "0" + remainingSeconds;
    else s += remainingSeconds;
    return s;
  }

  update(deltaTime: number) { }
}

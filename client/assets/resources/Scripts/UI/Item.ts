import {
  _decorator,
  Button,
  Component,
  find,
  Input,
  Label,
  math,
  Node,
  Sprite,
  SpriteAtlas,
  Vec2,
} from "cc";
import { GamePlay } from "./GamePlay";
import { GameSolo } from "./GameSolo";
import { GameManager } from "../Manager/GameManager";
const { ccclass, property } = _decorator;

@ccclass("Item")
export class Item extends Component {
  @property(SpriteAtlas)
  listAnimal: SpriteAtlas;
  @property(Sprite)
  avatar: Sprite;

  @property(Node)
  nodeRootUI: Node

  index: number = -1;
  block: boolean = false;
  public pos = new Vec2();
  position: Vec2 = new Vec2();
  start() {
    this.nodeRootUI.on(Input.EventType.TOUCH_END, this.btnCLick, this);
  }

  btnCLick() {
    if (this.block == false) {
      if (find("Canvas").getComponent(GameManager).gamePlay.active) {
        // check gameManager hay gamePlay
        if (!find("Canvas").children[2].getComponent(GamePlay).blockClick) {
          find("Canvas")
            .children[2].getComponent(GamePlay)
            .btnClickItem(this.node);
        }
      } else {
        find("Canvas")
          .children[3].getComponent(GameSolo)
          .btnClickItem(this.node);
      }
    }
  }

  refresh(index, pos?, active?) {
    this.index = index;
    this.pos ? this.pos = pos : this.pos = this.pos;
    if (this.index != -1)
      this.avatar.spriteFrame = this.listAnimal.getSpriteFrame("" + this.index);
    this.node.active = active
  }

  setPos(p) {
    this.position = p;
  }

  init(pos, index) {
    this.pos = pos;
    this.index = index;
    this.avatar.spriteFrame = this.listAnimal.getSpriteFrame("" + this.index);
  }

  protected onDestroy(): void {
    this.node.off(Input.EventType.TOUCH_END, this.btnCLick, this);
  }

  //   protected onEnable(): void {
  //     this.node.on(Input.EventType.TOUCH_END, this.btnCLick, this);
  //   }
}

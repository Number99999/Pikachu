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
const { ccclass, property } = _decorator;

@ccclass("Item")
export class Item extends Component {
  @property(SpriteAtlas)
  listAnimal: SpriteAtlas
  @property(Sprite)
  avatar: Sprite
  index: number = -1;
  public pos = new Vec2();

  start() {
    this.node.on(Input.EventType.TOUCH_END, this.btnCLick, this);
  }

  btnCLick() {
    if (!find("Canvas").children[2].getComponent(GamePlay).blockClick) {
      find("Canvas").children[2].getComponent(GamePlay).btnClickItem(this.node);
    }
  }

  refresh(index) {
    this.index = index
    this.avatar.spriteFrame = this.listAnimal.getSpriteFrame("" + this.index)
  }

  init(pos, index) {
    this.pos = pos;
    this.index = index;
    this.avatar.spriteFrame = this.listAnimal.getSpriteFrame("" + this.index)
  }

  protected onDestroy(): void {
    this.node.off(Input.EventType.TOUCH_END, this.btnCLick, this)
  }

  protected onEnable(): void {
    this.node.off(Input.EventType.TOUCH_END, this.btnCLick, this)
  }
}

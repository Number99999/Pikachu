import { _decorator, Component, Node, Label, Vec2, Input, find } from "cc";
import { GamePlay } from "./GamePlay";
const { ccclass, property } = _decorator;

@ccclass("Item")
export class Item extends Component {
  @property(Label)
  label: Label;
  index: number;
  public pos = new Vec2();
  start() {
    this.node.on(Input.EventType.TOUCH_END, this.btnCLick, this);
  }

  btnCLick() {
    this.label.string = "-1";
    if (!find("Canvas").getComponent(GamePlay).blockClick)
      find("Canvas").getComponent(GamePlay).btnClick(this.node);
    console.log(this.pos);
  }
  init(pos, index) {
    this.pos = pos;
    this.index = index;
  }

  update(deltaTime: number) {}
}

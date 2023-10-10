import {
  _decorator,
  Component,
  Input,
  instantiate,
  Node,
  Prefab,
  Vec2,
  Vec3,
} from "cc";
import { Item } from "./Item";
const { ccclass, property } = _decorator;

@ccclass("GamePlay")
export class GamePlay extends Component {
  @property(Prefab)
  ItemPrefab: Prefab;

  @property(Node)
  container: Node;
  //   @ts-ignore
  GameSize: {
    x: number;
    y: number;
  } = {};

  nodeClick1: Node = null;
  nodeClick2: Node = null;
  blockClick: boolean = false;
  start() {
    this.init();
    this.node.on(Input.EventType.TOUCH_END, this.btnClick, this);
  }

  init() {
    this.GameSize.x = 14;
    this.GameSize.y = 10;
    for (let j = 0; j < this.GameSize.y; j++) {
      for (let i = 0; i < this.GameSize.x; i++) {
        let node = instantiate(this.ItemPrefab);
        node.setPosition(
          new Vec3(
            (-this.GameSize.x * 50) / 2 + 50 * i,
            (this.GameSize.y * 50) / 2 - 50 * j
          )
        );
        node
          .getComponent(Item)
          .init(new Vec2(j, i), new Vec2(this.GameSize.x * i + j));
        this.container.addChild(node);
        if (
          i == 0 ||
          i == 1 ||
          i == this.GameSize.x - 2 ||
          i == this.GameSize.x - 1 ||
          j == 0 ||
          j == 1 ||
          j == this.GameSize.y - 2 ||
          j == this.GameSize.y - 1
        )
          node.active = false;
      }
    }
  }
  btnClick(node: Node) {
    if (this.nodeClick1 == null) this.nodeClick1 = node;
    else if (this.nodeClick2 == null) {
      this.nodeClick2 = node;
      this.blockClick = true;

      console.log(
        this.nodeClick1.getComponent(Item).pos,
        this.nodeClick2.getComponent(Item).pos
      );
    }
  }

  update(deltaTime: number) {}
}

import {
  _decorator,
  Component,
  instantiate,
  Label,
  Node,
  Tween,
  tween,
  UIOpacity,
  UITransform,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Notication")
export class Notication extends Component {
  @property(Label)
  lblNotic: Label;
  start() { }

  show(str: string) {
    this.node.active = true;
    let nodeNotice = instantiate(this.lblNotic.node);
    this.node.addChild(nodeNotice);
    nodeNotice.active = true;
    nodeNotice.getComponent(Label).string = str;

    nodeNotice.setPosition(
      new Vec3(
        (480 + nodeNotice.getComponent(UITransform).width / 2) *
        (Math.random() < 0.5 ? 1 : -1),
        0
      )
    );

    tween(nodeNotice)
      .to(0.4, { position: new Vec3(0, 0) })
      .call(() => {
        let opa = nodeNotice.getComponent(UIOpacity);
        tween(opa).to(0.5, { opacity: 100 }).start();
        tween(nodeNotice)
          .to(1.1, { position: new Vec3(0, 50) })
          .call(() => {
            nodeNotice.destroy();
          })
          .start();
      })
      .start();
  }

  update(deltaTime: number) { }
}

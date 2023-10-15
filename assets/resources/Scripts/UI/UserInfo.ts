import { _decorator, Component, Label, Node, Sprite } from "cc";
import UserData from "../data/UserData";
const { ccclass, property } = _decorator;

@ccclass("UserInfo")
export class UserInfo extends Component {
  @property(Sprite)
  avatar: Sprite;
  @property(Label)
  userName: Label;

  start() {
    this.userName.string = UserData.username;
  }
  init(data) {
    this.userName.string = data.username;
  }

  update(deltaTime: number) {}
}

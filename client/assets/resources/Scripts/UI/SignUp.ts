import { _decorator, Component, EditBox, find, Node } from "cc";
import { GameManager } from "../Manager/GameManager";
import config from "../data/config";
const { ccclass, property } = _decorator;

@ccclass("SignUp")
export class SignUp extends Component {
  @property(EditBox)
  editUsername;
  @property(EditBox)
  editPass;
  @property(EditBox)
  editComfirmPass;

  gameManager;
  start() {
    this.gameManager = find("Canvas").getComponent(GameManager);
  }

  btnConfirm() {
    if (this.editUsername.string.length > 5) {
      if (this.editPass.string.length > 5) {
        if (this.editPass.string == this.editComfirmPass.string) {
          let dt = {
            username: this.editUsername.string,
            password: this.editPass.string,
            type: config.typeMess.SignUp,
          };
          this.gameManager.webSocket.send(JSON.stringify(dt));
        } else this.gameManager.showNotice("Username and password must match");
      } else this.gameManager.showNotice("Password must be longer 6 character");
    } else this.gameManager.showNotice("Username must be longer 6 character");

    this.editUsername.string = "";
    this.editPass.string = "";
    this.editComfirmPass.string = "";
  }

  btnHide() {
    this.node.active = false;
  }

  update(deltaTime: number) {}
}

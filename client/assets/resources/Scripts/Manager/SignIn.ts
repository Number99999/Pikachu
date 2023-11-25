import { _decorator, Button, Component, EditBox, find, Node } from "cc";
import UserData from "../data/UserData";
import { GameManager } from "./GameManager";
import config from "../data/config";
const { ccclass, property } = _decorator;

@ccclass("SignIn")
export class SignIn extends Component {
  @property(EditBox)
  editUser;
  @property(EditBox)
  editPass;


  gameManager: GameManager;
  start() {
    this.gameManager = find("Canvas").getComponent(GameManager);
  }

  btnSignIn() {
    if (this.editUser.string.length < 6 || this.editPass.string.length < 6)
      this.gameManager.showNotice(
        "Username and password must be longer than 6 characters "
      );
    else {
      let dt = {
        username: this.editUser.string,
        password: this.editPass.string,
        type: config.typeMess.SignIn,
      };
      this.gameManager.webSocket.send(JSON.stringify(dt));
    }
  }

  update(deltaTime: number) { }
}

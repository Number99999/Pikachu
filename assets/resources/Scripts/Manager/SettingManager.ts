import { _decorator, Component, find, Node } from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("SettingManager")
export class SettingManager extends Component {
  gameManager;
  start() {
    this.gameManager = find("Canvas").getComponent(GameManager);
  }

  btnTatMusic() {
    this.gameManager.playMusic(0);
  }

  btnBatMusic() {
    this.gameManager.playMusic(1);
  }
  btnTatSound() {
    this.gameManager.playSound(0);
  }
  btnBatSound() {
    this.gameManager.playSound(1);
  }
  update(deltaTime: number) {}
}

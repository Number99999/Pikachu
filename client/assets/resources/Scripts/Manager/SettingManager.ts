import { _decorator, Component, find, Node } from "cc";
import { GameManager } from "./GameManager";
import { MucsicManager } from "./MucsicManager";
const { ccclass, property } = _decorator;

@ccclass("SettingManager")
export class SettingManager extends Component {
  @property(Node)
  btnSoundOn: Node
  @property(Node)
  btnSoundOff: Node
  @property(Node)
  btnMusicOn: Node
  @property(Node)
  btnMusicOff: Node

  gameManager: GameManager;
  musicManager: MucsicManager
  start() {
    this.gameManager = find("Canvas").getComponent(GameManager);
    this.musicManager = MucsicManager.getInstance();
    console.log("sound", this.musicManager.audioSound.volume, "music", this.musicManager.audioMusic.volume);

    this.updateBtn()
  }

  btnTatMusic() {
    console.log("btn tat sound");

    this.musicManager.setVolumeMusic(1);
    this.updateBtn()
  }

  btnBatMusic() {
    console.log("btn bat music");

    this.musicManager.setVolumeMusic(0);
    this.updateBtn()
  }
  btnTatSound() {
    console.log("btn tat sound");

    this.musicManager.setVolumeSound(1);
    this.updateBtn()
  }
  btnBatSound() {
    console.log("btn bat sound");

    this.musicManager.setVolumeSound(0);
    this.updateBtn()
  }

  updateBtn() {
    console.log(this.musicManager.audioMusic.volume == 1);

    if (this.musicManager.audioMusic.volume == 1) {
      this.btnMusicOff.active = false;
      this.btnMusicOn.active = true;
    }
    else {
      this.btnMusicOff.active = true;
      this.btnMusicOn.active = false;
    }

    if (this.musicManager.audioSound.volume == 1) {
      this.btnSoundOn.active = true;
      this.btnSoundOff.active = false;
    }
    else {
      this.btnSoundOff.active = true;
      this.btnSoundOn.active = false;
    }
  }
  update(deltaTime: number) {


  }
}

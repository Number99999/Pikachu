import { _decorator, AudioClip, AudioSource, Node, resources, sys } from "cc";
import config from "../data/config";
const { ccclass, property } = _decorator;

@ccclass("MucsicManager")
export class MucsicManager {
  private static instance: MucsicManager;
  public volMusic: number = null;
  public volSound: number = null;
  private music: AudioClip;
  private sound: AudioClip;
  public audioMusic: AudioSource;
  public audioSound: AudioSource;
  public static getInstance() {
    if (!this.instance) this.instance = new MucsicManager();
    return this.instance;
  }

  constructor() {
    this.music = new AudioClip();
    this.sound = new AudioClip();
    this.audioMusic = new AudioSource();
    this.audioSound = new AudioSource();
    this.load();
  }

  load() {
    resources.load(config.Data.PathMusic, AudioClip, (err, data) => {
      this.music = data;
      this.audioMusic.clip = data;
      console.log("loaded music");
      this.playMusic();
    });
    resources.load(config.Data.PathSound, AudioClip, (err, data) => {
      this.sound = data;
      this.audioSound.clip = data;
      console.log("loaded sound");
      this.playSound();
    });
  }

  playMusic() {
    if (sys.localStorage.getItem(config.Name.PikachuMusic) == null) {
      this.setVolumeMusic(1);
      return;
    }
    else {
      this.audioMusic.volume = parseInt(
        sys.localStorage.getItem(config.Name.PikachuMusic)
      );
      this.audioMusic.play();
    }
  }

  playSound() {
    if (sys.localStorage.getItem(config.Name.PikachuSound) == null) {
      this.setVolumeSound(1);
      return;
    }
    else {
      this.audioSound.volume = parseInt(
        sys.localStorage.getItem(config.Name.PikachuSound)
      );
      this.audioSound.playOneShot(this.audioSound.clip, 1);
    }

  }

  setVolumeMusic(vol: number) {
    this.audioMusic.volume = vol;
    sys.localStorage.setItem(config.Name.PikachuMusic, vol + "");
    this.playMusic();
  }

  setVolumeSound(vol: number) {
    this.audioSound.volume = vol;
    sys.localStorage.setItem(config.Name.PikachuSound, vol + "");
    this.playSound();
  }
}

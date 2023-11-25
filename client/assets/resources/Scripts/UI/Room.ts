import { _decorator, Component, EditBox, find, Label, Node } from 'cc';
import { GameManager } from '../Manager/GameManager';
import UserData from '../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('Room')
export class Room extends Component {

    @property(EditBox)
    editBoxRoom: EditBox

    @property(Label)
    lblRoom: Label

    @property(Node)
    rootUI1: Node

    @property(Node)
    rootUI2: Node

    @property(Label)
    lblUsername: Label

    @property(Label)
    lblEnemyName: Label

    gameManager: GameManager
    start() {
        this.gameManager = find("Canvas").getComponent(GameManager);
        this.lblUsername.string = UserData.username
    }

    btnJoinRoom() {
        if (this.editBoxRoom.string.length == 0) this.gameManager.showNotice("Enter id room!!!")
        else {
            this.gameManager.btnJoinRoom(this.editBoxRoom.string)
            this.editBoxRoom.string = ""
        }
    }

    btnCreateRoom() {
        this.editBoxRoom.string = ""
        this.gameManager.btnCreateRoom();
    }

    btnOutRoom() {
        this.gameManager.btnOutRoom()
    }

    btnReady() {
        this.gameManager.btnReady()
    }

    setInforEnemy(name: string) {
        this.lblEnemyName.string = name;
    }

    update(deltaTime: number) {
        if (UserData.room != 0) {
            this.rootUI1.active = false
            this.rootUI2.active = true
            this.lblRoom.string = "Room " + UserData.room;
        }
        else {
            this.rootUI1.active = true
            this.rootUI2.active = false
            this.lblRoom.string = "Room";
        }
    }
}



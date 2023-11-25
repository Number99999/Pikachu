import { _decorator, Component, find, Node } from 'cc';
import { GameManager } from '../Manager/GameManager';
const { ccclass, property } = _decorator;

@ccclass('ChooseMode')
export class ChooseMode extends Component {

    gameManager: GameManager;
    start() {
        this.gameManager = find("Canvas").getComponent(GameManager)

    }

    update(deltaTime: number) {

    }

    btnGamePlay() {
        this.gameManager.btnShowGamePlay()
    }

    btnGameSolo() {
        this.gameManager.actionGameSolo()
    }
}



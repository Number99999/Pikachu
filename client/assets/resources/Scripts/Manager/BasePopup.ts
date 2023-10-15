import { _decorator, Component, Input, input, log, Node, Prefab } from 'cc';
import { UIManager } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('BasePopup')
export class BasePopup extends Component {

    @property(Prefab)
    pref: Prefab;
    protected start(): void {
    }

    btnClick() {
        UIManager.getInstance().showPrefab(this.pref, this.node.parent)
    }

    hide() {
        UIManager.getInstance().hide(this.pref)
    }

}



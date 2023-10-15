import { _decorator, Component, instantiate, log, Node, Prefab, resources, tween, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager {
    private static instance: UIManager
    private map = new Map()

    public static getInstance() {
        if (!this.instance) this.instance = new UIManager();
        return this.instance;
    }

    showPrefab(pre: Prefab, node: Node) {
        if (!this.map.has(pre)) {
            let i = instantiate(pre);
            this.map.set(pre.uuid, i)
            node.addChild(i);
        }
        else if (this.map.get(pre.uuid).active == false) {
            let i = this.map.get(pre.uuid);
            i.active = true
        }
    }

    hide(pre: Prefab) {
        let i = this.map.get(pre.uuid);
        i.active = false
    }
}



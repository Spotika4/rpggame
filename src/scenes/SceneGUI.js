import Phaser from 'phaser'


export default class SceneGUI extends Phaser.Scene {

    constructor(config){
        super(config);
        Phaser.Scene.call(this, { key: 'SceneGUI', active: true })
    }

    preload(){

    }

    create(){
        let rectangle = this.add.rectangle(150, 50, 150, 15, 0xc20000);
    }
}
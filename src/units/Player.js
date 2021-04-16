import Phaser from 'phaser'
import Unit from "./Unit"


// фабрика
export default class Player extends Unit {

	constructor(scene, x, y, texture = 'player', frame = 1){
		super(scene, x, y, texture, frame);
	}
}

Phaser.GameObjects.GameObjectCreator.prototype.player = function(scene, x, y){
	return new Player(scene, x, y, 'player');
};

Phaser.GameObjects.GameObjectFactory.prototype.player = function(scene, x, y){
	let player = new Player(scene, x, y, 'player');
	scene.sys.displayList.add(player);
	scene.sys.updateList.add(player);
	this.scene.events.on('update', player.update, player);
	return player;
};


// функции
Player.prototype.initialize = function(){
	this.setState('control');
	return this;
};

Player.prototype.controls = function(){
	this.movement(false);
	if(this.scene.cursor.down.isDown){
		this.movement('south')
	}else if(this.scene.cursor.left.isDown){
		this.movement('west')
	}else if(this.scene.cursor.right.isDown){
		this.movement('east')
	}else if(this.scene.cursor.up.isDown){
		this.movement('north')
	}else{
		if(this.scene.cursor.down.isUp){
			this.movement('stop')
		}else if(this.scene.cursor.left.isUp){
			this.movement('stop')
		}else if(this.scene.cursor.right.isUp){
			this.movement('stop')
		}else if(this.scene.cursor.up.isUp){
			this.movement('stop')
		}
	}

	return this;
};
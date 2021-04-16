import Phaser from 'phaser'
import Navigator from "./unit/Navigator"
import Radar from "./unit/Radar"
import Behavior from './unit/Behavior'
import Params from './unit/Params'


// фабрика
export default class Unit extends Phaser.Physics.Arcade.Sprite {

	constructor(scene, x, y, key){
		super(scene, x, y, key, 2);
		this.config = scene.game.units(key);
		this.key = key;
		scene.units.add(this);
		this.params = new Params(this);
		this.radar = new Radar(this);
		this.behavior = new Behavior(this);
		this.navigator = new Navigator(this);
	}
}

Phaser.GameObjects.GameObjectCreator.prototype.unit = function(scene, x, y, key){
	return new Unit(scene, x, y, key);
};

Phaser.GameObjects.GameObjectFactory.prototype.unit = function(scene, x, y, key){
	let unit = new Unit(scene, x, y, key);
	scene.sys.displayList.add(unit);
	scene.sys.updateList.add(unit);
	this.scene.events.on('update', unit.update, unit);
	return unit;
};


// свойства
Unit.prototype.key = String;
Unit.prototype.config = Object;
Unit.prototype.params = Params;
Unit.prototype.radar = Radar;
Unit.prototype.navigator = Navigator;
Unit.prototype.behavior = Behavior;


// функции
Unit.prototype.preUpdate = function(time, delta){
	this.anims.update(time, delta);
	this.emit('preupdate');
};

Unit.prototype.update = function(time, delta){
	this.emit('update');
};

Unit.prototype.addedToScene = function(){
	// основные настройки физики
	this.setPushable(false).setDepth(15).createAnims();

	// основные объекты юнита
	this.radar.activate();
	this.behavior.activate();

	// интеркативность
	this.setInteractive().on('pointerup', function (pointer){
		this.setTint(0xffdddd);
		this.scene.player.radar.setTarget(this, pointer);
	}, this);

	// столкновения юнитов
	this.scene.physics.add.collider(this, this.scene.units, function(object, unit){
		unit.emit('collide', object, unit);
	}, null, this);
	this.initialize();
};

Unit.prototype.initialize = function(){
	this.setState('patrol');
	return this;
};

Unit.prototype.setState = function(state, options = {}){
	this.state = state;
	this.emit('setstate', state, options);
	return this;
};

Unit.prototype.movement = function(direction, stopFrame = false){
	let velocity = this.params.base.speed;
	switch(direction){

		case 'south':
			this.body.stayFrame = stopFrame||1;
			this.body.setVelocityY(velocity);
			this.anims.play('movesouth', true);
			break;

		case 'west':
			this.body.stayFrame = stopFrame||4;
			this.body.setVelocityX(velocity * -1);
			this.anims.play('movewest', true);
			break;

		case 'east':
			this.body.stayFrame = stopFrame||7;
			this.body.setVelocityX(velocity);
			this.anims.play('moveeast', true);
			break;

		case 'north':
			this.body.stayFrame = stopFrame||10;
			this.body.setVelocityY(velocity * -1);
			this.anims.play('movenorth', true);
			break;

		case 'stop':
			this.body.setVelocity(0, 0);
			this.anims.stop();
			break;

		// промежуточная остановка, для коректировки анимации
		default:
			this.body.setVelocity(0, 0);
	}
};

Unit.prototype.createAnims = function(){
	for(let key in this.config.anims){
		let item = this.config.anims[key];
		this.anims.create({
			"key": key,
			"repeat": item.repeat,
			"frameRate": item.frameRate,
			frames: this.anims.generateFrameNumbers(item.sprite, {frames: item.frames})
		});
	}
	return this;
};
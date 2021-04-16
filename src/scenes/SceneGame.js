import Phaser from 'phaser'
import SceneGUI from './SceneGUI.js'


export default class SceneGame extends Phaser.Scene {

	constructor(config){
		super(config);
		Phaser.Scene.call(this, { key: 'SceneGame' })
	}

	preload(){
		let config = this.cache.json.get('config');
		this.cache.addCustom('database');

		// загрузка данных локаций из бд
		for(let key in this.cache.custom.tilemaps){
			this.load.json(key, this.cache.custom.tilemaps[key].file);
		}

		// загрузка тайлсетов из бд
		for(let key in this.cache.custom.tilesets){
			this.load.image(key, this.cache.custom.tilesets[key].file);
		}

		// загрузка спрайтов из бд
		for(let key in this.cache.custom.sprites){
			this.load.spritesheet(key, this.cache.custom.sprites[key].file, {
				frameWidth: this.cache.custom.sprites[key].frameWidth,
				frameHeight: this.cache.custom.sprites[key].frameHeight
			});
		}

		this.load.tilemapTiledJSON(config.map.key, config.map.json);
	}

	create(){
		this.scene.add('SceneGUI', SceneGUI, true, { x: 0, y: 0 });
		this.pointer = this.input.mousePointer;
		this.cursor = this.input.keyboard.createCursorKeys();
		this.tilemap = this.make.tilemap({key: this.cache.json.get('config').map.key});
		this.layers = new Phaser.Data.DataManager(this);
		this.createWorld(this.tilemap).inhabitWorld();
		this.physics.add.collider(this.units, this.layers.get('collides'));
	}

	createWorld(tilemap){
		tilemap.addTilesets(tilemap.tilesets);
		tilemap.createLayers().setLayer('default');
		this.physics.world.bounds.width = tilemap.widthInPixels;
		this.physics.world.bounds.height = tilemap.heightInPixels;
		this.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
		this.units = new Phaser.Physics.Arcade.Group(this.physics.world, this, [], {
			active: true, enable: true,
			enableBody: true, immovable: false,
			maxVelocityY: 100, maxVelocityX: 100,
			setDepth: {value: 15}, collideWorldBounds: true,
		});
		return this;
	}

	inhabitWorld(){
		this.player = this.add.player(this, 200, 200);
		this.add.unit(this, 200, 300, 'dog');
		return this;
	}
}
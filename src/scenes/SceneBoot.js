import Phaser from 'phaser'

export default class SceneBoot extends Phaser.Scene {

	constructor(){
		super({});
		Phaser.Scene.call(this, { key: 'SceneBoot' })
	}

	preload(){
		// загрузка файлов БД
		this.load.json('config', 'data/config.json');
		this.load.json('sprites', 'data/sprites.json');
		this.load.json('tilesets', 'data/tilesets.json');
		this.load.json('tilemaps', 'data/tilemaps.json');
		this.load.json('units', 'data/units.json');
	}

	create(){
		// загрузка БД
		this.cache.custom.tilemaps = this.cache.json.get('tilemaps');
		this.cache.custom.tilesets = this.cache.json.get('tilesets');
		this.cache.custom.sprites = this.cache.json.get('sprites');
		this.cache.custom.units = this.cache.json.get('units');
		this.scene.start('SceneGame');
	}
}

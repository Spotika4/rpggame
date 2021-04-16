import Phaser from 'phaser'


Phaser.Tilemaps.ParseToTilemap = function(scene, key = undefined, tileWidth = 48, tileHeight = 48, width = 10, height = 10, data = undefined, insertNull = undefined){
	let mapData = null;
	if(Array.isArray(data)){
		let name = key !== undefined ? key : 'map';
		mapData = Phaser.Tilemaps.Parsers.Parse(name, Phaser.ARRAY_2D, data, tileWidth, tileHeight, insertNull);
	}else if(key !== undefined){
		let tilemapData = scene.cache.tilemap.get(key);
		if(!tilemapData){
			console.warn('No map data found for key ' + key);
		}else{
			mapData = Phaser.Tilemaps.Parsers.Parse(key, tilemapData.format, tilemapData.data, tileWidth, tileHeight, insertNull);
		}
	}
	if(mapData === null){
		mapData = new Phaser.Tilemaps.MapData({ tileWidth: tileWidth, tileHeight: tileHeight, width: width, height: height });
	}
	let tilemap = new Phaser.Tilemaps.Tilemap(scene, mapData);
	tilemap.key = (key !== undefined) ? key : 'map';
	return tilemap;
};
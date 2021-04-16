import Phaser from 'phaser'
import Astar from './Astar'


// фабрика
Phaser.GameObjects.GameObjectCreator.prototype.tilemap = function(options){
	return Phaser.Tilemaps.ParseToTilemap(this.scene, options.key);
};


// свойства
Phaser.Tilemaps.Tilemap.prototype.key = String;
Phaser.Tilemaps.Tilemap.prototype.astar = Astar;


// функции
Phaser.Tilemaps.Tilemap.prototype.addTilesets = function(tilesets){
	for(let i in tilesets){
		this.addTilesetImage(tilesets[i].name, tilesets[i].name);
	}
	return this;
};

Phaser.Tilemaps.Tilemap.prototype.createLayers = function(){
	for(let i in this.layers){
		this.createLayer(this.layers[i].name, this.tilesets);
	}
	return this;
};

Phaser.Tilemaps.Tilemap.prototype.createLayer = function(layerID, tileset, x = 0, y = 0){
	let index = this.getLayerIndex(layerID);
	let layerData = this.layers[index];
	let layer = new Phaser.Tilemaps.TilemapLayer(this.scene, this, index, tileset, x, y);
	layer.setName(layerData.name);
	layer.setVisible(layerData.visible);
	for(let l = 0; l < layerData.properties.length; ++l){
		if(layerData.properties[l].name === 'collides' && layerData.properties[l].value === true){
			layer.setCollisionByExclusion([-1]);
		}else if(layerData.properties[l].name === 'depth'){
			layer.setDepth(layerData.properties[l].value);
		}
	}
	this.scene.sys.displayList.add(layer);
	layer.setRenderOrder(this.renderOrder);
	return layer;
};

Phaser.Tilemaps.Tilemap.prototype.createUnits = function(){
	this.units = new Phaser.Physics.Arcade.Group(this.scene.physics.world, this.scene, undefined);
	let index = this.getLayerIndexByName('events');
	let layer = this.getLayer(index);
	for(let i in layer.indexes){
		let tile = layer.tiles[layer.indexes[i]];
		this.scene.physics.add.unit(this.scene, tile.pixelX, tile.pixelY);
	}
	this.units.setOnCollide();
	return this;
};

Phaser.Tilemaps.Tilemap.prototype.tileCenterToWorldXY = function(tileX, tileY, vec2, camera, layer){
	let coords = this.tileToWorldXY(tileX, tileY, vec2, camera, layer);
	if(coords.x && coords.y){
		coords = {x: coords.x + (this.tileHeight / 2), y: coords.y + (this.tileHeight / 2)};
	}
	return coords;
};

Phaser.Tilemaps.Tilemap.prototype.GetEmptyTilesWithin = function(tileX, tileY, width, height, layerName = 'collides'){
	let layer = this.getLayer(this.getLayerIndexByName(layerName));

	if (tileX === undefined) tileX = 0;
	if (tileY === undefined) tileY = 0;
	if (width === undefined) width = layer.width;
	if (height === undefined) height = layer.height;

	// Clip x, y to top left of map, while shrinking width/height to match.
	if (tileX < 0) {
		width += tileX;
		tileX = 0;
	}

	if (tileY < 0) {
		height += tileY;
		tileY = 0;
	}

	// Clip width and height to bottom right of map.
	if (tileX + width > layer.width) {
		width = Math.max(layer.width - tileX, 0);
	}

	if (tileY + height > layer.height) {
		height = Math.max(layer.height - tileY, 0);
	}

	let results = [];
	for (let ty = tileY; ty < tileY + height; ty++) {
		for (let tx = tileX; tx < tileX + width; tx++) {
			let tile = layer.data[ty][tx];
			if (tile !== null && tile.index < 0) {
				results.push(tile);
			}
		}
	}
	return results;
};
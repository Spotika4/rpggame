import Phaser from 'phaser'
import './Camera'
import '../tilemaps/Tilemaps'
import '../tilemaps/Tilemap'
import '../tilemaps/layers/TilemapLayer'
import '../tilemaps/Astar'
import '../tilemaps/Parse'
import '../tilemaps/tile/ParseTileLayers'
import '../tilemaps/tile/ParseJSONTiled'
import "../units/Body"
import "../units/Unit"
import "../units/Player"
import "../units/unit/Params"



Phaser.Game.prototype.saveFile = function(name, file){
	localStorage.setItem(name, JSON.stringify(file));
};

Phaser.Game.prototype.loadFile = function(name){
	return JSON.parse(localStorage.getItem(name));
};

Phaser.Game.prototype.units = function(key){
	if(typeof this.cache.custom.units[key] === "undefined"){
		return false;
	}
	return this.cache.custom.units[key]
};
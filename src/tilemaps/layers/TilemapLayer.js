import Phaser from 'phaser'
import Astar from '../Astar'


// свойства
Phaser.Tilemaps.Tilemap.prototype.astar = Astar;


// функции
Phaser.Tilemaps.TilemapLayer.prototype.addedToScene = function(){
    this.astar = new Astar.Initialization(this.layer.graph, {
        cost(a, b){ return (b.data.v <= 0) ? NaN : b.data.v; }
    });
    this.scene.layers.set(this.name, this);
};
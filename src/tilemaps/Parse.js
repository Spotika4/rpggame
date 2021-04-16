import Phaser from "phaser";


Phaser.Tilemaps.Parsers.Parse = function(name, mapFormat, data, tileWidth, tileHeight, insertNull){
    let newMap;
    switch (mapFormat){
        case (Phaser.Tilemaps.Parsers.ARRAY_2D):
            newMap = Phaser.Tilemaps.Parsers.Parse2DArray(name, data, tileWidth, tileHeight, insertNull);
            break;
        case (Phaser.Tilemaps.Formats.CSV):
            newMap = Phaser.Tilemaps.Parsers.ParseCSV(name, data, tileWidth, tileHeight, insertNull);
            break;
        case (Phaser.Tilemaps.Formats.TILED_JSON):
            newMap = Phaser.Tilemaps.Parsers.Tiled.ParseJSONTiled(name, data, insertNull);
            break;
        case (Phaser.Tilemaps.Formats.WELTMEISTER):
            newMap = Phaser.Tilemaps.Parsers.Impact.ParseWeltmeister(name, data, insertNull);
            break;
        default:
            console.warn('Unrecognized tilemap data format: ' + mapFormat);
            newMap = null;
    }
    return newMap;
};
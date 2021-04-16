import Phaser from "phaser";


Phaser.Tilemaps.Parsers.Tiled.ParseJSONTiled = function (name, json, insertNull) {
    let mapData = new Phaser.Tilemaps.MapData({
        width: json.width,
        height: json.height,
        name: name,
        tileWidth: json.tilewidth,
        tileHeight: json.tileheight,
        orientation: Phaser.Tilemaps.Parsers.FromOrientationString(json.orientation),
        format: Phaser.Tilemaps.Formats.TILED_JSON,
        version: json.version,
        properties: json.properties,
        renderOrder: json.renderorder,
        infinite: json.infinite
    });
    if (mapData.orientation === Phaser.HEXAGONAL) {
        mapData.hexSideLength = json.hexsidelength;
    }
    mapData.layers = Phaser.Tilemaps.Parsers.Tiled.ParseTileLayers(json, insertNull);
    mapData.images = Phaser.Tilemaps.Parsers.Tiled.ParseImageLayers(json);
    let sets = Phaser.Tilemaps.Parsers.Tiled.ParseTilesets(json);
    mapData.tilesets = sets.tilesets;
    mapData.imageCollections = sets.imageCollections;
    mapData.objects = Phaser.Tilemaps.Parsers.Tiled.ParseObjectLayers(json);
    mapData.tiles = Phaser.Tilemaps.Parsers.Tiled.BuildTilesetIndex(mapData);
    Phaser.Tilemaps.Parsers.Tiled.AssignTileProperties(mapData);
    return mapData;
};
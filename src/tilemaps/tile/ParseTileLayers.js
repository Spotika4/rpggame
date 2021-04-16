import Phaser from "phaser";


Phaser.Tilemaps.Parsers.Tiled.ParseTileLayers = function (json, insertNull) {
    let infiniteMap = Phaser.Utils.Objects.GetFastValue(json, 'infinite', false);
    let tileLayers = [];

    let groupStack = [];
    let curGroupState = Phaser.Tilemaps.Parsers.Tiled.CreateGroupLayer(json);

    while (curGroupState.i < curGroupState.layers.length || groupStack.length > 0) {
        if (curGroupState.i >= curGroupState.layers.length) {
            // Ensure recursion stack is not empty first
            if (groupStack.length < 1) {
                console.warn(
                    'TilemapParser.parseTiledJSON - Invalid layer group hierarchy'
                );
                break;
            }

            // Return to previous recursive state
            curGroupState = groupStack.pop();
            continue;
        }

        let curl = curGroupState.layers[curGroupState.i];
        curGroupState.i++;

        if (curl.type !== 'tilelayer') {
            if (curl.type === 'group') {
                // Compute next state inherited from group
                let nextGroupState = Phaser.Tilemaps.Parsers.Tiled.CreateGroupLayer(json, curl, curGroupState);

                // Preserve current state before recursing
                groupStack.push(curGroupState);
                curGroupState = nextGroupState;
            }

            // Skip this layer OR 'recurse' (iterative style) into the group
            continue;
        }

        // Base64 decode data if necessary. NOTE: uncompressed base64 only.
        if (curl.compression) {
            console.warn(
                'TilemapParser.parseTiledJSON - Layer compression is unsupported, skipping layer \''
                + curl.name + '\''
            );
            continue;
        } else if (curl.encoding && curl.encoding === 'base64') {
            // Chunks for an infinite map
            if (curl.chunks) {
                for (let i = 0; i < curl.chunks.length; i++) {
                    curl.chunks[i].data = Phaser.Base64Decode(curl.chunks[i].data);
                }
            }

            // Non-infinite map data
            if (curl.data) {
                curl.data = Phaser.Base64Decode(curl.data);
            }

            delete curl.encoding; // Allow the same map to be parsed multiple times
        }

        //  This is an array containing the tile indexes, one after the other. -1 = no tile,
        //  everything else = the tile index (starting at 1 for Tiled, 0 for CSV) If the map
        //  contains multiple tilesets then the indexes are relative to that which the set starts
        //  from. Need to set which tileset in the cache = which tileset in the JSON, if you do this
        //  manually it means you can use the same map data but a new Phaser.Tilemaps.Tileset.

        let layerData;
        let gidInfo;
        let tile;
        let blankTile;
        let tiles = [];

        let layerGraph = [];

        let output = [];
        let x = 0;

        if (infiniteMap) {
            let layerOffsetX = (Phaser.Utils.Objects.GetFastValue(curl, 'startx', 0) + curl.x);
            let layerOffsetY = (Phaser.Utils.Objects.GetFastValue(curl, 'starty', 0) + curl.y);

            layerData = new Phaser.Tilemaps.LayerData({
                name: (curGroupState.name + curl.name),
                x: (curGroupState.x + Phaser.Utils.Objects.GetFastValue(curl, 'offsetx', 0) + layerOffsetX * json.tilewidth),
                y: (curGroupState.y + Phaser.Utils.Objects.GetFastValue(curl, 'offsety', 0) + layerOffsetY * json.tileheight),
                width: curl.width,
                height: curl.height,
                tileWidth: json.tilewidth,
                tileHeight: json.tileheight,
                alpha: (curGroupState.opacity * curl.opacity),
                visible: (curGroupState.visible && curl.visible),
                properties: Phaser.Utils.Objects.GetFastValue(curl, 'properties', []),
                orientation: Phaser.Tilemaps.Parsers.FromOrientationString(json.orientation)
            });

            if (layerData.orientation === Phaser.HEXAGONAL) {
                layerData.hexSideLength = json.hexsidelength;
            }

            for (let c = 0; c < curl.height; c++) {
                output.push([null]);

                for (let j = 0; j < curl.width; j++) {
                    output[c][j] = null;
                }
            }

            for (let c = 0, len = curl.chunks.length; c < len; c++) {
                let chunk = curl.chunks[c];

                let offsetX = (chunk.x - layerOffsetX);
                let offsetY = (chunk.y - layerOffsetY);

                let y = 0;

                for (let t = 0, len2 = chunk.data.length; t < len2; t++) {
                    let newOffsetX = x + offsetX;
                    let newOffsetY = y + offsetY;

                    gidInfo = Phaser.Tilemaps.Parsers.Tiled.ParseGID(chunk.data[t]);

                    //  index, x, y, width, height
                    if (gidInfo.gid > 0) {
                        tile = new Phaser.Tilemaps.Tile(layerData, gidInfo.gid, newOffsetX, newOffsetY, json.tilewidth, json.tileheight);

                        // Turning Tiled's FlippedHorizontal, FlippedVertical and FlippedAntiDiagonal
                        // propeties into flipX, flipY and rotation
                        tile.rotation = gidInfo.rotation;
                        tile.flipX = gidInfo.flipped;

                        output[newOffsetY][newOffsetX] = tile;
                    } else {
                        blankTile = insertNull
                            ? null
                            : new Phaser.Tilemaps.Tile(layerData, -1, newOffsetX, newOffsetY, json.tilewidth, json.tileheight);

                        output[newOffsetY][newOffsetX] = blankTile;
                    }

                    x++;

                    if (x === chunk.width) {
                        y++;
                        x = 0;
                    }
                }
            }
        } else {
            layerData = new Phaser.Tilemaps.LayerData({
                name: (curGroupState.name + curl.name),
                x: (curGroupState.x + Phaser.Utils.Objects.GetFastValue(curl, 'offsetx', 0) + curl.x),
                y: (curGroupState.y + Phaser.Utils.Objects.GetFastValue(curl, 'offsety', 0) + curl.y),
                width: curl.width,
                height: curl.height,
                tileWidth: json.tilewidth,
                tileHeight: json.tileheight,
                alpha: (curGroupState.opacity * curl.opacity),
                visible: (curGroupState.visible && curl.visible),
                properties: Phaser.Utils.Objects.GetFastValue(curl, 'properties', []),
                orientation: Phaser.Tilemaps.Parsers.FromOrientationString(json.orientation)
            });

            if (layerData.orientation === Phaser.HEXAGONAL) {
                layerData.hexSideLength = json.hexsidelength;
            }

            let row = [];

            let rowGraph = [];

            //  Loop through the data field in the JSON.
            for (let k = 0, len = curl.data.length; k < len; k++) {
                gidInfo = Phaser.Tilemaps.Parsers.Tiled.ParseGID(curl.data[k]);

                //  index, x, y, width, height
                if (gidInfo.gid > 0) {
                    tile = new Phaser.Tilemaps.Tile(layerData, gidInfo.gid, x, output.length, json.tilewidth, json.tileheight);

                    // Turning Tiled's FlippedHorizontal, FlippedVertical and FlippedAntiDiagonal
                    // propeties into flipX, flipY and rotation
                    tile.rotation = gidInfo.rotation;
                    tile.flipX = gidInfo.flipped;
                    tile.weight = 0;

                    row.push(tile);
                    tiles.push(tile);

                    rowGraph.push(tile.weight);
                } else {
                    blankTile = insertNull ? null : new Phaser.Tilemaps.Tile(layerData, -1, x, output.length, json.tilewidth, json.tileheight);
                    blankTile.weight = 1;

                    row.push(blankTile);
                    tiles.push(blankTile);
                    rowGraph.push(blankTile.weight);
                }

                x++;
                if (x === curl.width) {
                    output.push(row);
                    x = 0;
                    row = [];

                    layerGraph.push(rowGraph);
                    rowGraph = [];
                }
            }
        }
        layerData.data = output;
        layerData.tiles = tiles;
        layerData.indexes = curl.indexes;
        layerData.graph = layerGraph;
        tileLayers.push(layerData);
    }
    return tileLayers;
};

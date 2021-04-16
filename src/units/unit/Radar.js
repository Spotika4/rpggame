

export default class Radar{

    constructor(unit){
        this.unit = unit;
    }

    activate(){
        this.unit.on('update', this.update, this);
        this.unit.config.start = this.unit.scene.tilemap.getTileAtWorldXY(this.unit.x, this.unit.y);
    }

    destroy(){
        if (!this.unit) return;
        if(this.graphics) this.graphics.destroy();
        this.gps = undefined;
        this.bodies = undefined;
        this.target = undefined;
        this.unit.off('update', null, this);
        this.unit = undefined;
    }

    update(){
        this.gps.ping(this.unit.x, this.unit.y, false, this.unit.scene.tilemap);
        this.bodies = this.unit.scene.physics.overlapCirc(this.unit.x, this.unit.y, this.unit.config.radar.radius);

        if(this.unit.scene.physics.debug !== false){
            if(this.graphics) this.graphics.destroy();
            this.graphics = this.unit.scene.add.circle(this.unit.x, this.unit.y, this.unit.config.radar.radius);
            this.graphics.setDepth(999).setStrokeStyle(1, 0x008000);
            for(let i in this.bodies){
                if(this.bodies[i].center.x !== this.unit.x && this.bodies[i].center.y !== this.unit.y){
                    if(this.unit.scene.physics.debug !== false){
                        this.graphics.setStrokeStyle(1, 0xFF0000);
                    }
                }
            }
        }
    }

    search(key){
        let result = false;
        for(let i in this.bodies){
            if(this.bodies[i].center.x === this.unit.x && this.bodies[i].center.y === this.unit.y){
                continue;
            }
            if(key === this.bodies[i].gameObject.key){
                result = this.bodies[i].gameObject;
            }
        }
        return result;
    }

    setTarget(object){
        this.target = object;
    }

    gps = {
        x: 0,
        y: 0,
        tile: false,

        ping(x, y, tile = false, tilemap){
            if(tile !== false){
                this.x = x;
                this.y = y;
                this.tile = tile;
            }else{
                let vx = (this.x > x) ? this.x - x : x - this.x;
                let vy = (this.y > y) ? this.y - y : y - this.y;
                if((vx + vy) > 6){
                    tile = tilemap.getTileAtWorldXY(x, y);
                    if(this.tile.x !== tile.x || this.tile.y !== tile.y){
                        this.tile = tile;
                    }
                }
            }
        }
    }
}
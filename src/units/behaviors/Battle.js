

export default class Battle{

    constructor(unit){
        this.unit = unit;
    }

    activate(){
        this.target.set(this.unit.radar.target);
        this.unit.on('update', this.update, this);
        if(this.unit.navigator.go(this.target.tile.x, this.target.tile.y)){
            this.unit.once('collide', function(object, unit){
                unit.navigator.movement = false;
                unit.navigator.stop();
            }, this);
        }
    }

    destroy(){
        this.target = undefined;
        this.unit = undefined;
    }

    update(){
        this.target.update();
        if(this.target.isMove() && this.unit.navigator.movement === false){
            let tile = this.target.position();
            if(this.unit.navigator.go(tile.x, tile.y, true)){
                this.unit.once('collide', function(object, unit){
                    unit.navigator.movement = false;
                    unit.navigator.stop();
                }, this);
            }
            return;
        }
        let difference = this.difference();
        if(difference !== false && this.unit.navigator.movement === false){
            let coords = {x: this.target.object.x, y: this.target.object.y};
            if(this.unit.navigator.go(coords.x, coords.y, false, true)){
                this.unit.once('collide', function(object, unit){
                    unit.navigator.movement = false;
                    unit.navigator.stop();
                }, this);
            }
        }
        console.log(this.unit.navigator.movement);
    }

    difference(){
        let unit = this.unit;
        let target = this.target.object;
        let x = target.x - unit.x;
        let y = target.y - unit.y;
        x = (x < 0) ? x * -1 : x;
        y = (y < 0) ? y * -1 : y;
        if((x < y && x > 12) || (y < x && y > 12)){
            return {x: x, y: y};
        }else if ((x < y && y > 60) || (y < x && x > 60)){
            return {x: x, y: y};
        }
        return false;
    }

    target = {
        tile: false,
        coords: false,
        object: false,
        set: function(object){
            this.object = object;
            this.tile = object.radar.gps.tile;
            this.coords = {x: object.x, y: object.y};
            return this;
        },
        isMove: function(){
            let point = {x: this.tile.x, y: this.tile.y};
            let target = {x: this.object.radar.gps.tile.x, y: this.object.radar.gps.tile.y};
            return (JSON.stringify(target) !== JSON.stringify(point));
        },
        update: function(){
            this.tile = this.object.radar.gps.tile;
            this.coords = {x: this.object.x, y: this.object.y};
            return this;
        },
        position: function(){
            return this.tile;
        }
    }
}
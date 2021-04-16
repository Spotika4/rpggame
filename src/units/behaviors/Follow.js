

export default class Follow{

    constructor(unit){
        this.unit = unit;
    }

    activate(options){
        this.options = options;
        this.target.set(this.unit.radar.target);
        this.unit.behavior.time.addEvent({'delay': 1000, 'loop': true, 'args': [this], 'callbackScope': this, 'callback': this.update});
    }

    destroy(){
        if (!this.unit) return;
        this.options = undefined;
        this.target = undefined;
        this.unit.behavior.time.removeAllEvents();
        this.unit.off('collide', null, this);
        this.unit = undefined;
    }

    update(){
        if(this.target.isMove() && !this.targetInRadar()){
            let target = this.target.update().position();
            if(this.unit.navigator.go(target.x, target.y)){
                this.unit.once('collide', function(object, unit){
                    if(this.target.object.key === object.key){
                        unit.navigator.stop();
                    }
                }, this);
            }
        }else if(this.unit.navigator.movement !== false){
            if(typeof this.options.after !== undefined){
                this.unit.navigator.stop();
                this.unit.setState(this.options.after);
            }
        }
    }

    targetInRadar(){
        let result = false;
        for(let i in this.unit.radar.bodies){
            result = (this.target.object.key === this.unit.radar.bodies[i].gameObject.key);
            if(result === true) break;
        }
        return result;
    }

    target = {
        tile: false,
        object: false,
        set: function(object){
            this.object = object;
            this.tile = object.radar.gps.tile;
            return this;
        },
        isMove: function(){
            let point = {x: this.tile.x, y: this.tile.y};
            let target = {x: this.object.radar.gps.tile.x, y: this.object.radar.gps.tile.y};
            return (JSON.stringify(target) !== JSON.stringify(point));
        },
        update: function(){
            this.tile = this.object.radar.gps.tile;
            return this;
        },
        position: function(){
            return this.tile;
        }
    }
}
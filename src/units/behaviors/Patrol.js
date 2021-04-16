

export default class Patrol{

    constructor(unit){
        this.unit = unit;
    }

    activate(){
        if(!this.unit.config.patrol.tiles){
            let start = (this.unit.config.start) ? this.unit.config.start : this.unit.radar.gps.tile;
            let width = (this.unit.config.patrol.width) ? this.unit.config.patrol.width : 3;
            let height = (this.unit.config.patrol.height) ? this.unit.config.patrol.height : 3;
            this.unit.config.patrol.tiles = this.unit.scene.tilemap.GetEmptyTilesWithin(start.x, start.y, width, height);
        }
        this.unit.behavior.time.addEvent({'delay': 100, 'loop': true, 'callbackScope': this, 'callback': this.update});
        this.patrolling();
        return this;

    }

    destroy(){
        this.unit.navigator.events.off('pathend', null, this);
        this.unit.behavior.time.removeAllEvents();
        this.unit.off('collide', null, this);
        this.unit = undefined;
    }

    update(){
        console.log('Патрулируем');
        let object = this.unit.radar.search('player');
        if(object !== false){
            this.unit.radar.setTarget(object);
            this.unit.navigator.stop();
            //this.unit.setState('follow', {after: 'battle'});
            this.unit.setState('follow');
        }
    }

    reset(){
        this.unit.navigator.stop();
        this.unit.behavior.time.addEvent({'callbackScope': this, 'loop': false, 'delay': this.unit.config.patrol.delay, 'callback': this.patrolling});
        return this;
    }

    patrolling(){
        if(this.unit.navigator.points.length === 0){
            let patrolTiles = this.unit.config.patrol.tiles;
            this.target = patrolTiles[Math.floor(Math.random() * (patrolTiles.length - 1)) + 1];
            if(this.unit.navigator.go(this.target.x, this.target.y)){
                this.unit.once('collide', this.reset, this);
                this.unit.navigator.events.once('pathend', this.reset, this);
            }else{
                return this.reset();
            }
        }
        return this;
    }
}
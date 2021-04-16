import Phaser from "phaser";


export default class Navigator extends Phaser.Events.EventEmitter {

    constructor(unit){
        super();
        this.unit = unit;
        this.turn = [];
        this.points = [];
        this.events = new Phaser.Events.EventEmitter();
    }

    go(x, y){
        let target = {x: x, y: y};
        if(this.points.length > 1){
            let start = this.unit.scene.tilemap.getTileAtWorldXY(this.points[1].x, this.points[1].y);
            this.turn = this.routing(start, target);
            this.points.splice(2);
        }else{
            let start = this.unit.scene.tilemap.getTileAtWorldXY(this.unit.x, this.unit.y);
            this.points = this.routing(start, target);
        }
        if(this.points !== false){
            this.unit.on('update', this.update, this);
            this.unit.on('preupdate', this.preupdate, this);
        }
        return (this.points !== false);
    }

    destroy(){
        if (!this.unit) return;
        if(this.graphics) this.graphics.destroy();
        this.turn = undefined;
        this.points = undefined;
        this.unit.scene.time.removeEvent(this.timer);
        this.unit.off('update', null, this);
        this.unit.off('preupdate', null, this);
        this.unit = undefined;
    }

    preupdate(){
        if(this.points.length > 0){
            let unit = {x: Math.floor(this.unit.x), y: Math.floor(this.unit.y)};
            let point = {x: Math.floor(this.points[0].x), y: Math.floor(this.points[0].y)};
            if(this.checkPoint(unit, point)){
                this.unit.setPosition(this.points[0].x, this.points[0].y);
                this.unit.movement('stop');
                this.movement = false;
                this.points.shift();
                if(this.points.length === 2 && this.turn !== false){
                    this.turn.unshift(this.points[0]);
                    this.points = this.turn;
                    this.turn = false;
                }else if(this.points.length === 0){
                    this.stop();
                    this.events.emit('pathend');
                }
            }else{
                if(this.movement === 'east' && unit.y > point.y){
                    this.unit.movement('stop');
                    this.unit.setPosition(unit.x, point.y);
                }else if(this.movement === 'west' && unit.y < point.y){
                    this.unit.movement('stop');
                    this.unit.setPosition(unit.x, point.y);
                }else if(this.movement === 'south' && unit.x > point.x){
                    this.unit.movement('stop');
                    this.unit.setPosition(point.x, unit.y);
                }else if(this.movement === 'north' && unit.x < point.x){
                    this.unit.movement('stop');
                    this.unit.setPosition(point.x, unit.y);
                }
            }
        }
    }

    update(){
        this.movement = false;
        let point = this.points[0];
        if(point.y < this.unit.y){
            this.movement = 'north';
        }else if(point.y > this.unit.y){
            this.movement = 'south';
        }else if(point.x < this.unit.x){
            this.movement = 'west';
        }else if(point.x > this.unit.x){
            this.movement = 'east';
        }
        this.unit.movement(this.movement);
    }

    stop(){
        if(this.unit.scene.physics.debug !== false){
            if(this.graphics) this.graphics.destroy();
        }
        this.points = [];
        this.unit.movement('stop');
        this.unit.off('update', this.update, this);
        this.unit.off('preupdate', this.preupdate, this);
    }

    checkPoint(a, b){
        return (JSON.stringify(a) === JSON.stringify(b) && JSON.stringify(a) === JSON.stringify(b));
    }

    routing(start, target){
        let path = this.getPath(start, target);
        if(path === false) return false;
        let points = this.getPoints(path);
        return (points.length === 0) ? false : points;
    }

    getPoints(path){
        let points = [];
        let coord = this.unit.scene.tilemap.tileCenterToWorldXY(path[0].data.x, path[0].data.y);
        if(coord.y !== this.unit.y && coord.x !== this.unit.x){
            if(coord.y !== this.unit.y){
                points.push({x: coord.x, y: this.unit.y});
            }else if(coord.x !== this.unit.x){
                points.push({x: this.unit.x, y: coord.y});
            }
        }
        for (let i in path) {
            coord = this.unit.scene.tilemap.tileCenterToWorldXY(path[i].data.x, path[i].data.y);
            points.push({x: coord.x, y: coord.y});
        }

        if(this.unit.scene.physics.debug !== false){
            let line = new Phaser.Curves.Path(this.unit.x, this.unit.y);
            for (let i in points) {
                if(i > 0 && points[i + 1]){
                    if(points[i].y === points[i + 1].y){
                        if(points[i].x < points[i - 1].x && points[i].x >! points[i + 1].x){
                            line.lineTo(points[i].x, points[i].y);
                        }else if(points[i].x > points[i - 1].x && points[i].x <! points[i + 1].x){
                            line.lineTo(points[i].x, points[i].y);
                        }
                    }else if(points[i].x === points[i + 1].x){
                        if(points[i].y < points[i - 1].y && points[i].y >! points[i + 1].y){
                            line.lineTo(points[i].x, points[i].y);
                        }else if(points[i].y > points[i - 1].y && points[i].y <! points[i + 1].y){
                            line.lineTo(points[i].x, points[i].y);
                        }
                    }
                }else{
                    line.lineTo(points[i].x, points[i].y);
                }
            }

            if(this.graphics) this.graphics.destroy();
            this.graphics = this.unit.scene.add.graphics();
            this.graphics.lineStyle(1, 0xFFFFFF, 1).setDepth(999);
            line.draw(this.graphics);
        }

        return points;
    }

    getPath(start, target){
        let mod = false;
        let collides = this.unit.scene.layers.get('collides');
        let graph = collides.astar.graphs[0];
        if(target.x !== start.x){
            if(target.x > start.x){
                if(graph.get(start.x + 1, start.y).data.v > 0){
                    mod = true;
                    start.x = start.x + 1;
                }
            }else if(target.x < start.x){
                if(graph.get(start.x - 1, start.y).data.v > 0){
                    mod = true;
                    start.x = start.x - 1;
                }
            }
        }
        if(target.y !== start.y && mod === false){
            if(target.y > start.y){
                if(graph.get(start.x, start.y + 1).data.v > 0){
                    start.y = start.y + 1;
                }
            }else if(target.y < start.y){
                if(graph.get(start.x, start.y - 1).data.v > 0){
                    start.y = start.y - 1;
                }
            }
        }
        let route = collides.astar.route(
            {data: {x: start.x, y: start.y}},
            {data: {x: target.x, y: target.y}}
        );
        return (route.length > 0) ? route : false;
    }
}
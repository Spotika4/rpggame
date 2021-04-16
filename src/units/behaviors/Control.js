

export default class Control{

    constructor(unit){
        this.unit = unit;
    }

    activate(){
        this.unit.on('update', this.update, this);
        this.unit.scene.cameras.main.startFollow(this.unit);
    }

    destroy(){
        this.unit.movement('stop')
        this.unit.scene.events.off('update', null, this);
        this.unit.scene.cameras.main.stopFollow();
        this.unit.behavior.time.removeAllEvents();
        this.unit = undefined;
    }

    update(){
        let unit = this.unit;
        let cursor = unit.scene.cursor;
        unit.movement(false);
        if(cursor.down.isDown){
            unit.movement('south')
        }else if(cursor.left.isDown){
            unit.movement('west')
        }else if(cursor.right.isDown){
            unit.movement('east')
        }else if(cursor.up.isDown){
            unit.movement('north')
        }else{
            if(cursor.down.isUp){
                unit.movement('stop')
            }else if(cursor.left.isUp){
                unit.movement('stop')
            }else if(cursor.right.isUp){
                unit.movement('stop')
            }else if(cursor.up.isUp){
                unit.movement('stop')
            }
        }
    }
}
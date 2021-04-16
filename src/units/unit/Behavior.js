import Phaser from "phaser";
import Patrol from '../behaviors/Patrol'
import Battle from '../behaviors/Battle'
import Follow from '../behaviors/Follow'
import Control from '../behaviors/Control'


export default class Behavior {

    constructor(unit){
        this.unit = unit;
        this.behavior = false;
        this.time = new Phaser.Time.Clock(unit.scene);
    }

    activate(){
        this.time.start();
        this.unit.on('setstate', this.setstate, this);
        return this;
    }

    destroy(){
        if (!this.unit) return;
        if(this.behavior !== false){
            this.behavior.destroy();
            this.behavior = undefined;
        }

        this.time.removeAllEvents();
        this.time = undefined;

        this.unit.off('setstate', null, this);
        this.unit = undefined;
    }

    setstate(state, options){
        if(state in this.behaviors){
            let behavior = this.behaviors.get(this.unit, state);
            if(behavior !== false){
                if(this.behavior !== false){
                    this.behavior.destroy();
                    this.time.removeAllEvents();
                }
                this.behavior = behavior;
                this.behavior.activate(options);
            }
        }
    }

    behaviors = {

        patrol: function(unit){
            return new Patrol(unit);
        },

        follow: function(unit){
            return new Follow(unit);
        },

        control: function(unit){
            return new Control(unit);
        },

        battle: function(unit){
            return new Battle(unit);
        },

        get: function(unit, state){
            if(typeof this[unit.state] !== undefined){
                return this[state](unit);
            }
            return false
        }
    }
}
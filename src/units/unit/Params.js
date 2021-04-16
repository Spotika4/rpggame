

export default class Params{

    constructor(unit){
        Object.assign(this.base, unit.config.params.base);
        Object.assign(this.current, this.base);
        this.set('hp', this.base.vit * 20);
    }

    base = {
        speed: 10,
        str: 1,
        agi: 1,
        int: 1,
        dex: 1,
        vit: 1,
    };

    current = {
        speed: 10,
        str: 1,
        agi: 1,
        int: 1,
        dex: 1,
        vit: 1,
        hp: 1,
    };

    get(key){
        return this.current[key];
    }

    set(key, value){
        this.current[key] = value;
    }
}
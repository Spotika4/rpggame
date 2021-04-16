import Phaser from 'phaser'


Phaser.Cameras.Scene2D.Camera.prototype.toFadeOut = function(duration, red, green, blue, callback, context){
    return this.fadeEffect.start(true, null, 0, 0, 0, true, callback, context);
};

Phaser.Cameras.Scene2D.Effects.Fade.prototype.update = function(time, delta){
    if (!this.isRunning) {
        return;
    }
    this._elapsed += delta;
    this.progress = Phaser.Math.Clamp(this._elapsed / this.duration, 0, 1);
    if (this._onUpdate) {
        this._onUpdate.call(this._onUpdateScope, this.camera, this.progress);
    }
    if (this._elapsed < this.duration) {
        this.alpha = (this.direction) ? this.progress : 1 - this.progress;
    } else {
        this.alpha = (this.direction) ? 1 : 0;
        this.effectComplete();
    }

    if(this.progress > 0.3){
        this.effectComplete();
    }
};
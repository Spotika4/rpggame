import Phaser from 'phaser'


Phaser.Physics.Arcade.World.prototype.overlapRadius = function (x, y, radius, excludeCenter = true) {
    let objInRect = OverlapRectangle(this, x - radius, y - radius, 2 * radius, 2 * radius);
    if (objInRect.length === 0) {
        return objInRect;
    }
    let area = new Phaser.Geom.Circle(x, y, radius);
    let circFromBody = new Phaser.Geom.Circle();
    let bodiesInArea = [];
    for (let k in objInRect) {
        let body = objInRect[k];
        if (body.isCircle) {
            circFromBody.setTo(body.center.x, body.center.y, body.halfWidth);
            if (Phaser.Geom.Intersects.CircleToCircle(area, circFromBody)) {
                if((body.center.x !== area.x && body.center.y !== area.y) || excludeCenter === false){
                    bodiesInArea.push(body);
                }
            }
        } else if (Phaser.Geom.Intersects.CircleToCircle(area, body)) {
            if((body.center.x !== area.x && body.center.y !== area.y) || excludeCenter === false){
                bodiesInArea.push(body);
            }
        }
    }
    return bodiesInArea;
};

let OverlapRectangle = function (world, x, y, width, height) {
    let bodies = [];
    let minMax = world.treeMinMax;
    minMax.minX = x;
    minMax.minY = y;
    minMax.maxX = x + width;
    minMax.maxY = y + height;
    if (world.useTree) {
        bodies = world.tree.search(minMax);
    } else {
        let wbodies = world.bodies;
        let fakeBody = {
            position: {
                x: x  - (width / 2),
                y: y  - (width / 2)
            },
            left: x,
            top: y,
            right: x + width,
            bottom: y + height,
            isCircle: false
        };
        let intersects = world.intersects;
        wbodies.iterate(function (target) {
            if (intersects(target, fakeBody)) {
                bodies.push(target);
            }
        });
    }
    return bodies;
};

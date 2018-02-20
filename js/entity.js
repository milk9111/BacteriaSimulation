/**
 * The constructor for the Entity object. It is the parent of all
 * objects that will be created in the game. It holds the current instance
 * of the GameEngine, the x & y position of the entity, and if it is going to
 * be removed from the world or not.
 *
 * @param game
 * @param x
 * @param y
 * @constructor
 *
 * @author Seth Ladd
 */
//es6 version of Entity.
class Entity {

    constructor(game, x, y, hasCollision, frameWidth, frameHeight, boundsXOffset, boundsYOffset, name) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.boundsXOffset = null;
        this.boundsYOffset = null;
        this.removeFromWorld = false;
        this.collisionBounds = null;
        this.name = name;
        this.colliderColor = "red";

        this.collidedObject = null;

        this.bottomHitATop = null;
        this.topHitABottom = null;
        this.rightHitALeft = null;
        this.leftHitARight = null;

        if (hasCollision) {
            this.boundsXOffset = boundsXOffset;
            this.boundsYOffset = boundsYOffset;

            let boundsX = this.x + this.boundsXOffset;
            let boundsY = this.y + this.boundsYOffset;
            this.collisionBounds = {width: frameWidth, height: frameHeight, x: boundsX, y: boundsY};
        }
        this.lastX = this.x;
        this.lastY = this.y;

        this.pos = 0;
    }


    update () {
        //update bounds position
        if (this.collisionBounds !== null) {
            this.collisionBounds.x = this.x + this.boundsXOffset;
            this.collisionBounds.y = this.y + this.boundsYOffset;
        }
        if(this.isSmacked && this.smackTime <= this.smackLength) {
            this.smackTime++;
            //We do this to pass by value instead of pass by reference, because we modify bounds we don't want to keep
            let bounds = {
                collisionBounds: {
                    x: this.collisionBounds.x,
                    y: this.collisionBounds.y,
                    height: this.collisionBounds.height,
                    width: this.collisionBounds.width
                }
            };
            let xDiff = 0;
            let yDiff = 0;
            switch(this.smackDirection) {
                case "up":
                    bounds.y -= 1;
                    yDiff = -1;
                    break;
                case "down":
                    bounds.y += 1;
                    yDiff = 1;
                    break;
                case "left":
                    bounds.x -= 1;
                    xDiff = -1;
                    break;
                case "right":
                    bounds.x += 1;
                    xDiff = 1;
                    break;
            }
            if(this.hasCollided(bounds, this.game.walls)) {
                this.isSmacked = false;
                this.smackTime = 0;
                this.smackLength = 0;
            } else {
                this.x += xDiff;
                this.y += yDiff;
            }
        } else {
            this.isSmacked = false;
            this.smackTime = 0;
            this.smackLength = 0;
        }

    }


    draw (ctx) {
        if (this.collisionBounds !== null) {

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = this.colliderColor;
            ctx.moveTo(this.collisionBounds.x, this.collisionBounds.y);

            ctx.lineTo(this.collisionBounds.x,
                this.collisionBounds.y + this.collisionBounds.height);

            ctx.lineTo(this.collisionBounds.x + this.collisionBounds.width,
                this.collisionBounds.y + this.collisionBounds.height);

            ctx.lineTo(this.collisionBounds.x + this.collisionBounds.width,
                this.collisionBounds.y);

            ctx.lineTo(this.collisionBounds.x, this.collisionBounds.y);

            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
    }


    set removal  (remove) {
        this.removeFromWorld = remove;
    }

    get removalStatus () {
        return this.removeFromWorld;
    }


    static intersects  (object1, object2) {
        //If one of the objects has no collision then it can't intersect
        if (object1.collisionBounds == null || object2.collisionBounds == null) {
            return false;
        }

        let p1X = object1.collisionBounds.x;
        let p1Y = object1.collisionBounds.y;

        let p2X = object1.collisionBounds.x + object1.collisionBounds.width;
        let p2Y = object1.collisionBounds.y + object1.collisionBounds.height;

        let p3X = object2.collisionBounds.x;
        let p3Y = object2.collisionBounds.y;

        let p4X =  object2.collisionBounds.x + object2.collisionBounds.width;
        let p4Y =  object2.collisionBounds.y + object2.collisionBounds.height;

        return !( p2Y < p3Y || p1Y > p4Y || p2X < p3X || p1X > p4X );
    }


    static hasCollided(entity, entityArr) {
        for (let i = 0; i < entityArr.length; i++) {
            if (entity !== entityArr[i] && Entity.intersects(entity, entityArr[i])) {
                if (entity === entityArr[i]) {
                    console.log("Entities are the same!");
                }
                return true;
            }
        }
        return false;
    }
}

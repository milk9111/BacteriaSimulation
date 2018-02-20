
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
    this.timesFinished = 0;
}

Animation.prototype.drawFrame = function (game, tick, ctx, x, y, scale) {
    let lastFrame = false;
    if (!game.stop) {
        //console.log("drawing frame");
        let scaleBy = scale || 1;
        this.elapsedTime += tick;
        if (this.loop) {
            if (this.isDone()) {
                this.elapsedTime = 0;
                this.timesFinished++;
            }
        } else if (this.isDone()) {
            this.elapsedTime -= tick;
            lastFrame = true;
            this.timesFinished++;
        }

        let originalFrame = this.currentFrame();
        let index = originalFrame;
        let vindex = 0;
        if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
            index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
            vindex++;
        }
        while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
            index -= Math.floor(this.spriteSheet.width / this.frameWidth);
            vindex++;
        }

        let locX = x;
        let locY = y;
        let offset = vindex === 0 ? this.startX : 0;

        if (!this.reverse) {
            //console.log(index === this.frames - 1);
            if (index === (this.frames - 1) && game.moving) {
                index = originalFrame;
                this.elapsedTime = 0;
                vindex = 0;
            }
            ctx.drawImage(this.spriteSheet,
                          index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                          this.frameWidth, this.frameHeight,
                          locX, locY,
                          this.frameWidth * scaleBy,
                          this.frameHeight * scaleBy);
        } else {
            if (index === (this.frames - 1) && game.moving) {
                index = originalFrame;
                this.elapsedTime = 0;
                vindex = 0;
            }
            ctx.drawImage(this.spriteSheet,
                index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                this.frameWidth, this.frameHeight,
                locX, locY,
                this.frameWidth * scaleBy,
                this.frameHeight * scaleBy);

            //For now we can keep this top part here. Once we have actual sprites and animations we should switch to
            //this function below.
            //flipSpriteHorizontally(ctx, this.spriteSheet, locX, locY, index * this.frameWidth + offset,
            //    vindex * this.frameHeight + this.startY, this.frameWidth, this.frameHeight);
        }

        if (lastFrame) {
            this.elapsedTime = this.totalTime;
        }
    } else {
        //game.stop = false;
    }
}


/*
    Not my function, I took this from StackOverflow.
 */
function flipSpriteHorizontally(ctx, img, x, y, spriteX, spriteY, spriteW, spriteH){
    // move to x + img's width
    // adding img.width is necessary because we're flipping from
    //     the right side of the img so after flipping it's still
    //     at [x,y]
    ctx.translate(x+spriteW,y);

    // scaleX by -1; this "trick" flips horizontally
    ctx.scale(-1,1);

    // draw the img
    // no need for x,y since we've already translated
    ctx.drawImage(img,
                spriteX,spriteY,spriteW,spriteH,0,0,spriteW,spriteH
               );

    // always clean up -- reset transformations to default
    ctx.setTransform(1,0,0,1,0,0);
}

/**
 *
 * @param e1 {Object}
 * @param e1.x {number}
 * @param e1.y {number}
 * @param e2 {Object}
 * @param e2.x {number}
 * @param e2.y {number}
 * @param dist {number}
 */
function areEntitiesInRange(e1, e2, dist) {

    let xDist = Math.pow(Math.abs(e1.x - e2.x), 2);
    let yDist = Math.pow(Math.abs(e1.y - e2.y), 2);
    let distance = Math.sqrt(xDist + yDist);
    return distance <= dist;

}


Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}


function toggleSound() {
    ASSET_MANAGER.toggleSound();
}

function buttonClick (label) {
    if (label === "Pause") {
        $("#pause").text("Resume");
        gameEngine.isPaused = true;
        $('#step').removeAttr('disabled');
    } else {
        $("#pause").text("Pause");
        gameEngine.isPaused = false;
        $('#step').attr('disabled','disabled');
    }
}

function startStep () {
    console.log("Starting step");
    gameEngine.isStepping = true;
    $('#pause').attr('disabled','disabled');
    $('#step').attr('disabled','disabled');
}

function endStep () {
    console.log("Ending step");
    gameEngine.isStepping = false;
    $('#pause').removeAttr('disabled');
    $('#step').removeAttr('disabled');
}

function changeTemp (direction) {
    gameEngine.changeTemp(direction);
}

function restart () {
    gameEngine.restart();
}

let playerStartX;
let playerStartY;
let gameEngine;
let isPaused = false;

//up, down, left, right
let facingDirection;


// the "main" code begins here
let ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("../img/images.jpg");

ASSET_MANAGER.downloadAll(function() {

  let canvas = document.getElementById('gameWorld');
  let ctx = canvas.getContext('2d');

  //LOAD ENTITIES
  //start facing downwards.
  facingDirection = "down";
  gameEngine = new GameEngine();

  gameEngine.init(ctx);
  gameEngine.start();
  gameEngine.beginSimulation();
});

// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    let wallCurrent = Date.now();
    let wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    let gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}


/**
 * The constructor for the GameEngine object. It holds the context, list of
 * entities that are in the game, and various other bits like the mouse, click,
 * and surface width and height.
 *
 * @constructor
 * @author Seth Ladd
 */
class GameEngine {

    constructor() {
        this.entities = [];
        this.ctx = null;
        this.surfaceWidth = null;
        this.surfaceHeight = null;
        this.isPaused = false;
        this.isStepping = false;

        this.simulation = null;

        this.maxWidth = 20;
        this.maxHeight = 20;
        this.minWidth = 10;
        this.minHeight = 10;

        this.minutesLabel = null;
        this.bacteriaCountLabel = null;
        this.genCountLabel = null;
        this.resourceCountLabel = null;
        this.deadCountLabel = null;
        this.tempLabel = null;
    }

    beginSimulation () {
        this.simulation = new Simulation(this);
        this.addEntity(this.simulation);
    }

    /**
     * This is the initializer for the GameEngine object. It simply takes the
     * context of the game and sets the surface width and height to that of
     * the canvas (which comes from the context. It also starts the user input
     * as well.
     *
     * @param ctx
     * @author Seth Ladd
     */
    init (ctx) {
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.timer = new Timer();
        this.minutesLabel = document.getElementById("minutes");
        this.bacteriaCountLabel = document.getElementById("bacteriaCount");
        this.genCountLabel = document.getElementById("genCount");
        this.resourceCountLabel = document.getElementById("resourceCount");
        this.deadCountLabel = document.getElementById("deadCount");
        this.tempLabel = document.getElementById("temp");

        console.log('simulation initialized');
    }


    /**
     * Here is the start of the game. That is, it begins the infinite loop that will
     * be the timer for the game which will cause all of the movements, animations,
     * collisions, etc.
     *
     * @author Seth Ladd
     */
    start () {
        console.log("starting simulation");
        let that = this;
        (function gameLoop() {
            that.loop();
            requestAnimFrame(gameLoop, that.ctx.canvas);
        })();
    }


    /**
     * This is called whenever a new entity is created in the game world.
     * @param entity
     * @author Seth Ladd
     */
    addEntity (entity) {
        this.entities.push(entity);
        entity.pos = this.entities.indexOf(entity);
    }


    /**
     * Here the GameEngine is going to call draw on every entity in the game in order to paint
     * them on the screen at their current position.
     *
     * @author Seth Ladd
     */
    draw () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.save();
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i] !== null && this.entities[i] !== undefined) {
                this.entities[i].draw(this.ctx);
            } else {
                console.log(this.entities[i]);
            }
        }
        this.ctx.restore();
    }


    /**
     * Here the GameEngine is going to call update on every entity in the game in order to
     * move them around the screen.
     *
     * @author Seth Ladd
     */
    update () {
        let entitiesCount = this.entities.length;
        let removalPositions = [];

        //This moves the entities (via their own update method)
        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (entity.removalStatus === false) {
                entity.update();
            } else {
                removalPositions.push(i);
            }
        }

        //This removes entities from the game world
        for (let i = removalPositions.length - 1; i >= 0; --i) {
            this.entities.splice(removalPositions[i], 1);
        }

        if (removalPositions.length > 0) {
            this.updateEntityPositions();
        }
    }

    updateEntityPositions () {
        for (let i = 0; i < this.entities.length - 1; i++) {
            this.entities[i].pos = i;
        }
    }

    changeTemp (direction) {
        this.simulation.changeTemp(direction);
    }

    restart () {
        console.log("Restarting");
        this.timer.gameTime = 0;
        this.timer.maxStep = 0.05;
        this.timer.wallLastTimestamp = 0;
        this.entities = [];
        this.addEntity(this.simulation);
        this.simulation.setupSimulation();
        this.simulation.temperature = parseInt($("#temp").text());
        this.simulation.splittingChance = this.simulation.adjustSplittingChance();
        console.log(this.simulation.temperature);
    }

    /**
     * This is called at the top of every loop for the GameEngine's infinite loop. It handles
     * the clock tick, GameEngine update and draw calls, and resetting all of the player movement
     * variables.
     *
     * @author Seth Ladd
     */
    loop () {

        if (!this.isPaused || this.isStepping) {
            this.clockTick = this.timer.tick();
            this.update();
            if (this.isStepping) {
                endStep();
            }
        }


        if (!this.isStepping) {
            this.draw();
        }

        if (this.simulation !== null) {
            if (!this.isStepping) {
                this.minutesLabel.innerText = this.simulation.minutes;
                this.bacteriaCountLabel.innerText = this.simulation.bacteria.length;
                this.genCountLabel.innerText = this.simulation.genCount;
                this.resourceCountLabel.innerText = this.simulation.currentResourcesAvailable;
                this.deadCountLabel.innerText = this.simulation.numberOfDead;
                this.tempLabel.innerText = this.simulation.temperature;
            }
        } else {
            this.minutesLabel.innerText = 0;
            this.bacteriaCountLabel.innerText = 0;
            this.genCountLabel.innerText = 0;
            this.resourceCountLabel.innerText = 0;
            this.deadCountLabel.innerText = 0;
            this.tempLabel.innerText = 0;
        }
    }

}

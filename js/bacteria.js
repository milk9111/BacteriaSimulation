
class Bacteria extends Entity {

    constructor (game, simulation, x, y, width, height, parentVariation, parentColor) {
        super(game, x, y, true, width, height, 0, 0, "Bacteria");

        this.game = game;
        this.simulation = simulation;
        //this.simulation = simulation;

        this.originalWidth = width;
        this.originalHeight = height;
        this.width = width;
        this.height = height;
        this.maxWidth = width + 10;
        this.maxHeight = height + 10;

        this.parentVariation = parentVariation;

        this.xGrow = true;
        this.yGrow = true;
        this.minGrow = 0.03;
        this.xGrowStep = 0.25;
        this.finalXGrowStep = (Math.random() * this.xGrowStep) + this.minGrow;
        this.yGrowStep = 0.5;
        this.finalYGrowStep = (Math.random() * this.yGrowStep) + this.minGrow;

        this.maxDeathTimer = this.simulation.splittingChance;
        this.minDeathTimer = this.maxDeathTimer / 2;
        this.deathTimer = (Math.random() * this.maxDeathTimer) + 1;
        if (this.deathTimer < this.minDeathTimer) {
            this.deathTimer = this.minDeathTimer;
        }

        this.isDead = false;

        this.isAgainstWallOnX = false;
        this.isAgainstWallOnY = false;

        function random_rgba() {
            let o = Math.round, r = Math.random, s = 255;
            return {r: o((r()*s)%s), g: o((r()*s)%s), b: o((r()*s)%s), a: r().toFixed(1)};
        }

        if (parentVariation === 1) {
            this.color = random_rgba();
        } else {
            this.color = {r: (parentColor.r+parentVariation)%255, g: (parentColor.g+parentVariation)%255, b: (parentColor.b+parentVariation)%255, a: Math.random().toFixed(1)};
        }
    }


    update () {
        this.adjustSize();
        if (this.deathTimer <= 0) {
            this.game.simulation.killParent(this);
            this.game.simulation.numberOfDead++;
            this.isDead = true;
        }
        this.deathTimer--;

        super.update();
    }

    draw (ctx) {
        if (!this.isDead) {
            ctx.save();
            let color = 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ',' + this.color.a + ')';
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            ctx.strokeStyle = "black";
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
        //Entity.prototype.draw.call(this);
    }

    adjustSize () {
        if (this.xGrow) {
            this.width+=this.finalXGrowStep;
        } else {
            this.width-=this.finalXGrowStep;
        }
        if (this.yGrow) {
            this.height+=this.finalYGrowStep;
        } else {
            this.height-=this.finalYGrowStep;
        }

        if (this.width >= this.maxWidth || this.width <= this.originalWidth) {
            this.xGrow = !this.xGrow;
        }

        if (this.height >= this.maxHeight || this.height <= this.originalHeight) {
            this.yGrow = !this.yGrow;
        }
    }
}
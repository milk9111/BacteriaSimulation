
class Simulation extends Entity {

    constructor (game) {
        super (game, 0, 0, false, 0, 0, 0, 0, "Simulation");

        this.game = game;
        this.setupSimulation();
    }

    setupSimulation () {
        this.bacteria = [];
        this.genCount = 1;

        this.minutes = 0;
        this.minutesUntilSplit = 4;
        this.currentStep = 0;

        this.startingResourcesAvailable = 500; //generic "resource" count that represents food for bacteria to grow

        this.temperature = 60; //in degrees Fahrenheit

        this.splitChanceReduceCount = 0;
        this.reductionSinceLastTempChange = 0;
        this.splittingChance = this.adjustSplittingChance();
        this.currentResourcesAvailable = this.startingResourcesAvailable;
        this.numberOfDead = 0;

        let firstBacteria = this.makeFirstBacteria();
        this.game.addEntity(firstBacteria);
        this.bacteria.push(firstBacteria);

        this.hasSplit = false;
    }

    changeTemp (direction) {
        if (direction === "up") {
            this.temperature++;
        } else {
            this.temperature--;
        }

        this.splittingChance = this.adjustSplittingChance();
    }

    adjustSplittingChance () {
        let tempVariation = 1;

        tempVariation += (0.1 * (100 / this.temperature));

        return this.startingResourcesAvailable * tempVariation - this.reductionSinceLastTempChange;
    }

    update () {
        if (this.minutes >= this.minutesUntilSplit || this.game.isStepping) {
            this.minutes = 0;
            this.hasSplit = false;
            let bacteriaCount = this.bacteria.length;
            for (let i = 0; i < bacteriaCount; i++) {
                let splitChance = (Math.random() * this.splittingChance);
                if (splitChance <= this.currentResourcesAvailable
                    && this.currentResourcesAvailable > 0 && splitChance > 0) {
                    this.bacteriaSplit(this.bacteria[i]);
                    this.hasSplit = true;
                }
                if (this.currentResourcesAvailable > 0) {
                    this.currentResourcesAvailable--;
                    this.splitChanceReduceCount++;
                    if (this.splitChanceReduceCount % 10 === 0) {
                        this.splittingChance -= 3;
                        this.reductionSinceLastTempChange += 2;
                    }
                }
            }

            if (this.hasSplit) {
                this.genCount++;
            }
        }

        this.currentStep += this.game.clockTick;
        if (this.currentStep > 1) {
            this.currentStep = 0;
            this.minutes++;
        }

        super.update();
    }

    bacteriaSplit (parent) {
        let child1 = this.makeABacteria(this.game.maxWidth, this.game.minWidth,
            this.game.maxHeight, this.game.minHeight, 1, 1, 1, 1, parent.parentVariation+5, parent.color);

        let child2 = this.makeABacteria(this.game.maxWidth, this.game.minWidth,
            this.game.maxHeight, this.game.minHeight, 1, 1, 1, 1, parent.parentVariation+5, parent.color);

        this.game.addEntity(child1);
        this.bacteria.push(child1);

        this.game.addEntity(child2);
        this.bacteria.push(child2);

        this.killParent(parent);
    }


    killParent (parent) {
        parent.removal = true;
        this.bacteria.splice(this.bacteria.indexOf(parent), 1);
    }

    makeFirstBacteria () {
        let bacteria = this.makeABacteria(this.game.maxWidth, this.game.minWidth,
            this.game.maxHeight, this.game.minHeight, 1, 1, 1, 1, 1, null);

        let x = (Math.random() * this.game.surfaceWidth) + 1;
        x = ((x + bacteria.width > this.game.surfaceWidth) ? ((x + bacteria.width) - this.game.surfaceWidth - bacteria.width) : x);

        let y = (Math.random() * this.game.surfaceHeight) + 1;
        y = ((y + bacteria.height > this.game.surfaceHeight) ? ((y + bacteria.height) - this.game.surfaceHeight - bacteria.height) : y);

        bacteria.x = x;
        bacteria.y = y;

        return bacteria;
    }

    makeABacteria (maxWidth, minWidth, maxHeight, minHeight, maxX, minX, maxY, minY, parentVariation, parentColor) {
        let width = (Math.random() * maxWidth) + 1;
        width = ((width < minWidth) ? (width + minWidth) : width);

        let height = (Math.random() * maxHeight) + 1;
        height = ((height < minHeight) ? (height + minHeight) : height);

        let pos = this.getPosition(width, height, maxX, minX, maxY, minY);

        let bacteria = new Bacteria(this.game, this, pos.x, pos.y, width, height, parentVariation, parentColor);

        let x = (Math.random() * this.game.surfaceWidth) + 1;
        x = ((x + bacteria.width > this.game.surfaceWidth) ? ((x + bacteria.width) - this.game.surfaceWidth - bacteria.width) : x);

        let y = (Math.random() * this.game.surfaceHeight) + 1;
        y = ((y + bacteria.height > this.game.surfaceHeight) ? ((y + bacteria.height) - this.game.surfaceHeight - bacteria.height) : y);

        bacteria.x = x;
        bacteria.y = y;

        return bacteria;
    }


    getPosition (width, height, maxX, minX, maxY, minY) {
        let x = (Math.random() * maxX) + 1;
        x = ((x < minX) ? (minX) : x);

        let y = (Math.random() * maxY) + 1;
        y = ((y < minY) ? (minY) : y);

        let hitAWallOnX = false;
        let hitAWallOnY = false;
        if (x + width > this.game.surfaceWidth || x - width <= 0) {
            if (x + width > this.game.surfaceWidth) {
                x = x - ((x + width) - this.game.surfaceWidth);
            } else {
                x = (x + width) * 2;
            }
            hitAWallOnX = true;
        }

        if (y + height > this.game.surfaceHeight || y - height <= 0) {
            if (y + height > this.game.surfaceHeight) {
                y = y - ((y + height) - this.game.surfaceHeight);
            } else {
                y = (y + height) * 2;
            }
            hitAWallOnY = true;
        }

        return {x: x, y: y, hitAWallOnX: hitAWallOnX, hitAWallOnY: hitAWallOnY};
    }

    draw (ctx) {
        super.draw(ctx);
    }
}
import Entity from "./Entity.js";

const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

class Player extends Entity {
    constructor() {
        super("player");
        this.money = 0;
        this.x = 883.63;
        this.y = 525.54;
        this.angle = 90;
        this.xVel = 0;
        this.yVel = 0;
        this.w = 64;
        this.h = 32;
        this.acceleration = 0.05; // Controls how fast velocity increases
        this.maxSpeed = 1.0;     // NEW: Max speed limit for smoother, controlled play
        this.angleSpeed = 2;
        this.hasLoaded = false;

        this.sprite = new Image();
        this.sprite.src = "./Assets/images/Car.jpeg";
        this.sprite.onload = () => {
            console.log("Sprite loaded!");
            this.hasLoaded = true;
        };
    }

    toRadian(angle) {
        return (angle) * Math.PI / 180;
    }
    
    drawMoney(ctx) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Money: $${this.money}`, 20, 30);
    }

    /**
     * Collision response: stops the player completely.
     * Note: For complex movement, a more advanced solution (like pushing the player
     * outside the collider) would be needed, but this prevents passing through walls.
     */
    on_collision(entity) {
        if (entity.name === "wall") {
            // Halt velocity upon collision with a wall entity
            this.xVel = 0;
            this.yVel = 0;
        }


        // console.log(`Player hit ${entity.name}`);
    }

    update(ctx) {
        console.log(`Player position: (${this.x.toFixed(2)}, ${this.y.toFixed(2)}) Angle: ${this.angle.toFixed(2)}° Speed: (${this.xVel.toFixed(2)}, ${this.yVel.toFixed(2)})`);
        // Handle input
        if (keys["w"]) {
            this.xVel += Math.cos(this.toRadian(this.angle + 90)) * this.acceleration;
            this.yVel += Math.sin(this.toRadian(this.angle + 90)) * this.acceleration;
        }
        if (keys["s"]) {
            this.xVel -= Math.cos(this.toRadian(this.angle + 90)) * this.acceleration;
            this.yVel -= Math.sin(this.toRadian(this.angle + 90)) * this.acceleration;
        }
        if(Math.abs(this.yVel) > 0.0) {
            if (keys["a"]) {
                this.angle -= this.angleSpeed;
            }
            if (keys["d"]) {
                this.angle += this.angleSpeed;
            }
        }

        // Wrap angle
        this.angle = (this.angle + 360) % 360;

        // --- Apply Max Speed Limit ---
        const currentSpeedSq = this.xVel * this.xVel + this.yVel * this.yVel;
        const maxSpeedSq = this.maxSpeed * this.maxSpeed;

        if (currentSpeedSq > maxSpeedSq) {
            const currentSpeed = Math.sqrt(currentSpeedSq);
            // Rescale velocity vector to the maximum speed
            this.xVel = (this.xVel / currentSpeed) * this.maxSpeed;
            this.yVel = (this.yVel / currentSpeed) * this.maxSpeed;
        }
        // ------------------------------

        // Apply velocity
        this.x += this.xVel;
        this.y += this.yVel;

        // Apply some damping (space friction)
        const friction = 0.99; 
        this.xVel *= friction;
        this.yVel *= friction;
    }

    // In the main game loop, you'll call player.draw(ctx, 6)

    draw(ctx, player, multiplier = 2) {
        if (!this.hasLoaded) return;

        const scaledW = this.w * multiplier;
        const scaledH = this.h * multiplier;

        const canvasCenterX = ctx.canvas.width / 2;
        const canvasCenterY = ctx.canvas.height / 2;

        ctx.save();

        // Move origin to canvas center (player stays fixed there)
        ctx.translate(canvasCenterX, canvasCenterY);
        ctx.rotate(this.toRadian(this.angle + 90));

        // Draw sprite centered
        ctx.drawImage(
            this.sprite,
            -scaledW / 2,
            -scaledH / 2,
            scaledW,
            scaledH
        );

        ctx.restore();
    }
}

export default Player;

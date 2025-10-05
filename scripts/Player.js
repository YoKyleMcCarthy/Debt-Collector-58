import Entity from "./Entity.js";

const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

class Player extends Entity {
    constructor() {
        super("player");
        this.nitroSoundEffect = document.getElementById('nitroSound');
        this.engineIdleSound = document.getElementById('engineIdle');
        this.money = 0;
        this.x = 883.63;
        this.y = 525.54;
        this.angle = 90;
        this.xVel = 0;
        this.yVel = 0;
        this.w = 64;
        this.h = 32;
        this.acceleration = 0.05; // Controls how fast velocity increases
        this.baseMaxSpeed = 1.0;  // Base max speed
        this.boostSpeed = 3.0;    // Speed when spacebar is held down (Boost)
        this.maxSpeed = this.baseMaxSpeed; // Active max speed
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
    
    // drawMoney is now handled by drawHUD in the main game loop
    drawMoney(ctx) { 
        // This function is deprecated, but kept here just in case. 
        // The display logic is now in main_game.js for correct viewport rendering.
    }

    /**
     * Collision response: stops the player completely.
     */
    on_collision(entity) {
        if (entity.name === "wall") {
            // Halt velocity upon collision with a wall entity
            this.xVel = 0;
            this.yVel = 0;
        }
    }

    update(ctx) {
        // --- SPEED BOOST LOGIC ---
        // If the spacebar is held, set maxSpeed to boostSpeed, otherwise use base speed.
        if (keys[" "]) {
            this.maxSpeed = this.boostSpeed;
            if(this.nitroSoundEffect.paused) {
                this.nitroSoundEffect.currentTime = 0;
                this.nitroSoundEffect.play();
                this.nitroSoundEffect.volume = 1.0;
                this.engineIdleSound.pause();
            }
        } else {
            this.maxSpeed = this.baseMaxSpeed;
            this.nitroSoundEffect.pause();
            if(this.engineIdleSound.paused) {
                this.engineIdleSound.currentTime = 0;
                this.engineIdleSound.play();
                this.engineIdleSound.volume = 1.0;
            }

        }
        
        // --- END SPEED BOOST LOGIC ---        
        // Handle input (Acceleration)
        if (keys["w"]) {
            this.xVel += Math.cos(this.toRadian(this.angle + 90)) * this.acceleration;
            this.yVel += Math.sin(this.toRadian(this.angle + 90)) * this.acceleration;
        }
        if (keys["s"]) {
            this.xVel -= Math.cos(this.toRadian(this.angle + 90)) * this.acceleration;
            this.yVel -= Math.sin(this.toRadian(this.angle + 90)) * this.acceleration;
        }
        
        // Handle turning (only allowed when there is movement)
        if(Math.abs(this.xVel) > 0.01 || Math.abs(this.yVel) > 0.01) { // Check velocity magnitude, not just yVel
            if (keys["a"]) {
                this.angle -= this.angleSpeed;
            }
            if (keys["d"]) {
                this.angle += this.angleSpeed;
            }
        }

        // Wrap angle
        this.angle = (this.angle + 360) % 360;

        // --- Apply Active Max Speed Limit ---
        const currentSpeedSq = this.xVel * this.xVel + this.yVel * this.yVel;
        const maxSpeedSq = this.maxSpeed * this.maxSpeed; // Uses active maxSpeed (base or boost)

        if (currentSpeedSq > maxSpeedSq) {
            const currentSpeed = Math.sqrt(currentSpeedSq);
            // Rescale velocity vector to the maximum speed
            this.xVel = (this.xVel / currentSpeed) * this.maxSpeed;
            this.yVel = (this.yVel / currentSpeed) * this.maxSpeed;
        }
        // ------------------------------------

        // Apply velocity
        this.x += this.xVel;
        this.y += this.yVel;

        // Apply some damping (space friction)
        const friction = 0.99; 
        this.xVel *= friction;
        this.yVel *= friction;
    }

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

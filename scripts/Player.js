import Entity from "./Entity.js";

const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

class Player extends Entity {
    constructor() {
        super("player");
        this.x = 100;
        this.y = 100;
        this.xVel = 0;
        this.yVel = 0;
        this.angle = 0; // degrees
        this.w = 128;
        this.h = 64;
        this.speed = 0.2;
        this.angleSpeed = 2;
        this.hasLoaded = false;

        this.sprite = new Image();
        this.sprite.src = "../Assets/images/Car.jpeg";
        this.sprite.onload = () => {
            console.log("Sprite loaded!");
            this.hasLoaded = true;
        };
    }

    toRadian(angle) {
        return (angle) * Math.PI / 180;
    }

    update(ctx) {
        // Handle input
        if (keys["w"]) {
            this.xVel += Math.cos(this.toRadian(this.angle + 90)) * this.speed;
            this.yVel += Math.sin(this.toRadian(this.angle + 90)) * this.speed;
        }
        if (keys["s"]) {
            this.xVel -= Math.cos(this.toRadian(this.angle + 90)) * this.speed;
            this.yVel -= Math.sin(this.toRadian(this.angle + 90)) * this.speed;
        }
        if(Math.abs(this.yVel) > 0.1) {
            if (keys["a"]) {
                this.angle -= this.angleSpeed;
            }
            if (keys["d"]) {
                this.angle += this.angleSpeed;
            }
        }

        // Wrap angle
        this.angle = (this.angle + 360) % 360;

        // Apply velocity
        this.x += this.xVel;
        this.y += this.yVel;

        // Apply some damping (space friction)
        const friction = 0.99; // <--- much better than fixed -0.1
        this.xVel *= friction;
        this.yVel *= friction;
    }

    draw(ctx) {
        if(!this.hasLoaded) {
            return;
        }
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.toRadian(this.angle + 90));
        ctx.drawImage(this.sprite, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    }
}

export default Player;

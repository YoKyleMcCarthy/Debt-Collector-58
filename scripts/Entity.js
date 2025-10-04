class Entity {
    constructor(name, x, y, w, h) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    update(ctx) {};
    on_collision(entity) {
        console.log(`${this.name} collided with ${entity.name}`);
    }
    draw(ctx) {};
}

export default Entity;
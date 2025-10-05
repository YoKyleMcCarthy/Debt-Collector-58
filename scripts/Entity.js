class Entity {
    constructor(name, x, y, w, h) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    update(ctx, player) {};
    on_collision(entity) {
        // Default collision handler (can be overridden by subclasses)
    }
    draw(ctx, player) {};
}

export default Entity;
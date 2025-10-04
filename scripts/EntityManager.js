import Entity from "./Entity.js";


class EntityManager {
    entities = [];
    constructor() {

    }

    checkCollision() {
        for (let i = 0; i < this.entities.length; i++) {
            const e1 = this.entities[i];
            
            for (let j = i + 1; j < this.entities.length; j++) {
                const e2 = this.entities[j];

                if (
                    e1.x < e2.x + e2.w &&
                    e1.x + e1.w > e2.x &&
                    e1.y < e2.y + e2.h &&
                    e1.y + e1.h > e2.y
                ) {
                    // Collision detected
                    if (typeof e1.on_collision === "function") {
                        e1.on_collision(e2);
                    }
                    if (typeof e2.on_collision === "function") {
                        e2.on_collision(e1);
                    }
                }
            }
        }
    }


    createEntity(name) {
        const entity = new Entity(name);
        this.entities.push(entity);
        return entity;
    }

    addEntity(entity) {
        this.entities.push(entity)
    }

    update(ctx) {
        this.entities.forEach((entity) => {
            entity.update(ctx);
        });
    }

    draw(ctx) {
        this.entities.forEach((entity) => {
            entity.draw(ctx);
        });
    }
}
export default EntityManager;
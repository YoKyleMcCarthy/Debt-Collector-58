import Entity from "./Entity.js";


class EntityManager {
    entities = [];
    constructor() {

    }
    
    /**
     * Loads static collision entities from map data (like walls) and adds them to the manager.
     * These entities are usually created once during game initialization.
     * @param {Array<{name: string, x: number, y: number, w: number, h: number}>} entitiesData 
     */
    loadCollisionLayer(entitiesData) {
        // Create an Entity instance for each collision tile
        entitiesData.forEach(data => {
            // Since Map.getCollisionEntities provides x, y, w, h, we use the full constructor here.
            const collisionEntity = new Entity(data.name, data.x, data.y, data.w, data.h);
            this.entities.push(collisionEntity);
        });
        console.log(`Loaded ${entitiesData.length} collision entities.`);
    }

    /**
     * Checks for collisions between all entities using AABB with a reduced size 
     * to improve accuracy with rotating sprites.
     */
    checkCollision() {
        // Defines the percentage of the entity's bounds to use for collision.
        // Set to 0.60 (60%) for a tighter, more accurate feel for rotating cars.
        const COLLISION_SCALE = 0.40; 

        for (let i = 0; i < this.entities.length; i++) {
            const e1 = this.entities[i];
            for (let j = i + 1; j < this.entities.length; j++) {
                const e2 = this.entities[j];

                // --- Calculate the smaller, tighter collision boxes ---
                
                // Entity 1: Dimensions and Centered Position
                const w1 = e1.w * COLLISION_SCALE;
                const h1 = e1.h * COLLISION_SCALE;
                // Calculate new starting position (x) to keep the reduced box centered
                const x1 = e1.x + (e1.w - w1) / 2;
                const y1 = e1.y + (e1.h - h1) / 2;

                // Entity 2: Dimensions and Centered Position
                const w2 = e2.w * COLLISION_SCALE;
                const h2 = e2.h * COLLISION_SCALE;
                // Calculate new starting position (x) to keep the reduced box centered
                const x2 = e2.x + (e2.w - w2) / 2;
                const y2 = e2.y + (e2.h - h2) / 2;
                
                // --- Perform AABB check using the tighter boxes ---

                if (
                    x1 < x2 + w2 &&
                    x1 + w1 > x2 &&
                    y1 < y2 + h2 &&
                    y1 + h1 > y2
                ) {
                    if(e1.name === "player" && e2.name === "player") {
                        // Ignore player-player collisions
                        continue;
                    }
                    if(e1.name !== "player" && e2.name !== "player") {
                        // Ignore non-player to non-player collisions
                        continue;
                    }
                    if(e1.name === "player" && e2.name !== "wall" && e2.name !== "Police") {
                        //remove entity if it's not a wall or police
                        const collisionSound = document.getElementById('collisionSound');
                        collisionSound.currentTime = 0;
                        collisionSound.play();
                        collisionSound.volume = 1.0;
                        this.entities.splice(j, 1);
                        j--; // Adjust index after removal
                        console.log(`Removed entity ${e2.name} after collision with player.`);
                        e1.money += 10; // Increase player's money by $10 for each entity collected
                        continue;
                    }
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

    update(ctx, player) {
        this.entities.forEach((entity) => {
            entity.update(ctx, player);
        });
        // CRITICAL: Call collision check during the update phase
        this.checkCollision(); 
    }

    draw(ctx, player) {
        this.entities.forEach((entity) => {
            // Note: Since walls/collision entities don't have a draw function, 
            // this simply skips them if they don't override the default.
            entity.draw(ctx, player);
        });
    }
}
export default EntityManager;

import Entity from './Entity.js';

function getRandomInt(min, max) {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Example: Get a random integer between 1 and 10 (inclusive)

class NPC extends Entity {
    constructor(name, x, y) {
        // Entity bounds: 128x64
        super(name, x, y, 128, 64); 
        this.color = 'blue';
        this.speed = 0.8; // Movement speed
        this.sprite = new Image();
        // FIX: Adjusted path to be relative to the main HTML/root file
        if(getRandomInt(1, 10) > 3) {
            this.sprite.src = "./Assets/images/Car.jpeg"; 
        }  else {

            this.sprite.src = "./Assets/images/PoliceCar.svg"; 
            this.name = "Police";
            this.speed = 1.2;
        }
        this.sprite.onload = () => {
            console.log("NPC Sprite loaded!");
            this.hasLoaded = true;
        };
        // Angle in radians for rotation (dynamically calculated)
        this.direction = 0; 

        // Waypoints for the NPC 
        this.nodes1 = [
            {x: 1007.8369112657041, y: 300.39992566474052, hasPassed: false},
            {x: 180.81985158610482, y: 300.8892500333796, hasPassed: false},
            {x: 180.49121446794345, y: 45.563010091980615, hasPassed: false},
            {x: 498.4198889744077, y: 44.1315107546244, hasPassed: false},
            {x: 500.2792553796, y: 678.3959189664539, hasPassed: false},
            {x: 1007.0979790492637, y: 650.6798874812597, hasPassed: false},
        ];

        /*
        Player position: (431.20, 654.99) Angle: 178.00° Speed: (0.00, 0.01)
        Player position: (428.46, 66.56) Angle: 88.00° Speed: (0.01, -0.00)
        Player position: (177.87, 61.62) Angle: 348.00° Speed: (-0.02, 0.03)
        Player position: (179.90, 251.17) Angle: 306.00° Speed: (0.01, 0.02)
        Player position: (1009.09, 251.88) Angle: 288.00° Speed: (0.00, -0.00)
        Player position: (984.44, 694.14) Angle: 152.00° Speed: (-0.06, 0.05)
        */
        this.nodes2 = [
            {x: 464.27, y: 654.82, hasPassed: false},
            {x: 464.46, y: 74.56, hasPassed: false},
            {x: 210.87, y: 72.62, hasPassed: false},
            {x: 210.90, y: 251.17, hasPassed: false},
            {x: 1009.09, y: 271.88, hasPassed: false},
            {x: 984.44, y: 694.14, hasPassed: false},
        ]
        
        // --- FIX: RANDOM PATH SELECTION ---
        // 1. Choose path randomly (0 or 1)
        const pathChoice = getRandomInt(0, 1);

        // 2. Assign the chosen array to the active nodes property
        if (pathChoice === 0) {
            this.nodes = this.nodes1;
        } else {
            this.nodes = this.nodes2;
        }
        // --- END RANDOM PATH SELECTION FIX ---
        
        this.currentNodeIndex = 0;

        // Set NPC's initial position to the first node's position
        if (this.nodes.length > 0) {
            const firstNode = this.nodes[0];
            
            // FIX: Set position so the NPC's CENTER starts at the node's position
            this.x = firstNode.x - this.w / 2;
            this.y = firstNode.y - this.h / 2;
        }
    }

    /**
     * Updates the NPC's position and direction based on the current target node.
     */
    update(ctx) {
        if (this.currentNodeIndex >= this.nodes.length) {
            // Loop back to the first node
            this.currentNodeIndex = 0;
            this.nodes.forEach(node => node.hasPassed = false);
            return;
        }

        const targetNode = this.nodes[this.currentNodeIndex];

        // 1. Calculate the distance and direction from the NPC's CENTER to the target node
        const npcCenterX = this.x + this.w / 2;
        const npcCenterY = this.y + this.h / 2;
        
        const dx = targetNode.x - npcCenterX;
        const dy = targetNode.y - npcCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 2. Check if the NPC is close enough to the target node
        const tolerance = 10; 
        if (distance < tolerance) {
            targetNode.hasPassed = true;
            this.currentNodeIndex++;
            return;
        }

        // 3. Calculate the new direction (angle) towards the target node (in radians)
        this.direction = Math.atan2(dy, dx); 
        
        // 4. Move the NPC towards the target node at a constant speed
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;
    }
    
    on_collision(entity) {
        if(entity.name === "player" && this.name !== "player" && this.name === "Police") {
            console.log("Police Collided with Player! Resetting position.");
            entity.x = 883.63;
            entity.y = 525.54;
            entity.xVel = 0;
            entity.yVel = 0;
            entity.angle = 90;
            entity.money = entity.money / 2; // Player loses half their money on collision with police
        }
    }

    /**
     * Draws the NPC, respecting the player's camera position and a fixed multiplier.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context.
     * @param {Player} player - The Player object for camera positioning.
     */
    draw(ctx, player) {
        // Use the same multiplier as your Map class
        const multiplier = 6; 
        
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        // Calculate the camera offset (how much the world is shifted)
        const playerCenterX = player.x * multiplier + (player.w * multiplier) / 2;
        const playerCenterY = player.y * multiplier + (player.h * multiplier) / 2;
        
        const offsetX = canvasWidth / 2 - playerCenterX;
        const offsetY = canvasHeight / 2 - playerCenterY;

        // Calculate the NPC's scaled and offset drawing position (dx, dy)
        const scaledNPCX = this.x * multiplier;
        const scaledNPCY = this.y * multiplier;
        
        const dx = scaledNPCX + offsetX;
        const dy = scaledNPCY + offsetY;
        
        // Scaled dimensions are used for centering the rotation (aligning the center of the car on the map)
        const scaledW = this.w * multiplier; 
        const scaledH = this.h * multiplier;
        
        // Unscaled dimensions are used for drawing the sprite (keeping the original size)
        const unscaledW = this.w; 
        const unscaledH = this.h;
        
        ctx.save();

        // Translate to the center of the NPC's world position (scaled by 6)
        ctx.translate(dx + scaledW / 2, dy + scaledH / 2);
        
        // Rotate the context by the NPC's direction angle PLUS 90 degree offset
        ctx.rotate(this.direction + Math.PI / 2); 

        if (this.sprite.complete) {
            // Draw the sprite using UN-SCALED dimensions, offset by half its UN-SCALED size
            ctx.drawImage(this.sprite, -unscaledW / 2, -unscaledH / 2, unscaledW, unscaledH);
        } else {
            // Fallback uses UN-SCALED dimensions
            ctx.fillStyle = this.color;
            ctx.fillRect(-unscaledW / 2, -unscaledH / 2, unscaledW, unscaledH);
        }
        
        ctx.restore();

        // --- Debug drawing for nodes (keep scaled for visibility on the scaled map) ---
        this.nodes.forEach(node => {
            ctx.fillStyle = node.hasPassed ? 'green' : 'red';
            ctx.beginPath();
            
            // Calculate node's position relative to the camera
            const nodeDx = node.x * multiplier + offsetX;
            const nodeDy = node.y * multiplier + offsetY;
            
            // Node radius is large (20 units unscaled) for visibility
            ctx.arc(nodeDx, nodeDy, 20, 0, Math.PI * 2); 
            ctx.fill();
        });
    }
};
export default NPC;

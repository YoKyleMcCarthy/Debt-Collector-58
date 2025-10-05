import EntityManager from "./EntityManager.js";
import Player from "./Player.js";
import NPC from "./NPC.js";
import Map from "./Map.js"


window.onload = () => {
    let canvas;
    let ctx;
    let player = new Player();
    let map = null;
    let shouldSpawnNPC = true;
    let entityCount = 2;
    
    // --- SCORE & HIGH SCORE INITIALIZATION ---
    player.money = 0; // Initialize player score
    const HS_KEY = 'debtCollectorHighScore';
    let highScore = 0;
    
    const loadHighScore = () => {
        const storedScore = localStorage.getItem(HS_KEY);
        highScore = storedScore ? parseInt(storedScore, 10) : 0;
    };

    const saveHighScore = (score) => {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem(HS_KEY, highScore.toString());
        }
    };
    // --- END SCORE & HIGH SCORE INITIALIZATION ---

    // --- STATE & TIMER INITIALIZATION ---
    const GAME_STATES = { START_MENU: 'start_menu', RUNNING: 'running', GAME_OVER: 'game_over' };
    let currentState = GAME_STATES.START_MENU; // START GAME IN START MENU
    const MAX_GAME_TIME = 1000; // 30 seconds
    let gameTime = MAX_GAME_TIME;
    // --- END STATE & TIMER INITIALIZATION ---
    
    // Interval IDs for stopping the game logic when finished
    let spawnIntervalId;
    let timerIntervalId;

    const entityManager = new EntityManager()

    // Function to reset the game to its initial state
    const resetGame = () => {
        // --- FIX: Use the Player's intended starting position and angle ---
        player.x = 883.63; 
        player.y = 525.54;
        player.angle = 90; // Starting angle from Player.js constructor
        // --- END FIX ---

        // Reset velocities
        player.xVel = 0;
        player.yVel = 0;
        
        // Reset player money/score
        player.money = 0; 

        // Reset timer and entity count
        gameTime = MAX_GAME_TIME;
        entityCount = 2; 
        shouldSpawnNPC = true;
        
        // Clear all existing entities (except walls/map)
        const playerIndex = entityManager.entities.findIndex(e => e.name === "player");
        const wallEntities = entityManager.entities.filter(e => e.name.startsWith("wall"));
        
        // Reset entities list to only include the player and walls
        entityManager.entities = [player, ...wallEntities]; 

        // Re-add initial NPC (name "1" or "2" based on entityCount reset)
        entityManager.addEntity(new NPC("1", 100, 100));

        currentState = GAME_STATES.RUNNING;
        console.log("Game Restarted!");
    };

    const init = () => {
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext('2d');
        if(!ctx) {
            console.log("We got a problem lol")
        }
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Load high score from local storage
        loadHighScore();

        const spritesheet = new Image();
        spritesheet.src = "./Assets/Map/SpriteSheet.png";
        spritesheet.onload = () => {
            map = new Map(spritesheet);
            // 1. Get wall data from the map
            const collisionEntities = map.getCollisionEntities();
            
            // 2. Load wall data into the entity manager
            entityManager.loadCollisionLayer(collisionEntities); 
        }

        // NPC spawning timer (runs every 4.2 seconds)
        spawnIntervalId = setInterval(() => {
            if (currentState === GAME_STATES.RUNNING) {
                shouldSpawnNPC = true;
            }
        }, 4200);
        
        // --- TIMER COUNTDOWN LOGIC ---
        // Use a dedicated 1000ms interval for precise second countdown
        timerIntervalId = setInterval(() => {
            if (currentState === GAME_STATES.RUNNING && gameTime > 0) {
                gameTime--;
                if (gameTime <= 0) {
                    currentState = GAME_STATES.GAME_OVER;
                }
            }
        }, 1000);
        // --- END TIMER COUNTDOWN LOGIC ---
        
        // --- INPUT FOR START / RESTART ---
        addEventListener("keydown", (e) => {
            if (e.key === " ") {
                e.preventDefault(); // Prevent accidental scrolling
                
                if (currentState === GAME_STATES.START_MENU) {
                    currentState = GAME_STATES.RUNNING;
                    console.log("Game Started!");
                } else if (currentState === GAME_STATES.GAME_OVER) {
                    resetGame();
                }
            }
        });
        // --- END INPUT FOR START / RESTART ---

        entityManager.addEntity(player);
        // Ensure initial NPC is created with a string name
        entityManager.addEntity(new NPC("1", 100,100)); 
    }
    
    // --- DRAW MONEY HUD FUNCTION (FIX) ---
    const drawHUD = (ctx, player) => {
        if (currentState === GAME_STATES.RUNNING || currentState === GAME_STATES.GAME_OVER) {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.font = "bold 20px Inter, sans-serif"; 
            ctx.textAlign = 'left';
            // Draw Money in the top left corner (fixed viewport position)
            ctx.fillText(`Money: $${player.money || 0}`, 20, 30);
            ctx.restore();
        }
    };
    // --- END DRAW MONEY HUD FUNCTION ---
    
    // --- DRAW OVERLAY FUNCTION ---
    const drawOverlay = (ctx) => {
        
        // --- START MENU LOGIC ---
        if (currentState === GAME_STATES.START_MENU) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(0, 0, canvas.width, canvas.height); 

            // Title
            ctx.font = 'bold 80px Inter, sans-serif';
            ctx.fillStyle = '#FFD700'; 
            ctx.textAlign = 'center';
            ctx.fillText('Debt Collector - 58', canvas.width / 2, canvas.height / 2 - 150);

            // Instructions
            ctx.font = '32px Inter, sans-serif';
            ctx.fillStyle = '#ADD8E6'; 
            ctx.fillText('Instructions:', canvas.width / 2, canvas.height / 2 - 50);

            ctx.font = '24px Inter, sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText('You are hired as a Debt Collector to smash cars.', canvas.width / 2, canvas.height / 2 - 10);
            ctx.fillText('Watch out for police officers (future feature) — they will take half your earnings!', canvas.width / 2, canvas.height / 2 + 30);
            
            // Start Prompt
            ctx.font = 'bold 40px Inter, sans-serif';
            ctx.fillStyle = '#32CD32'; 
            ctx.fillText('PRESS SPACEBAR TO START', canvas.width / 2, canvas.height / 2 + 150);
            
            return; 
        }
        // --- END START MENU LOGIC ---


        // Timer display (only if not START_MENU)
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        ctx.font = 'bold 48px Inter, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        // Display timer at the top center
        ctx.fillText(`Time Left: ${timeString}`, canvas.width / 2, 60); 

        if (currentState === GAME_STATES.GAME_OVER) {
            
            const currentScore = player.money || 0;
            const isNewHighScore = currentScore > highScore; 
            
            // --- HIGH SCORE LOGIC: Check and Save New High Score (updates 'highScore' globally) ---
            saveHighScore(currentScore);
            
            // Draw Game Over message
            ctx.font = 'bold 100px Inter, sans-serif';
            ctx.fillStyle = 'rgba(255, 0, 0, 0.9)'; 
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 120); 

            // --- NEW HIGH SCORE DISPLAY ---
            if (isNewHighScore) {
                ctx.font = 'bold 54px Inter, sans-serif';
                ctx.fillStyle = '#FFA500'; 
                ctx.fillText('NEW HIGH SCORE!', canvas.width / 2, canvas.height / 2 - 50); 
            }
            // --- END NEW HIGH SCORE DISPLAY ---
            
            // --- DRAW CURRENT SCORE ---
            const scoreText = `Score: $${currentScore}`; 
            ctx.font = '48px Inter, sans-serif';
            ctx.fillStyle = 'yellow';
            ctx.fillText(scoreText, canvas.width / 2, canvas.height / 2 + 0); 
            // --- END DRAW CURRENT SCORE ---

            // --- DRAW HIGH SCORE ---
            const highScoreText = `High Score: $${highScore}`; 
            ctx.font = '36px Inter, sans-serif';
            ctx.fillStyle = '#FFD700'; 
            ctx.fillText(highScoreText, canvas.width / 2, canvas.height / 2 + 50); 
            // --- END DRAW HIGH SCORE ---

            // Draw Restart prompt
            ctx.font = '28px Inter, sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText('Hit SPACE BAR to Restart', canvas.width / 2, canvas.height / 2 + 120); 
        }
    };
    // --- END DRAW OVERLAY FUNCTION ---

    const update = (ctx) => {
        if(map != null) map.update(ctx, player);
        
        // Always check collision to stop the car immediately upon impact
        entityManager.checkCollision();

        if (currentState === GAME_STATES.RUNNING) {
            
            if(shouldSpawnNPC) {
                // Use entityCount for unique names
                entityManager.addEntity(new NPC((entityCount++).toString(), 100,100));
                shouldSpawnNPC = false;
                console.log("Spawning NPC. Total: " + entityCount);
            }
            
            // Update movement for player and NPCs
            entityManager.update(ctx, player);
        }
        // If GAME_OVER or START_MENU, entity movement updates are skipped.
    }
    
    const render = (ctx) => {
        ctx.fillStyle = "black";
        ctx.fillRect(0,0, canvas.width, canvas.height);

        if(map != null) map.draw(ctx, player);

        entityManager.draw(ctx, player);
        
        // --- DRAW TIMER/MENU OVERLAY (top center and full screen messages) ---
        drawOverlay(ctx);
        
        // --- DRAW MONEY HUD (top left) ---
        drawHUD(ctx, player);
        // --- END DRAW MONEY HUD ---
    }

    const run = () => {
        // Main game loop runs at 60 FPS
        setInterval(() => {
            update(ctx);
            render(ctx);
        }, 1000/60);
    }
    
    addEventListener("resize", (e) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    init();
    run();
}

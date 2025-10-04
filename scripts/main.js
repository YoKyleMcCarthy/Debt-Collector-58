import EntityManager from "./EntityManager.js";
import Player from "./Player.js";


window.onload = () => {
    let canvas;
    let ctx;
    let player = new Player();

    const entityManager = new EntityManager()
    const init = () => {
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext('2d');
        if(!ctx) {
            console.log("We got a problem lol")
        }
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        entityManager.addEntity(player);
    }
    const update = (ctx) => {
        entityManager.update(ctx);
    }
    const render = (ctx) => {
        ctx.fillStyle = "black";
        ctx.fillRect(0,0, canvas.width, canvas.height);

        entityManager.draw(ctx);
    }

    const run = () => {
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
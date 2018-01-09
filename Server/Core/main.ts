const W = 1/Math.sqrt(3);
const H = 1;
let width = 650;
let height = 650;

class Main {
    static TWO_PI: number;

    static app: PIXI.Application;
    static dim: Dim;
    static im: PIXI.interaction.InteractionManager;
    static debugG: PIXI.Graphics;
    public static setup(){
        Main.TWO_PI = Math.PI*2;

        Main.app = new PIXI.Application({ width: width, height: height, forceCanvas: true });
        document.body.appendChild(Main.app.view);
        ($(document) as any).on("keydown",UI.keyDown);
        ($(document) as any).on("keyup",UI.keyUp);
        ($(document) as any).on("mousedown",UI.mbDown);
        ($(document) as any).on("mouseup",UI.mbUp);

        Main.im = Main.app.renderer.plugins.interaction;
        
        
        View.setup();
        Material.setup();
        Solid.setup();
        Tile.setup();

        Main.dim = new Dim();
        new View(Main.dim, new PVector(0,0), 15);

        let solid = new Solid({dim: Main.dim, x: 2, y: 2.1, color: 0xbb00ff, bound: Bound.ellipse(1,1,6), width: 1, height: 1});
        
        Main.debugG = new PIXI.Graphics();
        Main.app.stage.addChild(Main.debugG);

        //Main.debugG.beginFill(0xffff00);
        //g.drawRect(200,200,Main.app.view.width-400,Main.app.view.height-400);
        

        console.log('Hello World');

        Main.draw();
    }
    public static update(){
        UI.update();

        Solid.solids.forEach(s=>s.update())
    }
    public static draw(){
        
        //Main.debugG.clear();

        //keep up with update speed
        Main.update();

        View.draw();
        
        requestAnimationFrame(Main.draw);
    }

    public static mod(n: number, m: number){
        return ((n%m)+m)%m;
    }
    public static angleDif(a: number, b: number){
        return Math.abs(Main.mod((b-a)+Math.PI,Main.TWO_PI)-Math.PI);
    }
}

Main.setup();
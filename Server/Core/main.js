var W = 1 / Math.sqrt(3);
var H = 1;
var width = 650;
var height = 650;
var Main = /** @class */ (function () {
    function Main() {
    }
    Main.setup = function () {
        Main.TWO_PI = Math.PI * 2;
        Main.app = new PIXI.Application({ width: width, height: height, forceCanvas: true });
        document.body.appendChild(Main.app.view);
        $(document).on("keydown", UI.keyDown);
        $(document).on("keyup", UI.keyUp);
        $(document).on("mousedown", UI.mbDown);
        $(document).on("mouseup", UI.mbUp);
        Main.im = Main.app.renderer.plugins.interaction;
        View.setup();
        Material.setup();
        Solid.setup();
        Tile.setup();
        Main.dim = new Dim();
        new View(Main.dim, new PVector(0, 0), 15);
        var solid = new Solid({ dim: Main.dim, x: 2, y: 2.1, color: 0xbb00ff, bound: Bound.ellipse(1), width: 1, height: 1 });
        Main.debugG = new PIXI.Graphics();
        Main.app.stage.addChild(Main.debugG);
        //Main.debugG.beginFill(0xffff00);
        //g.drawRect(200,200,Main.app.view.width-400,Main.app.view.height-400);
        console.log('Hello World');
        Main.draw();
    };
    Main.update = function () {
        UI.update();
        Solid.solids.forEach(function (s) { return s.update(); });
    };
    Main.draw = function () {
        //Main.debugG.clear();
        //keep up with update speed
        Main.update();
        View.draw();
        requestAnimationFrame(Main.draw);
    };
    Main.mod = function (n, m) {
        return ((n % m) + m) % m;
    };
    Main.angleDif = function (a, b) {
        return Math.abs(Main.mod((b - a) + Math.PI, Main.TWO_PI) - Math.PI);
    };
    return Main;
}());
Main.setup();

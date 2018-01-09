var View = /** @class */ (function () {
    function View(dim, pos, height) {
        this.root = new PIXI.Container();
        Main.app.stage.addChild(this.root);
        this.blockG = new PIXI.Graphics();
        this.root.addChild(this.blockG);
        this.solidG = new PIXI.Graphics();
        this.root.addChild(this.solidG);
        this.dim = dim;
        this.pos = pos;
        this.height = height;
        View.views.push(this);
    }
    View.setup = function () {
        View.views = [];
    };
    View.draw = function () {
        View.views.forEach(function (v) { return v.draw(); });
    };
    View.prototype.draw = function () {
        //move the view
        //if needed, recalculate it
        var _this = this;
        var moveSpeed = .2;
        UI.holds.add('key_w', new NamedFunction('move', function () { return _this.pos.setY(_this.pos.getY() - moveSpeed); }));
        UI.holds.add('key_a', new NamedFunction('move', function () { return _this.pos.setX(_this.pos.getX() - moveSpeed); }));
        UI.holds.add('key_s', new NamedFunction('move', function () { return _this.pos.setY(_this.pos.getY() + moveSpeed); }));
        UI.holds.add('key_d', new NamedFunction('move', function () { return _this.pos.setX(_this.pos.getX() + moveSpeed); }));
        UI.downs.add('mb_0', new NamedFunction('place', function () { return console.log(_this.pixelToGrid(UI.mouseX(), UI.mouseY())); }));
        UI.downs.add('mb_0', new NamedFunction('place', function () {
            var v = _this.pixelToGrid(UI.mouseX(), UI.mouseY());
            _this.dim.setAt(v.getX(), v.getY(), Material.byID[(_this.dim.getAt(v.getX(), v.getY()).id + 1) % 5]);
        }));
        UI.holds.add('mb_1', new NamedFunction('mclick', function () {
            for (var i = 0; i < Dim.w; i++) {
                for (var j = 0; j < Dim.h; j++) {
                    _this.dim.set(i, j, Material.byID[0]);
                }
            }
            Main.debugG.clear();
            Main.debugG.lineStyle(5, 0xff0000);
            Main.debugG.drawRect(UI.mouseX(), UI.mouseY(), width / 2 - UI.mouseX(), height / 2 - UI.mouseY());
            var pos1 = _this.pixelToGrid(width / 2, height / 2);
            var pos2 = _this.pixelToGrid(UI.mouseX(), UI.mouseY());
            var tiles = _this.dim.tilesInRegion(pos1.x, pos1.y, pos2.x, pos2.y);
            tiles.forEach(function (t) { return _this.dim.set(Main.mod(t.x, Dim.w), Main.mod(t.y, Dim.h), Material.byID[1]); });
        }));
        this.blockG.clear();
        this.solidG.clear();
        this.blockG.beginFill(0x00ff00);
        var gridX = Math.floor(this.pos.getX() / W) * W + W / 2;
        var gridY = Math.floor(this.pos.getY() / H) * H + H / 2;
        var gridOffX = Main.mod(this.pos.getX(), W);
        var gridOffY = Main.mod(this.pos.getY(), H);
        var gridW = (width * this.height / height);
        var gridH = (this.height);
        var screenW = width / gridW;
        var screenH = height / gridH;
        for (var i = -W, _i = gridW + 3.1 * W; i < _i; i += W) {
            for (var j = -H, _j = gridH + 2.1 * H; j < _j; j += H) {
                var iOff = i - gridOffX;
                var jOff = j - gridOffY;
                this.blockG.beginFill(this.dim.getLeft(gridX + i, gridY + j).color);
                if (this.dim.isUp(gridX + i, gridY + j)) {
                    this.blockG.drawPolygon([iOff * screenW, jOff * screenH, (iOff + W) * screenW, (jOff + H) * screenH, (iOff - W) * screenW, (jOff + H) * screenH]);
                }
                else {
                    this.blockG.drawPolygon([iOff * screenW, (jOff + H) * screenH, (iOff + W) * screenW, jOff * screenH, (iOff - W) * screenW, jOff * screenH]);
                }
                this.blockG.endFill();
                var solids = this.dim.solidsAt(gridX + i, gridY + j);
                for (var k = 0; k < solids.length; k++) {
                    this.solidG.beginFill(solids[k].c);
                    solids[k].draw(this.solidG, (iOff + Main.mod(solids[k].p.getX(), W)) * screenW, (jOff + Main.mod(solids[k].p.getY(), H)) * screenH, screenW, screenH);
                    this.solidG.endFill();
                }
            }
        }
    };
    View.prototype.pixelToGrid = function (x, y) {
        var gridX = this.pos.getX();
        var gridY = this.pos.getY();
        var gridW = (width * this.height / height);
        var gridH = (this.height);
        var screenW = width / gridW;
        var screenH = height / gridH;
        return new PVector(gridX + x / width * gridW, gridY + y / height * gridH);
    };
    return View;
}());

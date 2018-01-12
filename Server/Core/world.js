var Dim = /** @class */ (function () {
    function Dim() {
        Dim.dimensions.push(this);
        this.blocks = [];
        for (var i = 0; i < Dim.w; i++) {
            this.blocks[i] = [];
            for (var j = 0; j < Dim.h; j++) {
                this.blocks[i][j] = new Tile(this, i, j);
            }
        }
        for (var i = 0; i < Dim.w; i++) {
            for (var j = 0; j < Dim.h; j++) {
                this.blocks[i][j].setup();
            }
        }
    }
    Dim.prototype.update = function () {
        for (var i = 0; i < Dim.w; i++) {
            for (var j = 0; j < Dim.h; j++) {
                this.blocks[i][j].update(Update.GRAVITY);
            }
        }
    };
    Dim.prototype.isUp = function (x, y) {
        return (this.getX(x) % 2 == this.getY(y) % 2);
    };
    Dim.prototype.inLeft = function (x, y) {
        //check if a point is in this triangle (left) or the next (right)
        return this.isUp(x, y) ? Main.mod(x / W, 1) < Main.mod(y / H, 1) : Main.mod(x / W, 1) + Main.mod(y / H, 1) < 1;
    };
    Dim.prototype.getAt = function (x, y) {
        return this.inLeft(x, y) ? this.getLeft(x, y) : this.getRight(x, y);
    };
    Dim.prototype.setAt = function (x, y, m) {
        if (this.inLeft(x, y)) {
            this.setLeft(x, y, m);
        }
        else {
            this.setRight(x, y, m);
        }
    };
    Dim.prototype.originAt = function (pos) {
        var result = new PVector(Math.floor(pos.getX() / W) * W, Math.floor(pos.getY() / H) * H);
        if (!this.inLeft(pos.getX(), pos.getY())) {
            result.setX(result.getX() + W);
        }
        return result;
    };
    Dim.prototype.isUpAt = function (x, y) {
        return this.inLeft(x, y) ? this.isUp(x, y) : !this.isUp(x, y);
    };
    Dim.prototype.get = function (x, y) {
        return this.blocks[x][y];
    };
    Dim.prototype.getLeft = function (x, y) {
        return this.blocks[this.getX(x)][this.getY(y)];
    };
    Dim.prototype.getRight = function (x, y) {
        return this.getLeft(x + W, y);
    };
    Dim.prototype.set = function (x, y, m) {
        this.blocks[x][y].m = m;
    };
    Dim.prototype.setLeft = function (x, y, m) {
        this.blocks[this.getX(x)][this.getY(y)].m = m;
    };
    Dim.prototype.setRight = function (x, y, m) {
        this.setLeft(x + W, y, m);
    };
    Dim.prototype.getX = function (x) {
        return Math.floor(Main.mod(x / W, Dim.w));
    };
    Dim.prototype.getY = function (y) {
        return Math.floor(Main.mod(y / H, Dim.h));
    };
    Dim.prototype.shiftX = function (x, off) {
        return Main.mod(x + off, Dim.w);
    };
    Dim.prototype.shiftY = function (y, off) {
        return Main.mod(y + off, Dim.h);
    };
    /*
    blocksInRegion(x1: number, y1: number, x2: number, y2: number){
        let toReturn: ({p: PVector, b: Material[]})[] = [];
        
        for(let i = (Math.ceil(x1/W)+.00001)*W, _i = x2; i < _i; i+=W){
            for(let j = (Math.ceil(y1/H)+.00001)*H, _j = y2; j < _j; j+=H){
                let tx = this.getX(i);
                let ty = this.getY(j);
                if(tx%2 == ty%2){
                    toReturn.push({
                        p: new PVector(i,j),
                        b: [
                            this.blocks[tx][ty],
                            this.blocks[this.shiftX(tx,-1)][ty],
                            this.blocks[this.shiftX(tx,-1)][this.shiftY(ty,-1)],
                            this.blocks[tx][this.shiftY(ty,-1)],
                            this.blocks[this.shiftX(tx,1)][this.shiftY(ty,-1)],
                            this.blocks[this.shiftX(tx,1)][ty]
                        ]
                    });
                }
            }
        }
        return toReturn;
    }
    */
    Dim.prototype.tilesInRegion = function (x1, y1, x2, y2) {
        var toReturn = [];
        for (var i = Math.floor(x1 / W), __i = i, _i = Math.floor(x2 / W) + 1; i <= _i; i++) {
            for (var j = Math.floor(y1), __j = j, _j = Math.floor(y2); j <= _j; j++) {
                var trueI = Main.mod(i, Dim.w);
                var trueJ = Main.mod(j, Dim.h);
                if (i == __i && j == __j && !(trueI % 2 == trueJ % 2 || this.inLeft(x1, y1))) {
                    continue;
                }
                if (i == _i && j == __j && !(trueI % 2 == trueJ % 2 || !this.inLeft(x2, y1))) {
                    continue;
                }
                if (i == __i && j == _j && !(trueI % 2 != trueJ % 2 || this.inLeft(x1, y2))) {
                    continue;
                }
                if (i == _i && j == _j && !(trueI % 2 != trueJ % 2 || !this.inLeft(x2, y2))) {
                    continue;
                }
                toReturn.push(new PVector(i, j));
            }
        }
        return toReturn;
    };
    Dim.prototype["export"] = function () {
        var result = [];
        for (var i = 0; i < Dim.w; i++) {
            result[i] = [];
            for (var j = 0; j < Dim.h; j++) {
                result[i][j] = this.blocks[i][j]["export"]();
            }
        }
        return result;
    };
    Dim.prototype["import"] = function (data) {
        for (var i = 0; i < Dim.w; i++) {
            for (var j = 0; j < Dim.h; j++) {
                this.blocks[i][j]["import"](data[i][j]);
            }
        }
    };
    Dim.dimensions = [];
    Dim.w = 48;
    Dim.h = 24;
    return Dim;
}());
var Tile = /** @class */ (function () {
    function Tile(dim, i, j) {
        this.dim = dim;
        this.i = i;
        this.j = j;
        this.updated = -1;
        this.m = Material.byID[0];
        this.name = "(" + i + "," + j + ")";
        this.solids = [];
        this.gravity = new PVector();
        this.surfaceDis = Infinity;
    }
    Tile.setup = function () {
        Tile.axisParas = Bound.findParas([new PVector(W, H), new PVector(-W, H), new PVector(0, 0)]);
        Tile.axisOrths = Bound.findOrths(Tile.axisParas);
    };
    Tile.prototype.setup = function () {
        this.isUp = this.i % 2 == this.j % 2;
        this.left = this.dim.get(this.dim.shiftX(this.i, -1), this.j);
        this.right = this.dim.get(this.dim.shiftX(this.i, 1), this.j);
        this.vert = this.dim.get(this.i, this.dim.shiftY(this.j, this.isUp ? 1 : -1));
        this.leftDir = new UnitVector(-3 * W, this.isUp ? -H : H);
        this.rightDir = new UnitVector(3 * W, this.isUp ? -H : H);
        this.vertDir = new UnitVector(0, this.isUp ? 1 : -1);
    };
    Tile.prototype.registerSolid = function (s) {
        this.solids.push(s);
    };
    Tile.prototype.unregisterSolid = function (s) {
        this.solids = this.solids.filter(function (_s) { return _s.id != s.id; });
    };
    Tile.prototype.update = function (type) {
        var sides = [{ t: this.left, d: this.leftDir }, { t: this.right, d: this.rightDir }, { t: this.vert, d: this.vertDir }];
        if (type == Update.GRAVITY) {
            var newGravity_1 = new PVector();
            sides.forEach(function (s) {
                if (s.t.m.solid) {
                    newGravity_1.addX(s.d.x * s.t.m.mass);
                    newGravity_1.addY(s.d.y * s.t.m.mass);
                }
            });
            var maxGravityNear_1 = PVector.zero;
            sides.forEach(function (s) {
                if (s.t.gravity.getMag() > maxGravityNear_1.getMag()) {
                    maxGravityNear_1 = s.t.gravity;
                }
            });
            if (maxGravityNear_1.getMag() * .9 > newGravity_1.getMag()) {
                VecOp.match(newGravity_1, maxGravityNear_1);
                VecOp.mult(newGravity_1, .9);
            }
            //newGravity = new PVector();
            if (newGravity_1.x != this.gravity.x || newGravity_1.y != this.gravity.y) {
                if (newGravity_1.getMag() > 0 && this.gravity.getMag() > 0) {
                    //console.log(newGravity,this.gravity);
                }
                this.gravity = newGravity_1;
                sides.forEach(function (s) { return s.t.update(Update.GRAVITY); });
            }
        }
        else if (type == Update.TEST) {
            this.m = Material.byName['red'];
            sides.forEach(function (s) { return s.t.m = Material.byName['red']; });
        }
    };
    Tile.prototype["export"] = function () {
        return this.m.name;
    };
    Tile.prototype["import"] = function (data) {
        this.m = Material.byName[data];
    };
    return Tile;
}());
var Update = /** @class */ (function () {
    function Update() {
    }
    Update.GRAVITY = 0;
    Update.TEST = 99;
    return Update;
}());

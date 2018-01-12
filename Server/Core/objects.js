var Solid = /** @class */ (function () {
    function Solid(args) {
        //dim, x, y, color, w, h, mass, bound, deltaMove, deltaTouch
        var _this = this;
        this.dim = args.dim;
        this.p = new PVector(args.x || 0, args.y || 0);
        this._p = new PVector(args.x || 0, args.y || 0);
        this.v = new PVector();
        this.a = new PVector();
        this.c = args.color || 0xff0000;
        this.w = args.width || 1;
        this.h = args.height || 1;
        this.mass = args.mass || .001;
        this.bound = args.bound || Bound.ellipse(this.w);
        this.deltaMove = args.deltaMove || this.bound.length > 1 ? VecOp.dis(this.bound[0], this.bound[1]) : this.w / 10;
        this.deltaTouch = args.deltaTouch || this.deltaMove / 10;
        this.boundWidth = this.w / 4;
        this.boundHeight = this.w / 4 / W;
        this.gridTile = undefined;
        this.tile = undefined;
        this.tiles = [];
        if (this.dim == undefined) {
            console.error("object created no dimension!");
        }
        if (this.deltaMove < 0.01) {
            console.error("object created with delta move of " + this.deltaMove + "!");
            this.deltaMove = 0.01;
        }
        if (this.deltaTouch < 0.0001) {
            console.error("object created with small touch distance of " + this.deltaTouch + "!");
            this.deltaTouch = 0.0001;
        }
        /*
        //calculate bounding boxes and circles
        this.innerRadius = Number.POSITIVE_INFINITY;
        this.outerRadius = 0;
        this.innerBox = new PVector(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        this.outerBox = new PVector(0,0);
        for(let i = 0; i < this.bound.length; i++){
            let a = this.bound[i];
            let b = this.bound[Main.mod(i+1,this.bound.length)];
            let c = new PVector(b.getX()-a.getX(), b.getY()-a.getY());
            for(let j = 0, dj = 1/(Math.ceil(VecOp.dis(a,b)/this.deltaTouch)+.5); j < 1; j+=dj){
                let d = new PVector(a.getX()+c.getX()*j, a.getY()+c.getY()*j);
                if(d.getMag() < this.innerRadius){
                    this.innerRadius = d.getMag();
                }
                if(Math.abs(d.getX()) < this.innerBox.getX() && Math.abs(d.getY()) < this.innerBox.getY()){
                    this.innerBox.setX(Math.max(Math.abs(d.getX()), Math.abs(d.getY())));
                    this.innerBox.setY(this.innerBox.getX());
                }
            }
            if(a.getMag() > this.outerRadius){
                this.outerRadius = a.getMag();
            }
            if(Math.abs(a.getX()) > this.outerBox.getX()){
                this.outerBox.setX(Math.abs(a.getX()));
            }
            if(Math.abs(a.getY()) > this.outerBox.getY()){
                this.outerBox.setY(Math.abs(a.getY()));
            }
        }
        VecOp.mult(this.innerBox,2);
        VecOp.mult(this.outerBox,2);

        this.boundParas = Bound.findParas(this.bound);
        this.boundOrths = Bound.findOrths(this.boundParas);
        
        console.log(this.boundParas);
        console.log(this.bound);
        */
        var speed = .004;
        UI.downs.add('key_i', new NamedFunction('move', function () { return _this.a.addY(-speed); }));
        UI.downs.add('key_j', new NamedFunction('move', function () { return _this.a.addX(-speed); }));
        UI.downs.add('key_k', new NamedFunction('move', function () { return _this.a.addY(speed); }));
        UI.downs.add('key_l', new NamedFunction('move', function () { return _this.a.addX(speed); }));
        UI.ups.add('key_i', new NamedFunction('move', function () { if (_this.a.getY() < 0) {
            _this.a.setY(0);
        } }));
        UI.ups.add('key_j', new NamedFunction('move', function () { if (_this.a.getX() < 0) {
            _this.a.setX(0);
        } }));
        UI.ups.add('key_k', new NamedFunction('move', function () { if (_this.a.getY() > 0) {
            _this.a.setY(0);
        } }));
        UI.ups.add('key_l', new NamedFunction('move', function () { if (_this.a.getX() > 0) {
            _this.a.setX(0);
        } }));
        UI.downs.add('key_e', new NamedFunction('export', function () { return console.log(JSON.stringify(_this.dim["export"]())); }));
        this.id = Math.floor(Math.random() * Number.MAX_VALUE);
        Solid.solids.push(this);
    }
    Solid.setup = function () {
        Solid.solids = [];
    };
    Solid.prototype.update = function () {
        VecOp.match(this._p, this.p);
        VecOp.add(this.v, this.a);
        if (this.tile != undefined) {
            this.v.addX(this.tile.gravity.x * this.mass);
            this.v.addY(this.tile.gravity.y * this.mass);
        }
        this.tiles.forEach(function (t) { return t.m = Material.byName['red']; });
        var drag = Damper.none;
        this.tiles.forEach(function (t) {
            drag = drag.add(t.m.drag);
        });
        VecOp.setMag(this.v, drag.apply(this.v.getMag()));
        var movement = this.v;
        var moves = 6;
        var _loop_1 = function () {
            var move = this_1.moveBy(movement);
            if (move.hit == false) {
                moves = 0;
            }
            else {
                var friction_1 = Damper.none;
                var bounce_1 = Damper.none;
                move.tiles.forEach(function (t) {
                    friction_1 = friction_1.add(t.m.friction);
                    bounce_1 = bounce_1.add(t.m.bounce);
                });
                movement = move.remainder;
                var para = friction_1.apply(VecOp.dot(movement, Tile.axisParas[move.axis]));
                var orth = bounce_1.apply(VecOp.dot(movement, Tile.axisOrths[move.axis]));
                movement = new PVector(Tile.axisParas[move.axis].x * para - Tile.axisOrths[move.axis].x * orth, Tile.axisParas[move.axis].y * para - Tile.axisOrths[move.axis].y * orth);
                para = friction_1.apply(VecOp.dot(this_1.v, Tile.axisParas[move.axis]));
                orth = bounce_1.apply(VecOp.dot(this_1.v, Tile.axisOrths[move.axis]));
                this_1.v = new PVector(Tile.axisParas[move.axis].x * para - Tile.axisOrths[move.axis].x * orth, Tile.axisParas[move.axis].y * para - Tile.axisOrths[move.axis].y * orth);
                ;
                /*
                Main.debugG.clear();
                Main.debugG.lineStyle(10,0x0000ff);
                Main.debugG.moveTo(width/2-width/4*hit.surface[0].x,height/2-width/4*hit.surface[0].y);
                Main.debugG.lineTo(width/2+width/4*hit.surface[0].x,height/2+width/4*hit.surface[0].y);

                Main.debugG.lineStyle(10,0xff0000);
                Main.debugG.moveTo(width/2-width/4*hit.surface[1].x,height/2-width/4*hit.surface[1].y);
                Main.debugG.lineTo(width/2+width/4*hit.surface[1].x,height/2+width/4*hit.surface[1].y);

                Main.debugG.lineStyle(10,0x00ff00);
                Main.debugG.moveTo(width/2,height/2);
                Main.debugG.lineTo(width/2+width*-6*this.v.x,height/2+width*-6*this.v.y);

                Main.debugG.lineStyle(10,0xffff00);
                Main.debugG.moveTo(width/2,height/2);
                Main.debugG.lineTo(width/2+width*10*movement.x,height/2+width*10*movement.y);
                */
                //VecOp.mult(movement,-1)
                moves--;
                if (moves == 0) {
                    console.log('An object ran out of bounces! It may be stuck..');
                }
            }
        };
        var this_1 = this;
        while (moves > 0) {
            _loop_1();
        }
        if (this.gridTile != undefined) {
            this.gridTile.unregisterSolid(this);
        }
        ;
        this.gridTile = this.dim.getLeft(this.p.x, this.p.y);
        this.tile = this.dim.getAt(this.p.x, this.p.y);
        this.tiles = this.touches();
        this.gridTile.registerSolid(this);
    };
    Solid.prototype.draw = function (g, x, y, w, h) {
        g.beginFill(this.c);
        g.drawEllipse(x, y, w * this.w / 2, h * this.h / 2);
        g.endFill();
        g.beginFill(0);
        for (var i = 0; i < this.bound.length; i++) {
            g.drawEllipse(x + w * this.bound[i].getX(), y + h * this.bound[i].getY(), w * this.h / 2 / 10, h * this.h / 2 / 10);
        }
        g.endFill();
    };
    Solid.prototype.moveBy = function (offset) {
        var _this = this;
        if (offset.getX() == 0 && offset.getY() == 0) {
            return { hit: false, dis: 1, tiles: [], axis: 0, remainder: new PVector() };
        }
        var rotate = function (v, para, orth) {
            return new PVector(para.x * v.x + orth.x * v.y, para.y * v.x + orth.y * v.y);
        };
        var unRotate = function (v, para, orth) {
            return new PVector(VecOp.dot(v, para), VecOp.dot(v, orth));
        };
        var tryDir = function (axis) {
            //find dis to cross boundry
            var xAxis = Tile.axisParas[axis];
            var yAxis = Tile.axisOrths[axis];
            var rotPos = rotate(_this.p, xAxis, yAxis);
            var rotOffset = rotate(offset, xAxis, yAxis);
            var rotPosNew = new PVector(rotPos.x + rotOffset.x, rotPos.y + rotOffset.y);
            var thisBlock;
            var nextBlock;
            var toHit;
            if (rotOffset.y > 0) {
                thisBlock = Math.floor(rotPos.y + _this.boundHeight);
                nextBlock = Math.floor(rotPosNew.y + _this.boundHeight);
                toHit = (nextBlock - (rotPos.y + _this.boundHeight)) / rotOffset.y;
            }
            else {
                thisBlock = Math.floor(rotPos.y - _this.boundHeight);
                nextBlock = Math.floor(rotPosNew.y - _this.boundHeight);
                toHit = (nextBlock + 1 - (rotPos.y - _this.boundHeight)) / rotOffset.y;
            }
            if (thisBlock != nextBlock) {
                console.log('crossed a bound');
                var tilesAfter = _this.dim.tilesInRegion(rotPos.x + rotOffset.x * (toHit + .001) - _this.boundWidth, rotPos.y + rotOffset.y * (toHit + .001) - _this.boundHeight, rotPos.x + rotOffset.x * (toHit + .001) + _this.boundWidth, rotPos.y + rotOffset.y * (toHit + .001) + _this.boundHeight);
                tilesAfter.forEach(function (t) { return t.setXY(t.x * W, t.y * H + H / 2); });
                tilesAfter = tilesAfter.map(function (t) { return unRotate(t, xAxis, yAxis); });
                var matsAfter = tilesAfter.map(function (t) { return _this.dim.getAt(t.x, t.y); });
                if (matsAfter.some(function (t) { return t.m.solid; })) {
                    var tilesBefore = _this.dim.tilesInRegion(rotPos.x + rotOffset.x * (toHit - .001) - _this.boundWidth, rotPos.y + rotOffset.y * (toHit - .001) - _this.boundHeight, rotPos.x + rotOffset.x * (toHit - .001) + _this.boundWidth, rotPos.y + rotOffset.y * (toHit - .001) + _this.boundHeight);
                    tilesBefore.forEach(function (t) { return t.setXY(t.x * W, t.y * H + H / 2); });
                    tilesBefore = tilesBefore.map(function (t) { return unRotate(t, xAxis, yAxis); });
                    if (tilesBefore.every(function (t) { return !_this.dim.getAt(t.x, t.y).m.solid; })) {
                        var hitTiles = tilesAfter.map(function (t) { return _this.dim.getAt(t.x, t.y); });
                        var remainder = PVector.clone(offset);
                        VecOp.mult(remainder, (1 - (toHit - .001)));
                        return { hit: true, dis: toHit - .001, tiles: matsAfter.filter(function (t) { return t.m.solid; }), axis: axis, remainder: remainder };
                    }
                }
                //tilesAfter.forEach(t=>this.dim.setAt(t.x,t.y,Material.byID[4]));
                //check for solids after
                //if no solids then solids, SAVE RETURN DATA
                //return return data from side stoped earliest
            }
            return { hit: false, dis: 1, tiles: [], axis: axis, remainder: new PVector() };
        };
        var move = tryDir(0);
        var tempMove = tryDir(1);
        if (tempMove.dis < move.dis) {
            move = tempMove;
        }
        tempMove = tryDir(2);
        if (tempMove.dis < move.dis) {
            move = tempMove;
        }
        this.p.addX(offset.x * move.dis);
        this.p.addY(offset.y * move.dis);
        return move;
    };
    Solid.prototype.touches = function (offset) {
        var _this = this;
        if (offset === void 0) { offset = PVector.zero; }
        var rotate = function (v, para, orth) {
            return new PVector(para.x * v.x + orth.x * v.y, para.y * v.x + orth.y * v.y);
        };
        var unRotate = function (v, para, orth) {
            return new PVector(VecOp.dot(v, para), VecOp.dot(v, orth));
        };
        var forAxis = function (axis) {
            //find dis to cross boundry
            var xAxis = Tile.axisParas[axis];
            var yAxis = Tile.axisOrths[axis];
            var rotPosNew = rotate(new PVector(_this.p.x + offset.x, _this.p.y + offset.y), xAxis, yAxis);
            var tiles = _this.dim.tilesInRegion(rotPosNew.x - _this.boundWidth, rotPosNew.y - _this.boundHeight, rotPosNew.x + _this.boundWidth, rotPosNew.y + _this.boundHeight);
            tiles.forEach(function (t) { return t.setXY(t.x * W, t.y * H + H / 2); });
            tiles = tiles.map(function (t) { return unRotate(t, xAxis, yAxis); });
            return tiles.map(function (t) { return _this.dim.getAt(t.x, t.y); });
        };
        var tiles = [];
        var tileHash = {};
        forAxis(0).forEach(function (t) { return tileHash[t.name] = t; });
        forAxis(1).forEach(function (t) { return tileHash[t.name] = t; });
        forAxis(2).forEach(function (t) { return tileHash[t.name] = t; });
        for (var t in tileHash) {
            tiles.push(tileHash[t]);
        }
        return tiles;
    };
    Solid.prototype.containsPoint = function (angles) {
        var dirs = angles.map(function (a) { return a; }).sort(function (a, b) { return a - b; });
        var dif = 0;
        for (var i = 0; i < dirs.length; i++) {
            if (i == dirs.length - 1) {
                dif = Math.PI * 2 - dirs[dirs.length - 1] + dirs[0];
            }
            else {
                dif = dirs[i + 1] - dirs[i];
            }
            if (dif > Math.PI) {
                return false;
            }
        }
        return true;
    };
    return Solid;
}());
var Bound = /** @class */ (function () {
    function Bound() {
    }
    Bound.ellipse = function (w) {
        var bound = [];
        for (var i = 0; i < Math.PI * 2 - Math.PI / 6; i += Math.PI * 2 / 6) {
            bound.push(new PVector(Math.cos(i) * w / 2, Math.sin(i) * w / 2));
        }
        return bound;
    };
    Bound.findParas = function (pts) {
        var paras = [];
        if (pts.length > 1) {
            for (var i = 0; i < pts.length; i++) {
                paras.push(new UnitVector(pts[(i + 1) % pts.length].getX() - pts[i].getX(), pts[(i + 1) % pts.length].getY() - pts[i].getY()));
            }
        }
        return paras;
    };
    Bound.findOrths = function (paras) {
        return paras.map(function (x) {
            var v = UnitVector.clone(x);
            VecOp.orthogonal(v);
            return v;
        });
    };
    Bound.boundAngles = function (v, centerX, centerY, bound) {
        if (centerX === void 0) { centerX = 0; }
        if (centerY === void 0) { centerY = 0; }
        return bound.map(function (b) { return VecOp.dirTo(v, new PVector(centerX + b.getX(), centerY + b.getY())); });
    };
    return Bound;
}());

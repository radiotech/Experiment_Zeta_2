var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var VecOp = /** @class */ (function () {
    function VecOp() {
    }
    VecOp.unit = function (v) {
        var mag = v.getMag();
        v.setXY(v.getX() / mag, v.getY() / mag);
    };
    VecOp.setMag = function (v, magNew) {
        var mag = v.getMag();
        v.setXY(v.getX() / mag * magNew, v.getY() / mag * magNew);
    };
    VecOp.orthogonal = function (v) {
        v.setXY(v.getY(), -v.getX());
    };
    VecOp.opposite = function (v) {
        v.setXY(-v.getX(), -v.getY());
    };
    VecOp.add = function (v1, v2) {
        v1.setXY(v1.getX() + v2.getX(), v1.getY() + v2.getY());
    };
    VecOp.sub = function (v1, v2) {
        v1.setXY(v1.getX() - v2.getX(), v1.getY() - v2.getY());
    };
    VecOp.mult = function (v1, n) {
        v1.setXY(v1.getX() * n, v1.getY() * n);
    };
    VecOp.multV = function (v1, v2) {
        v1.setXY(v1.getX() * v2.getX(), v1.getY() * v2.getY());
    };
    VecOp.div = function (v1, n) {
        v1.setXY(v1.getX() * n, v1.getY() * n);
    };
    VecOp.match = function (v1, v2) {
        v1.setXY(v2.getX(), v2.getY());
    };
    VecOp.round = function (v) {
        v.setXY(Math.round(v.x), Math.round(v.y));
    };
    VecOp.dis = function (v1, v2) {
        var a = v1.getX() - v2.getX(), b = v1.getY() - v2.getY();
        return Math.sqrt(a * a + b * b);
    };
    VecOp.equal = function (v1, v2) {
        return v1.getX() == v2.getX() && v1.getY() == v2.getY();
    };
    VecOp.dot = function (v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    };
    VecOp.unitRotateTowards = function (v1, v2, dis) {
        //v1 should be a unit vector..
        //if v1 == v2, return
        if (VecOp.equal(v1, v2)) {
            return;
        }
        //if close enough, jump v1 to v2
        var check = PVector.clone(v2);
        VecOp.unit(check);
        VecOp.sub(check, v1);
        if (check.getMag() < dis) {
            VecOp.add(check, v1);
            v1.setXY(check.getX(), check.getY());
            return;
        }
        //find clockwise dis
        var turnClock = PVector.clone(v1); //v1
        VecOp.orthogonal(turnClock); //v1 clockwise 90
        VecOp.sub(turnClock, v2); //v1 clockwise dis
        //find anticlock dis
        var turnAntiClock = PVector.clone(v1); //v1
        VecOp.orthogonal(turnAntiClock); //v1 clock 90
        VecOp.opposite(turnAntiClock); //v1 anticlock 90
        VecOp.sub(turnAntiClock, v2); //v1 anticlock dis
        //choose between directions
        var temp = turnAntiClock;
        if (turnClock.getMag() < turnAntiClock.getMag()) {
            temp = turnClock;
        }
        //adjust v1
        VecOp.add(temp, v2); //v1 turn 90
        VecOp.setMag(temp, dis); //rotation vector
        VecOp.add(v1, temp); //rotate v1
        VecOp.unit(v1); //restore to unit vector
    };
    VecOp.dirOf = function (v) {
        if (v.getX() >= 0) {
            return Main.mod(Math.atan(v.getY() / v.getX()), 2 * Math.PI);
        }
        else {
            return Main.mod(Math.atan(v.getY() / v.getX()) + Math.PI, 2 * Math.PI);
        }
    };
    VecOp.dirTo = function (a, b) {
        if (b.getX() >= a.getX()) {
            return Main.mod(Math.atan((b.getY() - a.getY()) / (b.getX() - a.getX())), 2 * Math.PI);
        }
        else {
            return Main.mod(Math.atan((b.getY() - a.getY()) / (b.getX() - a.getX())) + Math.PI, 2 * Math.PI);
        }
    };
    return VecOp;
}());
var PVector = /** @class */ (function () {
    function PVector(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.setXY(x, y);
        this.mag = undefined;
    }
    PVector.setup = function () {
        PVector.zero = new ZeroVector();
    };
    //basic get/set
    PVector.prototype.getMag = function () {
        if (this.mag == undefined) {
            this.mag = Math.sqrt(this.x * this.x + this.y * this.y);
        }
        return this.mag;
    };
    PVector.prototype.getX = function () {
        return this.x;
    };
    PVector.prototype.getY = function () {
        return this.y;
    };
    PVector.prototype.setX = function (x) {
        this._x = x;
        this.x = x;
        this.mag = undefined;
    };
    PVector.prototype.setY = function (y) {
        this._y = y;
        this.y = y;
        this.mag = undefined;
    };
    PVector.prototype.addX = function (x) {
        this._x += x;
        this.x += x;
        this.mag = undefined;
    };
    PVector.prototype.addY = function (y) {
        this._y += y;
        this.y += y;
        this.mag = undefined;
    };
    PVector.prototype.setXY = function (x, y) {
        this._x = x;
        this.x = x;
        this._y = y;
        this.y = y;
        this.mag = undefined;
    };
    PVector.clone = function (v) {
        return new PVector(v.x, v.y);
    };
    return PVector;
}());
var UnitVector = /** @class */ (function (_super) {
    __extends(UnitVector, _super);
    function UnitVector(x, y) {
        if (x === void 0) { x = 1; }
        if (y === void 0) { y = 0; }
        return _super.call(this, x, y) || this;
    }
    //basic get/set
    UnitVector.prototype.getMag = function () {
        return 1;
    };
    UnitVector.prototype.setX = function (x) {
        console.log("Called setX on a unit vector!");
        _super.prototype.setX.call(this, x);
        this.fix();
    };
    UnitVector.prototype.setY = function (y) {
        console.log("Called setY on a unit vector!");
        _super.prototype.setY.call(this, y);
        this.fix();
    };
    UnitVector.prototype.addX = function (x) {
        console.log("Called addX on a unit vector!");
        _super.prototype.addX.call(this, x);
        this.fix();
    };
    UnitVector.prototype.addY = function (y) {
        console.log("Called addY on a unit vector!");
        _super.prototype.addY.call(this, y);
        this.fix();
    };
    UnitVector.prototype.setXY = function (x, y) {
        _super.prototype.setXY.call(this, x, y);
        this.fix();
    };
    UnitVector.prototype.fix = function () {
        if (this.x == 0 && this.y == 0) {
            _super.prototype.setX.call(this, 1);
        }
        else {
            var mag = Math.sqrt(this.x * this.x + this.y * this.y);
            _super.prototype.setXY.call(this, this.x / mag, this.y / mag);
        }
    };
    UnitVector.clone = function (v) {
        return new UnitVector(v.x, v.y);
    };
    return UnitVector;
}(PVector));
var ZeroVector = /** @class */ (function (_super) {
    __extends(ZeroVector, _super);
    function ZeroVector() {
        return _super.call(this, 0, 0) || this;
    }
    ZeroVector.prototype.getMag = function () {
        return 0;
    };
    ZeroVector.prototype.setX = function (x) {
        console.log("Called setX on a zero vector!");
        _super.prototype.setX.call(this, 0);
    };
    ZeroVector.prototype.setY = function (y) {
        console.log("Called setY on a zero vector!");
        _super.prototype.setY.call(this, 0);
    };
    ZeroVector.prototype.addX = function (x) {
        console.log("Called addX on a zero vector!");
        _super.prototype.addX.call(this, 0);
    };
    ZeroVector.prototype.addY = function (y) {
        console.log("Called addY on a zero vector!");
        _super.prototype.addY.call(this, 0);
    };
    ZeroVector.prototype.setXY = function (x, y) {
        console.log("Called setXY on a zero vector!");
        _super.prototype.setXY.call(this, 0, 0);
    };
    return ZeroVector;
}(PVector));

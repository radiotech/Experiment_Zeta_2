var UI = /** @class */ (function () {
    function UI() {
    }
    UI.setup = function () {
        UI.downs = new Binding();
        UI.holds = new Binding();
        UI.ups = new Binding();
    };
    UI.down = function (key) {
        var isIn = false;
        for (var i = 0; !isIn && i < UI.held.length; i++) {
            if (UI.held[i] == key) {
                isIn = true;
            }
        }
        if (!isIn) {
            UI.downs.call(key);
            UI.held.push(key);
        }
    };
    UI.up = function (key) {
        UI.ups.call(key);
        for (var i = 0; i < UI.held.length; i++) {
            if (UI.held[i] == key) {
                UI.held.splice(i, 1);
                i--;
            }
        }
    };
    UI.update = function () {
        for (var i = 0; i < UI.held.length; i++) {
            UI.holds.call(UI.held[i]);
        }
    };
    UI.isDown = function (k) {
        for (var i = 0; i < UI.held.length; i++) {
            if (k == UI.held[i]) {
                return true;
            }
        }
        return false;
    };
    UI.keyDown = function (e) {
        UI.down('key_' + e.key.toLowerCase());
    };
    UI.keyUp = function (e) {
        UI.up('key_' + e.key.toLowerCase());
    };
    UI.mbDown = function (e) {
        UI.down('mb_' + e.button);
    };
    UI.mbUp = function (e) {
        UI.up('mb_' + e.button);
    };
    UI.mouseX = function () {
        return Main.im.mouse.global.x;
    };
    UI.mouseY = function () {
        return Main.im.mouse.global.y;
    };
    UI.held = [];
    return UI;
}());
var Binding = /** @class */ (function () {
    function Binding() {
        this.bound = {};
    }
    Binding.prototype.add = function (key, nf) {
        if (this.bound[key] == undefined) {
            this.bound[key] = [];
        }
        else {
            this.remove(key, nf.name);
        }
        this.bound[key][this.bound[key].length] = nf;
    };
    Binding.prototype.remove = function (key, name) {
        if (this.bound[key] != undefined) {
            for (var i = 0; i < this.bound[key].length; i++) {
                if (this.bound[key][i].name == name) {
                    this.bound[key].splice(i, 1);
                    i--;
                }
            }
            if (this.bound[key].length = 0) {
                this.bound[key] = undefined;
            }
        }
    };
    Binding.prototype.call = function (key) {
        if (this.bound[key] != undefined) {
            for (var i = 0; i < this.bound[key].length; i++) {
                this.bound[key][i].f();
            }
        }
    };
    return Binding;
}());
var NamedFunction = /** @class */ (function () {
    function NamedFunction(name, f) {
        this.name = name;
        this.f = f;
    }
    return NamedFunction;
}());
UI.setup();

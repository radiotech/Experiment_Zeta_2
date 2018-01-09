var Material = /** @class */ (function () {
    function Material(data) {
        this.name = data.name || ('Material_' + Material.byID.length);
        this.color = data.color != undefined ? data.color : 0xff0000;
        this.solid = data.solid != undefined ? data.solid : true;
        this.mass = data.mass != undefined ? data.mass : 10;
        this.drag = data.drag || (this.solid ? new Damper(.5, .001) : new Damper(.99, .0001));
        this.friction = data.friction || new Damper(1, 0);
        this.bounce = data.bounce || new Damper(0, 0);
        if (data.name == undefined) {
            console.error('Material created with no name!');
        }
        this.id = Material.byID.length;
        Material.byName[this.name] = this;
        Material.byID[this.id] = this;
    }
    Material.setup = function () {
        this.byName = {};
        this.byID = [];
        new Material({ name: 'air', color: 0xccccff, solid: false });
        new Material({ name: 'iron', color: 0x222244 });
        new Material({ name: 'red', color: 0xff2222, solid: false });
        new Material({ name: 'green', color: 0x22ff22, bounce: new Damper(1, 0) });
        new Material({ name: 'blue', color: 0x000000 });
    };
    return Material;
}());
var Damper = /** @class */ (function () {
    function Damper(m, b, num) {
        if (num === void 0) { num = 1; }
        if (num > 0) {
            this.m = m / num;
            this.b = b / num;
        }
        else {
            this.m = m;
            this.b = b;
        }
        this.num = num;
    }
    Damper.setup = function () {
        Damper.none = new Damper(1, 0, 0);
    };
    Damper.prototype.add = function (other) {
        return new Damper(this.m * this.num + other.m * other.num, this.b * this.num + other.b * other.num, this.num + other.num);
    };
    Damper.prototype.apply = function (value) {
        var sign = Main.sign(value);
        var newVal = value - sign * this.b;
        if (Main.sign(newVal) != sign) {
            return 0;
        }
        return newVal * this.m;
    };
    return Damper;
}());
/*


class Vector {
    public i: number;
    public j: number;
    public x: number;
    public y: number;
    constructor(x=0, y=0, i=0, j=0){
        this.x = x;
        this.y = y;
        this.i = i;
        this.j = j;
    }
    public clone(){
        return new Vector(this.x,this.y,this.i,this.j);
    }
    public static spot(i: number, j: number){
        return new Vector(0,0,i,j);
    }
    public static pos(x: number, y: number){
        return new Vector(x,y,0,0);
    }
    public static zero(){
        return new Vector();
    }
}



class Tri {
    public static w: number;
    public static h: number;

    public spot: Vector;
    public pos: Vector;
    public posMin: Vector;
    public up: boolean;
    public tri: Tri[];
    public ver: Ver[];
    public objs: Obj[];
    public gravity: Vector;
    public material: Material;

    public color: number;

    constructor(i,j) {
        this.spot = Vector.spot(i,j);
        this.pos = this.spot;
        Tri.spotToPos(this.pos);
        this.posMin = this.spot.clone();
        Tri.spotToPosMin(this.posMin);
        this.up = i%2==j%2;
        this.tri = [];
        this.ver = [];
        this.objs = [];
        this.gravity = Vector.zero();
        this.material = Material.byName.air;
    }
    public add(obj: Obj){
        this.remove(obj);
        this.objs.push(obj);
    }
    public remove(obj: Obj){
        for(let i = 0; i < this.objs.length; i++){
            if(this.objs[i] == obj){
                this.objs.splice(i,1);
            }
        }
    }

    public static posToSpot(v: Vector){
        v.i = v.x/Tri.w*2;
        v.j = v.y/Tri.h;
        let di = v.i%1;
        let dj = v.j%1;
        v.i = Math.floor(v.i);
        v.j = Math.floor(v.j);
        if(v.i%2!=v.j%2){
            if(1-di>dj){
                v.i--;
            }
        } else {
            if(di<dj){
                v.i--;
            }
        }
        return v;
    }
    public static fixSpot(v: Vector){
        v.i = Main.fixI(v.i);
        v.j = Main.fixJ(v.j);
        return v;
    }
    public static drawSpotSize(g: PIXI.Graphics, pos: Vec, size: Vec, odd: boolean){
        if(odd){
            g.moveTo(pos.getX(),pos.getY()+size.getY());
            g.lineTo(pos.getX()+size.getX(), pos.getY()+size.getY());
            g.lineTo(pos.getX()+size.getX()/2, pos.getY());
        } else {
            g.moveTo(pos.getX(),pos.getY());
            g.lineTo(pos.getX()+size.getX(), pos.getY());
            g.lineTo(pos.getX()+size.getX()/2, pos.getY()+size.getY());
        }
        g.endFill();
    }
    public static spotToPos(v: Vector){
        v.x = (v.i/2+.5)*Tri.w;
        v.y = (v.j+(v.i%2==v.j%2?1:2)/3)*Tri.h;
    }
    public static spotToPosV(v: Vec){
        v.setXY((v.getX()/2+.5)*Tri.w,
        (v.getY()+(v.getX()%2==v.getY()%2?1:2)/3)*Tri.h);
    }
    public static spotToPosMin(v: Vector){
        v.x = v.i/2*Tri.w;
        v.y = v.j*Tri.h;
    }
}

class Ver {
    spot: Vector;
    pos: Vector;
    tri: Tri[];
    mass: number;
    constructor(i: number, j: number) {
        this.spot = Vector.spot(i,j);
        this.pos = this.spot;
        Ver.spotToPos(this.pos);
        this.tri = [];
        this.mass = 0;
    }
    public static spotToPos(v: Vector){
        let temp = Vector.spot(v.i*2+v.j%2,v.j);
        Tri.spotToPosMin(temp);
        v.x = temp.x;
        v.y = temp.y;
    }
}

class Dimension {
    static dimensions: Dimension[] = [];
    static w: number;
    static h: number;
    tri: Tri[][];
    ver: Ver[][];

    static update(){
        for(let i = 0; i < Dimension.dimensions.length; i++){
            Dimension.dimensions[i].update();
        }
    }
    constructor() {
        Dimension.dimensions.push(this);
        this.tri = [];
        this.ver = [];

        //setup grid
        for(let i = 0; i < Dimension.w; i++){
            this.tri[i] = [];
            for(let j = 0; j < Dimension.h; j++){
                this.tri[i][j] = new Tri(i,j);
            }
        }

        //make planet
        for(let i = 11; i < 14; i++){
            for(let j = 4; j < 6; j++){
                this.tri[i][j].material = Material.byName.iron;
            }
        }


        //radial color
        let hitTri = [];
        for(let i = 0; i < Dimension.w; i++){
            hitTri[i] = [];
            for(let j = 0; j < Dimension.h; j++){
                hitTri[i][j] = false;
            }
        }
        let hitTriX = [];
        let hitTriY = [];

        let lastNew = 0;
        let grain = Tri.w/100;
        let r = 0;
        while(lastNew<Tri.w*2){
            r += grain;
            lastNew += grain;

            let dDir = Math.PI*2/(2*Math.PI*r/grain);
            for(let dir = 0; dir < Math.PI*2; dir+=dDir){
                let pos = Vector.pos(this.tri[0][0].pos.x/2-Math.cos(dir)*r,this.tri[0][0].pos.x/2+Math.sin(dir)*r);
                Tri.posToSpot(pos);
                Tri.fixSpot(pos);
                if(!hitTri[pos.i][pos.j]){
                    lastNew = 0;
                    hitTri[pos.i][pos.j] = true;
                    hitTriX[hitTriX.length] = pos.i;
                    hitTriY[hitTriY.length] = pos.j;
                }
            }
        }

        for(let i = 0; i < hitTriX.length; i++){
            this.tri[hitTriX[i]][hitTriY[i]].color = 0xff0000-i*160;//i%256 << 16 + Math.floor(i/255)%255<<8;
        }


        //setup verticies
        for(let i = 0; i < Dimension.w/2; i++){
            this.ver[i] = [];
            for(let j = 0; j < Dimension.h; j++){
                this.ver[i][j] = new Ver(i,j);

                let pos = this.ver[i][j].pos;
                for(let k = 0; k < 6; k++){
                    let dir = Math.PI/6+Math.PI/3*k;
                    let spot = Vector.pos(pos.x-Math.cos(dir)/2,pos.y+Math.sin(dir)/2);
                    Tri.posToSpot(spot);
                    Tri.fixSpot(spot);
                    this.ver[i][j].tri[k] = this.tri[spot.i][spot.j];

                    this.ver[i][j].mass += this.ver[i][j].tri[k].material.mass/3;

                    if(i>0 && j > 0){
                        let pt = new PIXI.Graphics();
                        pt.beginFill(0xff00ff);
                        
                        Main.drawPt(pt,(this.ver[i][j].tri[k].pos.x+pos.x)/2,(this.ver[i][j].tri[k].pos.y+pos.y)/2);
                        Main.app.stage.addChild(pt);
                    }
                }

                for(let k = 0; k < 6; k++){
                    this.ver[i][j].tri[k].tri[this.ver[i][j].tri[k].tri.length] = this.ver[i][j].tri[(k+1)%6];
                }

                let pt = new PIXI.Graphics();
                pt.beginFill(0x00ff00);
                Main.drawPt(pt,pos.x,pos.y);
                Main.app.stage.addChild(pt);

            }
        }

        //gravity
        for(let vi = 0; vi < Dimension.w/2; vi++){
            for(let vj = 0; vj < Dimension.h; vj++){
                if(this.ver[vi][vj].mass > 0){
                    let mass = this.ver[vi][vj].mass;
                    let x1 = this.ver[vi][vj].pos.x;
                    let y1 = this.ver[vi][vj].pos.y;
                    for(let ti = 0; ti < Dimension.w; ti++){
                        for(let tj = 0; tj < Dimension.h; tj++){
                            let x2 = this.tri[ti][tj].pos.x;
                            let y2 = this.tri[ti][tj].pos.y;
                            let d = Main.disTo(x1,y1,x2,y2);
                            let pull = mass/d/10;
                            this.tri[ti][tj].gravity.x += pull*(x1-x2)/d;
                            this.tri[ti][tj].gravity.y += pull*(y1-y2)/d;
                        }
                    }
                }
            }
        }
    }
    public fixXY(v: Vec){
        if(v.getY()<0){
            v.setY(v.getY()+Dimension.h*Tri.h);
            this.fixXY(v);
        } else if(v.getY()>=Dimension.h*Tri.h) {
            v.setY(v.getY()-Dimension.h*Tri.h);
            this.fixXY(v);
        } else {
            let t = Vector.pos(v.getX(),v.getY());
            Tri.posToSpot(t);
            if(t.i < 0){
                v.setX(v.getX()+Dimension.w/2);
                this.fixXY(v);
            } else if(t.i >= Dimension.w) {
                v.setX(v.getX()-Dimension.w/2);
                this.fixXY(v);
            }
        }
    }
    public triAtPos(x: number, y: number){
        let v = Vector.pos(x,y);
        Tri.posToSpot(v);
        Tri.fixSpot(v);
        return this.tri[v.i][v.j];
    }
    public update(){
        
    }
}
*/ 

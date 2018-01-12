class Dim {
    static dimensions: Dim[] = [];
    static w: number = 48;
    static h: number = 24;

    blocks: Tile[][];

    constructor() {
        Dim.dimensions.push(this);

        this.blocks = [];
        for(let i = 0; i < Dim.w; i++){
            this.blocks[i] = [];
            for(let j = 0; j < Dim.h; j++){
                this.blocks[i][j] = new Tile(this,i,j);
            }
        }

        for(let i = 0; i < Dim.w; i++){
            for(let j = 0; j < Dim.h; j++){
                this.blocks[i][j].setup();
            }
        }
    }
    update(){
        for(let i = 0; i < Dim.w; i++){
            for(let j = 0; j < Dim.h; j++){
                this.blocks[i][j].update(Update.GRAVITY);
            }
        }
    }

    isUp(x: number, y: number){
        return(this.getX(x)%2 == this.getY(y)%2);
    }

    inLeft(x: number, y: number){
        //check if a point is in this triangle (left) or the next (right)
        return this.isUp(x,y)?Main.mod(x/W,1)<Main.mod(y/H,1):Main.mod(x/W,1)+Main.mod(y/H,1)<1;
    }
    getAt(x: number, y: number){
        return this.inLeft(x,y)?this.getLeft(x,y):this.getRight(x,y);
    }
    setAt(x: number, y: number, m: Material){
        if(this.inLeft(x,y)){
            this.setLeft(x,y,m);
        } else {
            this.setRight(x,y,m);
        }
    }
    originAt(pos: Vector){
        let result = new PVector(Math.floor(pos.getX()/W)*W,Math.floor(pos.getY()/H)*H);
        if(!this.inLeft(pos.getX(),pos.getY())){
            result.setX(result.getX()+W);
        }
        return result;
    }
    isUpAt(x: number, y: number){
        return this.inLeft(x,y)?this.isUp(x,y):!this.isUp(x,y);
    }

    get(x: number, y: number){
        return this.blocks[x][y];
    }
    getLeft(x: number, y: number){
        return this.blocks[this.getX(x)][this.getY(y)];
    }
    getRight(x: number, y: number){
        return this.getLeft(x+W,y);
    }
    
    set(x: number, y: number, m: Material){
        this.blocks[x][y].m = m;
    }
    setLeft(x: number, y: number, m: Material){
        this.blocks[this.getX(x)][this.getY(y)].m = m;
    }
    setRight(x: number, y: number, m: Material){
        this.setLeft(x+W, y, m);
    }

    getX(x: number){
        return Math.floor(Main.mod(x/W,Dim.w));
    }
    getY(y: number){
        return Math.floor(Main.mod(y/H,Dim.h));
    }
    shiftX(x: number, off: number){
        return Main.mod(x+off,Dim.w);
    }
    shiftY(y: number, off: number){
        return Main.mod(y+off,Dim.h);
    }

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
    tilesInRegion(x1: number, y1: number, x2: number, y2: number){
        let toReturn: Vector[] = [];
        for(let i = Math.floor(x1/W), __i = i, _i = Math.floor(x2/W)+1; i <= _i; i++){
            for(let j = Math.floor(y1), __j = j, _j = Math.floor(y2); j <= _j; j++){
                let trueI = Main.mod(i,Dim.w);
                let trueJ = Main.mod(j,Dim.h);
                if(i==__i && j==__j && !(trueI%2==trueJ%2 || this.inLeft(x1,y1))){continue;}
                if(i==_i && j==__j && !(trueI%2==trueJ%2 || !this.inLeft(x2,y1))){continue;}
                if(i==__i && j==_j && !(trueI%2!=trueJ%2 || this.inLeft(x1,y2))){continue;}
                if(i==_i && j==_j && !(trueI%2!=trueJ%2 || !this.inLeft(x2,y2))){continue;}
                toReturn.push(new PVector(i,j));
            }
        }
        return toReturn;
    }

    export(){
        let result: string[][] = [];
        for(let i = 0; i < Dim.w; i++){
            result[i] = [];
            for(let j = 0; j < Dim.h; j++){
                result[i][j] = this.blocks[i][j].export();
            }
        }
        return result;
    }
    import(data){
        for(let i = 0; i < Dim.w; i++){
            for(let j = 0; j < Dim.h; j++){
                this.blocks[i][j].import(data[i][j]);
            }
        }
    }
    
}

class Tile {
    static axisParas: UnitVector[];
    static axisOrths: UnitVector[];

    dim: Dim;
    i: number;
    j: number;
    updated: number;
    m: Material;
    name: string;
    solids: Solid[];
    gravity: PVector;
    surfaceDis: number;

    isUp: Boolean;
    left: Tile;
    right: Tile;
    vert: Tile;
    leftDir: UnitVector;
    rightDir: UnitVector;
    vertDir: UnitVector;
    
    static setup(){
        Tile.axisParas = Bound.findParas([new PVector(W,H), new PVector(-W,H),new PVector(0,0)]);
        Tile.axisOrths = Bound.findOrths(Tile.axisParas);
    }

    constructor(dim: Dim, i: number, j: number){
        this.dim = dim;
        this.i = i;
        this.j = j;
        this.updated = -1;
        this.m = Material.byID[0];
        this.name = `(${i},${j})`;
        this.solids = [];
        this.gravity = new PVector();
        this.surfaceDis = Infinity;
    }

    setup(){
        this.isUp = this.i%2 == this.j%2;
        this.left = this.dim.get(this.dim.shiftX(this.i,-1),this.j);
        this.right = this.dim.get(this.dim.shiftX(this.i,1),this.j);
        this.vert = this.dim.get(this.i,this.dim.shiftY(this.j,this.isUp?1:-1));
        this.leftDir = new UnitVector(-3*W,this.isUp?-H:H);
        this.rightDir = new UnitVector(3*W,this.isUp?-H:H);
        this.vertDir = new UnitVector(0,this.isUp?1:-1);

    }
    registerSolid(s: Solid){
        this.solids.push(s);
    }
    unregisterSolid(s: Solid){
        this.solids = this.solids.filter(_s => _s.id != s.id);
    }
    update(type: number){
        let sides = [{t:this.left,d:this.leftDir},{t:this.right,d:this.rightDir},{t:this.vert,d:this.vertDir}];
        if(type == Update.GRAVITY){
            let newGravity = new PVector();
            sides.forEach(s=>{
                if(s.t.m.solid){
                    newGravity.addX(s.d.x*s.t.m.mass);
                    newGravity.addY(s.d.y*s.t.m.mass);
                }
            });
            let maxGravityNear = PVector.zero;
            sides.forEach(s=>{
                if(s.t.gravity.getMag() > maxGravityNear.getMag()){
                    maxGravityNear = s.t.gravity;
                }
            });
            if(maxGravityNear.getMag()*.9 > newGravity.getMag()){
                VecOp.match(newGravity,maxGravityNear)
                VecOp.mult(newGravity,.9);
            }
            //newGravity = new PVector();
            if(newGravity.x != this.gravity.x || newGravity.y != this.gravity.y){
                if(newGravity.getMag() > 0 && this.gravity.getMag() > 0){
                    //console.log(newGravity,this.gravity);
                }
                this.gravity = newGravity;
                sides.forEach(s=>s.t.update(Update.GRAVITY));
            }
        } else if(type == Update.TEST){
            this.m = Material.byName['red'];
            sides.forEach(s=>s.t.m = Material.byName['red']);
        }
    }


    export(){
        return this.m.name;
    }
    import(data){
        this.m = Material.byName[data];
    }
}

class Update {
    static GRAVITY = 0;
    static TEST = 99;
}

interface Vector {
    x: number;
    y: number;
    getMag(): number;
    getX(): number;
    getY(): number;
    setX(x: number);
    setY(y: number);
    addX(x: number);
    addY(y: number);
    setXY(x: number, y: number);
}

interface Vec extends Vector {}
interface Point extends Vector {}
interface Dir extends Vector {}

class VecOp {
    public static unit(v: Vector){
        let mag = v.getMag();
        v.setXY(v.getX()/mag,v.getY()/mag);
    }
    public static setMag(v: Vector, magNew: number){
        let mag = v.getMag();
        if(mag < .00001){
            return;
        }
        v.setXY(v.getX()/mag*magNew,v.getY()/mag*magNew);
    }
    public static orthogonal(v: Vector){
        v.setXY(v.getY(),-v.getX());
    }
    public static opposite(v: Vector){
        v.setXY(-v.getX(),-v.getY());
    }
    public static add(v1: Vector, v2: Vector){
        v1.setXY(v1.getX()+v2.getX(),v1.getY()+v2.getY());
    }
    public static sub(v1: Vector, v2: Vector){
        v1.setXY(v1.getX()-v2.getX(),v1.getY()-v2.getY());
    }
    public static mult(v1: Vector, n: number){
        v1.setXY(v1.getX()*n,v1.getY()*n);
    }
    public static multV(v1: Vector, v2: Vector){
        v1.setXY(v1.getX()*v2.getX(),v1.getY()*v2.getY());
    }
    public static div(v1: Vector, n: number){
        v1.setXY(v1.getX()*n,v1.getY()*n);
    }
    public static match(v1: Vector, v2: Vector){
        v1.setXY(v2.getX(),v2.getY());
    }
    public static round(v: Vector){
        v.setXY(Math.round(v.x),Math.round(v.y));
    }
    public static dis(v1: Vector, v2: Vector){
        let a = v1.getX()-v2.getX(), b = v1.getY()-v2.getY();
        return Math.sqrt(a*a+b*b);
    }
    public static equal(v1: Vector, v2: Vector){
        return v1.getX()==v2.getX()&&v1.getY()==v2.getY();
    }
    public static dot(v1: Vector, v2: Vector){
        return v1.x*v2.x+v1.y*v2.y;
    }
    public static unitRotateTowards(v1: Vector, v2: Vector, dis: number){ //rotate a unit vector towards another vector by an amount
        //v1 should be a unit vector..

        //if v1 == v2, return
        if(VecOp.equal(v1,v2)){
            return;
        }

        //if close enough, jump v1 to v2
        let check = PVector.clone(v2);
        VecOp.unit(check);
        VecOp.sub(check,v1);
        if(check.getMag() < dis){
            VecOp.add(check,v1);
            v1.setXY(check.getX(),check.getY());
            return;
        }
        
        //find clockwise dis
        let turnClock = PVector.clone(v1); //v1
        VecOp.orthogonal(turnClock); //v1 clockwise 90
        VecOp.sub(turnClock,v2) //v1 clockwise dis

        //find anticlock dis
        let turnAntiClock = PVector.clone(v1); //v1
        VecOp.orthogonal(turnAntiClock); //v1 clock 90
        VecOp.opposite(turnAntiClock); //v1 anticlock 90
        VecOp.sub(turnAntiClock,v2); //v1 anticlock dis

        //choose between directions
        let temp = turnAntiClock;
        if(turnClock.getMag() < turnAntiClock.getMag()){
            temp = turnClock;
        }

        //adjust v1
        VecOp.add(temp,v2); //v1 turn 90
        VecOp.setMag(temp,dis); //rotation vector
        VecOp.add(v1,temp); //rotate v1
        VecOp.unit(v1); //restore to unit vector
    }
    public static dirOf(v: Vector){
        if(v.getX()>=0){
            return Main.mod(Math.atan(v.getY()/v.getX()),2*Math.PI);
        } else {
            return Main.mod(Math.atan(v.getY()/v.getX())+Math.PI,2*Math.PI);
        }
    }
    public static dirTo(a: Vector, b: Vector){
        if(b.getX()>=a.getX()){
            return Main.mod(Math.atan((b.getY()-a.getY())/(b.getX()-a.getX())),2*Math.PI);
        } else {
            return Main.mod(Math.atan((b.getY()-a.getY())/(b.getX()-a.getX()))+Math.PI,2*Math.PI);
        }
    }
}

class PVector implements Vector {
    static zero;
    protected _x: number;
    protected _y: number;
    protected mag: number;
    public x: number;
    public y: number;
    constructor(x=0, y=0){
        this.setXY(x,y);
        this.mag = undefined;
    }

    static setup(){
        PVector.zero = new ZeroVector();
    }

    //basic get/set
    public getMag(){
        if(this.mag == undefined){
            this.mag = Math.sqrt(this.x*this.x+this.y*this.y);
        }
        return this.mag;
    }
    public getX(){ //depreciated.. use .x
        return this.x;
    }
    public getY(){ //depreciated.. use .y
        return this.y;
    }
    public setX(x: number){
        this._x = x;
        this.x = x;
        this.mag = undefined;
    }
    public setY(y: number){
        this._y = y;
        this.y = y;
        this.mag = undefined;
    }
    public addX(x: number){
        this._x += x;
        this.x += x;
        this.mag = undefined;
    }
    public addY(y: number){
        this._y += y;
        this.y += y;
        this.mag = undefined;
    }
    public setXY(x: number, y: number){
        this._x = x;
        this.x = x;
        this._y = y;
        this.y = y;
        this.mag = undefined;
    }
    

    public static clone(v: Vector){
        return new PVector(v.x,v.y);
    }
}

class UnitVector extends PVector {
    constructor(x=1, y=0){
        super(x,y);
    }

    //basic get/set
    public getMag(){
        return 1;
    }
    public setX(x: number){
        console.log("Called setX on a unit vector!");
        super.setX(x);
        this.fix();
    }
    public setY(y: number){
        console.log("Called setY on a unit vector!");
        super.setY(y);
        this.fix();
    }
    public addX(x: number){
        console.log("Called addX on a unit vector!");
        super.addX(x);
        this.fix();
    }
    public addY(y: number){
        console.log("Called addY on a unit vector!");
        super.addY(y);
        this.fix();
    }
    public setXY(x: number, y: number){
        super.setXY(x,y);
        this.fix();
    }
    private fix(){
        if(this.x==0 && this.y==0){
            super.setX(1);
        } else {
            let mag = Math.sqrt(this.x*this.x+this.y*this.y);
            super.setXY(this.x/mag,this.y/mag);
        }
    }

    public static clone(v: Vector){
        return new UnitVector(v.x,v.y);
    }
}

class ZeroVector extends PVector {
    constructor(){
        super(0,0);
    }

    public getMag(){
        return 0;
    }
    public setX(x: number){
        console.log("Called setX on a zero vector!");
        super.setX(0);
    }
    public setY(y: number){
        console.log("Called setY on a zero vector!");
        super.setY(0);
    }
    public addX(x: number){
        console.log("Called addX on a zero vector!");
        super.addX(0);
    }
    public addY(y: number){
        console.log("Called addY on a zero vector!");
        super.addY(0);
    }
    public setXY(x: number, y: number){
        if(x!=0 || y!=0){
            console.log("Called setXY on a zero vector!");
            console.trace();
        }
        super.setXY(0,0);
    }
}
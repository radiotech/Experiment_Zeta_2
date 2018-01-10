
class Solid {
    static solids: Solid[];
    
    //constructor args
    dim: Dim;
    p: Vector;
    c: number;
    w: number;
    h: number;
    bound: Vector[];
    deltaMove: number;
    deltaTouch: number;
    
    //internal vars
    id: number;
    _p: Vector;
    v: Vector;
    a: Vector;
    boundHeight: number;
    boundWidth: number;
    tile: Tile;
    tiles: Tile[];

    static setup(){
        Solid.solids = [];
    }

    constructor(args){
        //dim, x, y, color, w, h, bound, deltaMove, deltaTouch

        this.dim = args.dim;
        this.p = new PVector(args.x || 0,args.y || 0);
        this._p = new PVector(args.x || 0,args.y || 0);
        this.v = new PVector();
        this.a = new PVector();
        this.c = args.color || 0xff0000;
        this.w = args.width || 1;
        this.h = args.height || 1;
        this.bound = args.bound || Bound.ellipse(this.w);
        this.deltaMove = args.deltaMove || this.bound.length>1?VecOp.dis(this.bound[0],this.bound[1]):this.w/10;
        this.deltaTouch = args.deltaTouch || this.deltaMove / 10;
        this.boundWidth = this.w/4;
        this.boundHeight = this.w/4/W;
        this.tile = undefined;
        this.tiles = [];
        if(this.dim == undefined){
            console.error(`object created no dimension!`);
        }
        if(this.deltaMove < 0.01){
            console.error(`object created with delta move of ${this.deltaMove}!`);
            this.deltaMove = 0.01;
        }
        if(this.deltaTouch < 0.0001){
            console.error(`object created with small touch distance of ${this.deltaTouch}!`);
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

        let speed = .004;
        UI.downs.add('key_i', new NamedFunction('move', ()=>this.a.addY(-speed)));
        UI.downs.add('key_j', new NamedFunction('move', ()=>this.a.addX(-speed)));
        UI.downs.add('key_k', new NamedFunction('move', ()=>this.a.addY(speed)));
        UI.downs.add('key_l', new NamedFunction('move', ()=>this.a.addX(speed)));

        UI.ups.add('key_i', new NamedFunction('move', ()=>{if(this.a.getY()<0){this.a.setY(0)}}));
        UI.ups.add('key_j', new NamedFunction('move', ()=>{if(this.a.getX()<0){this.a.setX(0)}}));
        UI.ups.add('key_k', new NamedFunction('move', ()=>{if(this.a.getY()>0){this.a.setY(0)}}));
        UI.ups.add('key_l', new NamedFunction('move', ()=>{if(this.a.getX()>0){this.a.setX(0)}}));

        UI.downs.add('key_e', new NamedFunction('export', ()=>console.log(JSON.stringify(this.dim.export()))));

        this.id = Math.floor(Math.random() * Number.MAX_VALUE);
        Solid.solids.push(this);
    }
    update(){
        VecOp.match(this._p,this.p);
        VecOp.add(this.v,this.a);
        
        this.tiles.forEach(t=>t.m = Material.byName['red']);
        let drag = Damper.none;
        this.tiles.forEach(t => {
            drag = drag.add(t.m.drag);
        });
        VecOp.setMag(this.v,drag.apply(this.v.getMag()));
        
        let movement = this.v;
        let moves = 6;
        while(moves > 0){
            let move = this.moveBy(movement);

            if(move.hit == false){
                moves = 0;
            } else {
                
                let friction = Damper.none;
                let bounce = Damper.none;
                move.tiles.forEach(t => {
                    friction = friction.add(t.m.friction);
                    bounce = bounce.add(t.m.bounce);
                });

                movement = move.remainder;
                let para = friction.apply(VecOp.dot(movement,Tile.axisParas[move.axis]));
                let orth = bounce.apply(VecOp.dot(movement,Tile.axisOrths[move.axis]));
                movement = new PVector(Tile.axisParas[move.axis].x*para-Tile.axisOrths[move.axis].x*orth,Tile.axisParas[move.axis].y*para-Tile.axisOrths[move.axis].y*orth);
                
                para = friction.apply(VecOp.dot(this.v,Tile.axisParas[move.axis]));
                orth = bounce.apply(VecOp.dot(this.v,Tile.axisOrths[move.axis]));
                this.v = new PVector(Tile.axisParas[move.axis].x*para-Tile.axisOrths[move.axis].x*orth,Tile.axisParas[move.axis].y*para-Tile.axisOrths[move.axis].y*orth);;

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
                if(moves == 0){
                    console.log('An object ran out of bounces! It may be stuck..');
                }
                
            }
        }
        
        if(this.tile!=undefined){
            this.tile.unregisterSolid(this)
        };
        this.tile = this.dim.getLeft(this.p.x,this.p.y);
        this.tiles = this.touches();
        this.tile.registerSolid(this);
    }
    draw(g: PIXI.Graphics, x: number, y: number, w: number, h: number){

        g.beginFill(this.c);
        g.drawEllipse(x,y,w*this.w/2,h*this.h/2);
        g.endFill();

        g.beginFill(0);
        for(let i = 0; i < this.bound.length; i++){
            g.drawEllipse(x+w*this.bound[i].getX(),y+h*this.bound[i].getY(),w*this.h/2/10,h*this.h/2/10);
        }
        g.endFill();
    }
    moveBy(offset: Vector){
        if(offset.getX() == 0 && offset.getY() == 0){ //no movement
            return {hit:false, dis:1, tiles:[], axis:0, remainder:new PVector()};
        }
        
        let rotate = (v: Vector, para: UnitVector, orth: UnitVector)=>{
            return new PVector(para.x*v.x+orth.x*v.y,para.y*v.x+orth.y*v.y);
        }
        let unRotate = (v: Vector, para: UnitVector, orth: UnitVector)=>{
            return new PVector(VecOp.dot(v,para),VecOp.dot(v,orth));
        }
        
        let tryDir = (axis: number)=>{
            //find dis to cross boundry
            let xAxis = Tile.axisParas[axis];
            let yAxis = Tile.axisOrths[axis];
            let rotPos = rotate(this.p,xAxis,yAxis);
            let rotOffset = rotate(offset,xAxis,yAxis);
            let rotPosNew = new PVector(rotPos.x+rotOffset.x,rotPos.y+rotOffset.y);
            
            let thisBlock: number;
            let nextBlock: number;
            let toHit: number;
            if(rotOffset.y > 0){
                thisBlock = Math.floor(rotPos.y+this.boundHeight);
                nextBlock = Math.floor(rotPosNew.y+this.boundHeight);
                toHit = (nextBlock-(rotPos.y+this.boundHeight))/rotOffset.y;
            } else {
                thisBlock = Math.floor(rotPos.y-this.boundHeight);
                nextBlock = Math.floor(rotPosNew.y-this.boundHeight);
                toHit = (nextBlock+1-(rotPos.y-this.boundHeight))/rotOffset.y;
            }
            
            if(thisBlock != nextBlock){
                console.log('crossed a bound');
                let tilesAfter = this.dim.tilesInRegion(
                    rotPos.x+rotOffset.x*(toHit+.001)-this.boundWidth,
                    rotPos.y+rotOffset.y*(toHit+.001)-this.boundHeight,
                    rotPos.x+rotOffset.x*(toHit+.001)+this.boundWidth,
                    rotPos.y+rotOffset.y*(toHit+.001)+this.boundHeight
                );
                tilesAfter.forEach(t=>t.setXY(t.x*W,t.y*H+H/2));
                tilesAfter = tilesAfter.map(t=>unRotate(t,xAxis,yAxis));
                let matsAfter = tilesAfter.map(t=>this.dim.getAt(t.x,t.y));
                if(matsAfter.some(t=>t.m.solid)){ //some tiles in after are solid
                    let tilesBefore = this.dim.tilesInRegion(
                        rotPos.x+rotOffset.x*(toHit-.001)-this.boundWidth,
                        rotPos.y+rotOffset.y*(toHit-.001)-this.boundHeight,
                        rotPos.x+rotOffset.x*(toHit-.001)+this.boundWidth,
                        rotPos.y+rotOffset.y*(toHit-.001)+this.boundHeight
                    );
                    tilesBefore.forEach(t=>t.setXY(t.x*W,t.y*H+H/2));
                    tilesBefore = tilesBefore.map(t=>unRotate(t,xAxis,yAxis));
                    if(tilesBefore.every(t=>!this.dim.getAt(t.x,t.y).m.solid)){ //every tile in before are is not solid
                        let hitTiles = tilesAfter.map(t=>this.dim.getAt(t.x,t.y));
                        let remainder = PVector.clone(offset);
                        VecOp.mult(remainder,(1-(toHit-.001)));
                        return {hit:true, dis:toHit-.001, tiles:matsAfter.filter(t=>t.m.solid), axis:axis, remainder:remainder};
                    }
                }
                //tilesAfter.forEach(t=>this.dim.setAt(t.x,t.y,Material.byID[4]));

                //check for solids after
                //if no solids then solids, SAVE RETURN DATA
                //return return data from side stoped earliest
            }
            return {hit:false, dis:1, tiles:[], axis:axis, remainder:new PVector()};
        }
        
        let move = tryDir(0);
        let tempMove = tryDir(1);
        if(tempMove.dis < move.dis){
            move = tempMove;
        }
        tempMove = tryDir(2);
        if(tempMove.dis < move.dis){
            move = tempMove;
        }
        this.p.addX(offset.x*move.dis);
        this.p.addY(offset.y*move.dis);
        return move;
    }

    touches(offset: Vector = PVector.zero){
        let rotate = (v: Vector, para: UnitVector, orth: UnitVector)=>{
            return new PVector(para.x*v.x+orth.x*v.y,para.y*v.x+orth.y*v.y);
        }
        let unRotate = (v: Vector, para: UnitVector, orth: UnitVector)=>{
            return new PVector(VecOp.dot(v,para),VecOp.dot(v,orth));
        }
        
        let forAxis = (axis: number)=>{
            //find dis to cross boundry
            let xAxis = Tile.axisParas[axis];
            let yAxis = Tile.axisOrths[axis];
            let rotPosNew = rotate(new PVector(this.p.x+offset.x,this.p.y+offset.y),xAxis,yAxis);
            
            let tiles = this.dim.tilesInRegion(
                rotPosNew.x-this.boundWidth,
                rotPosNew.y-this.boundHeight,
                rotPosNew.x+this.boundWidth,
                rotPosNew.y+this.boundHeight
            );
            tiles.forEach(t=>t.setXY(t.x*W,t.y*H+H/2));
            tiles = tiles.map(t=>unRotate(t,xAxis,yAxis));
            return tiles.map(t=>this.dim.getAt(t.x,t.y));
        }
        
        let tiles: Tile[] = [];
        let tileHash = {};
        forAxis(0).forEach(t=>tileHash[t.name]=t);
        forAxis(1).forEach(t=>tileHash[t.name]=t);
        forAxis(2).forEach(t=>tileHash[t.name]=t);
        for(let t in tileHash){
            tiles.push(tileHash[t]);
        }
        return tiles;
    }
    /*
    moveByOLD(offset: Vector){
        if(offset.getX() == 0 && offset.getY() == 0){ //no movement
            return undefined;
        }
        if(!this.touches()){ //only check for collisions if not already colliding
            let steps = Math.ceil(offset.getMag()/this.deltaMove);
            let stepX = offset.getX()/steps;
            let stepY = offset.getY()/steps;
            for(let i = 1; i <= steps; i++){
                let touchData: any = this.touches(stepX*i,stepY*i,true);
                if(touchData != undefined){
                    let touch = this.touch(stepX*(i-1),stepY*(i-1),stepX*i,stepY*i);
                    VecOp.add(this.p,touch.off);
                    if(touch.data != undefined){
                        touchData = touch.data;
                    }
                    return {force:new PVector(offset.x-touch.off.x,offset.y-touch.off.y),surface:touchData};
                }
            }
        }
        VecOp.add(this.p,offset);
        return undefined;
    }
    */
    /*
    touches(offX = 0, offY = 0, reportSide = false){
        //checks if this object collides with blocks with a given offset from current pos
        let posX = this.p.getX()+offX;
        let posY = this.p.getY()+offY;
        let pos = new PVector(posX,posY);
        if(this.bound.length > 1){
            //outer bound
            let outerX1 = posX-this.outerBox.getX()/2;
            let outerY1 = posY-this.outerBox.getY()/2;
            let outerX2 = posX+this.outerBox.getX()/2;
            let outerY2 = posY+this.outerBox.getY()/2;
            //inner bound
            let innerX1 = posX-this.innerBox.getX()/2;
            let innerY1 = posY-this.innerBox.getY()/2;
            let innerX2 = posX+this.innerBox.getX()/2;
            let innerY2 = posY+this.innerBox.getY()/2;
            //find hits
            let hits = this.dim.blocksInRegion(outerX1,outerY1,outerX2,outerY2);
            //copy type of hits
            let innerHits = hits; 
            let outerHits = hits;
            innerHits = [];
            outerHits = [];
            //sort hits into inner (collide) and outer (might collide)
            for(let i = 0; i < hits.length; i++) {
                let h = hits[i];
                let dis = VecOp.dis(pos,h.p);
                if(dis < this.outerRadius){
                    if(dis < this.innerRadius || (h.p.getX()>innerX1&&h.p.getX()<innerX2&&h.p.getY()>innerY1&&h.p.getY()<innerY2)){
                        innerHits.push(h);
                    } else {
                        outerHits.push(h);
                    }
                }
            }
            //if inner has solid, touching
            for(let i = 0; i < innerHits.length; i++) {
                let h = innerHits[i];
                if(h.b.some(x=>x.solid)){
                    if(reportSide){
                        let angles = Bound.boundAngles(h.p,posX,posY,this.bound);
                        let inSide = this.inSide(angles);
                        return {
                            para: this.boundParas[inSide],
                            orth: this.boundOrths[inSide],
                            tiles: h.b.filter(b=>b.solid)
                        }
                    } else {
                        console.log(1);
                        return true;
                    }
                }
            }
            //if outer has solid and is within the bounds, touching
            for(let i = 0; i < outerHits.length; i++) {
                let h = outerHits[i];
                if(h.b.some(x=>x.solid)){
                    let angles = Bound.boundAngles(h.p,posX,posY,this.bound);
                    if(this.containsPoint(angles)){
                        if(reportSide){
                            let inSide = this.inSide(angles);
                            return {
                                para: this.boundParas[inSide],
                                orth: this.boundOrths[inSide],
                                tiles: h.b.filter(b=>b.solid)
                            }
                        } else {
                            console.log(1);
                            return true;
                        }
                    }
                }
            }
        }
        for(let i = 0; i < this.bound.length; i++){
            let hitPos = new PVector(posX+this.bound[i].getX(),posY+this.bound[i].getY());
            let tile = this.dim.getAt(hitPos.getX(),hitPos.getY());
            if(tile.solid){
                if(reportSide){
                    let tilePos = this.dim.originAt(hitPos);
                    let useUp = this.dim.isUpAt(hitPos.x,hitPos.y);
                    let inSide = this.inSide(Bound.boundAngles(hitPos,tilePos.x,tilePos.y,useUp?Tile.upBound:Tile.dnBound));
                    return {
                        para: useUp?Tile.upBoundParas[inSide]:Tile.dnBoundParas[inSide],
                        orth: useUp?Tile.upBoundOrths[inSide]:Tile.dnBoundOrths[inSide],
                        tiles: [this.dim.getAt(hitPos.getX(),hitPos.getY())]
                    }
                } else {
                    console.log(1);
                    return true;
                }
            }
        }
        return reportSide?undefined:false;
    }
    */
    /*
    touch(offXA: number, offYA: number, offXB: number, offYB: number){
        //given point A, known not touching, and point b, known touching, returns a point c, <= deltaTouch from touching
        let touchData = undefined;
        let lastTouchData = undefined;
        let disX = offXB-offXA;
        let disY = offYB-offYA;
        let offX = disX/2;
        let offY = disY/2;
        let shiftX = disX/2;
        let shiftY = disY/2;
        let shift = Math.sqrt(disX*disX+disY*disY)/2;
        while(shift > this.deltaTouch){
            shiftX /= 2;
            shiftY /= 2;
            shift /= 2;
            touchData = this.touches(offXA+offX,offYA+offY,true);
            if(touchData != undefined){
                lastTouchData = touchData;
                offX -= shiftX;
                offY -= shiftY;
            } else {
                offX += shiftX;
                offY += shiftY;
            }
        }
        touchData = this.touches(offXA+offX,offYA+offY,true);
        if(touchData != undefined){
            lastTouchData = touchData;
            offX -= shiftX;
            offY -= shiftY;
        }
        return {off: new PVector(offXA+offX,offYA+offY), data: lastTouchData};
    }
    */
    containsPoint(angles: number[]){
        let dirs = angles.map(a=>a).sort((a,b)=>a-b);
        let dif = 0;
        for(let i = 0; i < dirs.length; i++){
            if(i == dirs.length-1){
                dif = Math.PI*2-dirs[dirs.length-1]+dirs[0];
            } else {
                dif = dirs[i+1]-dirs[i];
            }
            if(dif > Math.PI){
                return false;
            }
        }
        return true;
    }
    /*
    inSide(angles: number[]){
        let maxI = 0;
        let max = 0;
        let dif = 0;
        for(let i = 0; i < angles.length; i++){
            dif = Main.angleDif(angles[(i+1)%angles.length],angles[i]);
            if(dif > max){
                maxI = i;
                max = dif;
            }
        }
        return maxI;
    }
    */
}

class Bound {
    static ellipse(w: number){
        let bound: Vector[] = [];
        for(let i = 0; i < Math.PI*2-Math.PI/6; i+=Math.PI*2/6){
            bound.push(new PVector(Math.cos(i)*w/2,Math.sin(i)*w/2));
        }
        return bound;
    }

    static findParas(pts: Vector[]){
        let paras: UnitVector[] = [];
        if(pts.length > 1){
            for(let i = 0; i < pts.length; i++){
                paras.push(new UnitVector(pts[(i+1)%pts.length].getX()-pts[i].getX(),pts[(i+1)%pts.length].getY()-pts[i].getY()));
            }
        }
        return paras;
    }
    static findOrths(paras: Vector[]){
        return paras.map(x=>{
            let v = UnitVector.clone(x);
            VecOp.orthogonal(v);
            return v;
        })
    }
    static boundAngles(v: Vector, centerX = 0, centerY = 0, bound: Vector[]){
        return bound.map(b=>VecOp.dirTo(v,new PVector(centerX+b.getX(),centerY+b.getY())));
    }
}
class View {
    public static views: View[];

    private root: PIXI.Container;
    private blockG: PIXI.Graphics;
    private solidG: PIXI.Graphics;

    private dim: Dim;
    private pos: Vector;
    private height: number;

    public static setup(){
        View.views = [];
    }
    public static draw(){
        View.views.forEach(v=>v.draw());
    }

    constructor(dim: Dim, pos: Vector, height: number){
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
    public draw(){
        //move the view
        //if needed, recalculate it
        
        let moveSpeed = .2;
        
        
        UI.holds.add('key_w', new NamedFunction('move', ()=>this.pos.setY(this.pos.getY()-moveSpeed)));
        UI.holds.add('key_a', new NamedFunction('move', ()=>this.pos.setX(this.pos.getX()-moveSpeed)));
        UI.holds.add('key_s', new NamedFunction('move', ()=>this.pos.setY(this.pos.getY()+moveSpeed)));
        UI.holds.add('key_d', new NamedFunction('move', ()=>this.pos.setX(this.pos.getX()+moveSpeed)));
        UI.downs.add('mb_0', new NamedFunction('place', ()=>console.log(this.pixelToGrid(UI.mouseX(),UI.mouseY()))));
        UI.downs.add('mb_0', new NamedFunction('place', ()=>{
            let v = this.pixelToGrid(UI.mouseX(),UI.mouseY());
            this.dim.setAt(v.getX(), v.getY(), Material.byID[(this.dim.getAt(v.getX(),v.getY()).m.id+1)%5]);
        }));
        UI.holds.add('mb_1', new NamedFunction('mclick', ()=>{
            
            for(let i = 0; i < Dim.w; i++){
                for(let j = 0; j < Dim.h; j++){
                    this.dim.set(i,j,Material.byID[0]);
                }
            }
            Main.debugG.clear();
            Main.debugG.lineStyle(5,0xff0000);
            Main.debugG.drawRect(UI.mouseX(),UI.mouseY(),width/2-UI.mouseX(),height/2-UI.mouseY());

            let pos1 = this.pixelToGrid(width/2,height/2);
            let pos2 = this.pixelToGrid(UI.mouseX(),UI.mouseY());
            let tiles = this.dim.tilesInRegion(pos1.x,pos1.y,pos2.x,pos2.y);
            tiles.forEach(t=>this.dim.set(Main.mod(t.x,Dim.w),Main.mod(t.y,Dim.h),Material.byID[1]));
        }));

        this.blockG.clear();
        this.solidG.clear();
        this.blockG.beginFill(0x00ff00);
        let gridX = Math.floor(this.pos.getX()/W)*W+W/2;
        let gridY = Math.floor(this.pos.getY()/H)*H+H/2;
        let gridOffX = Main.mod(this.pos.getX(),W);
        let gridOffY = Main.mod(this.pos.getY(),H);
        let gridW = (width*this.height/height);
        let gridH = (this.height);
        let screenW = width/gridW;
        let screenH = height/gridH;
        for(let i = -W, _i = gridW+3.1*W; i < _i; i+=W){
            for(let j = -H, _j = gridH+2.1*H; j < _j; j+=H){
                let iOff = i-gridOffX;
                let jOff = j-gridOffY;
                let tile = this.dim.getLeft(gridX+i,gridY+j);
                this.blockG.beginFill(tile.m.color);
                if(this.dim.isUp(gridX+i,gridY+j)){
                    this.blockG.drawPolygon([iOff*screenW,jOff*screenH, (iOff+W)*screenW,(jOff+H)*screenH, (iOff-W)*screenW,(jOff+H)*screenH]);
                } else {
                    this.blockG.drawPolygon([iOff*screenW,(jOff+H)*screenH, (iOff+W)*screenW,jOff*screenH, (iOff-W)*screenW,jOff*screenH]);
                }
                this.blockG.endFill();

                for(let k = 0; k < tile.solids.length; k++){
                    this.solidG.beginFill(tile.solids[k].c);
                    tile.solids[k].draw(this.solidG,(iOff+Main.mod(tile.solids[k].p.getX(),W))*screenW,(jOff+Main.mod(tile.solids[k].p.getY(),H))*screenH,screenW,screenH);
                    this.solidG.endFill();
                }
                
            }
        }
    }

    public pixelToGrid(x: number, y: number){
        
        let gridX = this.pos.getX();
        let gridY = this.pos.getY();
        let gridW = (width*this.height/height);
        let gridH = (this.height);
        let screenW = width/gridW;
        let screenH = height/gridH;

        return new PVector(gridX+x/width*gridW,gridY+y/height*gridH);
    }

}
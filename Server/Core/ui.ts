
class UI {
    public static held: string[] = [];
    public static downs: Binding;
    public static holds: Binding;
    public static ups: Binding;

    public static setup(){
        UI.downs = new Binding();
        UI.holds = new Binding();
        UI.ups = new Binding();
    }

    public static down(key: string){
        let isIn = false;
        for(let i = 0; !isIn && i < UI.held.length; i++){
            if(UI.held[i] == key){
                isIn = true;
            }
        }
        if(!isIn){
            UI.downs.call(key);
            UI.held.push(key);
        }
    }
    public static up(key: string){
        UI.ups.call(key);
        for(let i = 0; i < UI.held.length; i++){
            if(UI.held[i] == key){
                UI.held.splice(i, 1);
                i--;
            }
        }
    }

    public static update(){
        for(let i = 0; i < UI.held.length; i++){
            UI.holds.call(UI.held[i]);
        }
    }

    public static isDown(k: String){
        for(let i = 0; i < UI.held.length; i++){
            if(k == UI.held[i]){
                return true;
            }
        }
        return false;
    }

    public static keyDown(e: KeyboardEvent){
        UI.down('key_'+e.key.toLowerCase());
    }
    public static keyUp(e: KeyboardEvent){
        UI.up('key_'+e.key.toLowerCase());
    }
    public static mbDown(e: MouseEvent){
        UI.down('mb_'+e.button);
    }
    public static mbUp(e: MouseEvent){
        UI.up('mb_'+e.button);
    }
    public static mouseX(){
        return Main.im.mouse.global.x;
    }
    public static mouseY(){
        return Main.im.mouse.global.y;
    }
}

class Binding {
    public bound: any = {};

    public add(key: string, nf: NamedFunction){
        if(this.bound[key] == undefined){
            this.bound[key] = [];
        } else {
            this.remove(key,nf.name);
        }
        this.bound[key][this.bound[key].length] = nf;
    }
    public remove(key: string, name: string){
        if(this.bound[key] != undefined){
            for(let i = 0; i < this.bound[key].length; i++){
                if(this.bound[key][i].name == name){
                    this.bound[key].splice(i, 1);
                    i--;
                }
            }
            if(this.bound[key].length = 0){
                this.bound[key] = undefined;
            }
        }
        
    }
    public call(key: string){
        if(this.bound[key] != undefined){
            for(let i = 0; i < this.bound[key].length; i++){
                this.bound[key][i].f();
            }
        }
    }
}

class NamedFunction {
    public name: string;
    public f: Function;
    constructor(name: string, f: Function){
        this.name = name;
        this.f = f;
    }
}

UI.setup();
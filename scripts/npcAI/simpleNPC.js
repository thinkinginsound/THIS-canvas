class randomNPC{
    constructor(canvaswidth,canvasheight,startX,startY){
        this.canvaswidth = canvaswidth;
        this.canvasheight = canvasheight;
        this.x = startX;
        this.y = startY;
    }
    
    move(){
        if(this.x != this.canvaswidth-1 && this.x != 1){
            this.x += (Math.floor(Math.random()*3)-1);
        }
        if(this.y != this.canvasheight-1 && this.y != 1){
            this.y += (Math.floor(Math.random()*3)-1);
        } else {
            this.y += (Math.floor(Math.random()*3)-1);
        }
        checkbounds();
    }
}
class randomNPC{
    constructor(canvaswidth,canvasheight,startX,startY){
        this.canvaswidth = canvaswidth;
        this.canvasheight = canvasheight;
        this.x = startX;
        this.y = startY;
    }
    
    move(){
        let coinToss = Math.round(Math.random());
        let direction = Math.floor(Math.random()*3)-1;
        if(coinToss == 0){
            if(this.x < this.canvaswidth-1 && this.x > 1){
                this.x += direction;
            } else if(this.x >= this.canvaswidth-1){
                this.x += (Math.round(Math.random())-1);
            } else {
                this.x += (Math.round(Math.random()));
            }
        } else {
            if(this.y < this.canvaswidth-1 && this.y > 1){
                this.y += direction;
            } else if(this.y >= this.canvaswidth-1){
                this.y += (Math.round(Math.random())-1);
            } else {
                this.y += (Math.round(Math.random()));
            }
        }
        return [this.x, this.y];
    }
}

module.exports = {
    randomNPC: randomNPC
}
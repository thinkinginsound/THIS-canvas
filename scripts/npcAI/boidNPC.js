let normalUser = require("./normalUser.js");

class boidNPC extends normalUser {
    constructor(canvaswidth,canvasheight,startX,startY){
      super(canvaswidth,canvasheight,startX,startY)
      this.type = "boidNPC"
      this.innerCircle = 2;
      this.outerCircle = 12;
    }

    moveSpace(directionX,directionY){
        this.prevX = this.x;
        this.prevY = this.y;
        if(this.x < this.canvaswidth-1 && this.x >= 1){
            this.x += directionX;
        } else if(this.x >= this.canvaswidth-1){
            this.x += (Math.round(Math.random())-1);
        } else {
            this.x += (Math.round(Math.random()));
        }
        if(this.y < this.canvasheight-1 && this.y >= 1){
            this.y += directionY;
        } else if(this.y >= this.canvasheight-1){
            this.y += (Math.round(Math.random())-1);
        } else {
            this.y += (Math.round(Math.random()));
        }
    }

    randomNPCMove(){
        let percentage = Math.floor(Math.random()*100);
        let directionX = 0;
        let directionY = 0;
        if(percentage <= 60){
            directionX = this.x-this.prevX;
        } else {
            percentage = Math.floor(Math.random()*100);
            if(percentage <= 40){
                directionX = 1
            } else if(percentage > 40 && percentage <=80){
                directionX = -1
            } else {
                directionX = 0
            }
        }
        percentage = Math.floor(Math.random()*100);
        if(percentage <= 60){
            directionY = this.y-this.prevY;
        } else {
            percentage = Math.floor(Math.random()*100);
            if(percentage <= 40){
                directionY = 1
            } else if(percentage > 40 && percentage <=80){
                directionY = -1
            } else {
                directionY = 0
            }
        }
        this.moveSpace(directionX,directionY);
    }

    move(listofNPC){
        let chanceOfunhearding = Math.floor(Math.random()*100);
        if(chanceOfunhearding <= 90){
            let selfIndex = listofNPC.indexOf(this);
            let generalDirectionX = 0;
            let generalDirectionY = 0;
            listofNPC.forEach((singleNPC,index) => {
                if(index != selfIndex){
                    if(this.x+this.outerCircle >= singleNPC.x && this.x-this.outerCircle <= singleNPC.x &&
                        this.y+this.outerCircle >= singleNPC.y && this.y-this.outerCircle <= singleNPC.y){
                        if(this.x+this.innerCircle <= singleNPC.x && this.x-this.innerCircle >= singleNPC.x &&
                            this.y+this.innerCircle <= singleNPC.y && this.y-this.innerCircle >= singleNPC.y){
                            let xDirection = singleNPC.x - this.x;
                            let yDirection = singleNPC.y - this.y;
                            if(xDirection < 0){
                                generalDirectionX += -1;
                            } else if(xDirection > 0){
                                generalDirectionX += 1;
                            } else {
                                generalDirectionX = 0;
                            }
                            if(yDirection < 0){
                                generalDirectionY += -1;
                            } else if (yDirection > 0) {
                                generalDirectionY += 1;
                            } else {
                                generalDirectionY = 0;
                            }
                        }
                    }
                }
            });
            if(generalDirectionX == 0 && generalDirectionY == 0){
                this.randomNPCMove();
            } else {
                if(generalDirectionX > 1){
                    generalDirectionX = 1;
                }
                if (generalDirectionX < -1){
                    generalDirectionX = -1;
                }
                if(generalDirectionY > 1){
                    generalDirectionY = 1;
                }
                if(generalDirectionY < -1){
                    generalDirectionY = -1;
                }
                this.moveSpace(generalDirectionX,generalDirectionY);
            }
        } else {
            this.randomNPCMove();
        }
        return [this.x, this.y];
    }
}

module.exports = {
    boidNPC: boidNPC
}

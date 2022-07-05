let BOARDSIZE;
let PLAYERS = []
class Player {
  constructor(spots, color, name) {
    this.spots = spots;
    this.color = color;
    this.name = name
    for(let spot of this.spots){
      spot.player = this;
    }
  }
  toString(){
    return this.name
  }
  move(current_spot,new_spot){
    if(this.spots.includes(current_spot)){
      current_spot.player = null;
      new_spot.player = this;
      this.spots = this.spots.filter((sp)=>sp!=current_spot);
      this.spots.push(new_spot);
    }
  }
}
class Spot{
  constructor(pos, size, cordinate) {
    this.pos = pos;
    this.size = size;
    this.player = null;
    this.selected = false;
    this.cordinate = cordinate;
  }
  collidePoint(pos){
    return (
      (pos.x >= (this.pos.x+floor(this.size.x/4))) &&
      (pos.x <= (this.pos.x+floor(this.size.x/4))+floor(this.size.x/2)) &&
      (pos.y >= (this.pos.y+floor(this.size.y/4))) &&
      (pos.y <= (this.pos.y+floor(this.size.y/4))+floor(this.size.y/2))
    )
  }
  setSelected(val){
    this.selected = val;
  }
  show(){
    fill(255,255,255);
    rect(this.pos.x,this.pos.y, this.size.x,this.size.y);
    push()
    fill(0,255,0);
    rectMode(CENTER)
    translate(this.pos.x+floor(this.size.x/2),this.pos.y+floor(this.size.y/2));
    rect(0,0, floor(this.size.x/2),floor(this.size.y/2));
    if (this.player!==null){
      let opacity = 255;
      if(this.selected){
        opacity = 100;
      }
      fill(red(this.player.color),green(this.player.color), blue(this.player.color),opacity);
      ellipse(0,0, floor(this.size.x/3),floor(this.size.y/3))

    }

    pop()
  }
}
class GAME{
  constructor(websocket){
    this.board_template = [
      [null,null,null],
      [null,null,null],
      [null,null,null]
    ];
    this.player = 1;
    this.selecteds = [];
    this.websocket = websocket;
    BOARDSIZE = createVector(500,500);
    let spot_size = createVector(floor(BOARDSIZE.x/3), floor(BOARDSIZE.y/3));
    for(let y=0; y<3; y++){
        for(let x=0; x<3; x++){
          this.board_template[y][x] = new Spot(createVector(spot_size.x*x,spot_size.y*y), createVector(spot_size.x,spot_size.y), [x,y]);
        }
      }
    this.player1 = false;
    this.player2 = false;
  }
  playMove(player, cur_cordinate, new_cordinate){
    cur_cordinate = this.board_template[cur_cordinate[0]][cur_cordinate[1]]
    new_cordinate = this.board_template[new_cordinate[0]][new_cordinate[1]]
    player = this.getPlayer(player);
    player.move(cur_cordinate,new_cordinate);

  }
  getPlayer(name){
    if(this.player1.name === name ){
      return this.player1
    }else if (this.player2.name === name) {
      return this.player2
    }
  }

  setPlayer(name){
    return
    if(PLAYERS.length===0){
      this.player1 = new Player(this.board_template[0], color(0, 0, 0),name);
      PLAYERS.push(this.player1);
    }else if (PLAYERS.length===1) {
      this.player2 = new Player(this.board_template[2], color(255, 204, 0), name);
      PLAYERS.push(this.player2);
    }
  }
  printSeleted(){
    let p = document.getElementById('selectedOutput');
    if(this.selecteds.length==0){
      p.innerHTML = ""
    }else if (this.selecteds.length==1) {
      p.innerHTML = `Player (${this.player}) request move from: ${this.selecteds[0].cordinate} to: `;
    }else if (this.selecteds.length==2) {
      event ={
        type:'play',
        cur_cordinate:[this.selecteds[0].cordinate[1],this.selecteds[0].cordinate[0]],
        new_cordinate:[this.selecteds[1].cordinate[1],this.selecteds[1].cordinate[0]]
      }
      console.log(this.selecteds[0], event)
      this.websocket.send(JSON.stringify(event))

      p.innerHTML = `Player (${this.player}) request move from: ${this.selecteds[0].cordinate} to: ${this.selecteds[1].cordinate}`;
      this.selecteds.forEach((item, i) => {
        item.setSelected(false);
      });
      this.selecteds = [];
    }

  }
  mousePressed(x,y){
    let pos = createVector(x,y);
    for(let y=0; y<3; y++){
        for(let x=0; x<3; x++){
          if(this.board_template[y][x].collidePoint(pos)){
            if(this.selecteds.includes(this.board_template[y][x])){
              this.board_template[y][x].setSelected(false);
              this.selecteds = this.selecteds.filter((sp)=>sp!==this.board_template[y][x]);
            }else{
              this.board_template[y][x].setSelected(true);
              this.selecteds.push(this.board_template[y][x]);
            }
            this.printSeleted()
          }
        }
    }
  }
  show(){
    for(let y=0; y<3; y++){
        for(let x=0; x<3; x++){
          this.board_template[y][x].show();
        }
      }
  }
}

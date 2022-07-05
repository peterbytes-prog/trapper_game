let Game;
function setup(){
  rectMode(CORNER);
  BOARDSIZE = createVector(500,500)
  createCanvas(BOARDSIZE.x,BOARDSIZE.y).parent('#cnv');
  // Game= new GAME();
}
function createGame(game){
  Game = game;
}
function draw(){
  background(0)
  if(Game){
    Game.show();
  }

}
function mousePressed(){
  const params = new URLSearchParams(window.location.search);
  if (params.has("watch")) {
    return;
  }
  if(Game){
    Game.mousePressed(mouseX,mouseY);
  }

}

window.setup = setup;
window.draw = draw;

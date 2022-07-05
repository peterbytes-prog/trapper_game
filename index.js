function winner(game, player){
  player = game.getPlayer(player);
  document.querySelector('.overlay').style.display = 'flex';
  document.querySelector('.overlay>h4').textContent =`Game Over. ${player.name} wins!`;
  console.log(player.color.toString(), player.color);
  document.querySelector('.overlay>h4').style.color = player.color.toString();
}
function playMove(game, player, cur_cordinate, new_cordinate){
  game.playMove(player, cur_cordinate, new_cordinate);
}
async function createBoard(websocket){
  game = new GAME(websocket);
  createGame(game)
  return game
}
function showMessages(message, status=''){
  let p = document.getElementById('selectedOutput');
  p.innerHTML = `${message}`;
  p.className = status||''

}
window.addEventListener("DOMContentLoaded", async ()=>{
  console.log(BOARDSIZE);

  await setTimeout(async ()=>{
    const websocket = new WebSocket("ws:\\localhost:8001");
    initGame(websocket);
    const board = await createBoard(websocket);
    recieveMoves(board, websocket);
  },1000)

})
function recieveMoves(board, websocket){
  websocket.addEventListener("message", ( { data } )=>{
    const event = JSON.parse(data);
    console.log(event)
    switch (event.type){
      case "init":
        document.querySelector('.join').href = "?join=" + event.join;
        document.querySelector('.watch').href = "?watch=" + event.watch;
        board.setPlayer(event.player)
        board.setPlayer("p2")
        break;
      case "join":
        board.setPlayer("p1");
        board.setPlayer(event.player);
        break;
      case "watch":
        board.setPlayer("p1")
        board.setPlayer("p2")
        break;
      case "play":
        playMove(board, event.player, event.cur_cordinate, event.new_cordinate)
        break;
      case "win":
        winner(board, event.player);
        break;
      case "error":
        showMessages(event.message, status='danger')
        break;
      default:
        throw new Error(`Unsupported action ${event.type}`)
    }
  })
}
function initGame(websocket){
  websocket.addEventListener('open',()=>{
    const params = new URLSearchParams(window.location.search);
    let event = { type: "init"}
    if(params.has("join")){
      //
      event.join = params.get("join");
    }else if(params.has("watch")){
      //
      event.watch = params.get("watch");
    }else{
      //
    }
    websocket.send(JSON.stringify(event));
  })
}

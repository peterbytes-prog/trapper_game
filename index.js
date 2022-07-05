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

  await setTimeout(async ()=>{
    const websocket = new WebSocket("ws:\\localhost:8001");
    initGame(websocket);
    const board = await createBoard(websocket);
    recieveMoves(board, websocket);
  },1000)

})
function createJoinActions(joins){
  document.querySelector('.joins').innerHTML ="";
  for(let join of joins){
    let a = document.createElement('a');
    a.classList.add('list-group-item', 'action', 'join');
    a.href = "?join=" + join;
    a.textContent = join;
    document.querySelector('.joins').appendChild(a);
  }
}
function updateWatchers(watching){
  document.querySelector('.watchers').innerHTML ="";
  for(let watcher of watching){
    let li = document.createElement('li');
    li.classList.add('list-group-item', 'watcher');
    li.textContent = watcher;
    document.querySelector('.watchers').appendChild(li);
  }
}
function createWatchActions(watches){
  document.querySelector('.watches').innerHTML ="";
  for(let watch of watches){
    let a = document.createElement('a');
    a.classList.add('list-group-item', 'action', 'watch');
    a.href = "?watch=" + watch;
    a.textContent = watch;
    document.querySelector('.watches').appendChild(a);
  }
}
function recieveMoves(board, websocket){
  websocket.addEventListener("message", ( { data } )=>{
    const event = JSON.parse(data);
    console.log(event)
    switch (event.type){
      case "init":
        board.setPlayer(event.player);
        board.setPlayer("p2");
        break;
      case 'connection':
        createJoinActions(event.joins);
        createWatchActions(event.watches);
        updateWatchers(event.watching);
        break;
      case "join":
        board.setPlayer("p1");
        board.setPlayer(event.player);
        break;
      case "watch":
        board.setPlayer("p1");
        board.setPlayer("p2");
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

from game import player1, player2, Game
import asyncio, json, websockets, secrets
JOINED = {}
WATCH = {}
async def errorHandler(websocket, err):
    """
    construct and send error event
    """

    event = {
        "type":"error",
        "message":err
    }
    await websocket.send(json.dumps(event))

async def replay(websocket, game):
    for event in game.getPrevMoves():
        await websocket.send(json.dumps(event))

async def startGame(websocket):
    """
    Initialize game session in JOINED global variable and WACTH variable
    """
    game = Game()
    connected = set([websocket])
    game_id = secrets.token_urlsafe(32)
    JOINED[game_id] = [game, connected]
    # watch_id = secrets.token_urlsafe(32)
    # WATCH[watch_id] = [game, connected] # can only be watch if two player are playing
    player = player1
    try:
        event = {
            "type":"init",
            "player":player,
            "join":game_id
        }
        print(f"player one starting game {game_id}")
        await websocket.send(json.dumps(event))
        updateConnected(websocket, game_id)
        await play(websocket, game, player, connected)
    finally:
        del JOINED[game_id]

def updateConnected(websocket, game_id):
    event = {
        'type':'connection',
        'joins':[i for i in JOINED if (len(JOINED[i][1])<2)],
        'watches':[i for i in WATCH],
        'watching':[id(i) for i in list(WATCH.get(game_id,[None,[]])[1])]
    }
    connections = [JOINED[i][1] for i in JOINED]
    connections.extend([WATCH[i][1] for i in WATCH])
    connections = set().union(*connections)
    websockets.broadcast(connections, json.dumps(event))

async def joinGame(websocket, join_id):
    game, connected = JOINED.get(join_id, (None,None))
    if game and connected:
        print(f"player two joining game: {join_id}")
        if(len(connected)>=2):
            await errorHandler(websocket, "Game not accepting new player.You are welcome to wacth!")
            return await watch(websocket, join_id)#handle as a watcher
        connected.add(websocket)
        watch_id = secrets.token_urlsafe(32)
        WATCH[join_id] = [game, connected] # can only be watch if two player are playing
        player = player2
        try:
            event = {
                "type":"join",
                "player":player
            }
            await websocket.send(json.dumps(event))

            updateConnected(websocket, join_id)
            # send prev moves

            await replay(websocket, game)
            await play(websocket, game, player, connected)
        finally:
            connected.remove(websocket)
    else:
        await errorHandler(websocket, "Game not found.")
        return

async def watch(websocket, watch_id):
    game, connected = WATCH.get(watch_id, (None,None))
    if game and connected:
        connected.add(websocket)
        print(f"spectator joining game: {watch_id}")
        try:
            event = {
                "type":"watch",
                "watch":watch_id
            }
            await websocket.send(json.dumps(event))
            updateConnected(websocket, watch_id)
            await replay(websocket, game)
            await websocket.wait_closed()
        finally:
            connected.remove(websocket)
    else:
        await errorHandler(websocket, "Game not found.")
        return

async def play(websocket, game, player, connected):
    print('connected', connected)
    """
    handle event loop recieve and process play move from given websocket
    """
    async for message in websocket:
        event = json.loads(message)
        assert(event['type']=='play')
        print(f"{player} play {event['cur_cordinate']} to {event['new_cordinate']}")
        cur_cordinate = event['cur_cordinate']
        new_cordinate = event["new_cordinate"]
        try:
            cur_cordinate,new_cordinate = game.play(player, cur_cordinate, new_cordinate)
        except RuntimeError as e:
            await errorHandler(websocket, str(e))
            continue
        event = {
            "type":"play",
            "player":player,
            "cur_cordinate":cur_cordinate,
            "new_cordinate": new_cordinate
        }
        websockets.broadcast(connected, json.dumps(event))

        if game.winner:
            event = {
                "type":"win",
                "player": game.last_player
            }
            websockets.broadcast(connected, json.dumps(event))
    pass
async def handler(websocket):
    """
    handle new websocket connection routes to start, join or watch
    """
    message = await websocket.recv()
    event = json.loads(message)
    assert event['type'] == 'init'
    if 'join' in event:
        await joinGame(websocket, event['join'])
    elif 'watch' in event:
        await watch(websocket, event['watch'])
    else:
        await startGame(websocket)
    pass
async def main(websocket):
    async for message in websocket:
        print(message)
async def app():
    async with websockets.serve(handler, "", 8001):
        await asyncio.Future()

if __name__ == '__main__':
    asyncio.run(app())

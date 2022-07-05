player1 ='p1'
player2 ='p2'

def winCases():
    return ([
        [(0,0),(1,0),(2,0)],
        [(0,1),(1,1),(2,1)],
        [(0,2),(1,2),(2,2)],

        [(1,0),(1,1),(1,2)],

        [(0,0),(1,1),(2,2)],
        [(0,2),(1,1),(2,0)],

    ])
class Game(object):
    """docstring for Game."""

    def __init__(self, *args, **kwargs):
        super(Game, self).__init__()
        self.arg = args
        self.kwargs = kwargs
        self.state = [
            [player1,player1,player1],
            ["","",""],
            [player2,player2,player2]
        ]
        self.winner = False
        self.last_player = ""
        self.prev_moves = []
    def checkWin(self):
        spots = []
        for y in range(3):
            for x in range(3):
                if(self.state[y][x] == self.last_player):
                    spots.append((y,x))
        for case in winCases():
            if all([(i in spots) for i in case]):
                return True
        return False
    def getPrevMoves(self):
        return self.prev_moves.copy()
    def play(self, player, cur_cordinate, new_cordinate):
        #verify player
        if(player == self.last_player):
            raise RuntimeError('Invalid Move, Not Players Turn!')
        #verify current cordinate with cur_cordinates
        if(self.state[cur_cordinate[0]][cur_cordinate[1]] != player):
            raise RuntimeError('Invalid Move, Player can only move from player current spot')
        #verify to move to spot is free
        if(self.state[new_cordinate[0]][new_cordinate[1]] != ""):
            raise RuntimeError('Invalid Move, Player can only move to a free spot')
        #verify player can only move to a new spot vertically or horizontally
        if(not((abs(cur_cordinate[0]-new_cordinate[0])<=1) or (abs(cur_cordinate[1]-new_cordinate[1])<=1))):
            raise RuntimeError('Invalid Move, move not allow')
        self.state[new_cordinate[0]][new_cordinate[1]] = player
        self.state[cur_cordinate[0]][cur_cordinate[1]] = ""
        self.last_player = player
        self.prev_moves.append({
            "type":"play",
            "player":player,
            "cur_cordinate":cur_cordinate,
            "new_cordinate": new_cordinate
        })
        self.winner = self.checkWin()
        return cur_cordinate, new_cordinate

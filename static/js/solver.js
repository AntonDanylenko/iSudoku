var AllVals = new Set([1,2,3,4,5,6,7,8,9]);
var Cliques = [new Set([0,1,2,3,4,5,6,7,8]),
              new Set([9,10,11,12,13,14,15,16,17]),
              new Set([18,19,20,21,22,23,24,25,26]),
              new Set([27,28,29,30,31,32,33,34,35]),
              new Set([36,37,38,39,40,41,42,43,44]),
              new Set([45,46,47,48,49,50,51,52,53]),
              new Set([54,55,56,57,58,59,60,61,62]),
              new Set([63,64,65,66,67,68,69,70,71]),
              new Set([72,73,74,75,76,77,78,79,80]),
              new Set([0,9,18,27,36,45,54,63,72]),
              new Set([1,10,19,28,37,46,55,64,73]),
              new Set([2,11,20,29,38,47,56,65,74]),
              new Set([3,12,21,30,39,48,57,66,75]),
              new Set([4,13,22,31,40,49,58,67,76]),
              new Set([5,14,23,32,41,50,59,68,77]),
              new Set([6,15,24,33,42,51,60,69,78]),
              new Set([7,16,25,34,43,52,61,70,79]),
              new Set([8,17,26,35,44,53,62,71,80]),
              new Set([0,1,2,9,10,11,18,19,20]),
              new Set([3,4,5,12,13,14,21,22,23]),
              new Set([6,7,8,15,16,17,24,25,26]),
              new Set([27,28,29,36,37,38,45,46,47]),
              new Set([30,31,32,39,40,41,48,49,50]),
              new Set([33,34,35,42,43,44,51,52,53]),
              new Set([54,55,56,63,64,65,72,73,74]),
              new Set([57,58,59,66,67,68,75,76,77]),
              new Set([60,61,62,69,70,71,78,79,80])
              ];
var squares = [[0,1,2,9,10,11,18,19,20],
              [3,4,5,12,13,14,21,22,23],
              [6,7,8,15,16,17,24,25,26],
              [27,28,29,36,37,38,45,46,47],
              [30,31,32,39,40,41,48,49,50],
              [33,34,35,42,43,44,51,52,53],
              [54,55,56,63,64,65,72,73,74],
              [57,58,59,66,67,68,75,76,77],
              [60,61,62,69,70,71,78,79,80]
              ];
var rows = [[0,1,2,3,4,5,6,7,8],
            [9,10,11,12,13,14,15,16,17],
            [18,19,20,21,22,23,24,25,26],
            [27,28,29,30,31,32,33,34,35],
            [36,37,38,39,40,41,42,43,44],
            [45,46,47,48,49,50,51,52,53],
            [54,55,56,57,58,59,60,61,62],
            [63,64,65,66,67,68,69,70,71],
            [72,73,74,75,76,77,78,79,80],
            ];
var cols = [[0,9,18,27,36,45,54,63,72],
            [1,10,19,28,37,46,55,64,73],
            [2,11,20,29,38,47,56,65,74],
            [3,12,21,30,39,48,57,66,75],
            [4,13,22,31,40,49,58,67,76],
            [5,14,23,32,41,50,59,68,77],
            [6,15,24,33,42,51,60,69,78],
            [7,16,25,34,43,52,61,70,79],
            [8,17,26,35,44,53,62,71,80],
            ];
var clique_list = [squares, rows, cols];
var neighbors = {};
makeNeighbors();


class MyStack {
  constructor(cells = [], list = [], guesses = []){
    this.cells = cells;
    this.stack = list; // stack of boards
    this.guess = guesses; // stack of guess_boards
  }

  string(){
    return this.stack;
  }

  push(args){
    this.cells.push(args[0]);
    this.stack.push(args[1]);
    this.guess.push(args[2]);
  }

  pop(){
    return [this.cells.pop(), this.stack.pop(), this.guess.pop()];
  }
}


function makeNeighbors(){
  for (var cell=0; cell<81; cell++){
    var temp = [];
    for (var clique=0; clique<Cliques.length; clique++){
      // console.log(Cliques[clique]);
      if (Cliques[clique].has(cell)){
        Cliques[clique].forEach(function (val){
            // console.log(val);
            if (!temp.includes(val)){
              temp.push(val);
            }
          });
      }
    }
    neighbors[cell] = temp;
  }
}

function printBoard(board){
  var result = "";
  for (var x=0; x<9; x++){
    for (var y=0; y<9; y++){
      if (board[x*9+y]=="_"){
        result+="[ ]";
      }
      else {
        result = result + "[" + board[x*9+y] + "]";
      }
    }
    result+="\n";
  }
  console.log(result);
}

function compBoards(board0, board1){
  for (var x=0; x<81; x++){
    if (board0[x]!=board1[x] && board0[x]!='_'){
      return false;
    }
  }
  return true;
}

function checkBoard(board){
  for (var search_type=0; search_type<3; search_type++){
    for (var clique=0; clique<clique_list[search_type].length; clique++){
      var nums = [];
      for (var cell=0; cell<clique_list[search_type][clique].length; cell++){
        if (nums.includes(board[clique_list[search_type][clique][cell]])){
          return false;
        }
        nums.push(board[clique_list[search_type][clique][cell]]);
      }
    }
  }
  return true;
}





function findClique(cell, search_type){
  if (cell==-1){
    return clique_list[search_type][0];
  }
  for (var clique=0; clique<clique_list[search_type].length; clique++){
    if (clique_list[search_type][clique].includes(cell)){
      return clique_list[search_type][clique];
    }
  }
  return null;
}

function nextClique(clique, search_type){
  var index = clique_list[search_type].indexOf(clique);
  if (index!=8){
    return clique_list[search_type][index+1];
  }
  return null;
}



function nextOpenCell(board, prev_cell){
  for (var x=prev_cell+1; x<board.length; x++){
    if (board[x]=='_'){
      return x;
    }
  }
  return null;
}

function nextOpenCellinClique(board, prev_cell, clique){
  var start = 0;
  if (clique.includes(prev_cell)){
    start = clique.indexOf(prev_cell)+1;
  }
  for (var x=start; x<clique.length; x++){
    if (board[clique[x]]=='_'){
      return clique[x];
    }
  }
  return null;
}



function canPlace(board, cell, num){
  if (board[cell]!='_'){
    return false;
  }
  for (var x=0; x<neighbors[cell].length; x++){
    if (board[neighbors[cell][x]]==num){
      return false;
    }
  }
  return true;
}

function soleCandidate(board, cell){
  var candidate = -1;
  for (var num=1; num<10; num++){
    if (canPlace(board,cell,num)){
      if (candidate==-1){
        candidate=num;
      }
      else {
        return 0;
      }
    }
  }
  return candidate;
}

function nextSoleCandidate(board, prev_cell){
  for (var x=prev_cell+1; x<board.length; x++){
    if (board[x]=='_'){
      var num = soleCandidate(board,x);
      if (num!=0){
        return [x,num];
      }
    }
  }
  return [81,0];
}



function nextValidGuess(board, cell, num){
  var temp = [0,false];
  for (var guess=num; guess<10; guess++){
    if (canPlace(board,cell,guess)){
      if (temp[0]==0){
        temp = [guess,true];
      }
      else {
        return [temp[0],false];
      }
    }
  }
  return temp;
}

function getGuesses(board, cell){
  var guesses = [];
  for (var x=1; x<10; x++){
    if (canPlace(board,cell,x)){
      guesses.push(x);
    }
  }
  if (guesses.length==0){
    return [0,0,0,0,0,0,0,0,0];
  }
  else {
    return guesses;
  }
}

function makeGuessBoard(board){
  var guess_board = [];
  for (var x=0; x<81; x++){
    guess_board.push(getGuesses(board,x));
  }
  return guess_board;
}

function getShortestIndex(array){
  var min = 0;
  for (var x=0; x<array.length; x++){
    if (array[x].length<array[min].length){
      min = x;
    }
  }
  return min;
}




function case0(board, state){
  var sole_num = nextSoleCandidate(board,-1);
  while (sole_num[0]!=81){
    if (sole_num[1]==-1){
      // console.log("ERROR FOUND 0");
      state = 3;
      return [board,state];
    }
    board[sole_num[0]] = sole_num[1];
    sole_num = nextSoleCandidate(board,sole_num[0]);
  }
  // printBoard(board);
  // console.log(compBoards(board,solved));
  state = 1;
  return [board,state];
}

function case1(board, state){
  var cells_changed = 0;
  for (var cur_num=1; cur_num<10; cur_num++){
    for (var search_type=0; search_type<3; search_type++){
      var clique = findClique(0,search_type);
      while (clique!=null){
        var sole_spot = [-1, false];
        var cell = nextOpenCellinClique(board,-1,clique);
        while (cell!=null){
          if (canPlace(board,cell,cur_num)){
            if (sole_spot[0]==-1){
              sole_spot = [cell, true];
            }
            else {
              sole_spot = [cell, false];
            }
          }
          cell = nextOpenCellinClique(board,cell,clique);
        }
        if (sole_spot[1]){
          board[sole_spot[0]] = cur_num;
          cells_changed+=1;
        }
        clique = nextClique(clique,search_type);
      }
    }
  }
  // printBoard(board);
  // console.log(compBoards(board,solved));
  if (cells_changed!=0){
    state = 0;
  }
  else {
    state = 2;
  }
  return [board,state];
}


function execute(board){
  var mystack = new MyStack();
  var guess_board = [];
  var state = 0;

  while (board.includes('_')){
    switch (state){

      case 0:
        // console.log("CASE 0 SOLE NUM");
        var update = case0(board,state);
        board = update[0];
        state = update[1];
        break;

      case 1:
        // console.log("CASE 1 SOLE SPOT");
        var update = case1(board,state);
        board = update[0];
        state = update[1];
        if (state==2){
          guess_board = makeGuessBoard(board);
        }
        break;

      case 2:
        // console.log("CASE 2 GUESS");
        var cell = getShortestIndex(guess_board);
        // printBoard(guess_board);
        if (guess_board[cell].length==0){
          state = 3;
          break;
        }
        board[cell] = guess_board[cell][0];
        guess_board[cell] = guess_board[cell].slice(1);
        mystack.push([cell,board.slice(0),guess_board.slice(0)])

        // printBoard(board);
        // console.log(compBoards(board,solved));
        state = 0;
        break;

      case 3:
        // console.log("CASE 3 BACKTRACK");
        var popped = mystack.pop();
        board = popped[1];
        guess_board = popped[2];

        // printBoard(guess_board);
        // printBoard(board);
        // console.log(compBoards(board,solved));
        state = 2;
        break;
    }
  }

  return board;
}





function shuffle(array){
  if (array.includes(0)){
    return array;
  }

  var result = [];
  while (array.length>0){
    var num = array[Math.floor(Math.random()*array.length)];
    result.push(num);
    array = array.filter(function(item) {return item !== num});
  }
  return result;
}

function makeGuessRandom(board){
  var guess_board = [];
  for (var x=0; x<81; x++){
    guess_board.push(shuffle(getGuesses(board,x)));
  }
  return guess_board;
}

function generateFilled(){
  var board = Array(81).fill("_");
  var mystack = new MyStack();
  var guess_board = [];
  var state = 0;

  while (board.includes('_')){
    switch (state){

      case 0:
        // console.log("CASE 0 SOLE NUM");
        var update = case0(board,state);
        board = update[0];
        state = update[1];
        break;

      case 1:
        // console.log("CASE 1 SOLE SPOT");
        var update = case1(board,state);
        board = update[0];
        state = update[1];
        if (state==2){
          guess_board = makeGuessRandom(board);
          // printBoard(guess_board);
        }
        break;

      case 2:
        // console.log("CASE 2 GUESS");
        var cell = getShortestIndex(guess_board);
        if (guess_board[cell].length==0){
          state = 3;
          break;
        }
        board[cell] = guess_board[cell][0];
        guess_board[cell] = guess_board[cell].slice(1);
        mystack.push([cell,board.slice(0),guess_board.slice(0)])

        // printBoard(board);
        // console.log(compBoards(board,solved));
        state = 0;
        break;

      case 3:
        // console.log("CASE 3 BACKTRACK");
        var popped = mystack.pop();
        board = popped[1];
        guess_board = popped[2];

        // printBoard(guess_board);
        // printBoard(board);
        // console.log(compBoards(board,solved));
        state = 2;
        break;
    }
  }

  return board;
}




var test_board_easy = ['_', '_', '_', '_', '_', '_', '_', '_', '_',
                      '_', '7', '9', '_', '5', '_', '1', '8', '_',
                      '8', '_', '_', '_', '_', '_', '_', '_', '7',
                      '_', '_', '7', '3', '_', '6', '8', '_', '_',
                      '4', '5', '_', '7', '_', '8', '_', '9', '6',
                      '_', '_', '3', '5', '_', '2', '7', '_', '_',
                      '7', '_', '_', '_', '_', '_', '_', '_', '5',
                      '_', '1', '6', '_', '3', '_', '4', '2', '_',
                      '_', '_', '_', '_', '_', '_', '_', '_', '_'];

var solved_test_board_easy = ["3","4","5","8","7","1","2","6","9",
                              "2","7","9","6","5","3","1","8","4",
                              "8","6","1","4","2","9","5","3","7",
                              "1","9","7","3","4","6","8","5","2",
                              "4","5","2","7","1","8","3","9","6",
                              "6","8","3","5","9","2","7","4","1",
                              "7","3","8","2","6","4","9","1","5",
                              "5","1","6","9","3","7","4","2","8",
                              "9","2","4","1","8","5","6","7","3"];

var test_board_hard = ["_","_","_","_","_","3","_","1","7",
                      "_","1","5","_","_","9","_","_","8",
                      "_","6","_","_","_","_","_","_","_",
                      "1","_","_","_","_","7","_","_","_",
                      "_","_","9","_","_","_","2","_","_",
                      "_","_","_","5","_","_","_","_","4",
                      "_","_","_","_","_","_","_","2","_",
                      "5","_","_","6","_","_","3","4","_",
                      "3","4","_","2","_","_","_","_","_"];

var solved_test_board_hard = ["2","9","4","8","6","3","5","1","7",
                              "7","1","5","4","2","9","6","3","8",
                              "8","6","3","7","5","1","4","9","2",
                              "1","5","2","9","4","7","8","6","3",
                              "4","7","9","3","8","6","2","5","1",
                              "6","3","8","5","1","2","9","7","4",
                              "9","8","6","1","3","4","7","2","5",
                              "5","2","1","6","7","8","3","4","9",
                              "3","4","7","2","9","5","1","8","6"];

var test_board_escargot = ["1","_","_","_","_","7","_","9","_",
                          "_","3","_","_","2","_","_","_","8",
                          "_","_","9","6","_","_","5","_","_",
                          "_","_","5","3","_","_","9","_","_",
                          "_","1","_","_","8","_","_","_","2",
                          "6","_","_","_","_","4","_","_","_",
                          "3","_","_","_","_","_","_","1","_",
                          "_","4","_","_","_","_","_","_","7",
                          "_","_","7","_","_","_","3","_","_"];

var solved_test_board_escargot = ["1","6","2","8","5","7","4","9","3",
                                  "5","3","4","1","2","9","6","7","8",
                                  "7","8","9","6","4","3","5","2","1",
                                  "4","7","5","3","1","2","9","8","6",
                                  "9","1","3","5","8","6","7","4","2",
                                  "6","2","8","7","9","4","1","3","5",
                                  "3","5","6","4","7","8","2","1","9",
                                  "2","4","1","9","3","5","8","6","7",
                                  "8","9","7","2","6","1","3","5","4"];

function test(){
  // console.log(Cliques);

  // test_stack = new MyStack();
  // console.log(test_stack.string());
  // test_stack.push([80,3]);
  // test_stack.push([1,9]);
  // console.log(test_stack.string());

  // console.log(test_board);

  // makeNeighbors();
  // console.log(neighbors);

  // console.log(findClique(9,1));
  // console.log(nextClique(findClique(80,0),0));

  // console.log(nextOpenCell(test_board,0));
  // console.log(nextOpenCellinClique(test_board,9,findClique(9,1)));

  // console.log(canPlace(test_board,9,3));
  // console.log(soleCandidate(test_board, 40));
  // console.log(nextSoleCandidate(test_board,-1));

  // console.log(nextValidGuess(test_board,40,1));

  // console.log(test_board);
  // printBoard(test_board);

  // printBoard(test_board_easy);
  // start_time = new Date().getTime();
  // printBoard(execute(test_board_easy,solved_test_board_easy));
  // console.log(new Date().getTime() - start_time);

  // start_time = new Date().getTime();
  // var filled = generateFilled();
  // console.log(new Date().getTime() - start_time);
  // printBoard(filled);
  // console.log(checkBoard(filled));
}

test();

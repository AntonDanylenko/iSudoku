// Anton Danylenko, Ian Searfoss

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var selected;
var test_board = ["7", "1", "9", "4", "6", "3", "8", "2", "5",
                  "2", "5", "6", "7", "8", "1", "9", "4", "3",
                  "4", "8", "_", "9", "2", "5", "7", "6", "1",
                  "1", "9", "5", "6", "7", "8", "4", "3", "2",
                  "8", "6", "4", "2", "3", "9", "1", "5", "7",
                  "3", "7", "2", "1", "5", "4", "6", "9", "8",
                  "5", "4", "7", "3", "1", "6", "2", "8", "9",
                  "6", "2", "8", "5", "9", "7", "3", "1", "4",
                  "9", "3", "1", "8", "4", "2", "5", "7", "6"];
var init_board;
var cur_board;
var pencil_board;
var utensil;
var unlocked = true;

var timer;
var t;
var timer_active;
var boardRef = document.querySelector(".board");
var pauseRef = document.querySelector(".pauseMenu");
var secretFontChange;

// MAIN FUNCTIONS

function newGame(){
  selected = null;
  init_board = test_board.slice();
  // init_board = document.getElementById("puzzle").innerHTML.split(',');
  cur_board = init_board.slice();
  pencil_board = [];
  for (var i=0; i<81; i++) {
    pencil_board.push(['_','_','_','_','_','_','_','_','_']);
  }
  utensil = 0; // pen
  unlocked = true;
  timer = 0;
  timer_active = false;
  secretFontChange = false;
  setupBoard();
  timer_active = true;
  // console.log("setupBoard startTimer");
  startTimer();
  // checkPause();
  closeModal();
}

function setupBoard(){
  /* Draws the gridlines for the sudoku board */
  // console.log("SETUP BOARD");
  // console.log(cur_board);
  context.clearRect(0,0,canvas.width,canvas.height);
  placeSudoku();
  context.strokeStyle = 'black';
  for(var i=1; i<9; i++){
    // console.log("i: ", i);
    if(i==3 || i==6){
      context.lineWidth = 5;
    }
    else{
      context.lineWidth = 1;
    }
    context.beginPath();
    context.moveTo(i*context.canvas.width/9, 0);
    context.lineTo(i*context.canvas.width/9, context.canvas.height);
    context.stroke();
    context.beginPath();
    context.moveTo(0, i*context.canvas.height/9);
    context.lineTo(context.canvas.width, i*context.canvas.height/9);
    context.stroke();
  }
}

// window.addEventListener('focus', startTimer);
// window.addEventListener('blur', pauseTimer);

document.addEventListener('click', function(event) {
  /* Determines what to do when user clicks inside the board */
  // console.log("CLICK EVENT");
  var rect = canvas.getBoundingClientRect(canvas, event);
  var mousePos = [event.clientX - rect.left, event.clientY - rect.top];
  // console.log(mousePos);
  if (mousePos[0]>=0 && mousePos[1]>=0 &&
      mousePos[0]<=canvas.width && mousePos[1]<=canvas.height &&
      unlocked){
    var sectorX = findSector(mousePos[0], canvas.width);
    var sectorY = findSector(mousePos[1], canvas.height);
    // console.log("selected: "+selected)
    // console.log("sectorX: " + sectorX + ", sectorY: " + sectorY);
    if (selected && selected[0]==sectorX && selected[1]==sectorY) {
      unselectSquare(selected[0], selected[1]);
    } else if (selected) {
      unselectSquare(selected[0], selected[1]);
      selectSquare(mousePos[0], mousePos[1]);
    } else {
      selectSquare(mousePos[0], mousePos[1]);
    }
  }
  else if (selected && unlocked){
    unselectSquare(selected[0], selected[1]);
  }
}, false);

document.addEventListener('keydown', function(event) {
  /* If a square is selected and the user presses a number
     from 1 to 9, the number is placed in that square.
     If the user presses any of the arrow keys,
     the selected square is changed. */
  // console.log"KEYPRESS EVENT");
  key = event.keyCode;
  // console.log("Key: " + key);
  num = parseInt(String.fromCharCode(key));
  // console.log("Num: " + num);
  // console.log("isNum? "+([1,2,3,4,5,6,7,8,9].includes(num)));
  if (selected && unlocked){
    var index = (selected[1]*9/canvas.height)*9 + selected[0]*9/canvas.width;
    // console.log("Index: " + index);
    if (37<=key && key<=40){
      moveSelected(canvas, key);
    }
    else if (key==8){
      if (cur_board[index]=='_') {
        clearPencilCell(selected[0], selected[1]);
      }
      else {
        clearCell(selected[0], selected[1]);
      }
    }
    else if ([1,2,3,4,5,6,7,8,9].includes(num)) {
      if (init_board[index]=='_'){
        if (utensil){
          // console.log("debug: " + pencil_board[index][num-1]);
          if (cur_board[index]!='_') {
            clearCell(selected[0],selected[1]);
            pencilFullCell(selected[0],selected[1]);
          }
          if (num==pencil_board[index][num-1]){
            clearPencil(num, selected[0], selected[1]);
          }
          else {
            pencilNumber(num, selected[0], selected[1]);
          }
        }
        else {
          if (num==cur_board[index]){
            clearCell(selected[0], selected[1]);
          }
          else {
            writeNumber(num, selected[0], selected[1], error_cells=checkCell(num, index));
            if (checkWin()){
              winTime();
            }
          }
        }
      }
    }
  }
  if (key==32 && unlocked){
    // console.log("!utensil: " + !utensil);
    switchUtensil(!utensil);
  }
  else if (key==27) {
    if (selected) {
      unselectSquare(selected[0],selected[1]);
    }
    checkPause();
  }
}, false);

function writeNumber(number, x, y, error_cells, type='temp') {
  /* Writes the number in the square
      coresponding to the x and y coordinates */
  // console.log("WRITE NUMBER");
  var sectorX = findSector(x, canvas.width);
  var sectorY = findSector(y, canvas.height);
  var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
  // console.log("" + sectorX + ", " + sectorY)
  context.clearRect(sectorX+9, sectorY+9, canvas.width/9-18, canvas.height/9-18);
  context.font = '50px Arial';
  if(secretFontChange){
    context.font = '50px Comic Sans MS'
  }
  context.fillStyle = 'black';

  if (type=='perm'){
    context.fillStyle = 'lightgrey';
    context.fillRect(sectorX, sectorY, canvas.width/9, canvas.height/9);
    context.fillStyle = 'black';
  }

  if (error_cells.size) {
    context.fillStyle = 'red';
    // var offset = 6;
    // context.fillStyle = 'red';
    // context.fillRect(sectorX+2*offset, sectorY+2*offset, canvas.width/9-4*offset, canvas.height/9-4*offset);
    // context.lineWidth = 5;
    // context.strokeStyle = 'red';
    // for (let i of error_cells) {
    //   error_x = getX(i);
    //   error_y = getY(i);
    //   context.strokeRect(error_x+offset, error_y+offset, canvas.width/9-2*offset, canvas.height/9-2*offset);
    // }
  }

  context.fillText(number, sectorX+20, sectorY+(canvas.width/9)-16);
  cur_board[index] = number;
}








// HELPER FUNCTIONS

function placePermNum(num, index){
  /* places a permanent number into sudoku board */
  // console.log("" + num + ", " + index)
  var sectorX = (index%9)*(canvas.width/9);
  var sectorY = Math.floor(index/9)*(canvas.height/9);
  // console.log("" + sectorX + ", " + sectorY);
  writeNumber(num, sectorX, sectorY, checkCell(num, index), 'perm');
}

function placeSudoku(){
  /* places all permanent numbers into sudoku board */
  for (var cell=0; cell<init_board.length; cell++){
    if (init_board[cell]!='_'){
      placePermNum(init_board[cell], cell);
    }
  }
}

function placeAll() {
  // console.log("PLACE ALL");
  for (var i=0; i<81; i++) {
    x = getX(i);
    y = getY(i);
    if (cur_board[i]!='_' && init_board[i]=='_') {
      writeNumber(cur_board[i], x, y, checkCell(cur_board[i], i));
    }
    else {
      pencilFullCell(x, y);
    }
  }
}

function findSector(coord, total) {
  /* Determines which square the coordinate belongs too */
  // console.log("FIND SECTOR");
  return Math.floor(coord*9/total)*(total/9);
}

function getX (ind) {
  return (ind%9)*(canvas.width/9);
}

function getY (ind) {
  return Math.floor(ind/9)*(canvas.height/9);
}

function clearCell(x, y) {
  /* Clears the cell at coordinates x, y */
  // console.log("CLEAR CELL");
  var sectorX = findSector(x, canvas.width);
  var sectorY = findSector(y, canvas.height);
  var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
  // console.log("" + sectorX + ", " + sectorY)
  context.clearRect(sectorX+9, sectorY+9, canvas.width/9-18, canvas.height/9-18);
  pencilFullCell(x,y);
  cur_board[index] = '_';
}

function pencilNumber(num, x, y) {
  // console.log("PENCIL NUMBER");
  var sectorX = findSector(x, canvas.width);
  var sectorY = findSector(y, canvas.height);
  var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
  context.font = '15px Arial';
  if(secretFontChange){
    context.font = '15px Comic Sans MS'
  }
  context.fillStyle = 'black';
  context.fillText(num, sectorX+10+20*((num-1)%3), sectorY+20+18*Math.floor((num-1)/3));
  pencil_board[index][num-1] = num;
}

function clearPencil (number, x, y) {
  // console.log("CLEAR PENCIL");
  var sectorX = findSector(x, canvas.width);
  var sectorY = findSector(y, canvas.height);
  var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
  context.clearRect(sectorX+10+20*((num-1)%3), sectorY+9+18*Math.floor((num-1)/3), 8, 12);
  pencil_board[index][num-1] = '_';
}

function pencilFullCell (x, y) {
  // console.log("PENCIL FULL CELL");
  var sectorX = findSector(x, canvas.width);
  var sectorY = findSector(y, canvas.height);
  var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
  for (var i=0; i<9; i++) {
    if (pencil_board[index][i]!='_') {
      pencilNumber(i+1, x, y);
    }
  }
}

function clearPencilCell (x, y) {
  // console.log("CLEAR PENCIL CELL");
  var sectorX = findSector(x, canvas.width);
  var sectorY = findSector(y, canvas.height);
  var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
  context.clearRect(sectorX+9, sectorY+9, canvas.width/9-18, canvas.height/9-18);
  for (var i=0; i<9; i++) {
    pencil_board[index][i]='_'
  }
}

function selectSquare(x, y) {
  /* Selects the square that coresponds to the
     given x and y coordinates and outlines it */
  // console.log("SELECT SQUARE");
  var sectorX = findSector(x, canvas.width);
  var sectorY = findSector(y, canvas.height);
  var offset = 6;
  // console.log("sectorX: " + sectorX + ", sectorY: " + sectorY);
  context.lineWidth = 5;
  context.strokeStyle = "#50AEEE";
  context.strokeRect(sectorX+offset, sectorY+offset, canvas.width/9-2*offset, canvas.height/9-2*offset);
  selected = [sectorX, sectorY];
}

function unselectSquare(x, y) {
  /* Unselects the square and removes outline */
  // console.log("UNSELECT SQUARE");
  var sectorX = findSector(x, canvas.width);
  var sectorY = findSector(y, canvas.height);
  var index = (sectorY*9/canvas.height)*9 + sectorX*9/canvas.width;
  // console.log("sectorX: " + sectorX + ", sectorY: " + sectorY);
  // console.log("Index: " + index)
  context.fillStyle = 'white';
  if (init_board[index]!='_'){
    context.fillStyle = 'lightgrey';
  }
  context.fillRect(sectorX+3, sectorY+3, canvas.width/9-6, 6);
  context.fillRect(sectorX+3, sectorY+3, 6, canvas.height/9-6);
  context.fillRect(sectorX+3, sectorY+canvas.height/9-9, canvas.width/9-6, 6);
  context.fillRect(sectorX+canvas.width/9-9, sectorY+3, 6, canvas.height/9-6);
  // context.clearRect(sectorX+3, sectorY+3, canvas.width/9-6, canvas.height/9-6);
  selected = null;
}

function moveSelected(canvas, key) {
  /* Change the square selected based off the
     arrow key pressed. */
  // console.log("MOVE SELECTED");
  var context = canvas.getContext('2d');
  curX = selected[0];
  curY = selected[1];
  unselectSquare(selected[0], selected[1]);
  if (key==37){ // left arrow
    if (curX!=0) {
      curX-=canvas.width/9;
    }
    else {
      curX=canvas.width*8/9;
    }
  }
  else if (key==38){ // up arrow
    if (curY!=0) {
      curY-=canvas.height/9;
    }
    else {
      curY=canvas.height*8/9;
    }
  }
  else if (key==39){ // right arrow
    if (curX!=canvas.width*8/9) {
      curX+=canvas.width/9;
    }
    else {
      curX=0;
    }
  }
  else if (key==40){ // down arrow
    if (curY!=canvas.height*8/9) {
      curY+=canvas.height/9;
    }
    else {
      curY=0;
    }
  }
  selectSquare(curX, curY);
}






function changeTimer(){
  /*
  starts the timer everytime the page is reloaded
  */
  document.getElementById("time").innerHTML = displayTime(timer);
  t = setTimeout(function(){ changeTimer() }, 1000);
  timer = timer + 1;
}

function displayTime(calcTime){
  var hours = Math.floor(calcTime / 3600);
  calcTime = calcTime % 3600;
  var minutes = Math.floor(calcTime / 60);
  calcTime = calcTime % 60;
  var seconds = Math.floor(calcTime);

  seconds = addZeros(seconds);
  minutes = addZeros(minutes);

  return `${hours}:${minutes}:${seconds}`
}

function startTimer(){
  /*
  starts the timer
  */
  if (unlocked){
    timer_active = true;
    // console.log("startTimer changeTimer")
    changeTimer();
    document.querySelector(".pauseMenu").style.display = "none";
  }
  else {
    openModal();
  }
}

function pauseTimer(){
  /*
  pauses the timer when pause is clicked
  */
  clearTimeout(t);
  timer_active = false;
  if (unlocked){
    document.querySelector(".pauseMenu").style.display = "block";
  }
}

function checkPause(){
  /*
  checks if hitting pause will pause or start timer
  */
  if(timer_active){
    pauseTimer();
  }
  else {
    // timer = timer - 1;
    // console.log("checkPause startTimer");
    startTimer();
  }
  // document.getElementById("board").style.display = "block";
  if (unlocked) {
    boardRef.classList.toggle("hidden");
  }
}

function addZeros(i){
  /*
  adds zeros to the start of times less than 10 so it looks better
  */
  if(i < 10){
    i = "0" + i;
  }
  return i;
}

function secret(){
  if(!secretFontChange){
    document.querySelector("body").style.fontFamily = "Comic Sans MS, Arial, Sans-serif"
    secretFontChange = true;
  }
  else{
    document.querySelector("body").style.fontFamily = "Arial, Sans-serif"
    secretFontChange = false;
  }
  setupBoard();
  placeAll();
  // checkPause();
}

function switchUtensil(button) {
  /* Swith utensil depending on what button user clicks */
  if (button==1) {
    utensil=1; // pencil
    document.getElementById("pen").className = "";
    document.getElementById("pencil").className = "active";
  }
  else {
    utensil=0; // pen
    document.getElementById("pencil").className = "";
    document.getElementById("pen").className = "active";
  }
}

function openModal(){
  // console.log("OPEN MODAL");
  // console.log(unlocked);
  document.getElementById("winAlert").style.display = "block";
  document.getElementById("finalTime").innerHTML = "Time: " + displayTime(timer-1);
}

function closeModal(){
  // console.log("CLOSE MODAL");
  document.getElementById("winAlert").style.display = "none";
}

var cliques = [[0,1,2,3,4,5,6,7,8],
[9,10,11,12,13,14,15,16,17],
[18,19,20,21,22,23,24,25,26],
[27,28,29,30,31,32,33,34,35],
[36,37,38,39,40,41,42,43,44],
[45,46,47,48,49,50,51,52,53],
[54,55,56,57,58,59,60,61,62],
[63,64,65,66,67,68,69,70,71],
[72,73,74,75,76,77,78,79,80],
[0,9,18,27,36,45,54,63,72],
[1,10,19,28,37,46,55,64,73],
[2,11,20,29,38,47,56,65,74],
[3,12,21,30,39,48,57,66,75],
[4,13,22,31,40,49,58,67,76],
[5,14,23,32,41,50,59,68,77],
[6,15,24,33,42,51,60,69,78],
[7,16,25,34,43,52,61,70,79],
[8,17,26,35,44,53,62,71,80],
[0,1,2,9,10,11,18,19,20],
[3,4,5,12,13,14,21,22,23],
[6,7,8,15,16,17,24,25,26],
[27,28,29,36,37,38,45,46,47],
[30,31,32,39,40,41,48,49,50],
[33,34,35,42,43,44,51,52,53],
[54,55,56,63,64,65,72,73,74],
[57,58,59,66,67,68,75,76,77],
[60,61,62,69,70,71,78,79,80]];

function checkCell(num, cell_num){
  error_cells = new Set();
  for (var i=0; i<cliques.length; i++) {
    if (cliques[i].includes(cell_num)) {
      for (var ii=0; ii<9; ii++) {
        if (cliques[i][ii]!=cell_num && cur_board[cliques[i][ii]]==num) {
          error_cells.add(cliques[i][ii]);
        }
      }
    }
  }
  // console.log(error_cells);
  return error_cells;
}

function checkWin(){
  // console.log(cur_board);
  if (! cur_board.includes('_')){
    for (var i=0; i<cliques.length; i++) {
      var nums = [1,2,3,4,5,6,7,8,9];
      // console.log("nums: "+nums);
      for (var ii=0; ii<9; ii++) {
        index = nums.indexOf(parseInt(cur_board[cliques[i][ii]]));
        if (index>-1){
          nums.splice(index,1);
        }
        else{
          // console.log("has error");
          // console.log(i*9+ii);
          return false;
        }
      }
    }
    return true;
  }
  // console.log("has empty spaces");
  return false;
}

function winTime(){
  unlocked = false;
  pauseTimer();
  unselectSquare(selected[0],selected[1]);
  openModal();
}

function updateInfoBoard(){
  var formRef = document.getElementById("infoBoard");
  if(formRef.elements[0].value == ""){
    // alert("You must enter a name!!")
    return
  }
  var formParent = formRef.parentElement
  var listRef = document.getElementById("infoList");
  var listThatGetsAddedTo = document.createElement("p");
  var checkedRadio = "easy";
  var listOfDifficultyElements = document.getElementsByName("difficulty");
  for (var i = 0; i < listOfDifficultyElements.length; i++) {
    if (listOfDifficultyElements[i].checked){
      checkedRadio = listOfDifficultyElements[i].value;
    }
  }
  var selectedNum = 10;
  var numList = document.getElementsByName("enjoyment");
  for (var i = 0; i < numList.length; i++) {
    if (numList[i].selected){
      selectedNum = numList[i].value;
    }
  }
  var textStuff = document.createTextNode(formRef.elements[0].value + ": " + checkedRadio + " - " + selectedNum + "/10");
  listThatGetsAddedTo.appendChild(textStuff);
  formRef.remove()
  formParent.insertBefore(document.createTextNode("Thanks for your feedback!"), formParent.childNodes[2]);
  listRef.insertBefore(listThatGetsAddedTo, listRef.childNodes[0]);
}
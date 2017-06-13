var express = require('express');
var router  = express.Router();

var search   = require('../astar');

var Graph    = search.Graph;
var astar    = search.astar;

var flood = require('../snake/flood');

// console.log(grid);
// Handle POST request to '/start'
router.post('/start', function (req, res) {
  // NOTE: Do something here to start the game
  var coords = [
    [0,0],
    [0,0],
    [0,0],
  ];
  // Response data
  var data = {
    color: "#ffffff",
    name: "Cool Snake",
    health_points : 100,
    head_url: "http://www.placecage.com/c/200/200", // optional, but encouraged!
    taunt: "Let's do thisss thang!",                // optional, but encouraged!
    coords : coords
  }

  return res.json(data);
})

var other_snakes = [];

function initHead(){
  var head = {
    up    : [0,0],
    left  : [0,0],
    down  : [0,0],
    right : [0,0],
    coord : [0,0],
    x     : 0,
    y     : 0,
  };
  return head;
}

function initTail (){
  var tail = {
    up     : [0,0],
    left   : [0,0],
    down   : [0,0],
    right  : [0,0],
    coord     : [0,0],
    direction : '',
    behind : [0,0]

  };
  return tail;
}

function getAndGraphMySnake(data, gameState){
  try{
    var my_id    = data.you;
    var snakes   = data.snakes;
    var mySnake  = {}
    other_snakes = []
    for(var i = 0 ; i < snakes.length; i++){
      var coords = snakes[i].coords;
      if(snakes[i].id.indexOf(my_id) > -1){
        //found my snake 
        mySnake       = snakes[i];
        mySnake.head  = initHead();
        mySnake.head.coord = coords[0];
        mySnake.foodPaths  = [];
        mySnake.tail       = initTail();
        mySnake.tail.coord = coords[coords.length-1];
      }else{
        other_snakes.push(snakes[i]);
      }
      // Graph them on the board
      for(var j = 0; j < coords.length; j++){
        var coord = coords[j];
        gameState[coord[1]][coord[0]] = 0; 
      }
    }
    return mySnake;
  }catch(e){
    console.log(e);
    return;
  }
}

function fillGraphWithOnes(width, height){
  var graph = []
  for(var i = 0 ; i < width; i++){    // rows
    var row = [];
    for(var j = 0; j < height; j++){  // cols
      row.push(1);
    }
    graph.push(row);
  }
  return graph;
}

function graphFoodSources(data, graph){
  var foodSource = data.food;
  if(foodSource.length > 0){
    var x, y ;
    for(var i = 0; i < foodSource.length; i++){
      x = foodSource[i][1];  // x
      y = foodSource[i][0]; 
      graph[x][y] = 2;
    }
  }
}



function getGameBoard(data){
  try{
    var height = data.height ;
    var width  = data.width ;
    var gameBoard = fillGraphWithOnes(width, height);
    var snakes = data.snakes;
    // Find all the food and graph them
    graphFoodSources(data,gameBoard);
    // get snake position
    // Puts my snake info global variable my_snake
    getAndGraphMySnake(data, gameBoard);
    return gameBoard;
  }catch(e){
    console.log(e);
    return e;
  }
}
function updateCurrentHeadInfo(snake){
  var coord = snake.head.coord;
  console.log(coord);
  snake.head.left[0]  =  snake.head.coord[0] -1;
  snake.head.left[1]  =  snake.head.coord[1];
  snake.head.right[0] =  snake.head.coord[0]+1;
  snake.head.right[1] =  snake.head.coord[1];
  snake.head.up[0]    =  snake.head.coord[0];
  snake.head.up[1]    =  snake.head.coord[1]-1;
  snake.head.down[0]  =  snake.head.coord[0] ;
  snake.head.down[1]  =  snake.head.coord[1]+1;
}

function getAvailableMovesAndSetHead(gameState, snake, width, height){
  var head  = snake.head;
  var coord = snake.head.coord;
  var x     = coord[1];
  var y     = coord[0];
  var moves =  {
    up     :  0,
    down   :  0,
    left   :  0,
    right  :  0,
  }
  snake.head.x   = y;
  snake.head.y   = x;
  
  console.log("head (" + snake.head.x  + ","+ snake.head.y +")" );
  if(snake.head.x == width -1){    // at the right-most of the board
    // console.log("im @ the RIGHT wall");
    moves.left          = gameState[snake.head.y][snake.head.x-1];
    moves.right         = 0;
  }else if(snake.head.x == 0){     // at the left-most of the board
    moves.left         = 0;
    moves.right = gameState[snake.head.y][snake.head.x+1];  

  }else{     
    // not on the edge of the board
    moves.left      = gameState[snake.head.y][snake.head.x-1];  
    // Right 
    moves.right      = gameState[snake.head.y][snake.head.x+1];  
  }
  // Y axis
  if(snake.head.y == height -1 ){
    moves.up        = gameState[snake.head.y-1][snake.head.x];
    moves.down      = 0;
  }else if(snake.head.y == 0){
    moves.up   =  0;
    moves.down = gameState[snake.head.y+1][snake.head.x];
  }else{
    // Up
    moves.up   = gameState[snake.head.y-1][snake.head.x];
    // Down
    moves.down = gameState[snake.head.y+1][snake.head.x];
  }


  updateCurrentHeadInfo(snake);
  snake.moves = moves;
  // console.log(snake.moves);
  return moves;
}

function findDirectionOfSnake(snake){
  // console.log("Finding driection");
  var head = snake.head;
  var body = snake.coords[1];
  // console.log(body);
  if(head.left !== null && head.left === 'object'){
    if(head.left.equals(body)){
      snake.direction = 'east';
      snake.moves.left = 0;      
    }
  }
  if(head.right !== null && head.right === 'object'){
    if(head.right.equals(body)){
      snake.direction = 'west'; 
      snake.moves.right = 0;
    }
  }
  if(head.up !== null && head.up === 'object'){
    if(head.up.equals(body)){
      snake.direction = 'south';
      snake.moves.up  = 0;
    }
  }
  if(head.down !== null && head.down === 'object'){
    if(head.down.equals(body)){
      snake.direction  = 'north';
      snake.moves.down = 0;
    }
  }

}

function findDirectionOfTail (snake){
  console.log("Finding snake tail info");
  var tail = snake.tail.coord;
  var body = snake.coords[snake.coords.length-2];
  var tailX = tail[0];
  var tailY = tail[1];
  if(tailX == (body[0] -1) && tailY == body[1] ){
    snake.tail.direction  = 'east';
    snake.tail.behind[0]  = tail[0] -1 ;
    snake.tail.behind[1]  = tail[1];
  }
  if(tailX == ( body[0] +1 ) && tailY == body[1]){
    snake.tail.direction  = 'west'; 
    snake.tail.behind[0]  = tail[0] +1 ;
    snake.tail.behind[1]  = tail[1];
  }
  if(tailX == body[0] && tailY == ( body[1] -1 ) ){
    snake.tail.direction  = 'south';
    snake.tail.behind[0]  = tail[0];
    snake.tail.behind[1]  = tail[1] -1;

  }
  if(tailX == body[0] && tailY == (body[1] + 1 ) ){
    snake.tail.direction  = 'north';
    snake.tail.behind[0]  = tail[0];
    snake.tail.behind[1]  = tail[1] + 1;
  }

}

function getDirectionFromPath(snake, path){
  try{
    var head = snake.head;
    var nextMove = path[0];
    var direction = '';
    var nextX  = nextMove.x;
    var nextY  = nextMove.y;
    console.log(head);
    console.log("nextX = " + nextX + " nextY = " + nextY);
    console.log("headx = " + head.x + "heady = " + head.y);

    if(nextX == head.x -1 && nextY == head.y){
      direction = 'left';
    }else if(nextX == head.x +1 && nextY == head.y ){
      direction = 'right';
    }else if(nextX == head.x && nextY == head.y -1){
      direction = 'up';
    }else if(nextX == head.x && nextY == head.y +1 ){
      direction = 'down';
    }else{
      console.log("NO PATH");
      direction = 'down';
    }
    return direction;
  }catch(e){
    console.log(e);
  }
}


function randomMovement(moves){
  var numOfMoves = moves.length;
  return moves[Math.floor(Math.random() * 100) % numOfMoves];
}

function findPathForSnake(snake, data, gameState ,graph,  next){  
  try{
    var headCoord     = snake.head.coord; 
    var health_points = snake.health_points;
    var paths       = [];
    var foodSources = data.food;
    var start       = graph.grid[headCoord[0]][headCoord[1]];
    var direction   = findDirectionOfSnake(snake);
    var height      = data.height;
    var width       = data.width;
    if(snake.health_points <= 70){
      // console.log("Start Point (" + headCoord[0] + ","+ headCoord[1] +")")
      for(var i = 0; i < foodSources.length; i++){
        (function(i){
          var foodLocation = foodSources[i];
          var end   = graph.grid[foodLocation[0]][foodLocation[1]];

          console.log("searching : start (" + headCoord[0]  + "," + headCoord[1] + ")"  )
          console.log("searching : end (" + foodLocation[0] + "," + foodLocation[1] + ")"  )

          var path  = astar.search(graph, start, end,  { heuristic: astar.heuristics.manhattan });
          paths.push(path);
          // console.log(path.length);
          if(i == foodSources.length -1){
            snake.foodPaths = paths; // found all paths
            // Shortest to longest
            paths.sort(function(a,b){
              return a.length > b.length;
            });
            next(paths);  // return shortest path
          }
        })(i);
      }
    }else{
      // console.log(snake);
      if(snake.coords.length > 5){
        console.log("finding snake tail");
        findDirectionOfTail(snake);
        console.log("tail direc = " + snake.tail.direction);
        console.log(snake.tail);
        if(snake.tail.behind[0] > 0 && snake.tail.behind[1] > 0 && snake.tail.behind[0] < width && snake.tail.behind[1] < height ){
          var tailBehind = snake.tail.behind; // tail
          var tailGrid   = graph.grid[tailBehind[0], tailBehind[1]];
          var path  = astar.search(graph, start, tailGrid,  { heuristic: astar.heuristics.manhattan });
          paths.push(path);
          next(paths);
        }else{
          next([]); //no paths
        }
      }else{
        next([]);
      }
    }
  }catch(e){
    console.log(e);
  }
}

function printPath(path){
  console.log("printing path" );
  for(var i = 0 ; i < path.length; i++){
    console.log(path[i].x + ', ' + path[i].y );
  }
}
// function followTailPath(snake){

// }

function handle_snake(req, res, next){
  var data   = req.body;
  var width  = data.width;
  var height = data.height;
  // console.log(data);
  var response = {
    move: 'up', // one of: ['up','down','left','right']
    taunt: 'Outta my way, snake!', // optional, but encouraged!
  };
  try{
    // console.log(data);
    var move;
    var graph;
    var mySnake   = {};
    var gameState = getGameBoard(data);
    var available_moves = [];

    // get snake position
    // Puts my snake info global variable my_snake
    var mySnake = getAndGraphMySnake(data, gameState);
    graph = new Graph(gameState);
    findPathForSnake(mySnake, data, gameState, graph, function(paths){
      var shortest = [];
      if( typeof paths === 'object'){
        for(var i = 0 ; i < paths.length; i++){
          console.log(paths[i].length); // callback for paths
          if(paths[i].length > 0){
            shortest = paths[i];
            break;
          }
        }
      }
      // console.log(shortest);
      // console.log("shorest path to food is " + shortest.length);
      if(shortest.length > 0){
        // console.log("I have shortest path");
        var path = shortest; // shortest path is the first index
        var moves = getAvailableMovesAndSetHead(gameState, mySnake, width, height);
        // console.log(moves);
        // console.log("Find direaction of snake");
        findDirectionOfSnake(mySnake);
        // console.log("get direaction from snake");

        move = getDirectionFromPath(mySnake,shortest);
        console.log(mySnake);
        console.log('Moving.. '+ move);

        available_moves = getAvailableMoves(mySnake);

        if (available_moves.length <= 2){ // flood area no matter what
          move = floodAreaAndGetMove(data,mySnake);
        }else{
          if(mySnake.moves[move] > 0){
            response.move = move;
           // console.log("I have move : " + move);
            // console.log("direction " + mySnake.direction);
          }else{
            console.log("I dont shortest path");
            // No optimal move 
            var head = mySnake.head;
            var pathToTail = shortest;
            // console.log("I dont have best move, need to find move");
            // console.log(head);
            var moves = getAvailableMovesAndSetHead(gameState, mySnake, width, height);
            findDirectionOfSnake(mySnake);
            // console.log(moves);
            var available_moves = getAvailableMoves(mySnake);

            // Find the first Available move
            if(pathToTail.length > 0){
              console.log("Follow tail ");
              printPath(pathToTail);
              move = getDirectionFromPath(mySnake, pathToTail);
              console.log("move to tail  " + move);
            }

            if(move == null || available_moves.indexOf(move) == -1){
              console.log("Do a random move");
              move = randomMovement(available_moves);
            }
          }
        }
        response.move = move;
      }else{
         // No path to food   
        // console.log("No path");
        try{
          // console.log(graph);
          var moves = getAvailableMovesAndSetHead(gameState, mySnake, width, height);
          // console.log(moves);
          findDirectionOfSnake(mySnake);
          // console.log(mySnake.moves);
          available_moves = getAvailableMoves(mySnake);
          // console.log(available_moves);
          if(available_moves.length <= 2){
            // Run flood 
            move = floodAreaAndGetMove(data,mySnake);
            console.log("my move is = " + move);
          }else{
            move = randomMovement(available_moves);
            console.log("random move" + move);

          }
          response.move = move;
        }catch(e){
          console.log(e);
        }
      }
    });
  }catch(e){
    console.log(e);
  }
  res.json(response);
}

function getAvailableMoves(snake){
  var available_moves = [];
  for(var prop in snake.moves){
    if(snake.moves[prop] > 0){
      available_moves.push(prop);
    }
  }
  return available_moves;
}


function floodAreaAndGetMove (data, snake){
  // Run flood 
  var newMove = '';
  var maxArea = 0;
  var available_moves = getAvailableMoves(snake);
  //Flood each move

  var gameState  = getGameBoard(data);  // Generate a copy of the current game state
  for(var i = 0; i < available_moves.length; i++){
    var move      = available_moves[i];
    var tempGraph = getGameBoard(data);  // Generate a copy of the current game state
    console.log(tempGraph);
    updateCurrentHeadInfo(snake);
    console.log(snake.head);

    console.log("move = " + move );
    console.log("Filling (" + snake.head[move][0] + ", " +  snake.head[move][1] +  ")")
    var area      = flood.fillArea(snake.head[move][1], snake.head[move][0],gameState, 3,tempGraph);
    console.log(area)
    if(area.count > maxArea){
      maxArea  = area.count;
      newMove  = move;
    }
  }
  console.log("new move = " + newMove);
  return newMove;
}


// Assist functions
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}


// Handle POST request to '/move'
router.post('/move', handle_snake);

module.exports = router


module.exports = {
  flood : flood,
  fillArea  : fillArea,
  countFloodArea : countFloodArea, 
}
function initStack(size){
  var stack = [];
  for(var i = 0; i < size; i++){
    stack.push([0,0]);
  }
  return stack;
}

function countFloodArea(x, y, original, fill, arr) {
  var maxX = original[0].length - 1;
  var maxY = original[0].length - 1;
  var size  = (maxX + 1) * (maxY + 1 );
  var stack = initStack(size);
  var index = 0;       
  var count = 0;
  stack[0][0] = x;
  stack[0][1] = y;
  arr[x][y] = fill;
  while (index >= 0){
    x = stack[index][0];
    y = stack[index][1];
    index--;            
    if ((x > 0) && (arr[x-1][y] == original[x-1][y]) && arr[x-1][y] > 0  ){
      count++;
      index++;
      stack[index][0] = x-1;
      stack[index][1] = y;
    }
    if ((x < maxX) && (arr[x+1][y] == original[x+1][y]) && arr[x+1][y] > 0 ){
      count++;
      index++;
      stack[index][0] = x+1;
      stack[index][1] = y;
    }

    if ((y > 0) && (arr[x][y-1] == original[x][y-1]) && arr[x][y-1] > 0 ){
      count++;
      index++;
      stack[index][0] = x;
      stack[index][1] = y-1;
    }                
    if ((y < maxY) && (arr[x][y+1] == original[x][y+1]) && arr[x][y+1] > 0 ){
      count++;
      index++;
      stack[index][0] = x;
      stack[index][1] = y+1;
    }                          
  }
  return arr;
}
function fillArea(x, y, original, fill, arr) {
  var maxX = original[0].length - 1;
  var maxY = original[1].length - 1;
  var size  = (maxX + 1) * (maxY + 1 );
  var stack = initStack(size);
  var index = 0;   
  var count = 0;    
  stack[0][0] = x;
  stack[0][1] = y;
  arr[x][y] = fill;
  while (index >= 0){
    x = stack[index][0];
    y = stack[index][1];
    index--;            
    if ((x > 0) && (arr[x-1][y] == original[x-1][y]) && arr[x-1][y] > 0  ){
      arr[x-1][y] = fill;
      index++;
      count++;
      stack[index][0] = x-1;
      stack[index][1] = y;
    }
    if ((x < maxX) && (arr[x+1][y] == original[x+1][y]) && arr[x+1][y] > 0 ){
      arr[x+1][y] = fill;
      count++;
      index++;
      stack[index][0] = x+1;
      stack[index][1] = y;
    }
    if ((y > 0) && (arr[x][y-1] == original[x][y-1]) && arr[x][y-1] > 0 ){
      arr[x][y-1] = fill;
      index++;
      count++;

      stack[index][0] = x;
      stack[index][1] = y-1;
    }                
    if ((y < maxY) && (arr[x][y+1] == original[x][y+1]) && arr[x][y+1] > 0 ){
      arr[x][y+1] = fill;
      index++;
      count++;
      stack[index][0] = x;
      stack[index][1] = y+1;
    }                          
  }
  return {
    arr   : arr, 
    count : count,
  }
}
function flood (grid, width, height, x, y, filler) {
  var empty  =  1;
  var queuex = [x]
  var queuey = [y]
  var curry, currx
  var minx = x
  var miny = y
  var maxx = x
  var maxy = y
  var area = 0
  var verty
  var north
  var south
  var n


  while (queuey.length) {
    console.log(queuey);

    currx = queuex.pop()
    curry = queuey.pop()
    minx = currx < minx ? currx : minx
    maxx = currx > maxx ? currx : maxx
    row = currx * height;

    console.log('curry' + curry);

    if (grid[currx][curry] === empty) {
      north = south = curry
      do {
        north -= 1
      } while (
        grid[currx][north] === empty &&
        north >= 0
      )
      do {
        south += 1
      } while (
        grid[currx][south] === empty &&
        south < height
      )

      miny = north+1 < miny ? north+1 : miny
      maxy = south-1 > maxy ? south-1 : maxy

      console.log("north = " + north);
      console.log("south = " + south);

      for (n = north + 1; n < south; n += 1) {
        console.log(currx, n);
        grid[currx][n] = filler;
        area += 1

        if (grid[currx - 1][n] === empty) {
          queuex.push(currx - 1)
          queuey.push(n)
        }
        if (grid[currx + 1][n] === empty) {
          queuex.push(currx + 1)
          queuey.push(n)
        }
      }
    }
  }

  return {
      lo: [minx, miny]
    , hi: [maxx, maxy]
    , area: area
  }
}



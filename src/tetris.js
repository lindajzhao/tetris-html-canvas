// https://www.youtube.com/watch?v=H2aW5V46khA

const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

ctx.scale(20, 20);

// Tetris pieces
const SHAPES = {
	T: [
		[0, 0, 0],
		[1, 1, 1],
		[0, 1, 0],
  ],
	L: [
    [0, 2, 0],
    [0, 2, 0],
    [0, 2, 2],
  ],
	J: [
    [0, 3, 0],
    [0, 3, 0],
    [3, 3, 0],
  ],
	O: [
    [4, 4],
    [4, 4],
  ],
	Z: [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ],
	S: [
    [0, 6, 6],
    [6, 6, 0],
    [0, 0, 0],
  ],
  I: [
    [0, 7, 0, 0],
    [0, 7, 0, 0],
    [0, 7, 0, 0],
    [0, 7, 0, 0],
  ],
}

const COLORS = [
  null,
  '#e1f7d5',
  '#ffbdbd',
  '#c9c9ff',
  '#f1cbff',
  '#ffffba',
  '#baffc9',
  '#ffb3ba',
]

const KEY_CODES = {
  LEFT: 37,
  RIGHT: 39,
  DOWN: 40,
  SPACE: 32,
  Q: 81,
  W: 87,
}

// dropCounter = time since last drop
let dropCounter = 0;

// Drop piece 1 step every 1s
let dropInterval = 1000;

// beginning of time interva;
let lastTime = 0;


createMatrix = (w, h) => {
	// render placed/static pieces 
	const matrix = [];
	while (h--) {
		matrix.push(new Array(w).fill(0))
	}
	return matrix;
}

createPiece = () => {
  // return a random shape
  return Object.values(SHAPES)[Object.keys(SHAPES).length * Math.random() | 0];
}

const player = {
  matrix: null,
  pos: { x: 0, y: 0 },
  score: 0,
}

const arena = createMatrix(12, 20);

arenaSweep = () => {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
  }

  player.score += rowCount * 10;
  rowCount *= 2;
}

collide = (arena, player) => {
	// define current piece and offset
	const [piece, offset] = [player.matrix, player.pos];
		
  // Check every row
  // Check every col in row
  // There is a collision if '1' in the piece + arena at the same place
	for (let y = 0; y < piece.length; y++ ) {
		for (let x = 0; x < piece[y].length; x++) {
      const collisionDefinition = 
        piece[y][x] !== 0 &&
        (arena[y + offset.y] &&
          arena[y + offset.y][x + offset.x]) !== 0;

			if (collisionDefinition) {
				// Yes, there is a collision at this x + y
				return true;
			}
		}
	}
  // else: No, there's no collision at this x + y
  return false;
}

draw = () => {	
	// Re-render background every time
	ctx.fillStyle = '#333';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {x:0, y:0})
	// Render tetris piece in new position
	drawMatrix(player.matrix, player.pos);
}

// force constant update
update = (time = 0) => {
	// deltaTime = time since last update()
	const deltaTime = time - lastTime;
	lastTime = time;

	dropCounter += deltaTime;
	if (dropCounter > dropInterval) {
		playerDrop();
	}

	draw();
	requestAnimationFrame(update);
}

// Render tetris piece by using fillRect
drawMatrix = (matrix, offset) => {
	matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			// skip empty rows (matrix value = 0)
			if(value) {
					ctx.fillStyle = COLORS[value];
					ctx.fillRect(
						x + offset.x,
						y + offset.y,
						1, 1
					);
			}
		})
	})
}

merge = (arena, player) => {
	// add current piece to arena
	player.matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if(value) {
				arena[y + player.pos.y][x + player.pos.x] = value;
			}
		})
	})
}

playerReset = () => {
  player.matrix = createPiece();
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

  // Check if pieces are at the top (game over)
  if (collide(arena, player)) {
    alert('Game over!');
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

playerDrop = () => {  
  player.pos.y++;
  
  // Check if touching another piece or the ground
	if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  };
	dropCounter = 0;
}

playerMoveX = x => {
  player.pos.x += x;
  if (collide(arena, player)) {
    player.pos.x -= x;
  }
}

playerRotate = dir => {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while(collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    // if (offset > player.matrix[0].length) {
    //   rotate(player.matrix, -dir);
    //   player.pos.x = pos;
    //   return;
    // }
  }
}

rotate = (matrix, dir) => {
  // Transpose + Reverse = rotate
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x],
      ] = 
      [
        matrix[y][x],
        matrix[x][y],
      ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

updateScore = () => {
  document.getElementsByClassName('score')[0].innerText = player.score;
}

onKeydown = (keyCode) => {
  // move player piece using left, right, down and space keys
  // rotate with 'q' and 'w'
	switch (keyCode) {
		case KEY_CODES.LEFT:
      return playerMoveX(-1);
    case KEY_CODES.RIGHT:
      return playerMoveX(1);
    case KEY_CODES.DOWN:
			return playerDrop();
    case KEY_CODES.SPACE:
			return playerDrop();
    case KEY_CODES.Q:
			return playerRotate(-1);
    case KEY_CODES.W:
			return playerRotate(1);
	}
	return null;
}

initTetris = () => {
  document.addEventListener('keydown', e => onKeydown(e.keyCode))
  playerReset();
	update();
};

initTetris();

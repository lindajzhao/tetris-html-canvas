// https://www.youtube.com/watch?v=H2aW5V46khA

const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

ctx.scale(20, 20);

// Tetris pieces. 3x3 to allow rotation around center
const SHAPES = {
	T: [
		[0, 0, 0],
		[1, 1, 1],
		[0, 1, 0],
	]
}

const player = {
	matrix: SHAPES.T,
	pos: { x: 5, y: 5 }
}

// dropCounter = time since last drop
let dropCounter = 0;

// Drop piece 1 step every 1s
let dropInterval = 1000;

// beginning of time interva;
let lastTime = 0;


const createMatrix = (w, h) => {
	// render placed/static pieces 
	const matrix = [];
	while (h--) {
		matrix.push(new Array(w).fill(0))
	}
	return matrix;
}

const arena = createMatrix(12, 20);

const collide = (arena, player) => {
	// define current piece and offset
	const [piece, offset] = [player.matrix, player.pos];
		
	for (let y = 0; y < piece.length; y++ ) {
		for (let x = 0; x < piece[y].length; x++) {
			const collisionDefinition = piece[y][x] && arena[y + offset.y] && arena[y + offset.y][x + offset.x];
			console.log('__', piece)
			console.log('__', piece[y])
			console.log('__', piece[y][x])
			// console.log('__', arena[y + offset.y]);
			// console.log('__', arena[y + offset.y][x + offset.x]);
			
			if (collisionDefinition) {
				// Yes, there is a collision at this x + y
				return true;
			}
		}
	}
	console.count('__________count')
	// else: No, there's no collision at this x + y
	return false;
}

const draw = () => {	
	// Re-render background every time
	ctx.fillStyle = '#333';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Render tetris piece in new position
	drawMatrix(player.matrix, player.pos);
}

// force constant update
const update = (time = 0) => {
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
const drawMatrix = (matrix, offset) => {
	matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			// skip empty rows (matrix value = 0)
			if(value) {
					ctx.fillStyle = 'red';
					ctx.fillRect(
						x + offset.x,
						y + offset.y,
						1, 1
					);
			}
		})
	})
}

const merge = (arena, player) => {
	// add current piece to arena
	player.matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if(value) {
				arena[y + player.pos.y][x + player.pos.x] = value;
			}
		})
	})
}

const playerDrop = () => {
	player.pos.y++;
	collide(arena, player);
	dropCounter = 0;
}

const onMove = (keyCode) => {
	// move player piece using left, right, down and space keys
	switch (keyCode) {
		case 37:
			return player.pos.x--;
		case 39:
			return player.pos.x++;
		case 40:
			playerDrop();
		case 32:
			playerDrop();
	}
	return null;
}

initTetris = () => {
	document.addEventListener('keydown', e => onMove(e.keyCode))
	update();
};

initTetris();

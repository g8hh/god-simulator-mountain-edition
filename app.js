let gameWidth = 612;
let blockHeight = 16;
let maxWidth = 500;
let elapsed = Date.now();
var prng = new Math.seedrandom();
let missedSteps = 0;
let hintShown = false;

let app,
	Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics;

var playerState = localStorage.getItem('playerState');

if (playerState == null) {
	playerState = {
		accuracy: 10,
		zoom: 400,
		baseWidth: 100,
		highestLength: 0,
		followers: 0,
		speed: 1,
		achievements: [
			{
				done: false,
				height: 57,
			}, {
				done: false,
				height: 169,
			}, {
				done: false,
				height: 324,
			}, {
				done: false,
				height: 830,
			}, {
				done: false,
				height: 8848,
			}
		],
		upgrades: {
			accuracy: [
				{
					bought: false,
					price: 10,
					bonus: 15
				}, {
					bought: false,
					price: 100,
					bonus: 10
				}, {
					bought: false,
					price: 1000,
					bonus: 5
				}, {
					bought: false,
					price: 5000,
					bonus: 5
				}, {
					bought: false,
					price: 25000,
					bonus: 5
				}, {
					bought: false,
					price: 100000,
					bonus: 5
				}, {
					bought: false,
					price: 200000,
					bonus: 5
				}, {
					bought: false,
					price: 250000,
					bonus: 5
				}, {
					bought: false,
					price: 500000,
					bonus: 5
				}, {
					bought: false,
					price: 1000000,
					bonus: 5
				}
			],
			base: [
				{
					bought: false,
					price: 10,
					bonus: 120,
					name: "Small"
				}, {
					bought: false,
					price: 1000,
					bonus: 100,
					name: "Medium"
				}, {
					bought: false,
					price: 5000,
					bonus: 60,
					name: "Big"
				}, {
					bought: false,
					price: 50000,
					bonus: 40,
					name: "OMG"
				}
			],
			speed: [
				{
					bought: false,
					price: 10,
					bonus: 1
				}, {
					bought: false,
					price: 100,
					bonus: 1
				}, {
					bought: false,
					price: 1000,
					bonus: 1
				}, {
					bought: false,
					price: 10000,
					bonus: 1
				}, {
					bought: false,
					price: 25000,
					bonus: 1
				}, {
					bought: false,
					price: 50000,
					bonus: 1
				}, {
					bought: false,
					price: 250000,
					bonus: 1
				}, {
					bought: false,
					price: 500000,
					bonus: 1
				}, {
					bought: false,
					price: 1000000,
					bonus: 1
				}
			]
		}
	};
	localStorage.setItem('playerState', JSON.stringify(playerState));
} else {
	playerState = JSON.parse(playerState);
}

let saveGame = function () {
	localStorage.setItem('playerState', JSON.stringify(playerState));
}

let restartGame = function () {
	var result = confirm("Your progress will be lost!");
	if (result) {
		localStorage.removeItem('playerState');
		window.location.reload(false); 
	}
}

let updateAchievements = function () {
	let achievementUnlocked = false;
	
	for (let index = 0; index < playerState.achievements.length; index++) {
		let achievement = playerState.achievements[index];
		
		if (achievement.done) {
			$(".achievements .achievement").eq(index).css({opacity: 1});
			$(".achievements .achievement .details").eq(index).css({filter: "blur(0)"});
			continue;
		}

		if (achievement.height <= playerState.highestLength) {
			playerState.achievements[index].done = true;
			$(".achievements .achievement").eq(index).css({opacity: 1});
			$(".achievements .achievement .details").eq(index).css({filter: "blur(0)"});
			continue;
		}

		if (achievementUnlocked == false) {
			achievementUnlocked = true;
			$(".achievements .achievement").eq(index).css({opacity: 0.5});
			$(".achievements .achievement .details").eq(index).css({filter: "blur(8px)"});
		} else {
			$(".achievements .achievement").eq(index).css({opacity: 0});
		}
	}
}

let buySpeed = function () {
	let currentSpeedUpgrade = null;
	let currentIndex = null;

	for (let index = 0; index < playerState.upgrades.speed.length; index++) {
		let upgrade = playerState.upgrades.speed[index];
		
		if (upgrade.bought) {
			continue;
		}

		currentIndex = index;
		currentSpeedUpgrade = upgrade;
		break;
	}
	
	if (currentSpeedUpgrade == null) {
		return false;
	}

	if (currentSpeedUpgrade.price > playerState.followers) {
		return false;
	}

	playerState.upgrades.speed[currentIndex].bought = true;
	reduceFollowers(currentSpeedUpgrade.price);
	updateSpeed(currentSpeedUpgrade.bonus);

	updateUpgrades();
}

let buyBase = function () {
	let currentBaseUpgrade = null;
	let currentIndex = null;

	for (let index = 0; index < playerState.upgrades.base.length; index++) {
		let upgrade = playerState.upgrades.base[index];
		
		if (upgrade.bought) {
			continue;
		}

		currentIndex = index;
		currentBaseUpgrade = upgrade;
		break;
	}
	
	if (currentBaseUpgrade == null) {
		return false;
	}

	if (currentBaseUpgrade.price > playerState.followers) {
		return false;
	}

	playerState.upgrades.base[currentIndex].bought = true;
	reduceFollowers(currentBaseUpgrade.price);
	updateBase(currentBaseUpgrade.bonus);

	updateUpgrades();
}

let buyAccuracy = function () {
	let currentAccuracyUpgrade = null;
	let currentIndex = null;

	for (let index = 0; index < playerState.upgrades.accuracy.length; index++) {
		let upgrade = playerState.upgrades.accuracy[index];
		
		if (upgrade.bought) {
			continue;
		}

		currentIndex = index;
		currentAccuracyUpgrade = upgrade;
		break;
	}
	
	if (currentAccuracyUpgrade == null) {
		return false;
	}

	if (currentAccuracyUpgrade.price > playerState.followers) {
		return false;
	}

	playerState.upgrades.accuracy[currentIndex].bought = true;
	reduceFollowers(currentAccuracyUpgrade.price);
	updateAccuracy(currentAccuracyUpgrade.bonus);

	updateUpgrades();
}

let updateUpgrades = function () {
	let upgradeExists = false;
	for (let index = 0; index < playerState.upgrades.accuracy.length; index++) {
		let upgrade = playerState.upgrades.accuracy[index];
		
		if (upgrade.bought) {
			continue;
		}

		$(".upgrades .accuracy .price strong").text(numeral(upgrade.price).format("0a", Math.floor));
		$(".upgrades .accuracy .effect strong").text("+" + upgrade.bonus + "%");

		upgradeExists = true;

		break;
	}

	if (upgradeExists == false) {
		$(".upgrades .accuracy .price").remove();
		$(".upgrades .accuracy .effect strong").text("MAX");
		$(".upgrades .accuracy").addClass("max");
	}

	upgradeExists = false;
	for (let index = 0; index < playerState.upgrades.base.length; index++) {
		let upgrade = playerState.upgrades.base[index];
		
		if (upgrade.bought) {
			continue;
		}

		$(".upgrades .base .price strong").text(numeral(upgrade.price).format("0a", Math.floor));
		$(".upgrades .base .effect strong").text(upgrade.name);

		upgradeExists = true;

		break;
	}

	if (upgradeExists == false) {
		$(".upgrades .base .price").remove();
		$(".upgrades .base .effect strong").text("MAX");
		$(".upgrades .base").addClass("max");
	}

	upgradeExists = false;
	for (let index = 0; index < playerState.upgrades.speed.length; index++) {
		let upgrade = playerState.upgrades.speed[index];
		
		if (upgrade.bought) {
			continue;
		}

		$(".upgrades .speed .price strong").text(numeral(upgrade.price).format("0a", Math.floor));
		$(".upgrades .speed .effect strong").text("x" + (playerState.speed + upgrade.bonus));

		upgradeExists = true;

		break;
	}

	if (upgradeExists == false) {
		$(".upgrades .speed .price").remove();
		$(".upgrades .speed .effect strong").text("MAX");
		$(".upgrades .speed").addClass("max");
	}

	localStorage.setItem('playerState', JSON.stringify(playerState));
}

let gameState = {
	topWidth: playerState.baseWidth,
	floors: 1,
	droppingBlocks: [],
	completeBlocks: [],
	cameraPositionStart: 100,
	cameraPositionEnd: -20,
	lastCompleteBlock: null,
	perfectInARow: 0,
	length: 0
};

let updateLength = function (addLength) {
	gameState.length += addLength;

	if (playerState.highestLength < gameState.length) {
		playerState.highestLength = gameState.length;
		updateAchievements();
	}

	let length = gameState.length;
	let format = "0,0";
	let sign = "m";
	if (gameState.length > 1000) {
		format = "0,0.0";
		length *= 0.001;
		sign = "km";
	} else if (gameState.length > 100000) {
		format = "0,0";
		length *= 0.001;
		sign = "km";
	}

	$(".length strong").text(numeral(length).format(format, Math.floor) + sign);
}

let resetWorld = function () {
	app.stage.y = 100;

	gameState.droppingBlocks.forEach(function (block, i) {
		app.stage.removeChild(block.object);
	});
	
	gameState.completeBlocks.forEach(function (block, i) {
		app.stage.removeChild(block.object);
	});
	
	gameState = {
		topWidth: playerState.baseWidth,
		floors: 1,
		droppingBlocks: [],
		completeBlocks: [],
		cameraPositionStart: 100,
		cameraPositionEnd: -20,
		lastCompleteBlock: null,
		perfectInARow: 0,
		length: 0
	};

	generateBlock(false);
}

let reduceFollowers = function (followersSold) {
	playerState.followers -= followersSold;
	$(".followers strong").text(numeral(playerState.followers).format("0a", Math.floor));
}

let updateFollowers = function () {
	if (gameState.length > 1500) {
		playerState.followers += Math.floor(Math.pow(gameState.length * 0.01, 2));
	} else {
		playerState.followers += Math.floor(Math.pow(gameState.length * 0.1, 2));
	}
	$(".followers strong").text(numeral(playerState.followers).format("0a", Math.floor));
}

let updateAccuracy = function (addAccuracy) {
	playerState.accuracy += addAccuracy;
	$(".accuracy strong").text(playerState.accuracy + "%");
}

let updateBase = function (addBase) {
	playerState.baseWidth += addBase;
}

let updateSpeed = function (addSpeed) {
	playerState.speed += addSpeed;
}

let generateBlock = function (useAccuracy = true) {
	let x = Math.floor(gameWidth * 0.5);
	let difference = 0;

	let chance = prng();
	if (useAccuracy && chance * 100 > playerState.accuracy) {
		difference = Math.floor((chance - 0.5) * ((gameWidth - gameState.topWidth) * ((100 - playerState.accuracy) * 0.01)));
	} else if (chance * 100 <= playerState.accuracy && gameState.lastCompleteBlock != null) {
		x = gameState.lastCompleteBlock.object.x + gameState.lastCompleteBlock.width * 0.5;
	}

	x += difference;
	x -= Math.floor(gameState.topWidth * 0.5);

	let color = parseInt(randomColor({
		luminosity: 'bright'
	}).replace("#", "0x"));
	
	let rectangle = new Graphics();
	rectangle.beginFill(color);
	rectangle.drawRect(0, 0, gameState.topWidth, blockHeight);
	rectangle.endFill();
	rectangle.x = x;
	rectangle.y = 64 - (gameState.floors * blockHeight);
	app.stage.addChild(rectangle);

	let newBlock = {
		start: rectangle.y,
		end: 336 - (gameState.floors * blockHeight),
		object: rectangle,
		width: gameState.topWidth,
		color: color,
		complete: false
	};

	gameState.droppingBlocks.push(newBlock);

	let newBlockSize = getNewBlockSize(newBlock, true);
	
	if (newBlockSize != false) {
		gameState.floors += 1;
	}
}

let gameSetup = function () {
	let groundLeft = new Sprite(resources["images/ground-left.png"].texture);
	let groundCenter1 = new Sprite(resources["images/ground-center.png"].texture);
	let groundCenter2 = new Sprite(resources["images/ground-center.png"].texture);
	let groundCenter3 = new Sprite(resources["images/ground-center.png"].texture);
	let groundCenter4 = new Sprite(resources["images/ground-center.png"].texture);
	let groundCenter5 = new Sprite(resources["images/ground-center.png"].texture);
	let groundCenter6 = new Sprite(resources["images/ground-center.png"].texture);
	let groundRight = new Sprite(resources["images/ground-right.png"].texture);

	app.stage.addChild(groundLeft);
	groundLeft.position.set(50, 336);

	app.stage.addChild(groundCenter1);
	app.stage.addChild(groundCenter2);
	app.stage.addChild(groundCenter3);
	app.stage.addChild(groundCenter4);
	app.stage.addChild(groundCenter5);
	app.stage.addChild(groundCenter6);
	groundCenter1.position.set(114, 336);
	groundCenter2.position.set(178, 336);
	groundCenter3.position.set(242, 336);
	groundCenter4.position.set(306, 336);
	groundCenter5.position.set(370, 336);
	groundCenter6.position.set(434, 336);

	app.stage.addChild(groundRight);
	groundRight.position.set(498, 336);

	app.ticker.add(dt => gameLoop(dt));

	generateBlock(false);
}

let getNewBlockSize = function (block, onlyCalculate = false) {
	let newWidth = block.width;
	let newX = block.object.x;

	if (gameState.lastCompleteBlock != null) {
		if (gameState.lastCompleteBlock.object.x > block.object.x) {
			newWidth = gameState.lastCompleteBlock.width - Math.abs(gameState.lastCompleteBlock.object.x - block.object.x);
			newX = gameState.lastCompleteBlock.object.x;
		} else {
			newX = Math.abs(block.object.x - gameState.lastCompleteBlock.object.x);
			newWidth = gameState.lastCompleteBlock.width - newX;
			newX = gameState.lastCompleteBlock.object.x + newX;
		}

		if (onlyCalculate == false) {
			if (gameState.lastCompleteBlock.width - newWidth < 10) {
				gameState.perfectInARow += 1;
			} else {
				gameState.perfectInARow = 0;
			}
		}

		if (gameState.perfectInARow >= 1) {
			let bonus = Math.floor(Math.min(10, Math.max(0, maxWidth - newWidth + 10)));
			newWidth += bonus;
			newX -= Math.floor(bonus * 0.5);
		}

		if (newWidth <= 10) {
			return false;
		}

		return [newX, newWidth];
	} else {
		return [block.object.x, block.width];
	}
}

let showHint = function () {
	if (hintShown) {
		return;
	}

	hintShown = true;

	let hint = tippy(document.getElementById('exit'), {
		placement: 'bottom'
	});
	hint.show();
}

let addCompleteBlock = function (block) {
	let rectangle;
	let newBlockSize = getNewBlockSize(block);
	
	if (newBlockSize == false) {
		missedSteps += 1;

		if (missedSteps >= 3) {
			showHint();
		}
		return;
	}

	gameState.cameraPositionEnd += blockHeight;

	rectangle = new Graphics();
	rectangle.beginFill(block.color);
	rectangle.drawRect(0, 0, newBlockSize[1], blockHeight);
	rectangle.endFill();
	rectangle.x = newBlockSize[0];
	rectangle.y = block.object.y;
	app.stage.addChild(rectangle);

	gameState.lastCompleteBlock = {
		object: rectangle,
		width: newBlockSize[1]
	};

	gameState.topWidth = newBlockSize[1];

	if (gameState.length > 1500) {
		updateLength(100);
	} else {
		updateLength(10);
	}
	updateFollowers();
	
	gameState.completeBlocks.push(gameState.lastCompleteBlock);
}

let gameLoop = function (dt) {
	gameState.droppingBlocks.forEach(function (block, i) {
		if (block.complete) {
			//
		} else {
			if (block.object.y < block.end) {
				block.object.y += (block.end - block.start) * dt * 0.005 * playerState.speed;
			} else {
				block.object.y = block.end;
				block.complete = true;

				addCompleteBlock(block);
				
				app.stage.removeChild(block.object);
				gameState.droppingBlocks.splice(i, 1);

				generateBlock();
			}
		}
	});

	if (gameState.cameraPositionEnd > app.stage.y) {
		app.stage.y += (gameState.cameraPositionEnd - gameState.cameraPositionStart) * dt * 0.02;
	} else if (gameState.cameraPositionEnd != gameState.cameraPositionStart) {
		if (gameState.cameraPositionEnd > 100) {
			app.stage.y = gameState.cameraPositionEnd;
			gameState.cameraPositionStart = gameState.cameraPositionEnd;
		}
	}
}

$(function() {
	tippy('[data-tippy-content]', {
		placement: 'bottom'
	});

	app = new Application({
		width: gameWidth,
		height: 500,
		antialias: true,
		transparent: true
	});

	document.getElementById("pixi").appendChild(app.view);

	updateAccuracy(0);
	reduceFollowers(0);
	updateUpgrades();
	updateAchievements();

	$(".gui .exit").click(resetWorld);
	$(".upgrades .accuracy").click(buyAccuracy);
	$(".upgrades .base").click(buyBase);
	$(".upgrades .speed").click(buySpeed);

	$("#save-game").click(saveGame);
	$("#restart-game").click(restartGame);

	loader.add([
		"images/ground-left.png",
		"images/ground-center.png",
		"images/ground-right.png",
		"images/particle.png"
	])
	.load(gameSetup);

	app.stage.y = 100;
});
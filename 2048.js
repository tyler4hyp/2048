window.requestAnimFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function(callback) {
    window.setTimeout(callback, 1000 / 30);
};
var container = document.querySelector('.container'),
    currentScore = document.querySelector('.currentScore'),
    best = document.querySelector('.best'),
    replay = document.querySelector('.re-play'),
    cover = document.querySelector('.cover'),
    confirm = document.querySelector('.confirm'),
    mess = document.querySelector('.mess'),
    canvas,
    context,
    cards,      //方块数组
    animation;
var oldtx, oldty, tx, ty;
//字体颜色
var fontColors = ['#776e65', 'white'];
//方块背景色
var backColors = {
    	0: '#ccc0b3',
    	2: '#eee4da',
    	4: '#ede0c8',
    	8: '#f59563',
    	16: '#f59563',
    	32: '#f67c5f',
    	64: '#f65e3b',
    	128: '#edcf72',
    	256: '#edcc61',
    	512: '#edcc61',
    	1024: '#edcc61',
    	2048: '#edc22e',
    	4096: '#b784ab',
    	8192: '#ed2d08'
    };

var config = {
	interval: 10,  //方块间距
	cardSize: (screen.width -20 - 10 * 5) / 4,  //方块宽高
	isCreateNewCard: false,    //判断是否新增方块
	direction: 'left',         //移动方向
	arrayDirection: 'horizontal',   //cards是个二维数组, ‘horizontal’表示行在前列在后，‘vertical'表示列在前行在后
	isAnimate: false,   //判断是否处于方块移动过程中，移动过程中屏蔽响应事件
}

var game = {
	score: 0,    //当前分数
	best: 0,     //最高分数
	//生成canvas
	createCanvas: function(){
		canvas = document.createElement("canvas");
		canvas.setAttribute("width", screen.width - 20);
		canvas.setAttribute("height", screen.width -20);
		canvas.setAttribute("id", "canvas");
		container.appendChild(canvas);
		context = canvas.getContext('2d');
	},
	//生成背景
	drawBackground: function(){
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = '#bbada0';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = backColors[0];
        var x = 10, y = 10;
        for(var i=0; i<16; i++){
        	context.fillRect(x, y, config.cardSize, config.cardSize);
        	x = x + config.interval + config.cardSize;
        	if((i + 1) % 4 == 0){
        		x = 10;
        		y = y + config.interval + config.cardSize;
        	}
        }
	},
	//把一个大于等于1小于等于16的数字转换为行和列
	numToRowAndCol: function(num){
	    var row = Math.floor( num / 4);
    	var col = num % 4 ;
    	if(col == 0){
    		col = 4;
    	}else{
    		row += 1;
    	}
    	return [row, col];
	},
	//生成最初的三个方块
	init: function(){
		cards = new Array(4);
		for(var i = 0; i < 4 ; i ++){
			cards[i] = new Array(4);
		}
        var temp = [];
        for(var i=0; i<3; i++){
        	while(true){
        		var num = Math.round(Math.random() * 15 + 1);
        		if(temp.indexOf(num) == -1){
        		    temp.push(num);
        		    break;
        	    }
        	}
        }
        for(var i=0; i<3; i++){
        	var RowCol = this.numToRowAndCol(temp[i]);
        	if( i == 2){
        		var card = new Card(RowCol[0], RowCol[1], 4);
        	}else{
        		var card = new Card(RowCol[0], RowCol[1], 2);
        	}
        	cards[RowCol[0]-1][RowCol[1]-1] = card;
        	card.drawCard();
        }
	},
	//绑定事件
	bindEvent: function(){
		//键盘事件
		document.addEventListener('keydown', function(e){
			if(config.isAnimate){
				return false;
			};
			var key = e.keyCode || e.which || e.charCode;
			switch(key){
				case 37:
				    if(config.arrayDirection == 'vertical'){
				    	game.arrayTrans();
				    }
				    config.direction = 'left';
				    findDes();
                    animate();
				    break;
				case 38:
				    if(config.arrayDirection == 'horizontal'){
				    	game.arrayTrans();
				    }
				    config.direction = 'up';
				    findDes();
                    animate();
				    break;
				case 39:
				    if(config.arrayDirection == 'vertical'){
				    	game.arrayTrans();
				    }
				    config.direction = 'right';
				    findDes();
                    animate();
				    break;
				case 40:
				    if(config.arrayDirection == 'horizontal'){
				    	game.arrayTrans();
				    }
				    config.direction = 'down';
				    findDes();
                    animate();
				    break;
			}
		});
		replay.addEventListener('click', function(){
			game.restart();
		});
		confirm.addEventListener('click', function(){
			game.restart();
		});
        //滑动事件
		document.addEventListener('touchstart', function(e){
			if(config.isAnimate){
				return false;
			};
			oldtx = e.touches[0].clientX;
			oldty = e.touches[0].clientY;
		});
		document.addEventListener('touchend', function(e){
			if(config.isAnimate){
				return false;
			};
			tx = e.changedTouches[0].clientX;
			ty = e.changedTouches[0].clientY;
			var dx = tx - oldtx;
			var dy = ty - oldty;
			if( Math.abs(dx) > Math.abs(dy) ){
				if( dx < 0){
					if(config.arrayDirection == 'vertical'){
				    	game.arrayTrans();
				    }
				    config.direction = 'left';
				    findDes();
	                animate();
				}else{
					if(config.arrayDirection == 'vertical'){
				    	game.arrayTrans();
				    }
				    config.direction = 'right';
				    findDes();
                    animate();
				}
			}else{
				if( dy < 0 ){
					if(config.arrayDirection == 'horizontal'){
				    	game.arrayTrans();
				    }
				    config.direction = 'up';
				    findDes();
                    animate();
				}else{
					if(config.arrayDirection == 'horizontal'){
				    	game.arrayTrans();
				    }
				    config.direction = 'down';
				    findDes();
                    animate();
				}
			}
		});
	},
	//一轮动画结束后，恢复配置属性，方块相关属性
	reset: function(){
		config.isAnimate = false;
		config.isCreateNewCard = false;
		for(var i=0; i<4; i++){
			for(var j=0; j<4; j++){
				if(cards[i][j] instanceof Card){
					cards[i][j].isMerge = false;
					cards[i][j].isReach = false;
				}
			}
		}
	},
	//数组转置
	arrayTrans: function(){
		var temp = new Array(4);
		for(var m=0; m<4; m++){
			temp[m] = new Array();
		}
		for(var i=0; i<4; i++){
			for(var j=0; j<4; j++){
				temp[i].push(cards[j][i]);
			}
		}
		cards = temp;
		config.arrayDirection = (config.arrayDirection =='horizontal') ? 'vertical' : 'horizontal';
	},
	//分数更新
	updateScore: function(){
		currentScore.innerHTML = game.score;
		if(game.best <= game.score){
			game.best = game.score;
		}
		best.innerHTML = game.best
	},
	//游戏结束恢复初始状态
	restart: function(){
		window.cancelAnimationFrame(animation);
		context.clearRect(0, 0, canvas.width, canvas.height);
		game.reset();
		cards = [];
		game.score = 0;
		game.updateScore();
		config.arrayDirection = 'horizontal';
		game.drawBackground();
		game.init();
		cover.style.display = 'none';
	},
	//游戏成功判断
	success: function(){
		for(var i=0; i<4; i++){
			for(var j=0; j<4; j++){
				if(cards[i][j] instanceof Card && cards[i][j].num == 8192){
					mess.innerHTML = 'Success';
					cover.style.display = 'flex';
				}
			}
		}
	}
}
//方块对象
function Card(row, col, num){
	this.x = col * config.interval + (col - 1) * config.cardSize;
	this.y = row * config.interval + (row - 1) * config.cardSize;
	this.num = num;
	this.size = config.cardSize;
	this.row = row;         //当前列
	this.col = col;         //当前行
	this.newRow = row;      //移动目的地的行
	this.newCol = col;      //移动目的地的列
	this.isMerge = false;   //是否准备融合
	this.isReach = false;   //是否到达目的地
}
//画出方块
Card.prototype.drawCard = function(){
	context.fillStyle = backColors[this.num];
	context.fillRect(this.x, this.y, this.size, this.size);
	if(this.num > 4){
		context.fillStyle = fontColors[1];
	}else{
		context.fillStyle = fontColors[0];
	}
	context.font = "bold 30px Arial";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(this.num, this.x + this.size / 2 , this.y + this.size / 2);
}
//方块移动
Card.prototype.cardMove = function(dire){
	switch(dire){
		case 'left':
		    this.x -= (config.cardSize + config.interval) / 10;
		    break;
		case 'up':
		    this.y -= (config.cardSize + config.interval) / 10;
		    break;
		case 'right':
		    this.x += (config.cardSize + config.interval) / 10;
		    break;
		case 'down':
		    this.y += (config.cardSize + config.interval) / 10;
		    break;
	}
}
//计算目的地位置
function findDes(){
	var dire = config.direction;
	var temp = [];
	switch(dire){
		case 'left':
			for(var i=0; i<4; i++){
				//找出当前一行存在的所有方块
				for(var j=0; j<4; j++){
					if(cards[i][j] instanceof Card){
						temp.push(cards[i][j]);
					}
				}
				if(!temp.length){
					continue;
				}
				//最左边的方块的新列号设为1
				temp[0].newCol = 1;
				for(var m=1; m<temp.length; m++){
					//如果当前方块的数字和它前一个方块的数字相等，并且前一个方块没有融合
					//如果是则当前方块的新列号等于前一个方块的新列号，并且当前方块的isMerge设为true
					if( temp[m-1].num == temp[m].num && temp[m-1].isMerge == false){
						temp[m].newCol = temp[m-1].newCol;
						temp[m].isMerge = true;
					}else{
						//如果否则当前方块的新列号等于它前一个方块的新列号加1
						temp[m].newCol = temp[m-1].newCol + 1;
					}
				}
				temp = [];
			}
			break;
		case 'up':
		    for(var i=0; i<4; i++){
				for(var j=0; j<4; j++){
					//找出当前一列存在的所有方块
					if(cards[i][j] instanceof Card){
						temp.push(cards[i][j]);
					}
				}
				if(!temp.length){
					continue;
				}
				//最上面的方块的新行号设为1
				temp[0].newRow = 1;
				for(var m=1; m<temp.length; m++){
					//如果当前方块的数字和它前一个方块的数字相等，并且前一个方块没有融合
					//如果是则当前方块的新行号等于前一个方块的新行号，并且当前方块的isMerge设为true
					if( temp[m-1].num == temp[m].num && temp[m-1].isMerge == false){
						temp[m].newRow = temp[m-1].newRow;
						temp[m].isMerge = true;
					}else{
						//如果否则当前方块的新行号等于它前一个方块的新行号加1
						temp[m].newRow = temp[m-1].newRow + 1;
					}
				}
				temp = [];
			}
			break;
		//过程与向左相似，数组从尾部遍历
		case 'right':
		    for(var i=3; i>=0; i--){
				for(var j=3; j>=0; j--){
					if(cards[i][j] instanceof Card){
						temp.push(cards[i][j]);
					}
				}
				if(!temp.length){
					continue;
				}
				temp[0].newCol = 4;
				for(var m=1; m<temp.length; m++){
					if( temp[m-1].num == temp[m].num && temp[m-1].isMerge == false){
						temp[m].newCol = temp[m-1].newCol;
						temp[m].isMerge = true;
					}else{
						temp[m].newCol = temp[m-1].newCol - 1;
					}
				}
				temp = [];
			}
			break;
		//过程与向上相似，数组从尾部遍历
		case 'down':
		    for(var i=3; i>=0; i--){
				for(var j=3; j>=0; j--){
					if(cards[i][j] instanceof Card){
						temp.push(cards[i][j]);
					}
				}
				if(!temp.length){
					continue;
				}
				temp[0].newRow = 4;
				for(var m=1; m<temp.length; m++){
					if( temp[m-1].num == temp[m].num && temp[m-1].isMerge == false){
						temp[m].newRow = temp[m-1].newRow;
						temp[m].isMerge = true;
					}else{
						temp[m].newRow = temp[m-1].newRow - 1;
					}
				}
				temp = [];
			}
			break;
	}
}
//移动方块
function move(){
	var dire = config.direction;
	var temp = [];
	switch(dire){
		case 'left':
			for(var i=0; i<4 ;i++){
				for(var j=0; j<4; j++){
					if(cards[i][j] instanceof Card){
						//如果当前列号等于新列号，则说明已经到目的地，无需移动
						if(cards[i][j].col == cards[i][j].newCol){
							cards[i][j].isReach = true;
						}else{
							//计算目的地的x坐标
							var dx = cards[i][j].newCol * config.interval + (cards[i][j].newCol - 1) * config.cardSize;
							//存在移动过程, 此轮动画结束后可以生产新方块
							config.isCreateNewCard = true;
							if(cards[i][j].x == dx){
								cards[i][j].isReach = true;
								//如果当前方块的需要融合
								if(cards[i][j].isMerge){
									//创建新方块，数值为原有方块的2倍
									var card = new Card(cards[i][j].newRow, cards[i][j].newCol, cards[i][j].num * 2);
									//删除当前方块的前一个方块
									for(var k=j-1; k>=0; k--){
										if(cards[i][k] instanceof Card && cards[i][k].num == cards[i][j].num){
											cards[i][k] = undefined;
											break;
										}
									}
									//删除当前方块
								    cards[i][j] = undefined;
								    //新方块存入数组
									cards[card.row -1][card.col -1] = card;
									//分数更新
									game.score += card.num;
									game.updateScore();
								}else{
									//如果不需要融合，则重设当前方块的行和列，改变当前方块在数组中的位置
									cards[i][j].row = cards[i][j].newRow;
								    cards[i][j].col = cards[i][j].newCol;
									var arow = cards[i][j].row - 1;
									var acol = cards[i][j].col - 1;
									cards[arow][acol] = cards[i][j];
									cards[i][j] = undefined;
								}
							}else{
								//尚未抵达目的地则移动当前方块
								cards[i][j].cardMove(dire);
							}
						}
					}
				}
			}
			break;
	    case 'up':
	        for(var i=0; i<4 ;i++){
				for(var j=0; j<4; j++){
					if(cards[i][j] instanceof Card){
						//如果当前行号等于新行号，则说明已经到目的地，无需移动
						if(cards[i][j].row == cards[i][j].newRow){
							cards[i][j].isReach = true;
						}else{
							//计算目的地的y坐标
							var dy = cards[i][j].newRow * config.interval + (cards[i][j].newRow - 1) * config.cardSize;
							//存在移动过程, 此轮动画结束后可以生产新方块
							config.isCreateNewCard = true;
							if(cards[i][j].y == dy){
								cards[i][j].isReach = true;
								//如果当前方块的需要融合
								if(cards[i][j].isMerge){
									//创建新方块，数值为原有方块的2倍
									var card = new Card(cards[i][j].newRow, cards[i][j].newCol, cards[i][j].num * 2);
									//删除当前方块的前一个方块
									for(var k=j-1; k>=0; k--){
										if(cards[i][k] instanceof Card && cards[i][k].num == cards[i][j].num){
											cards[i][k] = undefined;
											break;
										}
									}
									//删除当前方块
								    cards[i][j] = undefined;
								    //新方块存入数组, 此处与上下移动不同，列在前，行在后
									cards[card.col -1][card.row -1] = card;
									//分数更新
									game.score += card.num;
									game.updateScore();
								}else{
									//如果不需要融合，则重设当前方块的行和列，改变当前方块在数组中的位置，列在前，行在后
									cards[i][j].row = cards[i][j].newRow;
								    cards[i][j].col = cards[i][j].newCol;
									var arow = cards[i][j].row - 1;
									var acol = cards[i][j].col - 1;
									cards[acol][arow] = cards[i][j];
									cards[i][j] = undefined;
								}
							}else{
								//尚未抵达目的地则移动当前方块
								cards[i][j].cardMove(dire);
							}
						}
					}
				}
			}
	        break;
	    //过程与向左相似，数组从尾部遍历
		case 'right':
		    for(var i=3; i>=0 ;i--){
				for(var j=3; j>=0; j--){
					if(cards[i][j] instanceof Card){
						if(cards[i][j].col == cards[i][j].newCol){
							cards[i][j].isReach = true;
						}else{
							var dx = cards[i][j].newCol * config.interval + (cards[i][j].newCol - 1) * config.cardSize;
							config.isCreateNewCard = true;
							if(cards[i][j].x == dx){
								cards[i][j].isReach = true;
								if(cards[i][j].isMerge){
									var card = new Card(cards[i][j].newRow, cards[i][j].newCol, cards[i][j].num * 2);
									for(var k=j+1; k<4; k++){
										if(cards[i][k] instanceof Card && cards[i][k].num == cards[i][j].num){
											cards[i][k] = undefined;
											break;
										}
									}
								    cards[i][j] = undefined;
									cards[card.row -1][card.col -1] = card;
									game.score += card.num;
									game.updateScore();
								}else{
									cards[i][j].row = cards[i][j].newRow;
								    cards[i][j].col = cards[i][j].newCol;
									var arow = cards[i][j].row - 1;
									var acol = cards[i][j].col - 1;
									cards[arow][acol] = cards[i][j];
									cards[i][j] = undefined;
								}
							}else{
								cards[i][j].cardMove(dire);
							}
						}
					}
				}
			}
		    break;
		//过程与向上相似，数组从尾部遍历
		case 'down':
		    for(var i=3; i>=0 ;i--){
				for(var j=3; j>=0; j--){
					if(cards[i][j] instanceof Card){
						if(cards[i][j].row == cards[i][j].newRow){
							cards[i][j].isReach = true;
						}else{
							var dy = cards[i][j].newRow * config.interval + (cards[i][j].newRow - 1) * config.cardSize;
							config.isCreateNewCard = true;
							if(cards[i][j].y == dy){
								cards[i][j].isReach = true;
								if(cards[i][j].isMerge){
									var card = new Card(cards[i][j].newRow, cards[i][j].newCol, cards[i][j].num * 2);
									for(var k=j+1; k<4; k++){
										if(cards[i][k] instanceof Card && cards[i][k].num == cards[i][j].num){
											cards[i][k] = undefined;
											break;
										}
									}
								    cards[i][j] = undefined;
									cards[card.col -1][card.row -1] = card;
									game.score += card.num;
									game.updateScore();
								}else{
									cards[i][j].row = cards[i][j].newRow;
								    cards[i][j].col = cards[i][j].newCol;
									var arow = cards[i][j].row - 1;
									var acol = cards[i][j].col - 1;
									cards[acol][arow] = cards[i][j];
									cards[i][j] = undefined;
								}
							}else{
								cards[i][j].cardMove(dire);
							}
						}
					}
				}
			}
		    break;
	}
}

//生成新方块
function createNewCard(){
	var temp = [];
	//寻找没有方块存在的位置
	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			if(cards[i][j] == undefined){
				temp.push([i, j]);
			}
		}
	}
	var len = temp.length - 1;
	//随机数选取一个位置
	var num = Math.round(Math.random() * len);
	var loca = temp[num];
	//生成新方块
	if(config.arrayDirection == 'horizontal'){
		var card = new Card(loca[0] + 1 , loca[1] + 1 , 2);
	}else{
		var card = new Card(loca[1] + 1 , loca[0] + 1 , 2);
	}
	cards[loca[0]][loca[1]] = card;
	card.drawCard();
}
//动画函数
function animate(){
	animation = window.requestAnimationFrame(animate, canvas);
	config.isAnimate = true;   //正在执行动画，屏蔽用户事件
	context.clearRect(0, 0, canvas.width, canvas.height);
	game.drawBackground();
	move();
	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			if(cards[i][j] instanceof Card){
				cards[i][j].drawCard();
			}
		}
	}
	var isAllReach = [];
	var isAllMerge = [];
	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			if(cards[i][j] instanceof Card){
				isAllReach.push(cards[i][j].isReach);
				isAllMerge.push(cards[i][j].isMerge);
			}
		}
	}
	//如果所有方块都完成融合并且都到达目的地，则此轮动画结束
	if(isAllReach.length != 0 && isAllReach.indexOf(false) == -1 && isAllMerge.indexOf(true) == -1){
		if(config.isCreateNewCard){
			createNewCard();
		}
		window.cancelAnimationFrame(animation);
		game.success();
		game.reset();
	}
}

game.createCanvas();
game.drawBackground();
game.init();
game.updateScore();
game.bindEvent();
//如果是chrome浏览器，则重设container高度，因为chrome视口高度包含地址栏
var isChrome = window.navigator.userAgent.indexOf("Chrome") !== -1;
if (isChrome) {
  var vH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  container.style.height = vH + 'px';
}
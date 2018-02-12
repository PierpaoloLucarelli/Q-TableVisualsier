var W = 10;
var H = 3;
var scale = 80;

function Game(){
	this.c = document.getElementById("myCanvas");
	this.width = W*scale;
	this.height = H*scale;
	this.scale = scale;
	this.actor = [0,0]

	this.hells = [
		[2,2],
		[3,0],
		[5,2],
		[7,2],
	];

	this.goal = [6,2];

	this.build_env = function(qt){

		var ctx = this.c.getContext("2d");
		ctx.rect(0, 0, W*scale, H*scale);
		ctx.fillStyle = "black";
		ctx.fill();
		for(var i = 0 ; i < H ; i++){
			for(var j = 0 ; j < W ; j++){
				ctx.beginPath();
				ctx.moveTo(j*scale,i*scale);	
				ctx.lineTo(j*scale+scale,i*scale);
				ctx.lineTo(j*scale+scale/2,i*scale+scale/2);
				var color = this.getHeat(qt[i*W+j][0]);
				ctx.fillStyle = color;
				ctx.fill();
				ctx.beginPath();
				ctx.moveTo(j*scale,i*scale);	
				ctx.lineTo(j*scale,i*scale+scale);
				ctx.lineTo(j*scale+scale/2,i*scale+scale/2);
				var color = this.getHeat(qt[i*W+j][3]);
				ctx.fillStyle = color;
				ctx.fill();
				ctx.beginPath();
				ctx.moveTo(j*scale+scale,i*scale+scale);	
				ctx.lineTo(j*scale,i*scale+scale);
				ctx.lineTo(j*scale+scale/2,i*scale+scale/2);
				var color = this.getHeat(qt[i*W+j][2]);
				ctx.fillStyle = color;
				ctx.fill();
				ctx.beginPath();
				ctx.moveTo(j*scale+scale,i*scale+scale);	
				ctx.lineTo(j*scale+scale,i*scale);
				ctx.lineTo(j*scale+scale/2,i*scale+scale/2);
				var color = this.getHeat(qt[i*W+j][1]);
				ctx.fillStyle = color;
				ctx.fill();
			}
		}
		// hells
		ctx.beginPath();
		for(var i = 0 ; i < this.hells.length ; i++){
			ctx.rect(this.hells[i][0]*scale,this.hells[i][1]*scale,scale,scale);
			ctx.fillStyle = "grey";
		}
		ctx.fill();
		// goal
		ctx.beginPath();
		ctx.rect(this.goal[0]*scale,this.goal[1]*scale,scale,scale);
		ctx.fillStyle = "blue";
		ctx.fill();

		// actor
		ctx.beginPath();
		ctx.rect(this.actor[0]*scale,this.actor[1]*scale,scale,scale);
		ctx.fillStyle = "red";
		ctx.fill();

		// grids
		ctx.beginPath();
		for(var i = 0 ; i <= W ; i++){
			ctx.moveTo(i*scale,0);	
			ctx.lineTo(i*scale,H*scale);
		}
		for(var i = 0 ; i <= H ; i++){
			ctx.moveTo(0,i*scale);	
			ctx.lineTo(W*scale,i*scale);
		}

		for(var i = 0 ; i < W ; i++){
			for(var j = 0 ; j < H ; j++){
				ctx.moveTo(i*scale,j*scale);	
				ctx.lineTo(i*scale+scale,j*scale+scale);
				ctx.moveTo(i*scale+scale,j*scale);
				ctx.lineTo(i*scale,j*scale+scale);
			}
		}
		ctx.strokeStyle="#FFFFFF";
		ctx.stroke();

		// q-values
		ctx.font = "8px Arial";
		ctx.fillStyle = "#FFFFFF";
		for(var i = 0 ; i < H ; i++){
			for(var j = 0 ; j < W ; j++){
				for(var q = 0 ; q < qt[0].length ; q++){
					ctx.fillText(qt[i*W+j][0], (j%W)*scale+scale/2-3, i*scale+scale/4+3);
					ctx.fillText(qt[i*W+j][1], (j%W)*scale+scale/4*3-3, i*scale+scale/2+3);
					ctx.fillText(qt[i*W+j][2], (j%W)*scale+scale/2-3, i*scale+scale/4*3+3);
					ctx.fillText(qt[i*W+j][3], (j%W)*scale+scale/4-3, i*scale+scale/2+3);
				}
			}
		}
	}

	this.getHeat = function(val){
		// console.log(val);
		var color = "rgb(";
		if(val >= 0){
			var g = val / 1 * 255;
			color +=  "0," + Math.round(g) + ",0)";
		} else {
			var r = val / 1 * 255;
			color += Math.round(r)*-1 + ",0,0)";
		}
		return color;
	}

	this.step = function(action){
		var n_action = this.action_outcome(action);
		this.actor[0] += n_action[0];
		this.actor[1] += n_action[1];
	}

	this.action_outcome = function(action){
		var new_action = [0,0]
		if(action == 0) // up
			if(this.actor[1] > 0)
				new_action[1]--;
		if(action == 1) // right
			if(this.actor[0] < W-1)
				new_action[0]++;
		if(action == 2) // down
			if(this.actor[1] < H-1)
				new_action[1]++;
		if(action == 3) // left
			if(this.actor[0] > 0)
				new_action[0]--;
		return new_action;
	}

	this.reward = function(){
		var reward_and_status = {
			r: 0,
			done: false
		};
		if(this.actor[0] == this.goal[0] && this.actor[1] == this.goal[1]){
			// is in goal
			reward_and_status.r = 1;
			reward_and_status.done = true;
			return reward_and_status;
		}
		else {
			for(var i = 0 ; i < this.hells.length ; i++){
				if(this.actor[0] == this.hells[i][0] && this.actor[1] == this.hells[i][1]){
					reward_and_status.r = -1;
					reward_and_status.done = true;
					return reward_and_status;			
				}

			}
		}
		return reward_and_status;
	}

	this.reset = function(){
		this.actor = [0,0];
		this.build_env(ql.qtable);
	}
}


function QLearner(gamma, lr){
	this.gamma = gamma;
	this.lr = lr;
	this.zeros = function(dimensions) {
    	var array = [];
    	for (var i = 0; i < dimensions[0]; ++i) {
        	array.push(dimensions.length == 1 ? 0 : this.zeros(dimensions.slice(1)));
    	}
    	return array;
	}
	this.qtable = this.zeros([W*H,4]);

	this.learn = function(s,r,a,s_){
		var i = s[1] * W + s[0];
		var i_ = s_[1] * W + s_[0];
		var q_predict = this.qtable[i][a];
		if(!r.done)
			q_target = r.r + this.gamma * Math.max(...this.qtable[i_]);
		else
			q_target = r.r;
		// update qtable
		this.qtable[i][a] += this.lr * (q_target - q_predict);
		this.qtable[i][a] = this.qtable[i][a].toFixed(3) / 1;
	}
}


var game = new Game();
var ql = new QLearner(0.9, 0.5);
game.build_env(ql.qtable);


document.onkeydown = function(e){
	var a = checkKey(e);
	var s = game.actor.slice();
	game.step(a);
	var s_ = game.actor.slice();
	game.build_env(ql.qtable);
	var r = game.reward();
	ql.learn(s, r, a, s_);


	if(r.done){
		setTimeout(function() {
    		game.reset();
		}, 100);
	}
}

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        return 0;
    }
    else if (e.keyCode == '40') {
        // down arrow
        return 2;
    }
    else if (e.keyCode == '37') {
       // left arrow
       	return 3;
    }
    else if (e.keyCode == '39') {
       // right arrow
       	return 1;
    }

}

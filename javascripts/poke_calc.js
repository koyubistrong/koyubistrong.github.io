

var PokeCalc = (function() {

  class PokeCalc {

	static init() {
		var goal_level = document.getElementById("goal_level");
		var current_level = document.getElementById("current_level");
		for(var level = 1; level <= 100; level++) {
			var opt = document.createElement("option");
			opt.value = level;
			opt.innerText = level;
			goal_level.appendChild(opt);
			var opt2 = document.createElement("option");
			opt2.value = level;
			opt2.innerText = level;
			current_level.appendChild(opt2);
		}
		goal_level.options[99].selected = true;
		PokeCalc.recalc();
	}
	
	static recalc() {
		var exp_type = document.getElementById("exp_type");
		var current_exp = document.getElementById("current_exp");
		var goal_exp = document.getElementById("goal_exp");
		var current_level = parseInt(document.getElementById("current_level").value);
		var goal_level = parseInt(document.getElementById("goal_level").value);
		var ex_type = parseInt(exp_type.value);
		var cur_val = PokeCalc.calcNeedExp(ex_type, current_level);
		var goal_val = PokeCalc.calcNeedExp(ex_type, goal_level);
		if(document.getElementById("ch_any_exp").checked) {
			cur_val = parseInt(current_exp.value);
			if(isNaN(cur_val)) {
				cur_val = 0;
			}
			current_exp.readOnly = false;
		}
		else {
			current_exp.readOnly = true;
		}
		current_exp.value = cur_val;
		goal_exp.value = goal_val;
		
		var candies = [
			{key: "xl", exp:30000},
			{key: "l", exp:10000},
			{key: "m", exp:3000},
			{key: "s", exp:800},
			{key: "xs", exp:100},
		];
		
		var diff_val = goal_val - cur_val;
		var ch_diff_val = diff_val;
		for(var candy of candies) {
			var exp_candy = document.getElementById("exp_candy_" + candy.key);
			var exp_candy2 = document.getElementById("exp_candy2_" + candy.key);
			var expc = candy.exp;
			exp_candy.value = 0;
			exp_candy2.value = 0;
			if(diff_val > 0) {
				exp_candy.value = Math.ceil(diff_val / expc);
				var candy_num = Math.floor(ch_diff_val / expc);
				if(candy.key == "xs") {
					candy_num = Math.ceil(ch_diff_val / expc);
				}
				exp_candy2.value = candy_num;
				ch_diff_val -= candy_num * expc;
			}
		}
	}
	
	static createTable() {
		var ex_table = document.getElementById("ex_table");
		ex_table.innerHTML = "";
		for(var level = 1; level <= 100; level++) {
			var tr = document.createElement("tr");
			var td = document.createElement("td");
			td.innerText = level;
			tr.appendChild(td);
			for(var ex_type = 0; ex_type < 6; ex_type++) {
				var td2 = document.createElement("td");
				td2.innerText = PokeCalc.calcNeedExp(ex_type, level);
				tr.appendChild(td2);
			}
			ex_table.appendChild(tr);
		}
	}
	
	static calcNeedExp(ex_type, level) {
		if(level < 2){
			return 0;
		}
		var level_triple = level * level * level;
		var level_double = level * level;
		var res = 0;
		if(ex_type == 0) {
			if(level <= 50) {
				res = level_triple * (100 - level) / 50;
			}
			else if(level <= 68) {
				res = level_triple * (150 - level) / 100;
			}
			else if(level <= 98) {
				res = level_triple * Math.floor(637 - 10 * level / 3) / 500;
			}
			else {
				res = level_triple * (160 - level) / 100;
			}
		}
		else if(ex_type == 1) {
			res = 0.8 * level_triple;
		}
		else if(ex_type == 2) {
			res = level_triple;
		}
		else if(ex_type == 3) {
			res = 1.2 * level_triple - 15 * level_double + 100 * level - 140;
		}
		else if(ex_type == 4) {
			res = 1.25 * level_triple;
		}
		else if(ex_type == 5) {
			if(level <= 15) {
				res = level_triple * (24 + Math.floor((level + 1) / 3)) / 50;
			}
			else if(level <= 36) {
				res = level_triple * (14 + level) / 50;
			}
			else {
				res = level_triple * (32 + Math.floor(level / 2)) / 50;
			}
		}
		
		return Math.floor(res);
	}
  }
 
  return PokeCalc;
})();
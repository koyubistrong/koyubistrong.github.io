

var Shiren5Calc = (function() {

    class Shiren5Calc {


  
        static init() {
            Shiren5Calc.assMonster = {};
            Shiren5Calc.dpMonster = [];
            Shiren5Calc.dpMonsterTable = {};
            Shiren5Calc.DB_INIT_NUM = 3;
            Shiren5Calc.bDBInitNum = 0;
            getCSV(Shiren5Calc.readDataBase, "https://koyubistrong.github.io/shiren5/monster.html", "\t", "\n");
            getCSV(Shiren5Calc.readMonsterTable.bind(null, "Genshi"), "https://koyubistrong.github.io/shiren5/genshi_monster_table.html", "\t", "\n");
            getCSV(Shiren5Calc.readMonsterTable.bind(null, "Zinsei"), "https://koyubistrong.github.io/shiren5/zinsei_monster_table.html", "\t", "\n");
        }

        static isInit() {
            return Shiren5Calc.bDBInitNum >= Shiren5Calc.DB_INIT_NUM;
        }
      
        static calc() {
            if(Shiren5Calc.isInit() == false) {
                return;
            }
            // 攻撃力
            var level = parseInt(document.getElementById("shiren5_level").value);
            var weapon = parseInt(document.getElementById("shiren5_weapon").value);
            var power = parseInt(document.getElementById("shiren5_power").value);
            var attack = Shiren5Calc.calcAttack(level, weapon, power);

            var special = {}
            special["全"] = (document.getElementById("shiren5_special_all").checked) ? 130 : 100;
			special["目"] = (document.getElementById("shiren5_special_eye").checked) ? 135 : 100;
			special["吸"] = (document.getElementById("shiren5_special_drain").checked) ? 135 : 100;
			special["竜"] = (document.getElementById("shiren5_special_dragon").checked) ? 135 : 100;
			special["爆"] = (document.getElementById("shiren5_special_explosion").checked) ? 135 : 100;
			special["浮"] = (document.getElementById("shiren5_special_floating").checked) ? 135 : 100;
			special["水"] = (document.getElementById("shiren5_special_water").checked) ? 135 : 100;
			special["植"] = (document.getElementById("shiren5_special_plant").checked) ? 135 : 100;
			special["金"] = (document.getElementById("shiren5_special_metal").checked) ? 135 : 100;
			special["魔"] = (document.getElementById("shiren5_special_magic").checked) ? 135 : 100;

            var sp_weapon_kind = document.getElementById("shiren5_sp_weapon_kind").value;
            var sp_weapon_level = parseInt(document.getElementById("shiren5_sp_weapon_level").value);
            if(sp_weapon_kind == "無") {
                // 処理なし
            }
            else if(sp_weapon_kind == "全") {
                special[sp_weapon_kind] = 120 + 10 * sp_weapon_level;
            }
            else {
                special[sp_weapon_kind] = 110 + 25 * sp_weapon_level;
            }

            var power_up = 100 + parseInt(document.getElementById("shiren5_power_up").value);
            special["全"] = Math.floor(special["全"] * power_up / 100)

            // 防御力
            var shield = parseInt(document.getElementById("shiren5_shield").value);
            var defence = shield * 0.61785;

            var rate_shield = {}
            rate_shield["昼"] = (document.getElementById("shiren5_rate_noon").checked) ? 75 : 100;
            rate_shield["金"] = (document.getElementById("shiren5_rate_money").checked) ? 85 : 100;

            var rate_shield_kind = document.getElementById("shiren5_rate_shield_kind").value;
            var rate_shield_level = parseInt(document.getElementById("shiren5_rate_shield_level").value);
            var reduce_rate = 100;
            if(rate_shield_kind == "昼") {
                rate_shield["昼"] = 80 - 5 * rate_shield_level;
            }
            else if(rate_shield_kind == "金") {
                rate_shield["金"] = 90 - 5 * rate_shield_level;
            }
            reduce_rate = Math.floor(reduce_rate * rate_shield["昼"] / 100);
            reduce_rate = Math.floor(reduce_rate * rate_shield["金"] / 100);

            var defence_up = parseInt(document.getElementById("shiren5_defence_up").value);
            reduce_rate = Math.floor(reduce_rate * (100 - defence_up) / 100);
            reduce_rate /= 100;

            // モンスター一覧
            var dungeon = document.getElementById("shiren5_dungeon").value;
            var floor = parseInt(document.getElementById("shiren5_floor").value);
            var monster_table = [];
            if(Shiren5Calc.dpMonsterTable[dungeon] == null) {
                monster_table = Shiren5Calc.dpMonster;
            }
            else {
                var monster = Shiren5Calc.dpMonsterTable[dungeon][floor - 1].monster;
                for(var i = 0; i < monster.length; i++) {
                    if(Shiren5Calc.assMonster[monster[i]] == null) {
                        console.log("No Data " + monster[i]);
                        continue;
                    }
                    monster_table.push(Shiren5Calc.assMonster[monster[i]]);
                }
            }
            //Shiren5Calc.makeAttackMonsterTable(Shiren5Calc.dpMonster, attack, special);
            Shiren5Calc.makeAttackMonsterTable(monster_table, attack, special, defence, reduce_rate);
        }

        static makeAttackMonsterTable(monster_table, attack, special, defence, reduce_rate) {
            const MIN_RAND = 87;
            const MAX_RAND = 112;
            const DIE_RATE_NUM = 3;
            var multi_attack = {}
            multi_attack["ナシャーガ"] = 2;
            multi_attack["ラシャーガ"] = 3;
            multi_attack["バシャーガ"] = 4;
            var elem_table = document.getElementById("shiren5_monster_table");
            elem_table.innerHTML = "";
            var tr = document.createElement("tr");
            var th = document.createElement("th");
            th.innerHTML = "モンスター";
            th.style = "width: 120px; text-align: center;";
            tr.appendChild(th);
            th = document.createElement("th");
            th.innerHTML = "受ダメ";
            th.style = "text-align: center;"
            tr.appendChild(th);
            th = document.createElement("th");
            th.innerHTML = "与ダメ";
            th.style = "text-align: center;"
            tr.appendChild(th);
            for(var i = 0; i < DIE_RATE_NUM; i++) {
                th = document.createElement("th");
                th.innerHTML = "倒確率" + (i + 1).toString();
                th.style = "text-align: center;"
                tr.appendChild(th);
            }
            elem_table.appendChild(tr);
            for(var i = 0; i < monster_table.length; i++) {
                // 与ダメ計算
                var monster = monster_table[i];
                var monster_defence = monster.defence / 2;
                var min_attack = Math.round(attack * MIN_RAND / 100 - monster_defence);
                var max_attack = Math.round(attack * MAX_RAND / 100 - monster_defence);
                var sp_rate = special["全"];
                for(var j = 0; j < monster.type.length; j++) {
                    if(special[monster.type[j]] == null) continue;
                    sp_rate = Math.floor(sp_rate * special[monster.type[j]] / 100);
                }
                sp_rate /= 100;
                min_attack = Math.round(min_attack * sp_rate);
                max_attack = Math.round(max_attack * sp_rate);
                if(min_attack < 1) min_attack = 1;
                if(max_attack < 1) max_attack = 1;

                // 受ダメ計算
                var monster_attack = monster.attack;
                var min_defence = Math.round(monster_attack * MIN_RAND / 100 - defence);
                var max_defence = Math.round(monster_attack * MAX_RAND / 100 - defence);
                min_defence = Math.round(min_defence * reduce_rate);
                max_defence = Math.round(max_defence * reduce_rate);
                if(min_defence < 1) min_defence = 1;
                if(max_defence < 1) max_defence = 1;
                if(multi_attack[monster.name] != null) {
                    min_defence *= multi_attack[monster.name];
                    max_defence *= multi_attack[monster.name];
                }

                // テーブル作成
                var sum_min_attack = min_attack;
                var sum_max_attack = max_attack;
                var monster_hp = monster.hp;
                var attack_end = false;
                var tr = document.createElement("tr");
                var td = document.createElement("td");
                td.innerHTML = monster.name;
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = min_defence + "-" + max_defence;
                td.style = "text-align: center;"
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = min_attack + "-" + max_attack;
                td.style = "text-align: center;"
                tr.appendChild(td);
                for(var j = 0; j < DIE_RATE_NUM; j++) {
                    var die_rate = 0;
                    if(monster_hp <= sum_min_attack) {
                        die_rate = 100;
                    }
                    else if(monster_hp > sum_min_attack && monster_hp <= sum_max_attack) {
                        die_rate = (sum_max_attack - monster_hp + 1) / (sum_max_attack - sum_min_attack + 1) * 100;
                    }
                    else {
                        die_rate = 0;
                    }
                    td = document.createElement("td");
                    td.style = "text-align: right;";
                    if(attack_end == false) {
                        td.innerHTML = die_rate.toFixed(1) + "%";
                    }
                    else {
                        td.innerHTML = "-";
                    }
                    tr.appendChild(td);
                    sum_min_attack += min_attack;
                    sum_max_attack += max_attack;
                    if(die_rate >= 100) {
                        attack_end = true;
                    }
                }
                elem_table.appendChild(tr);
            }
        }

        static calcAttack(level, weapon, power) {
            //Lv攻撃＋力攻撃＋装備攻撃
            //レベル攻撃力	LOG(レベル×0.4＋1)×24－3
            //ちから攻撃力	
            //ちから７以下	LOG(2.7)×LOG(2.7)×ちから÷8×25
            //ちから８以上	LOG([ちから÷2]－1.25)×LOG([ちから÷2]－1.25)×25
            //装備攻撃力	強さ×0.585
            var level_attack = Math.log10(level * 0.4 + 1) * 24 - 3;
            var weapon_attack = weapon * 0.585;
            var power_attack = 0;
            if(power < 8) {
                power_attack = Math.log10(2.7) * Math.log10(2.7) * power / 8 * 25;
            }
            else {
                var log_tmp = Math.log10(Math.floor(power / 2) - 1.25);
                power_attack = log_tmp * log_tmp * 25;
            }
            return level_attack + weapon_attack + power_attack;
        }

        static readDataBase(table) {
            if(table == null) {
                console.log("init error");
                return false;
            }
            for(var i = 1; i < table.length; i++) {
                if(table[i].length != 10) continue;
                var arr = table[i];
                var name = arr[1]
                if(Shiren5Calc.assMonster[name] != null) {
                    continue;
                }
                var data = {};
                data.name = name;
                data.type = arr[2].split(' ');
                data.hp = Number(arr[3]);
                data.attack = Number(arr[4]);
                data.defence = Number(arr[5]);
                data.speed = arr[6];
                data.exp = Number(arr[7]);
                data.skill = Number(arr[8]);
                data.drop = arr[9];
                Shiren5Calc.dpMonster.push(data);
                Shiren5Calc.assMonster[name] = data;
            }
            Shiren5Calc.bDBInitNum++;
            Shiren5Calc.calc();
            return true;
        }

        static readMonsterTable(name, table) {
            if(table == null) {
                console.log("init error");
                return false;
            }
            Shiren5Calc.dpMonsterTable[name] = [];
            for(var i = 0; i < table.length; i++) {
                Shiren5Calc.dpMonsterTable[name].push({});
                var data = Shiren5Calc.dpMonsterTable[name][i];
                data.floor = parseInt(table[i][0]);
                data.monster = [];
                for(var j = 1; j < table[i].length; j++) {
                    data.monster.push(table[i][j]);
                }
            }
            Shiren5Calc.bDBInitNum++;
            Shiren5Calc.calc();
            return true;
        }
    }
   
    return Shiren5Calc;
})();


var Shiren2Calc = (function() {

    class Shiren2Calc {

        static init() {
            Shiren2Calc.assMonster = {};
            Shiren2Calc.dpMonster = [];
            Shiren2Calc.dpAlly = [];
            Shiren2Calc.dpMonsterTable = {};
            Shiren2Calc.DB_INIT_NUM = 3;
            Shiren2Calc.bDBInitNum = 0;
            getCSV(Shiren2Calc.readMonster, "https://koyubistrong.github.io/shiren2/monster.html", "\t", "\n");
            getCSV(Shiren2Calc.readAlly, "https://koyubistrong.github.io/shiren2/ally.html", "\t", "\n");
            getCSV(Shiren2Calc.readMonsterTable.bind(null, "Saihate"), "https://koyubistrong.github.io/shiren2/saihate.html", "\t", "\n");
        }

        static isInit() {
            return Shiren2Calc.bDBInitNum >= Shiren2Calc.DB_INIT_NUM;
        }
      
        static calc() {
            if(Shiren2Calc.isInit() == false) {
                return;
            }
            const MAX_MARK = 17;
            
            // 武器印集計
            var weapon_mark_list = ["仏", "目", "月", "竜", "ド", "龍", "ち"]
            var weapon_mark_num = {};
            for (var i = 0; i < weapon_mark_list.length; i++){
                weapon_mark_num[weapon_mark_list[i]] = 0;
            }
            for (var i = 0; i < MAX_MARK; i++){
                var elem = document.getElementById("shiren2_weapon_mark_" + i);
                if(elem == null) continue;
                weapon_mark_num[elem.value]++;
            }

            // 盾印集計
            var shield_mark_list = ["命"]
            var shield_mark_num = {};
            for (var i = 0; i < shield_mark_list.length; i++){
                shield_mark_num[shield_mark_list[i]] = 0;
            }
            for (var i = 0; i < MAX_MARK; i++){
                var elem = document.getElementById("shiren2_shield_mark_" + i);
                if(elem == null) continue;
                shield_mark_num[elem.value]++;
            }

            // 修正値一覧
            var fixed_mark = {}
            fixed_mark["ち"] = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 32]
            fixed_mark["命"] =  [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 40, 40]

            // 攻撃と防御の基本値計算
            var level = parseInt(document.getElementById("shiren2_level").value);
            var weapon = parseInt(document.getElementById("shiren2_weapon").value);
            var power = parseInt(document.getElementById("shiren2_power").value);
            var shield = parseInt(document.getElementById("shiren2_shield").value);
            weapon += fixed_mark["ち"][weapon_mark_num["ち"]]
            shield += fixed_mark["命"][shield_mark_num["命"]]
            var attack = Shiren2Calc.calcAttack(level, weapon, power);
            var defence = Shiren2Calc.calcDefence(shield * 0.5);
            
            // 特攻倍率一覧
            var sp_rate = {};
            sp_rate["仏"] = [0, 50, 60, 70, 80, 90, 100, 140, 170, 200, 250, 300, 350, 400, 450, 500, 550, 600];
            sp_rate["目"] = [0, 50, 60, 70, 80, 90, 100, 140, 170, 200, 250, 300, 350, 400, 450, 500, 550, 600];
            sp_rate["月"] = [0, 50, 60, 70, 80, 90, 100, 140, 170, 200, 250, 300, 350, 400, 450, 500, 550, 600];
            sp_rate["竜"] = [0, 50, 60, 70, 80, 90, 100, 140, 170, 200, 250, 300, 350, 400, 450, 500, 550, 600];
            sp_rate["ド"] = [0, 50, 60, 70, 80, 90, 100, 140, 170, 200, 400, 400, 400, 400, 400, 400, 400, 400];
            sp_rate["龍"] = [0, 100, 120, 150, 170, 200, 250, 300, 400, 450, 500, 500, 500, 500, 500, 500, 500, 500];

            // 特攻系
            var special = {}
            special["ゴースト"] = 1.0 + sp_rate["仏"][weapon_mark_num["仏"]] / 100;
			special["一ツ目"] = 1.0 + sp_rate["目"][weapon_mark_num["目"]] / 100;
            special["爆弾"] = 1.0 + sp_rate["月"][weapon_mark_num["月"]] / 100;
			special["ドラゴン"] = 1.0 + (sp_rate["竜"][weapon_mark_num["竜"]] + sp_rate["龍"][weapon_mark_num["龍"]]) / 100;
            special["ドレイン"] = 1.0 + sp_rate["ド"][weapon_mark_num["ド"]] / 100;

            // 攻撃力アップ系
            var all_attack_rate = {}
            all_attack_rate["会"] = (document.getElementById("shiren2_blow_conscience_me").checked) ? 1.5 : 1.0;

            // モンスター一覧
            var dungeon = document.getElementById("shiren2_dungeon").value;
            var floor = parseInt(document.getElementById("shiren2_floor").value);
            var name = document.getElementById("shiren2_name").value;
            var monster_table = [];
                // 階層絞り込み
            if(Shiren2Calc.dpMonsterTable[dungeon] == null) {
                monster_table = Shiren2Calc.dpMonster;
            }
            else {
                var monster = Shiren2Calc.dpMonsterTable[dungeon][floor - 1].monster;
                for(var i = 0; i < monster.length; i++) {
                    if(Shiren2Calc.assMonster[monster[i]] == null) {
                        console.log("No Data " + monster[i]);
                        continue;
                    }
                    monster_table.push(Shiren2Calc.assMonster[monster[i]]);
                }
            }
                // 名前絞り込み
            if(name !== "") {
                var cond_monster_table = [];
                // カタカナをひらがなに変換
                var ruby_name = name.replace(/[ァ-ン]/g, function(s) {
                    return String.fromCharCode(s.charCodeAt(0) - 0x60);
                });
                for(var i = 0; i < monster_table.length; i++) {
                    var monster = monster_table[i];
                    if(monster.name.indexOf(name) > -1){
                        cond_monster_table.push(monster);
                        continue;
                    }
                    //if(monster.ruby.indexOf(ruby_name) > -1){
                    //    cond_monster_table.push(monster);
                    //}
                }
                monster_table = cond_monster_table;
            }
            if(monster_table.length == 0) {
                document.getElementById("shiren2_monster_table").innerHTML = "一致する条件が見つかりませんでした。";
                return;
            }
            //Shiren2Calc.makeAttackMonsterTable(Shiren2Calc.dpMonster, attack, special);
            Shiren2Calc.makeAttackMonsterTable(monster_table, attack, special, all_attack_rate, defence);
        }

        static makeAttackMonsterTable(monster_table, attack, special, all_attack_rate, defence) {
            const MIN_RAND = 87;
            const MAX_RAND = 112;
            const DIE_RATE_NUM = 3;
            var elem_table = document.getElementById("shiren2_monster_table");
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
            
            var fragment = document.createDocumentFragment();
            var all_attack_type = ["特", "会"];
            for(var i = 0; i < monster_table.length; i++) {
                // 与ダメ計算
                var monster = monster_table[i];
                var monster_defence = Shiren2Calc.calcDefence(monster.defence);

                // 特効印(倍率計算)
                var special_rate = 1.0;
                for(var j = 0; j < monster.type.length; j++) {
                    if(special[monster.type[j]] == null) continue;
                    special_rate = special_rate * special[monster.type[j]];
                }
                all_attack_rate["特"] = special_rate;

                var ave_attack = attack;
                for(var j = 0; j < all_attack_type.length; j++) {
                    if(all_attack_rate[all_attack_type[j]] == null) continue;
                    ave_attack = ave_attack * all_attack_rate[all_attack_type[j]];
                }
                ave_attack = parseInt(ave_attack) * monster_defence;

                var min_attack = parseInt(ave_attack - ave_attack / 8);
                var max_attack = parseInt(ave_attack + ave_attack / 8);
                if(min_attack < 1) min_attack = 1;
                if(max_attack < 1) max_attack = 1;
                var all_attack = [];
                all_attack[0] = min_attack;
                all_attack[1] = max_attack;

                // 受ダメ計算
                var monster_attack = parseInt(monster.attack) * defence;
                var min_defence = parseInt(monster_attack - monster_attack / 8);
                var max_defence = parseInt(monster_attack + monster_attack / 8);
                if(min_defence < 1) min_defence = 1;
                if(max_defence < 1) max_defence = 1;

                // 正確な倒確率計算
                var monster_hp = monster.hp;
                var die_rate_str = new Array(DIE_RATE_NUM);
                var attack_end = false;
                var old_dp = new Array(monster_hp + 1).fill(0);
                old_dp[0] = 1;
                /*
                for(var j = 0; j < DIE_RATE_NUM; j++) {
                    if(attack_end) {
                        die_rate_str[j] = "-";
                        continue;
                    }
                    var new_dp = new Array(monster_hp + 1).fill(0);
                    for(var jj = 0; jj <= monster_hp; jj++) {
                        if(old_dp[jj] == 0) continue;
                        for(var jjj = 0; jjj < all_attack.length; jjj++) {
                            var add_attck = jj + all_attack[jjj];
                            if(add_attck > monster_hp) add_attck = monster_hp;
                            new_dp[add_attck] += old_dp[jj];
                        }
                    }
                    var not_enough_num = 0;
                    for(var jj = 0; jj < monster_hp; jj++) {
                        not_enough_num += new_dp[jj];
                    }
                    var die_rate = 0;
                    if(not_enough_num == 0) {
                        die_rate = 100.0;
                        attack_end = true;
                    }
                    else {
                        die_rate = (1.0 - not_enough_num / (not_enough_num + new_dp[monster_hp])) * 100;
                    }
                    die_rate_str[j] = (Math.floor(die_rate * 10) / 10).toFixed(1) + "%";
                    old_dp = new_dp;
                }
                */
               
                // 概ねの倒確率計算
                var sum_min_attack = min_attack;
                var sum_max_attack = max_attack;
                var attack_end = false;
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

                   if(attack_end == false) {
                       die_rate_str[j] = die_rate.toFixed(1) + "%";
                   }
                   else {
                       die_rate_str[j] = "-";
                   }

                   sum_min_attack += min_attack;
                   sum_max_attack += max_attack;
                   if(die_rate >= 100) {
                       attack_end = true;
                   }
                }
               
                // テーブル作成
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
                    td = document.createElement("td");
                    td.style = "text-align: right;";
                    td.innerHTML = die_rate_str[j];
                    tr.appendChild(td);
                }

                fragment.appendChild(tr);
            }
            elem_table.appendChild(fragment);
        }

        static calcAttack(level, weapon, power) {
            var ally = Shiren2Calc.dpAlly[level - 1];
            if(ally == null) {
                return -1;
            }
            var level_attack = ally.attack.shiren;
            var weapon_attack = Math.floor(weapon / 2);
            var power_attack = power + 8;
            return (weapon_attack + power_attack) * level_attack / 16;
        }

        static calcDefence(defence) {
            return Math.pow(35 / 36, defence);
        }

        static addMark(id) {
            var weapon_mark = document.getElementById(id + "_select").value;
            if(weapon_mark == "") {
                return;
            }
            if(Shiren2Calc.confirmEmptyMark(id)) {
                document.getElementById(id).innerHTML = "";
            }
            const MAX_MARK = 17;
            var empty_id = null;
            for (var i = 0; i < MAX_MARK; i++){
                var elem_id = id + "_" + i;
                if(document.getElementById(elem_id) == null) {
                    empty_id = elem_id;
                    break;
                }
            }

            if(empty_id == null) {
                return;
            }

            var new_elem = document.createElement("label"); 
            new_elem.id = empty_id;
            new_elem.value = weapon_mark;
            new_elem.style.margin = "2px";
            new_elem.style.borderRadius = "0%";
            new_elem.style.fontSize = "15px";
            new_elem.style.border = "solid 1px gray";
            new_elem.innerText = weapon_mark;
            new_elem.onclick = Shiren2Calc.delMark.bind(null, id, new_elem);
            document.getElementById(id).appendChild(new_elem);

            Shiren2Calc.calc();
        }

        static delMark(id, del_elem) {
            document.getElementById(id).removeChild(del_elem);
            Shiren2Calc.calc();
            if(Shiren2Calc.confirmEmptyMark(id)) {
                document.getElementById(id).innerHTML = "(空)";
            }
        }

        static confirmEmptyMark(id) {
            const MAX_MARK = 17;
            for (var i = 0; i < MAX_MARK; i++){
                var elem_id = id + "_" + i;
                if(document.getElementById(elem_id) != null) {
                    return false;
                }
            }
            return true;
        }

        static readMonster(table) {
            if(table == null) {
                console.log("init error");
                return false;
            }
            for(var i = 0; i < table.length; i++) {
                if(table[i].length < 12) {
                    //console.log("paramater error");
                    continue;
                }
                var arr = table[i];
                var name = arr[0]
                if(Shiren2Calc.assMonster[name] != null) {
                    continue;
                }
                var data = {};
                data.name = name;
                data.hp = Number(arr[1]);
                data.attack = Number(arr[2]);
                data.defence = Number(arr[3]);
                data.exp = Number(arr[4]);
                data.type = arr[5].split("&br;");
                data.sleep_rate = Number(arr[6]);
                data.wake_up = arr[7];
                data.drop_rate = Number(arr[8]);
                data.skill_rate = Number(arr[9]);
                data.fixed_drop = arr[10];
                data.feature = arr[11];
                Shiren2Calc.dpMonster.push(data);
                Shiren2Calc.assMonster[name] = data;
            }
            Shiren2Calc.bDBInitNum++;
            Shiren2Calc.calc();
            return true;
        }

        static readAlly(table) {
            if(table == null) {
                console.log("init error");
                return false;
            }
            Shiren2Calc.dpAlly = [];
            for(var i = 0; i < table.length; i++) {
                if(table[i].length < 2) {
                    //console.log("paramater error");
                    continue;
                }
                var data = {};
                data.level = parseInt(table[i][0]);
                data.attack = {};
                data.attack.shiren = parseInt(table[i][1]);
                Shiren2Calc.dpAlly.push(data);
            }
            Shiren2Calc.bDBInitNum++;
            Shiren2Calc.calc();
            return true;
        }

        static readMonsterTable(name, table) {
            if(table == null) {
                console.log("init error");
                return false;
            }
            Shiren2Calc.dpMonsterTable[name] = [];
            for(var i = 0; i < table.length; i++) {
                Shiren2Calc.dpMonsterTable[name].push({});
                var data = Shiren2Calc.dpMonsterTable[name][i];
                data.floor = parseInt(table[i][0]);
                data.monster = [];
                for(var j = 1; j < table[i].length; j++) {
                    data.monster.push(table[i][j]);
                }
            }
            Shiren2Calc.bDBInitNum++;
            Shiren2Calc.calc();
            return true;
        }
    }
   
    return Shiren2Calc;
})();
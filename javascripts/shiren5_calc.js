

var Shiren5Calc = (function() {

    class Shiren5Calc {

        static init() {
            Shiren5Calc.assMonster = {};
            Shiren5Calc.assMaxMonster = {};
            Shiren5Calc.dpMonster = [];
            Shiren5Calc.dpMonsterTable = {};
            Shiren5Calc.DB_INIT_NUM = 11;
            Shiren5Calc.bDBInitNum = 0;
            Shiren5Calc.bInitMaxMonster = false;
            getCSV(Shiren5Calc.readDataBase, "https://koyubistrong.github.io/shiren5/monster_20230205.html", "\t", "\n");
            getCSV(Shiren5Calc.readMaxMonster, "https://koyubistrong.github.io/shiren5/max_level_monster.html", "\t", "\n");
            getCSV(Shiren5Calc.readMonsterTable.bind(null, "Genshi"), "https://koyubistrong.github.io/shiren5/genshi_monster_table.html", "\t", "\n");
            getCSV(Shiren5Calc.readMonsterTable.bind(null, "Onigiri"), "https://koyubistrong.github.io/shiren5/onigiri_monster_table.html", "\t", "\n");
            getCSV(Shiren5Calc.readMonsterTable.bind(null, "Shisen"), "https://koyubistrong.github.io/shiren5/shisen_monster_table.html", "\t", "\n");
            getCSV(Shiren5Calc.readMonsterTable.bind(null, "Arashi"), "https://koyubistrong.github.io/shiren5/arasi_monster_table.html", "\t", "\n");
            getCSV(Shiren5Calc.readMonsterTable.bind(null, "Zinsei"), "https://koyubistrong.github.io/shiren5/zinsei_monster_table.html", "\t", "\n");
            getCSV(Shiren5Calc.readMonsterTable.bind(null, "Syukai"), "https://koyubistrong.github.io/shiren5/syukai_monster_table.html", "\t", "\n");
            getCSV(Shiren5Calc.readMonsterTable.bind(null, "Izigen"), "https://koyubistrong.github.io/shiren5/izigen_monster_table.html", "\t", "\n");
            getCSV(Shiren5Calc.readMonsterTable.bind(null, "Genshima"), "https://koyubistrong.github.io/shiren5/genshima_monster_table.html", "\t", "\n");
            getCSV(Shiren5Calc.readMonsterTable.bind(null, "Wakupara"), "https://koyubistrong.github.io/shiren5/wakupara_monster_table.html", "\t", "\n");
        }

        static isInit() {
            return Shiren5Calc.bDBInitNum >= Shiren5Calc.DB_INIT_NUM;
        }
      
        static calc() {
            if(Shiren5Calc.isInit() == false) {
                return;
            }
            if(Shiren5Calc.bInitMaxMonster == false) {
                Shiren5Calc.initMaxMonster();
                Shiren5Calc.bInitMaxMonster = true;
            }
            var is_arrow_mode = document.getElementById("shiren5_weapon_arrow_mode").checked;

            // 攻撃と防御の基本値計算
            var level = parseInt(document.getElementById("shiren5_level").value);
            var weapon = parseInt(document.getElementById("shiren5_weapon").value);
            var power = parseInt(document.getElementById("shiren5_power").value);
            var isogeny_weapon = parseInt(document.getElementById("shiren5_isogeny_weapon").value);
            var weapon_bundle_bracelet = parseInt(document.getElementById("shiren5_weapon_bundle_bracelet").value);
            if(isogeny_weapon > 0) {
                // 武器束ねの腕輪
                weapon += (4 + 4 * isogeny_weapon) * weapon_bundle_bracelet;
            }
            var shield = parseInt(document.getElementById("shiren5_shield").value);
            if(document.getElementById("shiren5_rate_desperate").checked) {
                // 捨て身
                weapon += shield;
                shield = 0;
            }
            if(is_arrow_mode) {
                weapon = parseInt(document.getElementById("shiren5_weapon_arrow").value);
            }
            var attack = Shiren5Calc.calcAttack(level, weapon, power, is_arrow_mode);
            var defence = shield * 0.61785;

            // 特攻系
            var special = {}
			special["目"] = (document.getElementById("shiren5_special_eye").checked) ? 135 : 100;
			special["吸"] = (document.getElementById("shiren5_special_drain").checked) ? 135 : 100;
			special["竜"] = (document.getElementById("shiren5_special_dragon").checked) ? 135 : 100;
			special["爆"] = (document.getElementById("shiren5_special_explosion").checked) ? 135 : 100;
			special["浮"] = (document.getElementById("shiren5_special_floating").checked) ? 135 : 100;
			special["水"] = (document.getElementById("shiren5_special_water").checked) ? 135 : 100;
			special["植"] = (document.getElementById("shiren5_special_plant").checked) ? 135 : 100;
			special["金"] = (document.getElementById("shiren5_special_metal").checked) ? 135 : 100;
			special["魔"] = (document.getElementById("shiren5_special_magic").checked) ? 135 : 100;

            var all_attack_rate = {}
            all_attack_rate["全"] = (document.getElementById("shiren5_special_all").checked) ? 130 : 100;

            var sp_weapon_kind = document.getElementById("shiren5_sp_weapon_kind").value;
            var sp_weapon_level = parseInt(document.getElementById("shiren5_sp_weapon_level").value);
            if(sp_weapon_kind == "無") {
                // 処理なし
            }
            else if(sp_weapon_kind == "全") {
                all_attack_rate[sp_weapon_kind] = 120 + 10 * sp_weapon_level;
            }
            else {
                special[sp_weapon_kind] = 110 + 25 * sp_weapon_level;
            }

            // 攻撃力アップ系
            all_attack_rate["会"] = (document.getElementById("shiren5_blow_conscience_me").checked) ? 200 : 100;
            all_attack_rate["怒"] = (document.getElementById("shiren5_angry_me").checked) ? 200 : 100;
            all_attack_rate["祝"] = (document.getElementById("shiren5_blessing_weapon").checked) ? 125 : 100;
            all_attack_rate["スリ"] = (document.getElementById("shiren5_slip_enemy").checked) ? 200 : 100;
            var power_up_me = parseInt(document.getElementById("shiren5_power_up_me").value);
            var defence_up_enemy = parseInt(document.getElementById("shiren5_defence_up_enemy").value);
            if(power_up_me >= 0) {
                all_attack_rate["自攻U"] = 100 + power_up_me;
                all_attack_rate["自攻D"] = 100;
            }
            else {
                all_attack_rate["自攻U"] = 100;
                all_attack_rate["自攻D"] = 100 + power_up_me;
            }
            if(defence_up_enemy >= 0) {
                all_attack_rate["敵防D"] = 100 + defence_up_enemy;
                all_attack_rate["敵防U"] = 100;
            }
            else {
                all_attack_rate["敵防D"] = 100;
                all_attack_rate["敵防U"] = 100 + defence_up_enemy;
            }

            // 割合軽減
            var rate_shield = {}
            rate_shield["昼"] = (document.getElementById("shiren5_rate_noon").checked) ? 75 : 100;
            rate_shield["金"] = (document.getElementById("shiren5_rate_money").checked) ? 85 : 100;

            var rate_shield_kind = document.getElementById("shiren5_rate_shield_kind").value;
            var rate_shield_level = parseInt(document.getElementById("shiren5_rate_shield_level").value);
            if(rate_shield_kind == "昼") {
                rate_shield["昼"] = 80 - 5 * rate_shield_level;
            }
            else if(rate_shield_kind == "金") {
                rate_shield["金"] = 90 - 5 * rate_shield_level;
            }

            rate_shield["デ"] = 100 - parseInt(document.getElementById("shiren5_defence_up_me").value);

            // モンスター一覧
            var dungeon = document.getElementById("shiren5_dungeon").value;
            var floor = parseInt(document.getElementById("shiren5_floor").value);
            var name = document.getElementById("shiren5_name").value;
            var monster_table = [];
                // 階層絞り込み
            if(Shiren5Calc.dpMonsterTable[dungeon] == null) {
                monster_table = Shiren5Calc.dpMonster;
            }
            else {
                if(Shiren5Calc.dpMonsterTable[dungeon][floor - 1] != null) {
                    var monster = Shiren5Calc.dpMonsterTable[dungeon][floor - 1].monster;
                    for(var i = 0; i < monster.length; i++) {
                        if(Shiren5Calc.assMonster[monster[i]] == null) {
                            console.log("No Data " + monster[i]);
                            continue;
                        }
                        monster_table.push(Shiren5Calc.assMonster[monster[i]]);
                    }
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
                    if(monster.ruby.indexOf(ruby_name) > -1){
                        cond_monster_table.push(monster);
                    }
                }
                monster_table = cond_monster_table;
            }
            if(monster_table.length == 0) {
                document.getElementById("shiren5_monster_table").innerHTML = "一致する条件が見つかりませんでした。";
                return;
            }
            //Shiren5Calc.makeAttackMonsterTable(Shiren5Calc.dpMonster, attack, special);
            Shiren5Calc.makeAttackMonsterTable(monster_table, attack, special, all_attack_rate, defence, rate_shield, is_arrow_mode);
        }

        static makeAttackMonsterTable(monster_table, attack, special, all_attack_rate, defence, rate_shield, is_arrow_mode) {
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
            
            var fragment = document.createDocumentFragment();
            var all_attack_type = ["会", "怒", "特", "祝", "全", "スリ", "自攻U", "敵防U", "敵防D", "自攻D"];
            var all_defence_type = ["金", "昼", "デ"];
            for(var i = 0; i < monster_table.length; i++) {
                // 与ダメ計算
                var monster = monster_table[i];
                var monster_defence = monster.defence / 2;

                    // 特効印(倍率計算)
                var special_rate = 100;
                for(var j = 0; j < monster.type.length; j++) {
                    if(special[monster.type[j]] == null) continue;
                    special_rate = Math.floor(special_rate * special[monster.type[j]] / 100);
                }
                all_attack_rate["特"] = special_rate;
                if(is_arrow_mode) {
                    // 矢モードは特攻無効
                    all_attack_rate["特"] = 100;
                }

                    // 87から112までの全ての乱数によるダメージ計算
                var range_attack = MAX_RAND - MIN_RAND + 1;
                var all_attack = new Array(range_attack).fill(0);
                for(var att = MIN_RAND, ct = 0; att <= MAX_RAND; att++, ct++) {
                    var rand_attack = Math.round(attack * att / 100 - monster_defence);
                    for(var j = 0; j < all_attack_type.length; j++) {
                        if(all_attack_rate[all_attack_type[j]] == null) continue;
                        rand_attack = Math.floor(rand_attack * all_attack_rate[all_attack_type[j]] / 100);
                    }
                    if(rand_attack < 1) rand_attack = 1;
                    all_attack[ct] = rand_attack;
                }

                    // 表示用に最小値と最大値取得
                var min_attack = 0;
                var max_attack = 0;
                min_attack = all_attack[0];
                max_attack = all_attack[range_attack - 1];

                // 受ダメ計算
                var monster_attack = monster.attack;
                var min_defence = Math.round(monster_attack * MIN_RAND / 100 - defence);
                var max_defence = Math.round(monster_attack * MAX_RAND / 100 - defence);
                
                    // 金食い・昼強化
                for(var j = 0; j < all_defence_type.length; j++) {
                    if(rate_shield[all_defence_type[j]] == null) continue;
                    min_defence = Math.floor(min_defence * rate_shield[all_defence_type[j]] / 100);
                    max_defence = Math.floor(max_defence * rate_shield[all_defence_type[j]] / 100);
                }
  
                if(min_defence < 1) min_defence = 1;
                if(max_defence < 1) max_defence = 1;
                if(multi_attack[monster.name] != null) {
                    min_defence *= multi_attack[monster.name];
                    max_defence *= multi_attack[monster.name];
                }

               // 正確な倒確率計算
               var sum_min_attack = min_attack;
               var sum_max_attack = max_attack;
               var monster_hp = monster.hp;
               var attack_end = false;
               var die_rate_str = new Array(DIE_RATE_NUM);
               var old_dp = new Array(monster_hp + 1).fill(0);
               old_dp[0] = 1;
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
               
               /*
                   // 概ねの倒確率計算
               attack_end = false;
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
               */

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

        static calcAttack(level, weapon, power, is_arrow_mode) {
            //Lv攻撃＋力攻撃＋装備攻撃力(矢攻撃力)
            //レベル攻撃力	LOG(レベル×0.4＋1)×24－3
            //ちから攻撃力	
            //ちから７以下	LOG(2.7)×LOG(2.7)×ちから÷8×25
            //ちから８以上	LOG([ちから÷2]－1.25)×LOG([ちから÷2]－1.25)×25
            //装備攻撃力	強さ×0.585
            //矢攻撃力      強さ×0.330
            var level_attack = Math.log10(level * 0.4 + 1) * 24 - 3;
            var weapon_attack = weapon * 0.585;
            if(is_arrow_mode) {
                weapon_attack = weapon * 0.330;
            }
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

        static initMaxMonster() {
            var monster_table = Shiren5Calc.dpMonster;
            for(var i = 0; i < monster_table.length; i++) {
                var monster = monster_table[i];
                if(Shiren5Calc.assMaxMonster[monster.name] == null) {
                    continue;
                }
                var monster_level = Shiren5Calc.assMaxMonster[monster.name];
                for(var j = 0; j < monster_level.length; j++) {
                    var data = {};
                    data.name = monster.name + monster_level[j].toString(10);
                    data.type = monster.type;
                    data.hp = monster.hp;
                    data.attack = monster.attack * monster_level[j];
                    data.defence = monster.defence + Math.floor(monster.defence * (monster_level[j] - 1) / 4);
                    data.speed = monster.speed;
                    data.exp = monster.exp + Math.floor(monster.exp * (monster_level[j] - 1) / 4);
                    data.skill = monster.skill;
                    data.drop = monster.drop;
                    data.ruby = monster.ruby + monster_level[j].toString(10);
                    monster_table.splice(i + 1, 0, data);
                    Shiren5Calc.assMonster[data.name] = data;
                    i++;
                }
            }
        }

        static readDataBase(table) {
            if(table == null) {
                console.log("init error");
                return false;
            }
            for(var i = 1; i < table.length; i++) {
                if(table[i].length < 11) continue;
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
                data.ruby = arr[10];
                Shiren5Calc.dpMonster.push(data);
                Shiren5Calc.assMonster[name] = data;
            }
            Shiren5Calc.bDBInitNum++;
            Shiren5Calc.calc();
            return true;
        }
        static readMaxMonster(table) {
            if(table == null) {
                console.log("init error");
                return false;
            }
            for(var i = 0; i < table.length; i++) {
                if(table[i].length < 2) {
                    console.log("paramater error");
                    continue;
                }
                var arr = table[i];
                var name = arr[0];
                var level = parseInt(arr[1]);
                if(Shiren5Calc.assMaxMonster[name] == null) {
                    Shiren5Calc.assMaxMonster[name] = [];
                }
                Shiren5Calc.assMaxMonster[name].push(level);
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

        static changeArrowMode() {
            var is_arrow_mode = document.getElementById("shiren5_weapon_arrow_mode").checked;
            if(is_arrow_mode) {
                document.getElementById("shiren5_weapon").style.display = "none";
                document.getElementById("shiren5_weapon_arrow").style.display = "inline";
            }
            else {
                document.getElementById("shiren5_weapon").style.display = "inline";
                document.getElementById("shiren5_weapon_arrow").style.display = "none";
            }
        }
    }
   
    return Shiren5Calc;
})();
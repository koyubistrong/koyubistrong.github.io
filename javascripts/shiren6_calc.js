

var Shiren6Calc = (function() {

    class Shiren6Calc {

        static init() {
            Shiren6Calc.assMonster = {};
            Shiren6Calc.assMaxMonster = {};
            Shiren6Calc.dpMonster = [];
            Shiren6Calc.dpMonsterTable = {};
            Shiren6Calc.DB_INIT_NUM = 2;
            Shiren6Calc.bDBInitNum = 0;
            Shiren6Calc.bInitMaxMonster = false;
            getCSV(Shiren6Calc.readDataBase, "https://koyubistrong.github.io/shiren6/monster.html", "\t", "\n");
            //getCSV(Shiren6Calc.readMaxMonster, "https://koyubistrong.github.io/shiren5/max_level_monster.html", "\t", "\n");
            getCSV(Shiren6Calc.readMonsterTable.bind(null, "Shinzui"), "https://koyubistrong.github.io/shiren6/shinzui_monster_table.html", "\t", "\n");
        }

        static isInit() {
            return Shiren6Calc.bDBInitNum >= Shiren6Calc.DB_INIT_NUM;
        }
      
        static calc() {
            if(Shiren6Calc.isInit() == false) {
                return;
            }
            if(Shiren6Calc.bInitMaxMonster == false) {
                //Shiren6Calc.initMaxMonster();
                Shiren6Calc.bInitMaxMonster = true;
            }
            var is_arrow_mode = document.getElementById("shiren6_weapon_arrow_mode").checked;

            // 攻撃と防御の基本値計算
            var level = parseInt(document.getElementById("shiren6_level").value);
            var weapon = parseInt(document.getElementById("shiren6_weapon").value);
            var power = parseInt(document.getElementById("shiren6_power").value);
            var shield = parseInt(document.getElementById("shiren6_shield").value);
            if(is_arrow_mode) {
                weapon = parseInt(document.getElementById("shiren6_weapon_arrow").value);
            }
            var attack = Shiren6Calc.calcAttack(level, weapon, power, is_arrow_mode);
            var defence = shield;
            if(shield >= 21) {
                defence = 20 + (shield - 20) * 0.6
            }
            //var hp = parseInt(document.getElementById("shiren6_hp").value);

            // 特攻武器印系
            var special = {};
			special["ケモノ"] = (document.getElementById("shiren6_special_beast").checked) ? 50 : 0;
			special["ゴースト"] = (document.getElementById("shiren6_special_gost").checked) ? 50 : 0;
			special["ドラゴン"] = (document.getElementById("shiren6_special_dragon").checked) ? 50 : 0;
			special["ドレイン"] = (document.getElementById("shiren6_special_drain").checked) ? 50 : 0;
			special["一ツ目"] = (document.getElementById("shiren6_special_eye").checked) ? 50 : 0;
			special["浮遊"] = (document.getElementById("shiren6_special_floating").checked) ? 50 : 0;
            special["水棲"] = (document.getElementById("shiren6_special_water").checked) ? 50 : 0;
			special["爆発"] = (document.getElementById("shiren6_special_explosion").checked) ? 50 : 0;
			special["金属"] = (document.getElementById("shiren6_special_metal").checked) ? 50 : 0;

            // 攻撃UP武器印系
            var all_attack_rate = {};
            var all_attack = 100;
            all_attack += (document.getElementById("shiren6_special_twice").checked) ? 50 : 0;
            all_attack += (document.getElementById("shiren6_special_money").checked) ? 50 : 0;
            all_attack += (document.getElementById("shiren6_special_stomach").checked) ? 50 : 0;
            all_attack += (document.getElementById("shiren6_special_hungry").checked) ? 100 : 0;
            all_attack += (document.getElementById("shiren6_special_potential").checked) ? 50 : 0;
            all_attack += (document.getElementById("shiren6_blow_conscience_me").checked) ? 50 : 0;
            all_attack_rate["全"] = all_attack;

            // 攻撃力アップ系
            all_attack_rate["ドス"] = (document.getElementById("shiren6_dosukoi").checked) ? 150 : 100;
            var power_up_me = parseInt(document.getElementById("shiren6_power_up_me").value);
            var defence_up_enemy = parseInt(document.getElementById("shiren6_defence_up_enemy").value);
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
            rate_shield["腹力"] = (document.getElementById("shiren6_rate_stomach").checked) ? 70 : 100;
            rate_shield["金食"] = (document.getElementById("shiren6_rate_money").checked) ? 70 : 100;
            rate_shield["ハン"] = (document.getElementById("shiren6_rate_hungry").checked) ? 70 : 100;
            rate_shield["守り"] = (document.getElementById("shiren6_rate_number").checked) ? 70 : 100;
            rate_shield["満タン"] = (document.getElementById("shiren6_rate_max").checked) ? 50 : 100;
            rate_shield["痛恨"] = (document.getElementById("shiren6_rate_tukon").checked) ? 45 : 100;

            // お香系
            all_attack_rate["守り"] = (document.getElementById("shiren6_incense_mamo").checked) ? 50 : 100;
            all_attack_rate["攻め"] = (document.getElementById("shiren6_incense_seme").checked) ? 200 : 100;
            rate_shield["守り"] = (document.getElementById("shiren6_incense_mamo").checked) ? 50 : 100;
            rate_shield["攻め"] = (document.getElementById("shiren6_incense_seme").checked) ? 200 : 100;

            // モンスター一覧
            var dungeon = document.getElementById("shiren6_dungeon").value;
            var floor = parseInt(document.getElementById("shiren6_floor").value);
            var name = document.getElementById("shiren6_name").value;
            var monster_table = [];
                // 階層絞り込み
            if(Shiren6Calc.dpMonsterTable[dungeon] == null) {
                monster_table = Shiren6Calc.dpMonster;
            }
            else {
                if(Shiren6Calc.dpMonsterTable[dungeon][floor - 1] != null) {
                    var monster = Shiren6Calc.dpMonsterTable[dungeon][floor - 1].monster;
                    for(var i = 0; i < monster.length; i++) {
                        if(Shiren6Calc.assMonster[monster[i]] == null) {
                            console.log("No Data " + monster[i]);
                            continue;
                        }
                        monster_table.push(Shiren6Calc.assMonster[monster[i]]);
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
                    if(monster.ruby == null) continue;
                    if(monster.ruby.indexOf(ruby_name) > -1){
                        cond_monster_table.push(monster);
                    }
                }
                monster_table = cond_monster_table;
            }
            if(monster_table.length == 0) {
                document.getElementById("shiren6_monster_table").innerHTML = "一致する条件が見つかりませんでした。";
                return;
            }
            //Shiren6Calc.makeAttackMonsterTable(Shiren6Calc.dpMonster, attack, special);
            var hp = 100, is_arrow_mode = false;
            var table = Shiren6Calc.calcAttackMonsterTable(monster_table, attack, special, all_attack_rate, defence, rate_shield, hp, is_arrow_mode, 5);
            Shiren6Calc.viewAttackMonsterTable(table, 5);
            //Shiren6Calc.viewSuppressionTable(table, Shiren6Calc.dpMonsterTable["Genshi"], 9);
        }

        static calcAttackMonsterTable(monster_table, attack, special, all_attack_rate, defence, rate_shield, hp, is_arrow_mode, die_rate_num) {
            const MIN_RAND = 87;
            const MAX_RAND = 112;
            //const MIN_RAND = 90;
            //const MAX_RAND = 110;
            var multi_attack = {}
            multi_attack["ナシャーガ"] = 2;
            multi_attack["ラシャーガ"] = 3;
            multi_attack["バシャーガ"] = 4;
            
            var all_attack_type = ["全", "ドス", "パワ", "攻め", "守り", "自攻U", "敵防U", "敵防D", "自攻D"];
            var all_defence_type = ["腹力", "金食", "ハン", "攻め", "守り", "満タン", "痛恨"];
            var all_attack_offset = all_attack_rate["全"];
            var result = new Array(monster_table.length);
            for(var i = 0; i < monster_table.length; i++) {
                // 与ダメ計算
                var monster = monster_table[i];
                var monster_defence = monster.defence / 2.0;

                    // 特効印(倍率計算)
                var special_rate = 0;
                for(var j = 0; j < monster.type.length; j++) {
                    if(special[monster.type[j]] == null) continue;
                    special_rate += special[monster.type[j]];
                }
                if(is_arrow_mode) {
                    // 矢モードは特攻無効
                    special_rate = 0;
                }
                all_attack_rate["全"] = all_attack_offset + special_rate;

                    // 87から112までの全ての乱数によるダメージ計算
                var range_attack = MAX_RAND - MIN_RAND + 1;
                var all_attack = new Array(range_attack).fill(0);
                for(var att = MIN_RAND, ct = 0; att <= MAX_RAND; att++, ct++) {
                    var rand_attack = attack * (att + 0.0) / 100 - monster_defence + 1;
                    for(var j = 0; j < all_attack_type.length; j++) {
                        if(all_attack_rate[all_attack_type[j]] == null) continue;
                        rand_attack = rand_attack * all_attack_rate[all_attack_type[j]] / 100;
                    }
                    if(rand_attack < 1) rand_attack = 1;
                    all_attack[ct] = Math.floor(rand_attack);
                }

                    // 表示用に最小値と最大値取得
                var min_attack = 0;
                var max_attack = 0;
                min_attack = all_attack[0];
                max_attack = all_attack[range_attack - 1];
  
                if(min_defence < 1) min_defence = 1;
                if(max_defence < 1) max_defence = 1;
                if(multi_attack[monster.name] != null) {
                    min_defence *= multi_attack[monster.name];
                    max_defence *= multi_attack[monster.name];
                }

                    // 正確な倒確率計算
                var die_rates = Shiren6Calc.calcDieRate(monster.hp, all_attack, die_rate_num);

                // 受ダメ計算

                    // 87から112までの全ての乱数によるダメージ計算
                var monster_attack = monster.attack;
                var all_monster_attack = new Array(range_attack).fill(0);
                for(var att = MIN_RAND, ct = 0; att <= MAX_RAND; att++, ct++) {
                    var rand_attack = monster_attack * (att + 0.0) / 100 - defence + 1;
                    for(var j = 0; j < all_defence_type.length; j++) {
                        if(rate_shield[all_defence_type[j]] == null) continue;
                        rand_attack = rand_attack * rate_shield[all_defence_type[j]] / 100;
                    }
                    if(rand_attack < 1) rand_attack = 1;
                    all_monster_attack[ct] = Math.round(rand_attack);
                }

                var min_defence = all_monster_attack[0];
                var max_defence = all_monster_attack[range_attack - 1];

                    // 正確な倒確率計算
                var me_die_rates = Shiren6Calc.calcDieRate(hp, all_monster_attack, die_rate_num);
               
               /*
                   // 概ねの倒確率計算
                
                var sum_min_attack = min_attack;
                var sum_max_attack = max_attack;
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

                var info = {}
                info.name = monster.name;
                info.min_defence = min_defence;
                info.max_defence = max_defence;
                info.min_attack = min_attack;
                info.max_attack = max_attack;
                info.hp = monster.hp;
                info.die_rates = die_rates;
                info.me_die_rates = me_die_rates;
                result[i] = info;
            }

            return result;
        }

        static calcDieRate(hp, all_attack, die_rate_num) {
            var attack_end = false;
            var die_rates = new Array(die_rate_num);
            var old_dp = new Array(hp + 1).fill(0);
            old_dp[0] = 1;
            for(var j = 0; j < die_rate_num; j++) {
                 if(attack_end) {
                     die_rates[j] = 100.0;
                     continue;
                 }
                var new_dp = new Array(hp + 1).fill(0);
                for(var jj = 0; jj <= hp; jj++) {
                    if(old_dp[jj] == 0) continue;
                    for(var jjj = 0; jjj < all_attack.length; jjj++) {
                        var add_attck = jj + all_attack[jjj];
                        if(add_attck > hp) add_attck = hp;
                        new_dp[add_attck] += old_dp[jj];
                    }
                }
                var not_enough_num = 0;
                for(var jj = 0; jj < hp; jj++) {
                    not_enough_num += new_dp[jj];
                }
                var die_rate = 0;
                if(not_enough_num == 0) {
                    die_rate = 100.0;
                    attack_end = true;
                }
                else {
                    die_rate = (1.0 - not_enough_num / (not_enough_num + new_dp[hp])) * 100;
                }
                die_rates[j] = die_rate;
                //die_rates[j] = (Math.floor(die_rate * 10) / 10).toFixed(1) + "%";
                old_dp = new_dp;
            }
            return die_rates;
        }

        static viewAttackMonsterTable(table, die_rate_num) {
            var elem_table = document.getElementById("shiren6_monster_table");
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
            th = document.createElement("th");
            th.innerHTML = "HP";
            th.style = "text-align: center;"
            tr.appendChild(th);
            th = document.createElement("th");
            th.innerHTML = "倒確率";
            th.style = "text-align: center;"
            tr.appendChild(th);
            /*
            for(var i = 0; i < die_rate_num; i++) {
                th = document.createElement("th");
                th.innerHTML = "倒確率" + (i + 1).toString();
                th.style = "text-align: center;"
                tr.appendChild(th);
            }
            */
            elem_table.appendChild(tr);
            var fragment = document.createDocumentFragment();
            for(var i = 0; i < table.length; i++) {
                // テーブル作成
                var tr = document.createElement("tr");
                var td = document.createElement("td");
                td.innerHTML = table[i].name;
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = table[i].min_defence + "-" + table[i].max_defence;
                td.style = "text-align: center;"
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = table[i].min_attack + "-" + table[i].max_attack;
                td.style = "text-align: center;"
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = table[i].hp;
                td.style = "text-align: left;"
                tr.appendChild(td);
                td = document.createElement("td");
                for(var j = 0; j < die_rate_num; j++) {
                    if(table[i].die_rates[j] > 0.0) {
                        var die_rate = Math.floor(table[i].die_rates[j]);
                        if(die_rate <= 0.0) {
                            die_rate = 1;
                        }
                        td.innerHTML = "[" + (j + 1) + "] " + die_rate + "%";
                        break;
                    }
                }
                if(j >= die_rate_num) {
                    td.innerHTML = "[" + (j + 1) + "↑] -";
                }
                td.style = "text-align: left;"
                tr.appendChild(td);
                /*
                var end = false;
                for(var j = 0; j < die_rate_num; j++) {
                    td = document.createElement("td");
                    td.style = "text-align: right;";
                    if(end) {
                        td.innerHTML = "-";
                    }
                    else {
                        td.innerHTML = (Math.floor(table[i].die_rates[j] * 10) / 10).toFixed(1) + "%";
                        if(table[i].die_rates[j] >= 100.0) {
                            end = true;
                        }
                    }
                    tr.appendChild(td);
                }
                */

                fragment.appendChild(tr);
            }
            elem_table.appendChild(fragment);
        }

        static viewSuppressionTable(table, dungeon, die_rate_num) {
            var elem_table = document.getElementById("shiren6_monster_table");
            elem_table.innerHTML = "";
            var tr = document.createElement("tr");
            var th = document.createElement("th");
            th.innerHTML = "階層";
            th.style = "width: 120px; text-align: center;";
            tr.appendChild(th);
            th = document.createElement("th");
            th.innerHTML = "制圧度";
            th.style = "text-align: center;"
            tr.appendChild(th);
            elem_table.appendChild(tr);
            
            var fragment = document.createDocumentFragment();
            var monsters = {}
            for(var i = 0; i < table.length; i++) {
                monsters[table[i].name] = table[i];
            }
            for(var i = 0; i < dungeon.length; i++) {
                var enemy_sum = 0.0;
                var me_sum = 0.0;
                for(var j = 0; j < dungeon[i].monster.length; j++) {
                    var monster = monsters[dungeon[i].monster[j]];
                    enemy_sum += 100.0;
                    for(var k = 0; k < monster.die_rates.length; k++) {
                        if(monster.die_rates[k] >= 100.0) {
                            break;
                        }
                        enemy_sum += 100.0 - monster.die_rates[k];
                    }
                    me_sum += 100.0;
                    for(var k = 0; k < monster.me_die_rates.length; k++) {
                        if(monster.me_die_rates[k] >= 100.0) {
                            break;
                        }
                        me_sum += 100.0 - monster.me_die_rates[k];
                    }
                }
                var me_ave = me_sum / dungeon[i].monster.length;
                var enemy_ave = enemy_sum / dungeon[i].monster.length;
                var sup_rate = (me_ave / enemy_ave);
                var tr = document.createElement("tr");
                var td = document.createElement("td");
                td = document.createElement("td");
                td.innerHTML = (i + 1).toString();
                td.style = "text-align: left;"
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = (Math.floor(sup_rate * 10) / 10).toFixed(1);
                td.style = "text-align: left;"
                tr.appendChild(td);
                fragment.appendChild(tr);
            }
            elem_table.appendChild(fragment);
        }

        static calcAttack(level, weapon, power, is_arrow_mode) {
            // 攻撃力＝ちから攻撃力＋武器攻撃力＋レベル攻撃力
            // 　　　　ちから攻撃力＝ちからの値
            // 　　　　武器攻撃力＝武器の強さ×(0.75+ちからの値/32)
            // 　　　　レベル攻撃力＝1+(レベル-1)×1.5        （レベル≦5）
            // 　　　　　　　　　　　7.5+ (レベル-5)×1       （6≦レベル≦13）
            // 　　　　　　　　　　　15.5+(レベル-13)×0.5 （14≦レベル）【暫定】
            var level_attack = 0.0;
            if(level <= 5) {
                level_attack = 1 + (level - 1) * 1.5;
            }
            else if(level <= 13) {
                level_attack = 7.5 + (level - 5) * 1;
            }
            else {
                level_attack = 15.5 + (level - 13) * 0.5;
            }
            var weapon_attack = weapon * (0.75 + power / 32.0);
            if(is_arrow_mode) {
                weapon_attack = weapon * (0.75 + power / 32.0);
            }
            var power_attack = power;
            return level_attack + weapon_attack + power_attack;
        }

        static initMaxMonster() {
            var monster_table = Shiren6Calc.dpMonster;
            for(var i = 0; i < monster_table.length; i++) {
                var monster = monster_table[i];
                if(Shiren6Calc.assMaxMonster[monster.name] == null) {
                    continue;
                }
                var monster_level = Shiren6Calc.assMaxMonster[monster.name];
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
                    Shiren6Calc.assMonster[data.name] = data;
                    i++;
                }
            }
        }

        static readDataBase(table) {
            if(table == null) {
                console.log("init error");
                return false;
            }
            for(var i = 0; i < table.length; i++) {
                if(table[i].length < 11) continue;
                var arr = table[i];
                var name = arr[1]
                if(Shiren6Calc.assMonster[name] != null) {
                    continue;
                }
                var data = {};
                data.number = arr[0];
                data.name = name;
                data.level = arr[2];
                data.hp = Number(arr[3]);
                data.attack = Number(arr[4]);
                data.defence = Number(arr[5]);
                data.exp = Number(arr[6]);
                data.speed = arr[7];
                data.type = arr[8].split(' ');
                data.explanation = arr[9];
                data.ruby = arr[10];
                Shiren6Calc.dpMonster.push(data);
                Shiren6Calc.assMonster[name] = data;
            }
            Shiren6Calc.bDBInitNum++;
            Shiren6Calc.calc();
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
                if(Shiren6Calc.assMaxMonster[name] == null) {
                    Shiren6Calc.assMaxMonster[name] = [];
                }
                Shiren6Calc.assMaxMonster[name].push(level);
            }
            Shiren6Calc.bDBInitNum++;
            Shiren6Calc.calc();
            return true;
        }

        static readMonsterTable(name, table) {
            if(table == null) {
                console.log("init error");
                return false;
            }
            Shiren6Calc.dpMonsterTable[name] = [];
            for(var i = 0; i < table.length; i++) {
                Shiren6Calc.dpMonsterTable[name].push({});
                var data = Shiren6Calc.dpMonsterTable[name][i];
                data.floor = parseInt(table[i][0]);
                data.monster = [];
                for(var j = 1; j < table[i].length; j++) {
                    data.monster.push(table[i][j]);
                }
            }
            Shiren6Calc.bDBInitNum++;
            Shiren6Calc.calc();
            return true;
        }

        static changeArrowMode() {
            var is_arrow_mode = document.getElementById("shiren6_weapon_arrow_mode").checked;
            if(is_arrow_mode) {
                document.getElementById("shiren6_weapon").style.display = "none";
                document.getElementById("shiren6_weapon_arrow").style.display = "inline";
            }
            else {
                document.getElementById("shiren6_weapon").style.display = "inline";
                document.getElementById("shiren6_weapon_arrow").style.display = "none";
            }
        }
    }
   
    return Shiren6Calc;
})();
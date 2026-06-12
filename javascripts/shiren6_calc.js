

var Shiren6Calc = (function() {

    class Shiren6Calc {

        static init() {
            Shiren6Calc.assMonster = {};
            Shiren6Calc.assMaxMonster = {};
            Shiren6Calc.dpMonster = [];
            Shiren6Calc.dpMonsterTable = {};
            Shiren6Calc.DB_INIT_NUM = 3;
            Shiren6Calc.bDBInitNum = 0;
            Shiren6Calc.bInitMaxMonster = false;
            Shiren6Calc.graphMonster = null;
            Shiren6Calc.currentSettingIndex = 0;
            Shiren6Calc.settingValues = [{}, {}];
            Shiren6Calc.defaultSettingValues = {};
            Shiren6Calc.isLoadingSetting = false;
            Shiren6Calc.STORAGE_KEY = "shiren6_calc_state_v1";
            Shiren6Calc.STORAGE_VERSION = 2;
            Shiren6Calc.storedState = Shiren6Calc.loadStoredState();
            Shiren6Calc.initSettingTabs();
            Shiren6Calc.restoreDisplaySettings();
            Shiren6Calc.changeOneFloorStatus();
            getCSV(Shiren6Calc.readDataBase, "https://koyubistrong.github.io/shiren6/monster.html", "\t", "\n");
            //getCSV(Shiren6Calc.readMaxMonster, "https://koyubistrong.github.io/shiren5/max_level_monster.html", "\t", "\n");
            getCSV(Shiren6Calc.readMonsterTable.bind(null, "Shinzui"), "https://koyubistrong.github.io/shiren6/shinzui_monster_table.html", "\t", "\n");
            getCSV(Shiren6Calc.readMonsterTable.bind(null, "SinSinzui"), "https://koyubistrong.github.io/shiren6/sin_sinzui_monster_table.html", "\t", "\n");
        }

        static isInit() {
            return Shiren6Calc.bDBInitNum >= Shiren6Calc.DB_INIT_NUM;
        }
      
        static calc() {
            Shiren6Calc.saveCurrentSetting();
            Shiren6Calc.saveStoredState();
            if(Shiren6Calc.isInit() == false) {
                return;
            }
            if(Shiren6Calc.bInitMaxMonster == false) {
                //Shiren6Calc.initMaxMonster();
                Shiren6Calc.bInitMaxMonster = true;
            }

            // モンスター一覧
            var dungeon = document.getElementById("shiren6_dungeon").value;
            var name = document.getElementById("shiren6_name").value;
            var monster_table = [];
                // 階層絞り込み
            if(Shiren6Calc.dpMonsterTable[dungeon] == null) {
                monster_table = Shiren6Calc.dpMonster;
            }
            else {
                var under = parseInt(document.getElementById("shiren6_floor_under").value);
                var upper = parseInt(document.getElementById("shiren6_floor_upper").value);
                if(under > upper) {
                    upper = under;
                }
                var floor = under;
                var unique = {};
                while(floor <= upper) {
                    if(Shiren6Calc.dpMonsterTable[dungeon][floor - 1] != null) {
                        var monster = Shiren6Calc.dpMonsterTable[dungeon][floor - 1].monster;
                        for(var i = 0; i < monster.length; i++) {
                            if(Shiren6Calc.assMonster[monster[i]] == null) {
                                console.log("No Data " + monster[i]);
                                continue;
                            }
                            if(unique[monster[i]] != null) {
                                continue;
                            }
                            monster_table.push(Shiren6Calc.assMonster[monster[i]]);
                            unique[monster[i]] = true;
                        }
                    }
                    floor++;
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
                Shiren6Calc.viewAttackMonsterGraph([], 5);
                document.getElementById("shiren6_monster_table").innerHTML = "一致する条件が見つかりませんでした。";
                Shiren6Calc.changeDisplayType();
                return;
            }
            //Shiren6Calc.makeAttackMonsterTable(Shiren6Calc.dpMonster, attack, special);
            var hp = 100;
            var die_rate_num = 5;
            var setting = Shiren6Calc.getActiveSetting();
            var compare_setting = Shiren6Calc.getCompareSetting();
            var table = Shiren6Calc.calcAttackMonsterTableForSetting(monster_table, setting, hp, die_rate_num);
            var compare_table = Shiren6Calc.calcAttackMonsterTableForSetting(monster_table, compare_setting, hp, die_rate_num);
            Shiren6Calc.addCompareDamage(table, compare_table);
            Shiren6Calc.sortResultTable(table);
            Shiren6Calc.viewAttackMonsterTable(table, die_rate_num);
            //Shiren6Calc.viewSuppressionTable(table, Shiren6Calc.dpMonsterTable["Genshi"], 9);
            Shiren6Calc.viewAttackMonsterGraph(table, die_rate_num);
            Shiren6Calc.changeDisplayType();
        }

        static calcAttackMonsterTableForSetting(monster_table, setting, hp, die_rate_num) {
            var is_arrow_mode = Shiren6Calc.getSettingChecked(setting, "shiren6_weapon_arrow_mode");
            var player = Shiren6Calc.getPlayer(setting);

            // 攻撃と防御の基本値計算
            var level = parseInt(Shiren6Calc.getSettingValue(setting, "shiren6_level"));
            var weapon = parseInt(Shiren6Calc.getSettingValue(setting, "shiren6_weapon"));
            var power = parseInt(Shiren6Calc.getSettingValue(setting, "shiren6_power"));
            var shield = parseInt(Shiren6Calc.getSettingValue(setting, "shiren6_shield"));
            if(is_arrow_mode) {
                weapon = parseInt(Shiren6Calc.getSettingValue(setting, "shiren6_weapon_arrow"));
            }
            var attack = Shiren6Calc.calcAttack(level, weapon, power, is_arrow_mode, player);
            var defence = Shiren6Calc.calcDefence(shield, player);

            // 特攻武器印系
            var special = {};
			special["ケモノ"] = Shiren6Calc.getSettingChecked(setting, "shiren6_special_beast") ? 50 : 0;
			special["ゴースト"] = Shiren6Calc.getSettingChecked(setting, "shiren6_special_gost") ? 50 : 0;
			special["ドラゴン"] = Shiren6Calc.getSettingChecked(setting, "shiren6_special_dragon") ? 50 : 0;
			special["ドレイン"] = Shiren6Calc.getSettingChecked(setting, "shiren6_special_drain") ? 50 : 0;
			special["一ツ目"] = Shiren6Calc.getSettingChecked(setting, "shiren6_special_eye") ? 50 : 0;
			special["浮遊"] = Shiren6Calc.getSettingChecked(setting, "shiren6_special_floating") ? 50 : 0;
            special["水棲"] = Shiren6Calc.getSettingChecked(setting, "shiren6_special_water") ? 50 : 0;
			special["爆発"] = Shiren6Calc.getSettingChecked(setting, "shiren6_special_explosion") ? 50 : 0;
			special["金属"] = Shiren6Calc.getSettingChecked(setting, "shiren6_special_metal") ? 50 : 0;

            // 攻撃UP武器印系
            var all_attack_rate = {};
            var all_attack = 100;
            all_attack += Shiren6Calc.getSettingChecked(setting, "shiren6_special_twice") ? 50 : 0;
            all_attack += Shiren6Calc.getSettingChecked(setting, "shiren6_special_money") ? 50 : 0;
            all_attack += Shiren6Calc.getSettingChecked(setting, "shiren6_special_stomach") ? 50 : 0;
            all_attack += Shiren6Calc.getSettingChecked(setting, "shiren6_special_hungry") ? 100 : 0;
            all_attack += Shiren6Calc.getSettingChecked(setting, "shiren6_special_potential") ? 50 : 0;
            all_attack += Shiren6Calc.getSettingChecked(setting, "shiren6_blow_conscience_me") ? Shiren6Calc.getCriticalAttackBonus(player) : 0;
            all_attack_rate["全"] = all_attack;

            // 攻撃力アップ系
            all_attack_rate["ドス"] = Shiren6Calc.getSettingChecked(setting, "shiren6_dosukoi") ? 150 : 100;
            var power_up_me = parseInt(Shiren6Calc.getSettingValue(setting, "shiren6_power_up_me"));
            var defence_up_enemy = parseInt(Shiren6Calc.getSettingValue(setting, "shiren6_defence_up_enemy"));
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
            var rate_shield = {};
            rate_shield["腹力"] = Shiren6Calc.getSettingChecked(setting, "shiren6_rate_stomach") ? 70 : 100;
            rate_shield["金食"] = Shiren6Calc.getSettingChecked(setting, "shiren6_rate_money") ? 70 : 100;
            rate_shield["ハン"] = Shiren6Calc.getSettingChecked(setting, "shiren6_rate_hungry") ? 70 : 100;
            rate_shield["数字守り"] = Shiren6Calc.getSettingChecked(setting, "shiren6_rate_number") ? 70 : 100;
            rate_shield["満タン"] = Shiren6Calc.getSettingChecked(setting, "shiren6_rate_max") ? 50 : 100;
            rate_shield["痛恨"] = Shiren6Calc.getSettingChecked(setting, "shiren6_rate_tukon") ? 45 : 100;

            // お香系
            all_attack_rate["守り"] = Shiren6Calc.getSettingChecked(setting, "shiren6_incense_mamo") ? 50 : 100;
            all_attack_rate["攻め"] = Shiren6Calc.getSettingChecked(setting, "shiren6_incense_seme") ? 200 : 100;
            rate_shield["守り"] = Shiren6Calc.getSettingChecked(setting, "shiren6_incense_mamo") ? 50 : 100;
            rate_shield["攻め"] = Shiren6Calc.getSettingChecked(setting, "shiren6_incense_seme") ? 200 : 100;

            return Shiren6Calc.calcAttackMonsterTable(monster_table, attack, special, all_attack_rate, defence, rate_shield, hp, is_arrow_mode, die_rate_num);
        }

        static initSettingTabs() {
            var setting = Shiren6Calc.collectSettingValues();
            Shiren6Calc.defaultSettingValues = Object.assign({}, setting);
            Shiren6Calc.settingValues[0] = Object.assign({}, setting);
            Shiren6Calc.settingValues[1] = Object.assign({}, setting);
            if(Shiren6Calc.storedState != null && Array.isArray(Shiren6Calc.storedState.settingValues)) {
                for(var i = 0; i < 2; i++) {
                    if(Shiren6Calc.storedState.settingValues[i] != null) {
                        Shiren6Calc.settingValues[i] = Object.assign({}, setting, Shiren6Calc.storedState.settingValues[i]);
                    }
                }
            }
            if(Shiren6Calc.storedState != null && (Shiren6Calc.storedState.currentSettingIndex == 0 || Shiren6Calc.storedState.currentSettingIndex == 1)) {
                Shiren6Calc.currentSettingIndex = Shiren6Calc.storedState.currentSettingIndex;
            }
            Shiren6Calc.loadSetting(Shiren6Calc.currentSettingIndex);
            Shiren6Calc.updateSettingTabs();
        }

        static collectSettingValues() {
            return Shiren6Calc.collectElementValues("shiren6_calc_setting_table");
        }

        static collectDisplayValues() {
            return Shiren6Calc.collectElementValues("shiren6_display_setting_table");
        }

        static collectElementValues(parent_id) {
            var result = {};
            var parent = document.getElementById(parent_id);
            if(parent == null) {
                return result;
            }
            var inputs = parent.querySelectorAll("input, select");
            for(var i = 0; i < inputs.length; i++) {
                var elem = inputs[i];
                if(elem.id == null || elem.id == "") {
                    continue;
                }
                if(elem.type == "checkbox" || elem.type == "radio") {
                    result[elem.id] = elem.checked;
                }
                else {
                    result[elem.id] = elem.value;
                }
            }
            return result;
        }

        static restoreDisplaySettings() {
            if(Shiren6Calc.storedState == null || Shiren6Calc.storedState.displayValues == null) {
                return;
            }
            Shiren6Calc.applyElementValues("shiren6_display_setting_table", Shiren6Calc.storedState.displayValues);
        }

        static applyElementValues(parent_id, values) {
            var parent = document.getElementById(parent_id);
            if(parent == null || values == null) {
                return;
            }
            var inputs = parent.querySelectorAll("input, select");
            for(var i = 0; i < inputs.length; i++) {
                var elem = inputs[i];
                if(elem.id == null || elem.id == "" || values[elem.id] == null) {
                    continue;
                }
                if(elem.type == "checkbox" || elem.type == "radio") {
                    elem.checked = values[elem.id];
                }
                else {
                    elem.value = values[elem.id];
                }
            }
        }

        static loadStoredState() {
            try {
                var json = localStorage.getItem(Shiren6Calc.STORAGE_KEY);
                if(json == null || json == "") {
                    return null;
                }
                var state = JSON.parse(json);
                if(state.version !== Shiren6Calc.STORAGE_VERSION) {
                    if(state.displayValues != null) {
                        delete state.displayValues.shiren6_show_damage_diff;
                    }
                    state.version = Shiren6Calc.STORAGE_VERSION;
                }
                return state;
            }
            catch(e) {
                console.log("shiren6 localStorage load error", e);
                return null;
            }
        }

        static saveStoredState() {
            try {
                var state = {
                    version: Shiren6Calc.STORAGE_VERSION,
                    settingValues: Shiren6Calc.settingValues,
                    currentSettingIndex: Shiren6Calc.currentSettingIndex,
                    displayValues: Shiren6Calc.collectDisplayValues()
                };
                localStorage.setItem(Shiren6Calc.STORAGE_KEY, JSON.stringify(state));
            }
            catch(e) {
                console.log("shiren6 localStorage save error", e);
            }
        }

        static saveCurrentSetting() {
            if(Shiren6Calc.isLoadingSetting) {
                return;
            }
            if(Shiren6Calc.settingValues == null) {
                return;
            }
            Shiren6Calc.settingValues[Shiren6Calc.currentSettingIndex] = Shiren6Calc.collectSettingValues();
        }

        static loadSetting(index) {
            var setting = Shiren6Calc.settingValues[index];
            if(setting == null) {
                return;
            }
            var table = document.getElementById("shiren6_calc_setting_table");
            if(table == null) {
                return;
            }
            var inputs = table.querySelectorAll("input, select");
            Shiren6Calc.isLoadingSetting = true;
            for(var i = 0; i < inputs.length; i++) {
                var elem = inputs[i];
                if(elem.id == null || elem.id == "" || setting[elem.id] == null) {
                    continue;
                }
                if(elem.type == "checkbox" || elem.type == "radio") {
                    elem.checked = setting[elem.id];
                }
                else {
                    elem.value = setting[elem.id];
                }
            }
            Shiren6Calc.isLoadingSetting = false;
            Shiren6Calc.changeArrowMode();
        }

        static switchSetting(index) {
            if(index == Shiren6Calc.currentSettingIndex) {
                return;
            }
            Shiren6Calc.saveCurrentSetting();
            Shiren6Calc.currentSettingIndex = index;
            Shiren6Calc.loadSetting(index);
            Shiren6Calc.updateSettingTabs();
            Shiren6Calc.calc();
        }

        static resetCurrentSetting() {
            if(Shiren6Calc.settingValues == null || Shiren6Calc.defaultSettingValues == null) {
                return;
            }
            var setting_name = Shiren6Calc.getCurrentSettingName();
            if(confirm(setting_name + "をデフォルトに戻します。よろしいですか？") == false) {
                return;
            }
            Shiren6Calc.settingValues[Shiren6Calc.currentSettingIndex] = Object.assign({}, Shiren6Calc.defaultSettingValues);
            Shiren6Calc.loadSetting(Shiren6Calc.currentSettingIndex);
            Shiren6Calc.saveStoredState();
            Shiren6Calc.calc();
        }

        static copyCompareSettingToCurrent() {
            if(Shiren6Calc.settingValues == null) {
                return;
            }
            var source_index = 1 - Shiren6Calc.currentSettingIndex;
            var source_name = Shiren6Calc.getSettingName(source_index);
            var current_name = Shiren6Calc.getCurrentSettingName();
            if(confirm(source_name + "を" + current_name + "へコピーします。" + current_name + "の現在の内容は上書きされます。よろしいですか？") == false) {
                return;
            }
            Shiren6Calc.settingValues[Shiren6Calc.currentSettingIndex] = Object.assign({}, Shiren6Calc.settingValues[source_index]);
            Shiren6Calc.loadSetting(Shiren6Calc.currentSettingIndex);
            Shiren6Calc.saveStoredState();
            Shiren6Calc.calc();
        }

        static getCurrentSettingName() {
            return Shiren6Calc.getSettingName(Shiren6Calc.currentSettingIndex);
        }

        static getSettingName(index) {
            return index == 0 ? "設定A" : "設定B";
        }

        static updateSettingTabs() {
            for(var i = 0; i < 2; i++) {
                var tab = document.getElementById("shiren6_setting_tab_" + (i + 1));
                if(tab == null) {
                    continue;
                }
                var active = i == Shiren6Calc.currentSettingIndex;
                tab.classList.toggle("is-active", active);
                tab.setAttribute("aria-selected", active ? "true" : "false");
            }
        }

        static getActiveSetting() {
            if(Shiren6Calc.settingValues == null) {
                return Shiren6Calc.collectSettingValues();
            }
            return Shiren6Calc.settingValues[Shiren6Calc.currentSettingIndex];
        }

        static getCompareSetting() {
            if(Shiren6Calc.settingValues == null) {
                return Shiren6Calc.collectSettingValues();
            }
            return Shiren6Calc.settingValues[1 - Shiren6Calc.currentSettingIndex];
        }

        static getSettingValue(setting, id) {
            if(setting != null && setting[id] != null) {
                return setting[id];
            }
            var elem = document.getElementById(id);
            if(elem == null) {
                return "";
            }
            return elem.value;
        }

        static getSettingChecked(setting, id) {
            if(setting != null && setting[id] != null) {
                return setting[id] == true;
            }
            var elem = document.getElementById(id);
            return elem != null && elem.checked;
        }

        static getPlayer(setting) {
            return Shiren6Calc.getSettingChecked(setting, "shiren6_player_asuka") ? "asuka" : "shiren";
        }

        static getCriticalAttackBonus(player) {
            return player == "asuka" ? 200 : 50;
        }

        static addCompareDamage(table, compare_table) {
            var compare = {};
            for(var i = 0; i < compare_table.length; i++) {
                compare[compare_table[i].name] = compare_table[i];
            }
            for(var i = 0; i < table.length; i++) {
                var base = compare[table[i].name];
                if(base == null) {
                    table[i].min_defence_diff = 0;
                    table[i].max_defence_diff = 0;
                    table[i].min_attack_diff = 0;
                    table[i].max_attack_diff = 0;
                    table[i].defence_median_diff = 0;
                    table[i].attack_median_diff = 0;
                    table[i].compare_die_rate_text = "";
                    table[i].compare_die_rate_class = "shiren6-diff-even";
                    continue;
                }
                table[i].min_defence_diff = table[i].min_defence - base.min_defence;
                table[i].max_defence_diff = table[i].max_defence - base.max_defence;
                table[i].min_attack_diff = table[i].min_attack - base.min_attack;
                table[i].max_attack_diff = table[i].max_attack - base.max_attack;
                table[i].defence_median_diff = (table[i].min_defence + table[i].max_defence) / 2 - (base.min_defence + base.max_defence) / 2;
                table[i].attack_median_diff = (table[i].min_attack + table[i].max_attack) / 2 - (base.min_attack + base.max_attack) / 2;
                table[i].compare_die_rate_text = Shiren6Calc.formatDieRate(base, table[i].die_rates.length);
                table[i].compare_die_rate_class = "shiren6-diff-even";
            }
        }

        static formatSigned(value) {
            value = Math.round(value * 10) / 10;
            if(Math.abs(value) < 0.05) {
                value = 0;
            }
            var text = Number.isInteger(value) ? value.toString() : value.toFixed(1);
            if(value > 0) {
                return "+" + text;
            }
            if(value < 0) {
                return text;
            }
            return "±0";
        }

        static formatDamageWithDiff(min, max, diff, lower_is_better) {
            var damage_text = min + "-" + max;
            if(document.getElementById("shiren6_show_damage_diff").checked == false) {
                return damage_text;
            }
            var diff_class = lower_is_better ? Shiren6Calc.getReverseDiffClass(diff) : Shiren6Calc.getDiffClass(diff);
            return Shiren6Calc.formatCompareCell(damage_text, Shiren6Calc.formatSigned(diff), diff_class);
        }

        static formatDieRate(info, die_rate_num) {
            var die_rate_info = Shiren6Calc.getDieRateInfo(info, die_rate_num);
            if(die_rate_info.rate == null) {
                return "[" + die_rate_info.turn + "↑] -";
            }
            return "[" + die_rate_info.turn + "] " + die_rate_info.rate + "%";
        }

        static getDieRateInfo(info, die_rate_num) {
            var j = 0;
            for(; j < die_rate_num; j++) {
                if(info.die_rates[j] > 0.0) {
                    var die_rate = Math.floor(info.die_rates[j]);
                    if(die_rate <= 0.0) {
                        die_rate = 1;
                    }
                    return {
                        turn: j + 1,
                        rate: die_rate
                    };
                }
            }
            return {
                turn: j + 1,
                rate: null
            };
        }

        static formatDieRateWithCompare(info, die_rate_num) {
            var die_rate_text = Shiren6Calc.formatDieRate(info, die_rate_num);
            if(document.getElementById("shiren6_show_damage_diff").checked == false || info.compare_die_rate_text == "") {
                return die_rate_text;
            }
            return Shiren6Calc.formatCompareCell(die_rate_text, info.compare_die_rate_text, info.compare_die_rate_class);
        }

        static formatCompareCell(main_text, compare_text, compare_class) {
            return '<span class="shiren6-compare-cell"><span>' + main_text + '</span><span class="' + compare_class + '">' + compare_text + "</span></span>";
        }

        static getDiffClass(value) {
            if(value > 0) {
                return "shiren6-diff-plus";
            }
            if(value < 0) {
                return "shiren6-diff-minus";
            }
            return "shiren6-diff-even";
        }

        static getReverseDiffClass(value) {
            if(value < 0) {
                return "shiren6-diff-plus";
            }
            if(value > 0) {
                return "shiren6-diff-minus";
            }
            return "shiren6-diff-even";
        }

        static sortResultTable(result) {
            var sort_val = document.getElementById("shiren6_table_sort_type").value;
            if(sort_val != "") {
                result.sort(function(a, b) {
                    var sign = (document.getElementById("shiren6_table_sort_by_asc").checked) ? 1 : -1;
                    return (a[sort_val] > b[sort_val]) ? (1 * sign) : (-1 * sign);
                });
            }
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
            var all_defence_type = ["腹力", "金食", "ハン", "数字守り", "攻め", "守り", "満タン", "痛恨"];
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
                    var rand_attack = (attack - monster_defence + 1) * (att + 0.5) / 100;
                    for(var j = 0; j < all_attack_type.length; j++) {
                        if(all_attack_rate[all_attack_type[j]] == null) continue;
                        rand_attack = rand_attack * all_attack_rate[all_attack_type[j]] / 100;
                    }
                    if(rand_attack < 1) rand_attack = 1;
                    all_attack[ct] = Math.round(rand_attack);
                }

                    // 表示用に最小値と最大値取得
                var min_attack = 0;
                var max_attack = 0;
                min_attack = all_attack[0];
                max_attack = all_attack[range_attack - 1];
  
                    // 正確な倒確率計算
                var die_rates = Shiren6Calc.calcDieRate(monster.hp, all_attack, die_rate_num);

                // 受ダメ計算

                    // 87から112までの全ての乱数によるダメージ計算
                var monster_attack = monster.attack;
                var all_monster_attack = new Array(range_attack).fill(0);
                for(var att = MIN_RAND, ct = 0; att <= MAX_RAND; att++, ct++) {
                    var rand_attack = (monster_attack - defence + 1) * (att + 0.5) / 100;
                    for(var j = 0; j < all_defence_type.length; j++) {
                        if(rate_shield[all_defence_type[j]] == null) continue;
                        rand_attack = rand_attack * rate_shield[all_defence_type[j]] / 100;
                    }
                    if(rand_attack < 1) rand_attack = 1;
                    all_monster_attack[ct] = Math.round(rand_attack);
                }
                
                var min_defence = all_monster_attack[0];
                var max_defence = all_monster_attack[all_monster_attack.length - 1];
                if(multi_attack[monster.name] != null) {
                    for(var j = 0; j < all_monster_attack.length; j++) {
                        all_monster_attack[j] *= multi_attack[monster.name];
                    }
                    min_defence *= multi_attack[monster.name];
                    max_defence *= multi_attack[monster.name];
                }

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
                var j = 0;
                for(var j = 0; j < die_rate_num; j++) {
                    if(info.die_rates[j] > 0.0) {
                        info.die_rate_tonum = (j + 1) * 100 - info.die_rates[j];
                        break;
                    }
                }
                if(j >= die_rate_num) {
                    info.die_rate_tonum = j * 100;
                }
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
                td.innerHTML = Shiren6Calc.formatDamageWithDiff(table[i].min_defence, table[i].max_defence, table[i].defence_median_diff, true);
                td.style = "text-align: center;"
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = Shiren6Calc.formatDamageWithDiff(table[i].min_attack, table[i].max_attack, table[i].attack_median_diff, false);
                td.style = "text-align: center;"
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = '<span class="shiren6-hp-value">' + table[i].hp + '</span>';
                td.style = "text-align: center;"
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = Shiren6Calc.formatDieRateWithCompare(table[i], die_rate_num);
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

        static viewAttackMonsterGraph(table, die_rate_num) {
            var totals = new Array(die_rate_num * 2 + 1).fill(0);
            for(var i = 0; i < table.length; i++) {
                var die_num = 6;
                var die_rate = 0.0;
                for(var j = 0; j < die_rate_num; j++) {
                    if(table[i].die_rates[j] > 0.0) {
                        die_rate = Math.floor(table[i].die_rates[j]);
                        die_num = j + 1;
                        break;
                    }
                }
                var index = (die_num - 1) * 2;
                if(j < die_rate_num && die_rate <= 50) {
                    index++;
                }
                totals[index]++;
            }
            var labels = new Array(die_rate_num * 2 + 1).fill("");
            for(var i = 0; i < labels.length - 1; i++) {
                var str = "[" + (Math.floor(i / 2) + 1) + "]";
                labels[i] = str + ["-100%", "-50%"][i % 2];
            }
            labels[labels.length - 1] = "[" + (die_rate_num + 1) + "↑]";

            if(Shiren6Calc.graphMonster != null) {
                Shiren6Calc.graphMonster.destroy();
            } 

            var ctx = document.getElementById("shiren6_monster_graph");
            Shiren6Calc.graphMonster = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: labels,
                  datasets: [
                    {
                      label: '敵の数',
                      data: totals,
                      backgroundColor: "rgba(219,39,91,0.5)"
                    }
                    ]
                },
                options: {
                  plugins: {
                    title: {
                      display: true,
                      fontSize: 20, 
                      text: '倒確率分布'
                    }
                  },
                  scales: {
                    y: {
                      ticks: {
                        suggestedMax: 300,
                        suggestedMin: 0,
                        stepSize: 10,
                        callback: function(value, index, values){
                          return  value +  '匹';
                        }
                      }
                    }
                  },
                  animation: false,
                }
              });
        }

        static calcAttack(level, weapon, power, is_arrow_mode, player) {
            // 攻撃力＝ちから攻撃力＋武器攻撃力＋レベル攻撃力
            // 　　　　ちから攻撃力＝ちからの値
            // 　　　　武器攻撃力＝武器の強さ×(0.75+ちからの値/32)     （シレン）
            // 　　　　　　　　　　武器の強さ×0.9769+武器の強さ×0.04061×ちから （アスカ）
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
            if(player == "asuka") {
                weapon_attack = weapon * 0.9769 + weapon * 0.04061 * power;
            }
            var power_attack = power;
            return level_attack + weapon_attack + power_attack;
        }

        static calcDefence(shield, player) {
            if(player == "asuka") {
                if(shield <= 40) {
                    return shield * 0.5;
                }
                return 20 + (shield - 40) * 0.3;
            }
            var defence = shield;
            if(shield >= 21) {
                defence = 20 + (shield - 20) * 0.6
            }
            return defence;
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

        static adjustFloor() {
            var under_name = "shiren6_floor_under";
            var upper_name = "shiren6_floor_upper";
            var under = parseInt(document.getElementById(under_name).value);
            var upper = parseInt(document.getElementById(upper_name).value);
            if(document.getElementById("shiren6_floor_only_one").checked) {
                document.getElementById(upper_name).value = document.getElementById(under_name).value;
            }
            else {
                if(under > upper) {
                    document.getElementById(upper_name).value = document.getElementById(under_name).value;
                }
            }
        }

        static changeOneFloorStatus() {
            var under_name = "shiren6_floor_under";
            var upper_name = "shiren6_floor_upper";
            if(document.getElementById("shiren6_floor_only_one").checked) {
                document.getElementById(upper_name).value = document.getElementById(under_name).value;
                document.getElementById(upper_name).disabled = true;
            }
            else {
                document.getElementById(upper_name).disabled = false;
            }
        }

        static clickDisplayText() {
            if(document.getElementById("shiren6_display_setting_table").style.display == "none") {
                document.getElementById("shiren6_display_setting_table").style.display = "block";
                document.getElementById("shiren6_display_setting_text").innerText = "- 表示設定";
            }
            else {
                document.getElementById("shiren6_display_setting_table").style.display = "none";
                document.getElementById("shiren6_display_setting_text").innerText = "+ 表示設定";
            }
        }
        static changeDisplayType() {
            if(document.getElementById("shiren6_display_type_table").checked) {
                document.getElementById("shiren6_monster_table").style.display = "";
                document.getElementById("shiren6_monster_graph").style.display = "none";
            }
            if(document.getElementById("shiren6_display_type_graph").checked) {
                document.getElementById("shiren6_monster_table").style.display = "none";
                document.getElementById("shiren6_monster_graph").style.display = "";
            }
            Shiren6Calc.saveStoredState();
        }
    }
   
    return Shiren6Calc;
})();

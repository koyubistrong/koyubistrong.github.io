

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
            Shiren5Calc.graphMonster = null;
            Shiren5Calc.currentSettingIndex = 0;
            Shiren5Calc.settingValues = [{}, {}];
            Shiren5Calc.defaultSettingValues = {};
            Shiren5Calc.isLoadingSetting = false;
            Shiren5Calc.STORAGE_KEY = "shiren5_calc_state_v1";
            Shiren5Calc.STORAGE_VERSION = 1;
            Shiren5Calc.storedState = Shiren5Calc.loadStoredState();
            Shiren5Calc.initSettingTabs();
            Shiren5Calc.restoreDisplaySettings();
            Shiren5Calc.changeOneFloorStatus();
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
            Shiren5Calc.saveCurrentSetting();
            Shiren5Calc.saveStoredState();
            if(Shiren5Calc.isInit() == false) {
                return;
            }
            if(Shiren5Calc.bInitMaxMonster == false) {
                Shiren5Calc.initMaxMonster();
                Shiren5Calc.bInitMaxMonster = true;
            }

            // モンスター一覧
            var dungeon = document.getElementById("shiren5_dungeon").value;
            var name = document.getElementById("shiren5_name").value;
            var monster_table = [];
                // 階層絞り込み
            if(Shiren5Calc.dpMonsterTable[dungeon] == null) {
                monster_table = Shiren5Calc.dpMonster;
            }
            else {
                var under = parseInt(document.getElementById("shiren5_floor").value);
                var upper = parseInt(document.getElementById("shiren5_floor_upper").value);
                if(under > upper) {
                    upper = under;
                }
                var floor = under;
                var unique = {};
                while(floor <= upper) {
                    if(Shiren5Calc.dpMonsterTable[dungeon][floor - 1] != null) {
                        var monster = Shiren5Calc.dpMonsterTable[dungeon][floor - 1].monster;
                        for(var i = 0; i < monster.length; i++) {
                            if(Shiren5Calc.assMonster[monster[i]] == null) {
                                console.log("No Data " + monster[i]);
                                continue;
                            }
                            if(unique[monster[i]] != null) {
                                continue;
                            }
                            monster_table.push(Shiren5Calc.assMonster[monster[i]]);
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
                Shiren5Calc.viewAttackMonsterGraph([], 3);
                document.getElementById("shiren5_monster_table").innerHTML = "一致する条件が見つかりませんでした。";
                Shiren5Calc.changeDisplayType();
                return;
            }
            //Shiren5Calc.makeAttackMonsterTable(Shiren5Calc.dpMonster, attack, special);
            const DIE_RATE_NUM = 3;
            var setting = Shiren5Calc.getActiveSetting();
            var compare_setting = Shiren5Calc.getCompareSetting();
            var rows = Shiren5Calc.calcAttackMonsterTableForSetting(monster_table, setting, DIE_RATE_NUM);
            var compare_rows = Shiren5Calc.calcAttackMonsterTableForSetting(monster_table, compare_setting, DIE_RATE_NUM);
            Shiren5Calc.addCompareDamage(rows, compare_rows);
            Shiren5Calc.sortResultTable(rows);
            Shiren5Calc.viewAttackMonsterTable(rows, DIE_RATE_NUM);
            Shiren5Calc.viewAttackMonsterGraph(rows, DIE_RATE_NUM);
            Shiren5Calc.changeDisplayType();
        }

        static calcAttackMonsterTableForSetting(monster_table, setting, die_rate_num) {
            var is_arrow_mode = Shiren5Calc.getSettingChecked(setting, "shiren5_weapon_arrow_mode");

            // 攻撃と防御の基本値計算
            var level = parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_level"));
            var weapon = parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_weapon"));
            var power = parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_power"));
            var isogeny_weapon = parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_isogeny_weapon"));
            var weapon_bundle_bracelet = parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_weapon_bundle_bracelet"));
            if(isogeny_weapon > 0) {
                // 武器束ねの腕輪
                weapon += (4 + 4 * isogeny_weapon) * weapon_bundle_bracelet;
            }
            var shield = parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_shield"));
            if(Shiren5Calc.getSettingChecked(setting, "shiren5_rate_desperate")) {
                // 捨て身
                weapon += shield;
                shield = 0;
            }
            if(is_arrow_mode) {
                weapon = parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_weapon_arrow"));
            }
            var attack = Shiren5Calc.calcAttack(level, weapon, power, is_arrow_mode);
            var defence = shield * 0.61785;

            // 特攻系
            var special = {}
			special["目"] = Shiren5Calc.getSettingChecked(setting, "shiren5_special_eye") ? 135 : 100;
			special["吸"] = Shiren5Calc.getSettingChecked(setting, "shiren5_special_drain") ? 135 : 100;
			special["竜"] = Shiren5Calc.getSettingChecked(setting, "shiren5_special_dragon") ? 135 : 100;
			special["爆"] = Shiren5Calc.getSettingChecked(setting, "shiren5_special_explosion") ? 135 : 100;
			special["浮"] = Shiren5Calc.getSettingChecked(setting, "shiren5_special_floating") ? 135 : 100;
			special["水"] = Shiren5Calc.getSettingChecked(setting, "shiren5_special_water") ? 135 : 100;
			special["植"] = Shiren5Calc.getSettingChecked(setting, "shiren5_special_plant") ? 135 : 100;
			special["金"] = Shiren5Calc.getSettingChecked(setting, "shiren5_special_metal") ? 135 : 100;
			special["魔"] = Shiren5Calc.getSettingChecked(setting, "shiren5_special_magic") ? 135 : 100;

            var all_attack_rate = {}
            all_attack_rate["全"] = Shiren5Calc.getSettingChecked(setting, "shiren5_special_all") ? 130 : 100;

            var sp_weapon_kind = Shiren5Calc.getSettingValue(setting, "shiren5_sp_weapon_kind");
            var sp_weapon_level = parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_sp_weapon_level"));
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
            all_attack_rate["会"] = Shiren5Calc.getSettingChecked(setting, "shiren5_blow_conscience_me") ? 200 : 100;
            all_attack_rate["怒"] = Shiren5Calc.getSettingChecked(setting, "shiren5_angry_me") ? 200 : 100;
            all_attack_rate["祝"] = Shiren5Calc.getSettingChecked(setting, "shiren5_blessing_weapon") ? 125 : 100;
            all_attack_rate["スリ"] = Shiren5Calc.getSettingChecked(setting, "shiren5_slip_enemy") ? 200 : 100;
            var power_up_me = parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_power_up_me"));
            var defence_up_enemy = parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_defence_up_enemy"));
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
            rate_shield["昼"] = Shiren5Calc.getSettingChecked(setting, "shiren5_rate_noon") ? 75 : 100;
            rate_shield["金"] = Shiren5Calc.getSettingChecked(setting, "shiren5_rate_money") ? 85 : 100;

            var rate_shield_kind = Shiren5Calc.getSettingValue(setting, "shiren5_rate_shield_kind");
            var rate_shield_level = parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_rate_shield_level"));
            if(rate_shield_kind == "昼") {
                rate_shield["昼"] = 80 - 5 * rate_shield_level;
            }
            else if(rate_shield_kind == "金") {
                rate_shield["金"] = 90 - 5 * rate_shield_level;
            }

            rate_shield["デ"] = 100 - parseInt(Shiren5Calc.getSettingValue(setting, "shiren5_defence_up_me"));
            return Shiren5Calc.calcAttackMonsterTable(monster_table, attack, special, all_attack_rate, defence, rate_shield, is_arrow_mode, die_rate_num);
        }

        static initSettingTabs() {
            var setting = Shiren5Calc.collectSettingValues();
            Shiren5Calc.defaultSettingValues = Object.assign({}, setting);
            Shiren5Calc.settingValues[0] = Object.assign({}, setting);
            Shiren5Calc.settingValues[1] = Object.assign({}, setting);
            if(Shiren5Calc.storedState != null && Array.isArray(Shiren5Calc.storedState.settingValues)) {
                for(var i = 0; i < 2; i++) {
                    if(Shiren5Calc.storedState.settingValues[i] != null) {
                        Shiren5Calc.settingValues[i] = Object.assign({}, setting, Shiren5Calc.storedState.settingValues[i]);
                    }
                }
            }
            if(Shiren5Calc.storedState != null && (Shiren5Calc.storedState.currentSettingIndex == 0 || Shiren5Calc.storedState.currentSettingIndex == 1)) {
                Shiren5Calc.currentSettingIndex = Shiren5Calc.storedState.currentSettingIndex;
            }
            Shiren5Calc.loadSetting(Shiren5Calc.currentSettingIndex);
            Shiren5Calc.updateSettingTabs();
        }

        static collectSettingValues() {
            return Shiren5Calc.collectElementValues("shiren5_calc_setting_table");
        }

        static collectDisplayValues() {
            return Shiren5Calc.collectElementValues("shiren5_display_setting_table");
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
            if(Shiren5Calc.storedState == null || Shiren5Calc.storedState.displayValues == null) {
                return;
            }
            Shiren5Calc.applyElementValues("shiren5_display_setting_table", Shiren5Calc.storedState.displayValues);
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
                var json = localStorage.getItem(Shiren5Calc.STORAGE_KEY);
                if(json == null || json == "") {
                    return null;
                }
                var state = JSON.parse(json);
                if(state.version !== Shiren5Calc.STORAGE_VERSION) {
                    state.version = Shiren5Calc.STORAGE_VERSION;
                }
                return state;
            }
            catch(e) {
                console.log("shiren5 localStorage load error", e);
                return null;
            }
        }

        static saveStoredState() {
            try {
                var state = {
                    version: Shiren5Calc.STORAGE_VERSION,
                    settingValues: Shiren5Calc.settingValues,
                    currentSettingIndex: Shiren5Calc.currentSettingIndex,
                    displayValues: Shiren5Calc.collectDisplayValues()
                };
                localStorage.setItem(Shiren5Calc.STORAGE_KEY, JSON.stringify(state));
            }
            catch(e) {
                console.log("shiren5 localStorage save error", e);
            }
        }

        static saveCurrentSetting() {
            if(Shiren5Calc.isLoadingSetting) {
                return;
            }
            if(Shiren5Calc.settingValues == null) {
                return;
            }
            Shiren5Calc.settingValues[Shiren5Calc.currentSettingIndex] = Shiren5Calc.collectSettingValues();
        }

        static loadSetting(index) {
            var setting = Shiren5Calc.settingValues[index];
            if(setting == null) {
                return;
            }
            Shiren5Calc.isLoadingSetting = true;
            Shiren5Calc.applyElementValues("shiren5_calc_setting_table", setting);
            Shiren5Calc.isLoadingSetting = false;
            Shiren5Calc.changeArrowMode();
        }

        static switchSetting(index) {
            if(index == Shiren5Calc.currentSettingIndex) {
                return;
            }
            Shiren5Calc.saveCurrentSetting();
            Shiren5Calc.currentSettingIndex = index;
            Shiren5Calc.loadSetting(index);
            Shiren5Calc.updateSettingTabs();
            Shiren5Calc.calc();
        }

        static resetCurrentSetting() {
            if(Shiren5Calc.settingValues == null || Shiren5Calc.defaultSettingValues == null) {
                return;
            }
            var setting_name = Shiren5Calc.getCurrentSettingName();
            if(confirm(setting_name + "をデフォルトに戻します。よろしいですか？") == false) {
                return;
            }
            Shiren5Calc.settingValues[Shiren5Calc.currentSettingIndex] = Object.assign({}, Shiren5Calc.defaultSettingValues);
            Shiren5Calc.loadSetting(Shiren5Calc.currentSettingIndex);
            Shiren5Calc.saveStoredState();
            Shiren5Calc.calc();
        }

        static copyCompareSettingToCurrent() {
            if(Shiren5Calc.settingValues == null) {
                return;
            }
            var source_index = 1 - Shiren5Calc.currentSettingIndex;
            var source_name = Shiren5Calc.getSettingName(source_index);
            var current_name = Shiren5Calc.getCurrentSettingName();
            if(confirm(source_name + "を" + current_name + "へコピーします。" + current_name + "の現在の内容は上書きされます。よろしいですか？") == false) {
                return;
            }
            Shiren5Calc.settingValues[Shiren5Calc.currentSettingIndex] = Object.assign({}, Shiren5Calc.settingValues[source_index]);
            Shiren5Calc.loadSetting(Shiren5Calc.currentSettingIndex);
            Shiren5Calc.saveStoredState();
            Shiren5Calc.calc();
        }

        static getCurrentSettingName() {
            return Shiren5Calc.getSettingName(Shiren5Calc.currentSettingIndex);
        }

        static getSettingName(index) {
            return index == 0 ? "設定A" : "設定B";
        }

        static updateSettingTabs() {
            for(var i = 0; i < 2; i++) {
                var tab = document.getElementById("shiren5_setting_tab_" + (i + 1));
                if(tab == null) {
                    continue;
                }
                var active = i == Shiren5Calc.currentSettingIndex;
                tab.classList.toggle("is-active", active);
                tab.setAttribute("aria-selected", active ? "true" : "false");
            }
        }

        static getActiveSetting() {
            if(Shiren5Calc.settingValues == null) {
                return Shiren5Calc.collectSettingValues();
            }
            return Shiren5Calc.settingValues[Shiren5Calc.currentSettingIndex];
        }

        static getCompareSetting() {
            if(Shiren5Calc.settingValues == null) {
                return Shiren5Calc.collectSettingValues();
            }
            return Shiren5Calc.settingValues[1 - Shiren5Calc.currentSettingIndex];
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

        static addCompareDamage(rows, compare_rows) {
            var compare = {};
            for(var i = 0; i < compare_rows.length; i++) {
                compare[compare_rows[i].name] = compare_rows[i];
            }
            for(var i = 0; i < rows.length; i++) {
                var base = compare[rows[i].name];
                if(base == null) {
                    rows[i].defence_median_diff = 0;
                    rows[i].attack_median_diff = 0;
                    rows[i].compare_die_rate_str = [];
                    continue;
                }
                rows[i].defence_median_diff = (rows[i].min_defence + rows[i].max_defence) / 2 - (base.min_defence + base.max_defence) / 2;
                rows[i].attack_median_diff = (rows[i].min_attack + rows[i].max_attack) / 2 - (base.min_attack + base.max_attack) / 2;
                rows[i].compare_die_rate_str = base.die_rate_str;
            }
        }

        static sortResultTable(rows) {
            var sort_val = document.getElementById("shiren5_table_sort_type").value;
            if(sort_val != "") {
                rows.sort(function(a, b) {
                    var sign = (document.getElementById("shiren5_table_sort_by_asc").checked) ? 1 : -1;
                    if(a[sort_val] == b[sort_val]) return 0;
                    return (a[sort_val] > b[sort_val]) ? (1 * sign) : (-1 * sign);
                });
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
            if(document.getElementById("shiren5_show_damage_diff").checked == false) {
                return damage_text;
            }
            var diff_class = lower_is_better ? Shiren5Calc.getReverseDiffClass(diff) : Shiren5Calc.getDiffClass(diff);
            return Shiren5Calc.formatCompareCell(damage_text, Shiren5Calc.formatSigned(diff), diff_class);
        }

        static formatDieRate(row, die_rate_num) {
            return Shiren5Calc.formatDieRateText(row.die_rate_str, die_rate_num);
        }

        static formatDieRateText(die_rate_str, die_rate_num) {
            var j = 0;
            for(; j < die_rate_num; j++) {
                if(die_rate_str[j] == "-") {
                    continue;
                }
                var die_rate = parseFloat(die_rate_str[j]);
                if(die_rate > 0.0) {
                    die_rate = Math.floor(die_rate);
                    if(die_rate <= 0.0) {
                        die_rate = 1;
                    }
                    return "[" + (j + 1) + "] " + die_rate + "%";
                }
            }
            return "[" + (j + 1) + "↑] -";
        }

        static formatDieRateWithCompare(row, die_rate_num) {
            var die_rate_text = Shiren5Calc.formatDieRate(row, die_rate_num);
            if(document.getElementById("shiren5_show_damage_diff").checked == false || row.compare_die_rate_str == null) {
                return die_rate_text;
            }
            return Shiren5Calc.formatCompareCell(die_rate_text, Shiren5Calc.formatDieRateText(row.compare_die_rate_str, die_rate_num), "shiren6-diff-even");
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

        static calcAttackMonsterTable(monster_table, attack, special, all_attack_rate, defence, rate_shield, is_arrow_mode, die_rate_num) {
            const MIN_RAND = 87;
            const MAX_RAND = 112;
            var multi_attack = {}
            multi_attack["ナシャーガ"] = 2;
            multi_attack["ラシャーガ"] = 3;
            multi_attack["バシャーガ"] = 4;
            var rows = [];
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
               var die_rate_str = new Array(die_rate_num);
               var old_dp = new Array(monster_hp + 1).fill(0);
               old_dp[0] = 1;
               for(var j = 0; j < die_rate_num; j++) {
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

                var die_rate_tonum = die_rate_num * 100;
                for(var rate_idx = 0; rate_idx < die_rate_num; rate_idx++) {
                    if(die_rate_str[rate_idx] == "-") continue;
                    var die_rate_value = parseFloat(die_rate_str[rate_idx]);
                    if(die_rate_value > 0.0) {
                        die_rate_tonum = (rate_idx + 1) * 100 - die_rate_value;
                        break;
                    }
                }
                rows.push({
                    name: monster.name,
                    min_defence: min_defence,
                    max_defence: max_defence,
                    min_attack: min_attack,
                    max_attack: max_attack,
                    hp: monster.hp,
                    die_rate_tonum: die_rate_tonum,
                    die_rate_str: die_rate_str
                });
            }
            return rows;
        }

        static viewAttackMonsterTable(rows, die_rate_num) {
            var elem_table = document.getElementById("shiren5_monster_table");
            elem_table.innerHTML = "";
            var show_compare = document.getElementById("shiren5_show_damage_diff").checked;
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
            if(show_compare) {
                th = document.createElement("th");
                th.innerHTML = "倒確率";
                th.style = "text-align: center;"
                tr.appendChild(th);
            }
            else {
                for(var i = 0; i < die_rate_num; i++) {
                    th = document.createElement("th");
                    th.innerHTML = "倒確率" + (i + 1).toString();
                    th.style = "text-align: center;"
                    tr.appendChild(th);
                }
            }
            elem_table.appendChild(tr);

            var fragment = document.createDocumentFragment();
            for(var i = 0; i < rows.length; i++) {
                var row = rows[i];
                tr = document.createElement("tr");
                var td = document.createElement("td");
                td.innerHTML = row.name;
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = Shiren5Calc.formatDamageWithDiff(row.min_defence, row.max_defence, row.defence_median_diff, true);
                td.style = "text-align: center;"
                tr.appendChild(td);
                td = document.createElement("td");
                td.innerHTML = Shiren5Calc.formatDamageWithDiff(row.min_attack, row.max_attack, row.attack_median_diff, false);
                td.style = "text-align: center;"
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = '<span class="shiren6-hp-value">' + row.hp + '</span>';
                td.style = "text-align: center;"
                tr.appendChild(td);

                if(show_compare) {
                    td = document.createElement("td");
                    td.style = "text-align: left;";
                    td.innerHTML = Shiren5Calc.formatDieRateWithCompare(row, die_rate_num);
                    tr.appendChild(td);
                }
                else {
                    for(var j = 0; j < die_rate_num; j++) {
                        td = document.createElement("td");
                        td.style = "text-align: right;";
                        td.innerHTML = row.die_rate_str[j];
                        tr.appendChild(td);
                    }
                }
                fragment.appendChild(tr);
            }
            elem_table.appendChild(fragment);
        }

        static viewAttackMonsterGraph(rows, die_rate_num) {
            var totals = new Array(die_rate_num * 2 + 1).fill(0);
            for(var i = 0; i < rows.length; i++) {
                var die_num = die_rate_num + 1;
                var die_rate = 0.0;
                for(var j = 0; j < die_rate_num; j++) {
                    if(rows[i].die_rate_str[j] == "-") continue;
                    var parsed_rate = parseFloat(rows[i].die_rate_str[j]);
                    if(parsed_rate > 0.0) {
                        die_rate = Math.floor(parsed_rate);
                        die_num = j + 1;
                        break;
                    }
                }
                var index = (die_num - 1) * 2;
                if(die_num <= die_rate_num && die_rate <= 50) {
                    index++;
                }
                if(index >= totals.length) {
                    index = totals.length - 1;
                }
                totals[index]++;
            }
            var labels = new Array(die_rate_num * 2 + 1).fill("");
            for(var label_i = 0; label_i < labels.length - 1; label_i++) {
                var str = "[" + (Math.floor(label_i / 2) + 1) + "]";
                labels[label_i] = str + ["-100%", "-50%"][label_i % 2];
            }
            labels[labels.length - 1] = "[" + (die_rate_num + 1) + "↑]";

            if(Shiren5Calc.graphMonster != null) {
                Shiren5Calc.graphMonster.destroy();
            }

            var ctx = document.getElementById("shiren5_monster_graph");
            Shiren5Calc.graphMonster = new Chart(ctx, {
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
                          return value + '匹';
                        }
                      }
                    }
                  },
                  animation: false,
                }
              });
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

        static adjustFloor() {
            var under_name = "shiren5_floor";
            var upper_name = "shiren5_floor_upper";
            var under = parseInt(document.getElementById(under_name).value);
            var upper = parseInt(document.getElementById(upper_name).value);
            if(document.getElementById("shiren5_floor_only_one").checked) {
                document.getElementById(upper_name).value = document.getElementById(under_name).value;
            }
            else {
                if(under > upper) {
                    document.getElementById(upper_name).value = document.getElementById(under_name).value;
                }
            }
        }

        static changeOneFloorStatus() {
            var under_name = "shiren5_floor";
            var upper_name = "shiren5_floor_upper";
            if(document.getElementById("shiren5_floor_only_one").checked) {
                document.getElementById(upper_name).value = document.getElementById(under_name).value;
                document.getElementById(upper_name).disabled = true;
            }
            else {
                document.getElementById(upper_name).disabled = false;
            }
        }

        static clickDisplayText() {
            if(document.getElementById("shiren5_display_setting_table").style.display == "none") {
                document.getElementById("shiren5_display_setting_table").style.display = "block";
                document.getElementById("shiren5_display_setting_text").innerText = "- 表示設定";
            }
            else {
                document.getElementById("shiren5_display_setting_table").style.display = "none";
                document.getElementById("shiren5_display_setting_text").innerText = "+ 表示設定";
            }
        }

        static changeDisplayType() {
            if(document.getElementById("shiren5_display_type_table").checked) {
                document.getElementById("shiren5_monster_table").style.display = "";
                document.getElementById("shiren5_monster_graph").style.display = "none";
            }
            if(document.getElementById("shiren5_display_type_graph").checked) {
                document.getElementById("shiren5_monster_table").style.display = "none";
                document.getElementById("shiren5_monster_graph").style.display = "";
            }
            Shiren5Calc.saveStoredState();
        }
    }
   
    return Shiren5Calc;
})();

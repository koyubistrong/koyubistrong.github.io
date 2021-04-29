var RogueGame = (function() {
    
    class Charactor {
        multUnit(v) { return v * this.nUnit; }
        divUnit(v) { return Math.round(v / this.nUnit); }
        toReal(v) { return v * this.cell_size; }
        //toReal(v) { return Math.floor(v / this.cell_size); }
        constructor(info) {
            for (let key in info) {
                this[key] = info[key];
            }
        }

        makeGraph(color) {
            let rad = this.cell_size / 2;
            let grpChara = this.grpChara;
            grpChara.beginFill(color);
            grpChara.lineStyle(0);
            grpChara.drawCircle(rad, rad, rad);
            grpChara.x = this.divUnit(this.rx) + this.cell_size;
            grpChara.y = this.divUnit(this.ry) + this.cell_size;
        }

        move(info) {
            let ch = this;
            let moving = false;
            let speed = 200;
            if(info.pressedKeys[90] && ch.speed_x == 0 && ch.speed_y == 0) {
                speed = 1200;
            }
            ch.speed_x = speed * Math.sign(this.toReal(this.multUnit(ch.x)) - ch.rx);
            ch.speed_y = speed * Math.sign(this.toReal(this.multUnit(ch.y)) - ch.ry);
            ch.rx += ch.speed_x;
            ch.ry += ch.speed_y;
            ch.grpChara.x = this.divUnit(ch.rx) + this.cell_size;
            ch.grpChara.y = this.divUnit(ch.ry) + this.cell_size;
            if(ch.speed_x != 0 || ch.speed_y != 0) {
                moving = true;
            }
            return moving;
        }

        think(info) {

        }

        searchObject(info, find_type, pos, only_room, once_find, ignore_chara) {
            let search = Array2D(info.sizeInfo.nMapHeight, info.sizeInfo.nMapWidth, false);
            let queue = [];
            let find_list = [];
            let trace = [];
            let room_id = info.mapInfo[pos.y][pos.x].room_id;
            trace.push({parent: null, x: pos.x, y: pos.y});
            queue.push({parent: trace[0], x: pos.x, y: pos.y});
            search[pos.y][pos.x] = true;
            while(queue.length > 0) {
                let p = queue[0];
                for(let i = 0; i < info.dire_for_search.length; i++) {
                    let dx = p.x + info.dire_for_search[i].x;
                    let dy = p.y + info.dire_for_search[i].y;
                    let node = {parent: p.parent, x: dx, y: dy};
                    if(checkRange(dx, dy, info.sizeInfo.nMapWidth, info.sizeInfo.nMapHeight) == false) continue;
                    if(search[dy][dx] == true) continue;
                    if(info.mapInfo[dy][dx].type == ObjType.WALL) continue;
                    if(info.dire_for_search[i].diagonal) {
                        if(info.mapInfo[dy][p.x].type == ObjType.WALL ||
                            info.mapInfo[p.y][dx].type == ObjType.WALL) {
                                continue;
                        }
                    }
                    if(!ignore_chara && info.mapInfo[dy][dx].charactor != null) {
                        if(find_type["POS"] != null) {
                            let p = find_type["POS"];
                            if(dx == p.x && dy == p.y) {
                                find_list.push({type: "POS", node: node, x: dx, y: dy});
                            }
                        }
                        continue;
                    }
                    trace.push(node);
                    if(find_type["CHARA"] != null) {
                        if(info.mapInfo[dy][dx].charactor == find_type["CHARA"]) {
                            find_list.push({type: "CHARA", node: node, x: dx, y: dy});
                        }
                    }
                    if(find_type["AISLE"] != null) {
                        if(info.mapInfo[dy][dx].room_id == find_type["AISLE"]) {
                            find_list.push({type: "AISLE", node: node, x: dx, y: dy});
                        }
                    }
                    if(find_type["POS"] != null) {
                        let p = find_type["POS"];
                        if(dx == p.x && dy == p.y) {
                            find_list.push({type: "POS", node: node, x: dx, y: dy});
                        }
                    }
                    if(only_room && room_id != info.mapInfo[dy][dx].room_id) continue;
                    search[dy][dx] = true;
                    queue.push({parent: node, x: dx, y: dy});
                }
                queue.shift();
                if(once_find && find_list.length > 0) {
                    break;
                }
            }

            let find_trace = [];
            for(let i = 0; i < find_list.length; i++) {
                let node = find_list[i].node;
                find_trace[i] = {type: find_list[i].type, trace: []};
                while(node.parent != null) {
                    find_trace[i].trace.push({x: node.x, y: node.y});
                    node = node.parent;
                }
            }
            return find_trace;
        }

        canMove(info, x, y, direction) {
            let dx = x + direction.x;
            let dy = y + direction.y;
            if(checkRange(dx, dy, info.sizeInfo.nMapWidth, info.sizeInfo.nMapHeight) == false) {
                return null;
            }
            if(info.mapInfo[dy][dx].type == ObjType.WALL) {
                return null;
            }
            if(direction.x != 0 && direction.y != 0) {
                if(info.mapInfo[dy][x].type == ObjType.WALL ||
                    info.mapInfo[y][dx].type == ObjType.WALL) {
                        return null;
                }
            }
            if(info.mapInfo[dy][dx].charactor != null) {
                return null;
            }
            return {x: dx, y: dy};
        }

        canAttack(info, x, y, direction) {
            let dx = x + direction.x;
            let dy = y + direction.y;
            if(checkRange(dx, dy, info.sizeInfo.nMapWidth, info.sizeInfo.nMapHeight) == false) {
                return null;
            }
            if(direction.x != 0 && direction.y != 0) {
                if(info.mapInfo[dy][x].type == ObjType.WALL ||
                    info.mapInfo[y][dx].type == ObjType.WALL) {
                        return null;
                }
            }
            if(info.mapInfo[dy][dx].charactor == null) {
                return null;
            }
            return {charactor: info.mapInfo[dy][dx].charactor, x: dx, y: dy};
        }
    }

    class Player extends Charactor {
        think(info) {
            let ch = this;
            ch.actioned = false;
            //case 38://up
            //case 87://w
            //case 40://down
            //case 65://a
            //case 37://left
            //case 83://s
            //case 39://right
            //case 68://d
            //case 32://shoot
            let diff_x = 0;
            let diff_y = 0;
            if(info.pressedKeys[38]) {
                diff_y = -1;
            }
            if(info.pressedKeys[40]) {
                diff_y = 1;
            }
            if(info.pressedKeys[37]) {
                diff_x = -1;
            }
            if(info.pressedKeys[39]) {
                diff_x = 1;
            }
            if(info.pressedKeys[65]) {
                ch.actioned = true;
            }
            if(info.downKeys[83]) {
                let pos = super.canAttack(info, ch.x, ch.y, direction8[ch.direction]);
                if(pos != null) {
                    let pos_info = info.mapInfo[pos.y][pos.x];
                    pos_info.charactor.hp -= 10;
                    if(pos_info.charactor.hp <= 0) {
                        pos_info.charactor = null;
                    }
                }
                ch.actioned = true;
            }
            if(diff_x == 0 && diff_y == 0) {
                return ch.actioned;
            }
            let pos = super.canMove(info, ch.x, ch.y, {x: diff_x, y: diff_y});
            if(pos != null) {
                ch.x = pos.x;
                ch.y = pos.y;
                ch.actioned = true;
            }
            for(let i = 0; i < direction8.length; i++) {
                if(direction8[i].x == diff_x && direction8[i].y == diff_y) {
                    ch.direction = i;
                }
            }
            return ch.actioned;
        }
    }

    class Enemy extends Charactor {
        think(info) {
            let ch = this;
            ch.actioned = false
            if(ch.hp <= 0) {
                ch.grpChara.visible = false;
                ch.actioned = true;
                return ch.actioned;
            }
            if(info.player != null && !info.player.actioned) {
                return ch.actioned;
            }
            let shuffle_dire = [];
            let direction = direction8[ch.direction];
            for(let i = 0; i < direction8.length; i++) {
                shuffle_dire.push(direction8[i]);
            }
            shuffle(shuffle_dire);

            let pos_info = info.mapInfo[ch.y][ch.x];
            let bef_info = info.mapInfo[ch.bef_y][ch.bef_x];
            let target_find = false;
            if(pos_info.room_id >= 0 && pos_info.middle_aisle == false) {
                let target_list = super.searchObject(info, {CHARA: info.player, AISLE: -1}, {x: ch.x, y: ch.y}, true, false, true);
                //let target_list = super.searchObject(info, {AISLE: -1}, {x: ch.x, y: ch.y}, true, false, true);
                if(target_list.length > 0) {
                    let target = null;
                    for(let i = 0; i < target_list.length; i++) {
                        if(target_list[i].type == "CHARA") {
                            target = target_list[i].trace;
                            target_find = true;
                        }
                    }
                    let nomove_or_in_room = (ch.no_move_count >= 2 || bef_info.room_id != pos_info.room_id);
                    if(target_find == false && nomove_or_in_room) {
                        while(target == null) {
                            target = target_list[getRandomInt(0, target_list.length)].trace;
                            if(target_list.length > 1 &&
                                target[0].x == ch.bef_x && target[0].y == ch.bef_y) {
                                target = null;
                            }
                        }
                    }
                    //ch.bef_target_find
                    if(target != null) {
                        ch.tx = target[0].x;
                        ch.ty = target[0].y;
                    }
                }
            }
            else {
                let pos = super.canMove(info, ch.x, ch.y, direction8[ch.direction]);
                if(pos != null) {
                    ch.tx = pos.x;
                    ch.ty = pos.y;
                }
                else {
                    let find = false;
                    for(let i = 0; i < shuffle_dire.length; i++) {
                        pos = super.canMove(info, ch.x, ch.y, shuffle_dire[i]);
                        if(pos != null && shuffle_dire[i].x * -1 != direction.x &&
                            shuffle_dire[i].y * -1 != direction.y) {
                            ch.tx = pos.x;
                            ch.ty = pos.y;
                            find = true;
                            break;
                        }
                    }
                    pos = super.canMove(info, ch.x, ch.y, {x: direction.x * -1, y: direction.y * -1});
                    if(!find && pos != null) {
                        ch.tx = pos.x;
                        ch.ty = pos.y;
                    }
                }
                for(let i = 0; i < direction8.length; i++) {
                    let t_pos = super.canAttack(info, ch.x, ch.y, direction8[i]);
                    if(t_pos != null && t_pos.charactor == info.player) {
                        ch.tx = t_pos.x;
                        ch.ty = t_pos.y;
                        target_find = true;
                    }
                }
            }

            let diff_x = Math.sign(ch.tx - ch.x);
            let diff_y = Math.sign(ch.ty - ch.y);
            let target_trace = super.searchObject(info, {POS: {x: ch.tx, y: ch.ty}}, {x: ch.x, y: ch.y}, true, true, false);
            if(target_trace.length == 0) {
                target_trace = super.searchObject(info, {POS: {x: ch.tx, y: ch.ty}}, {x: ch.x, y: ch.y}, false, true, true);
            }
            if(target_trace.length > 0 && target_trace[0].trace.length > 0) {
                diff_x = Math.sign(target_trace[0].trace[target_trace[0].trace.length - 1].x - ch.x);
                diff_y = Math.sign(target_trace[0].trace[target_trace[0].trace.length - 1].y - ch.y);
            }

            if(target_find && info.mapInfo[ch.y + diff_y][ch.x + diff_x].charactor == info.player) {
                // 目標(プレイヤー)と隣接していた場合の処理
            }
            else {
                if(info.mapInfo[ch.y][ch.x + diff_x].charactor != null) {
                    diff_x = 0;
                }
                if(info.mapInfo[ch.y + diff_y][ch.x].charactor != null) {
                    diff_y = 0;
                }
                if(info.mapInfo[ch.y + diff_y][ch.x + diff_x].type == ObjType.WALL) {
                    diff_x = 0;
                    diff_y = 0;
                }
                if(info.mapInfo[ch.y + diff_y][ch.x + diff_x].charactor != null) {
                    diff_x = 0;
                    diff_y = 0;
                }
                if(diff_x == 0 && diff_y == 0) {
                    for(let i = 0; i < shuffle_dire.length; i++) {
                        let pos = super.canMove(info, ch.x, ch.y, shuffle_dire[i]);
                        if(pos != null) {
                            diff_x = shuffle_dire[i].x;
                            diff_y = shuffle_dire[i].y;
                            break;
                        }
                    }
                }
                ch.x = ch.x + diff_x;
                ch.y = ch.y + diff_y;
            }
            for(let i = 0; i < direction8.length; i++) {
                if(direction8[i].x == diff_x && direction8[i].y == diff_y) {
                    ch.direction = i;
                }
            }
            ch.bef_target_find = target_find;
            ch.actioned = true;
            return ch.actioned;
        }
    }

    class RogueGame {
        init() {
            if(this.app == null) {
                let canvas = document.getElementById('roguelike_game')
                this.app = new PIXI.Application({
                    backgroundColor: 0x000000,
                });
                canvas.appendChild(this.app.view);

                window.addEventListener("keydown", (e) => {
                    if(e.preventDefault) {
                        e.preventDefault();
                    }
                    //sleep(32); 
                    this.pressedKeys[e.keyCode] = true;
                    this.downKeys[e.keyCode] = true;
                },false);
                window.addEventListener("keyup", (e) => { 
                    if(e.preventDefault) {
                        e.preventDefault();
                    }
                    this.pressedKeys[e.keyCode] = false;
                },false);
            }
            this.dire_for_search = [];
            for(let i = 0; i < 2; i++) {
                for(let j = 0; j < direction8.length; j++) {
                    if(i == 0 && !direction8[j].diagonal) {
                        this.dire_for_search.push(direction8[j]);
                    }
                    if(i == 1 && direction8[j].diagonal) {
                        this.dire_for_search.push(direction8[j]);
                    }
                }
            }
            this.nCellSize = 8;
            this.nUnit = 100;
            this.pressedKeys = Array(256).fill(false);
            this.downKeys = Array(256).fill(false);
            this.initMap();
            this.initCharactor();
        }

        initMap() {
            const floor_div_width = 4;
            const floor_div_height = 3;
            const floor_height = 34;    // 34
            const floor_width = 56;     // 56
            const room_num = 6;
            const middle_aisle_num = 4;
            const connect_rate = 8;
            AutoMap2D.init();
            AutoMap2D.generate(floor_width, floor_height, this.nCellSize, floor_div_width, floor_div_height, room_num, middle_aisle_num, connect_rate);

            this.mapInfo = AutoMap2D.getMap();
            //this.virtualMapInfo = AutoMap2D.getVirtualMap();
            this.sizeInfo = AutoMap2D.getSizeInfo();

            this.app.renderer.autoDensity = true;
            this.app.renderer.resize(this.sizeInfo.nMapRealWidth + this.sizeInfo.nCellWidth * 2,
                this.sizeInfo.nMapRealHeight + this.sizeInfo.nCellHeight * 2);

            if(this.grpMap != null) {
                this.app.stage.removeChild(this.grpMap);
            }
            this.grpMap = this.makeImgMap();
            this.app.stage.addChild(this.grpMap);
            
            if(this.textFPS != null) {
                this.app.stage.removeChild(this.textFPS);
            }
            var word = "";
            var style = {font:'Arial', fontSize: 14, fill:'white'};
            this.textFPS = new PIXI.Text(word, style);
            this.app.stage.addChild(this.textFPS);
        }

        initCharactor() {
            if(this.charaInfo != null) {
                for(let i = 0; i < this.nCharaNum; i++) {
                    this.app.stage.removeChild(this.charaInfo[i].grpChara);
                }
            }
            this.charaInfo = [];
            this.nCharaNum = 40;
            for(let i = 0; i < this.nCharaNum; i++) {
                while(true) {
                    let y = getRandomInt(0, this.sizeInfo.nMapHeight);
                    let x = getRandomInt(0, this.sizeInfo.nMapWidth);
                    let cell = this.mapInfo[y][x];
                    if(this.mapInfo[y][x].charactor == null && cell.room_id >= 0) {
                        let grpChara = new PIXI.Graphics();
                        let info = {id: i, grpChara: grpChara, x: x, y: y, bef_x: x, bef_y: y,
                            rx: this.sizeInfo.nCellWidth * x * this.nUnit,
                            ry: this.sizeInfo.nCellHeight * y * this.nUnit,
                            direction: 6, tx: x, ty: y,
                            speed_x: 0, speed_y: 0, no_move_count: 999999,
                            actioned: false, cell_size: this.nCellSize,
                            nUnit: this.nUnit, hp: 20, bef_target_find: false
                        };
                        let ch = null;
                        if(i == -1) {
                            ch = new Player(info);
                            ch.makeGraph(0xFF0000);
                            this.player = ch;
                        }
                        else {
                            ch = new Enemy(info);
                            ch.makeGraph(0x888888);
                        }
                        this.charaInfo.push(ch);
                        this.mapInfo[y][x].charactor = ch;
                        this.app.stage.addChild(ch.grpChara);
                        break;
                    }
                }
            }
            if(this.main == null) {
                this.bef_time = Date.now();
                this.sum_fps = 0;
                this.ct_fps = 0;
                this.main = () => {
                    let t = Date.now();
                    //console.log(t - this.bef_time);
                    //console.log(this.app.ticker.FPS);               
                    let can_next = true;
                    for(let i = 0; i < this.nCharaNum; i++) {
                        let ch = this.charaInfo[i];
                        if(ch.move(this) == true) {
                            can_next = false;
                        }
                    }

                    if(can_next) {
                        for(let i = 0; i < this.nCharaNum; i++) {
                            let ch = this.charaInfo[i];
                            let bef_pos = {x: ch.x, y: ch.y};
                            let is_think = ch.think(this);//this.thinkCharactor(ch);

                            if(!is_think) {
                                continue;
                            }

                            if(ch.x == bef_pos.x && ch.y == bef_pos.y) {
                                ch.no_move_count++;
                            }
                            else {
                                ch.no_move_count = 0;
                            }
                            let pos_info = this.mapInfo[ch.y][ch.x];
                            let bef_info = this.mapInfo[bef_pos.y][bef_pos.x];
                            ch.bef_x = bef_pos.x;
                            ch.bef_y = bef_pos.y;
                            [bef_info.charactor, pos_info.charactor] = [pos_info.charactor, bef_info.charactor];
                        }
                    }

                    for(let i = 0; i < this.downKeys.length; i++) {
                        this.downKeys[i] = false;
                    }

                    this.sum_fps += this.app.ticker.FPS;
                    this.ct_fps++;
                    if(t - this.bef_time >= 1000) {
                        //this.textFPS.text = Math.floor(this.sum_fps / this.ct_fps).toString() + " FPS " + (Date.now() - t).toString() + " ms";
                        this.bef_time = t;
                        this.sum_fps = 0;
                        this.ct_fps = 0;
                    }
                };
                this.app.ticker.add(this.main);
            }
        }

        makeImgMap() {
            let grpMap = new PIXI.Graphics();
            let offset_x = this.nCellSize;
            let offset_y = this.nCellSize;
            let colors = [0x0000FF, 0x00FF00, 0xFF0000, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0x880000, 0x008800, 0x000088, 0x8888800, 0x880088, 0x008888];
            for(var y = 0; y < this.sizeInfo.nMapHeight; y++) {
                for(var x = 0; x < this.sizeInfo.nMapWidth; x++) {
                    var ry = y * this.nCellSize;
                    var rx = x * this.nCellSize;
                    if(this.mapInfo[y][x].type == ObjType.FLAT) {
                        if(false && this.mapInfo[y][x].room_id >= 0) {
                            grpMap.beginFill(colors[this.mapInfo[y][x].room_id % colors.length]);
                        }
                        else {
                            grpMap.beginFill(0xFFFFFF);
                        }
                    }
                    else grpMap.beginFill(0x000000);
                    grpMap.drawRect(offset_x + rx, offset_y + ry, this.sizeInfo.nCellWidth, this.sizeInfo.nCellHeight);
                }
            }
            grpMap.endFill();
            return grpMap;
        }
    }
   
    return RogueGame;
  })();

var rg = new RogueGame();
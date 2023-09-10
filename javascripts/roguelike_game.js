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
            grpChara.x = this.divUnit(this.rx) + this.n_draw_offset_X;
            grpChara.y = this.divUnit(this.ry) + this.n_draw_offset_Y;
        }

        move(info) {
            let ch = this;
            let moving = false;
            let speed = 100;
            if(info.pressedKeys[90] && ch.speed_x == 0 && ch.speed_y == 0) {
                speed = 800;
            }
            ch.speed_x = speed * Math.sign(this.toReal(this.multUnit(ch.x)) - ch.rx);
            ch.speed_y = speed * Math.sign(this.toReal(this.multUnit(ch.y)) - ch.ry);
            ch.rx += ch.speed_x;
            ch.ry += ch.speed_y;
            ch.grpChara.x = this.divUnit(ch.rx) + this.n_draw_offset_X;
            ch.grpChara.y = this.divUnit(ch.ry) + this.n_draw_offset_Y;
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

    class Item extends Charactor {
        think(info) {
            // no move
            return true;
        }
    }

    class RogueGame {
        init(type, b_all_reset) {
            if(type == null) {
                type = "TEST_GAME";
            }
            if(this.app == null) {
                let canvas = document.getElementById('roguelike_game');
                if(type == "DIAGONAL_CERT") {
                    canvas = document.getElementById('diagonal_cert');
                }
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
            this.strGameType = type;
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
            if(type == "DIAGONAL_CERT") {
                this.nMarginTop = 30;
                this.nMarginBottom = 30;
            }
            else {
                this.nMarginTop = 0;
                this.nMarginBottom = 0;
            }
            this.nDrawOffsetX = this.nCellSize;
            this.nDrawOffsetY = this.nCellSize + this.nMarginTop;
            this.pressedKeys = Array(256).fill(false);
            this.downKeys = Array(256).fill(false);
            this.initMap(type);
            this.initCharactor(type);

            if(this.main == null) {
                this.bef_time = Date.now();
                this.sum_fps = 0;
                this.ct_fps = 0;
                this.state = (type == "DIAGONAL_CERT") ? "Ready" : "Play";
                this.judge = "";
                this.main = () => {
                    let t = Date.now();
                    //console.log(t - this.bef_time);
                    //console.log(this.app.ticker.FPS);               
                    if(this.state == "Ready") {
                        this.Ready();
                    }
                    else if(this.state == "Play") {
                        this.Play();
                    }
                    else if(this.state == "Result") {
                        this.Result();
                    }
                    else if(this.state == "End") {
                        this.End();
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

            if(type == "DIAGONAL_CERT") {
                if(this.state == "Ready") {
                    this.app.stage.removeChildren();
                    this.textTitle = new PIXI.Text;
                    this.textTitle.style = {font:'メイリオ', fontSize: 34, fill:'white',
                                            stroke: 'white', strokeThickness: 1, align: "center"};
                    this.textTitle.text = "\n\n斜め軸検定\n　　　　　　　　　　　　　 \nPress 'Space' Key";
                    //this.textTitle.x = this.nDispSizeX / 4;
                    this.textTitle.y = this.nDispSizeY / 12;

                    this.textVersion = new PIXI.Text;
                    this.textVersion.style = {font:'メイリオ', fontSize: 20, fill:'white',
                                            stroke: 'white', strokeThickness: 1, align: "center"};
                    this.textVersion.text = "Ver. 0.9.0";
                    this.textVersion.x = this.nDispSizeX - this.nDispSizeX / 5;
                    this.textVersion.y = this.nDispSizeY - this.nDispSizeY / 12;

                    this.app.stage.addChild(this.textTitle);
                    this.app.stage.addChild(this.textVersion);
                }
                else if(this.state == "End") {
                    this.app.stage.removeChildren();
                    this.textEnd = new PIXI.Text;
                    this.textEnd.style = {font:'メイリオ', fontSize: 32, fill:'white',
                                            stroke: 'white', strokeThickness: 1, align: "center"};
                    this.textEnd.text = "結果\n\n"
                    if(this.nPoint >= this.nCertNum * 0.8) {
                        this.textEnd.text += "合格"
                        this.bClear = true;
                    }
                    else {
                        this.textEnd.text += "不合格"
                        this.bClear = false;
                    }
                    this.textEnd.text += "\n\n" + this.nPoint + " / " + this.nCertNum
                    this.textEnd.text += "\n\n「Enter」でツイートする";
                    this.textEnd.text += "\n\n　　　　　　　　　　　　　　 ";
                    //this.textTitle.x = this.nDispSizeX / 4;
                    this.textEnd.y = this.nDispSizeY / 10;
                    this.app.stage.addChild(this.textEnd);
                }
                else {
                    if(b_all_reset != null && b_all_reset) {
                        if(this.textPoint != null) {
                            this.app.stage.removeChild(this.textPoint);
                        }
                        this.nPoint = 0;
                        this.nCertCount = 1;
                        this.nCertNum = 10;
                        this.nLimitTime = 9900;
                        if(this.bPracticeMode) {
                            this.nLimitTime = -1;
                        }
                        this.nStartTime = Date.now();
                        this.textPoint = new PIXI.Text;
                        this.textPoint.style = {font:'メイリオ', fontSize: 28, fill:'white',
                                                stroke: 'white', strokeThickness: 1};
                        this.textPoint.text = this.nPoint + " / " + this.nCertNum;
                        this.textPoint.x = this.nDispSizeX / 8;
                        this.textPoint.y = 2;

                        this.textCount = new PIXI.Text;
                        this.textCount.style = {font:'メイリオ', fontSize: 28, fill:'white',
                                                stroke: 'white', strokeThickness: 1};
                        this.textCount.text = "第" + this.nCertCount + "問";
                        this.textCount.x = this.nDispSizeX - this.nDispSizeX / 4 - 10;
                        this.textCount.y = 2;
                        this.nStartTime = Date.now();
                        this.textTime = new PIXI.Text;
                        this.textTime.style = {font:'メイリオ', fontSize: 28, fill:'white',
                                                stroke: 'white', strokeThickness: 1, align: "center"};
                        this.textTime.y = this.nDispSizeY - this.nDispSizeY / 9.5;

                        this.app.stage.addChild(this.textPoint);
                        this.app.stage.addChild(this.textCount);
                        this.app.stage.addChild(this.textTime);
                    }
                }
            }

            if(this.textFPS != null) {
                this.app.stage.removeChild(this.textFPS);
            }
            var word = "";
            var style = {font:'Arial', fontSize: 14, fill:'white'};
            this.textFPS = new PIXI.Text(word, style);
            this.app.stage.addChild(this.textFPS);
        }

        initMap(type) {
            let floor_div_width = 4;
            let floor_div_height = 3;
            let floor_height = 34;    // 34
            let floor_width = 56;     // 56
            let room_num = 6;
            let middle_aisle_num = 4;
            let connect_rate = 8;
            if(type == "DIAGONAL_CERT") {
                floor_div_width = 4;
                floor_div_height = 3;
                floor_height = 34;    // 34
                floor_width = 56;     // 56
                room_num = 6;
                middle_aisle_num = 4;
                connect_rate = 8;
            }

            AutoMap2D.init();
            if(type == "DIAGONAL_CERT") {
                AutoMap2D.initFloor(floor_width, floor_height, this.nCellSize);
            }
            else {
                AutoMap2D.generate(floor_width, floor_height, this.nCellSize, floor_div_width, floor_div_height, room_num, middle_aisle_num, connect_rate);
            }

            this.mapInfo = AutoMap2D.getMap();
            //this.virtualMapInfo = AutoMap2D.getVirtualMap();
            this.sizeInfo = AutoMap2D.getSizeInfo();
            this.nDispSizeX = this.sizeInfo.nMapRealWidth + this.sizeInfo.nCellWidth * 2;
            this.nDispSizeY = this.sizeInfo.nMapRealHeight + this.sizeInfo.nCellHeight * 2 + this.nMarginTop + this.nMarginBottom;
            this.app.renderer.autoDensity = true;
            this.app.renderer.resize(this.nDispSizeX,this.nDispSizeY);

            if(this.grpMap != null) {
                this.app.stage.removeChild(this.grpMap);
            }
            this.grpMap = this.makeImgMap();
            this.app.stage.addChild(this.grpMap);
        }

        initCharactor(type) {
            if(this.charaInfo != null) {
                for(let i = 0; i < this.nCharaNum; i++) {
                    this.app.stage.removeChild(this.charaInfo[i].grpChara);
                }
            }
            let exist_player = false;
            this.charaInfo = [];
            this.charaInfoWithName = {};
            this.nCharaNum = 40;
            if(type == "DIAGONAL_CERT") {
                this.nCharaNum = 2;
                let min_dist = 5;
                let room_width = 3;
                let room_height = 3;
                if(this.nDiffcult == 1) {
                    min_dist = 4;
                    room_width = 3;
                    room_height = 3;
                }
                else if(this.nDiffcult == 2) {
                    min_dist = 8;
                    room_width = 5;
                    room_height = 5;
                }
                else if(this.nDiffcult == 3) {
                    min_dist = 14;
                    room_width = 7;
                    room_height = 7;
                }
                else if(this.nDiffcult == 4) {
                    min_dist = 24;
                    room_width = 9;
                    room_height = 7;
                }
                let room_ty = 0;
                let room_tx = 0;  
                let i_ty = 0;
                let i_tx = 0;
                while(true) {
                    i_ty = getRandomInt(0, this.sizeInfo.nMapHeight);
                    i_tx = getRandomInt(0, this.sizeInfo.nMapWidth);
                    let r_x = i_tx + min_dist;
                    let d_y = i_ty + min_dist;
                    let l_x = i_tx - min_dist;
                    let u_y = i_ty - min_dist;
                    let dir = [{x: r_x, y: d_y},
                        {x: l_x, y: d_y},
                        {x: r_x, y: u_y},
                        {x: l_x, y: u_y}]
                    shuffle(dir);
                    let b_find = false;
                    for(let i = 0; i < dir.length; i++) {
                        if(checkRange(dir[i].x, dir[i].y, this.sizeInfo.nMapWidth, this.sizeInfo.nMapHeight)) {
                            room_tx = dir[i].x;
                            room_ty = dir[i].y;
                            b_find = true;
                            break;
                        }
                    }
                    if(b_find) {
                        break;
                    }
                }

                let i_info = this.makeCharacterInfo(0, i_tx, i_ty);
                let i_ch = new Item(i_info);
                i_ch.makeGraph(0x0000FF);
                this.charaInfo.push(i_ch);
                this.mapInfo[i_ty][i_tx].charactor = i_ch;
                this.charaInfoWithName["Item"] = i_ch;

                let offset_x = -getRandomInt(0, room_width);
                let offset_y = -getRandomInt(0, room_height);
                let player_dir = getRandomInt(0, room_height * room_width);
                let p_tx = 0;
                let p_ty = 0;
                for(let y = 0; y < room_height; y++) {
                    for(let x = 0; x < room_width; x++) {
                        let dy = room_ty + y + offset_y;
                        let dx = room_tx + x + offset_x;
                        if(dy < 0) {
                            dy = room_ty + -(dy + 1) + room_height + offset_y;
                        }
                        else if(dy >= this.sizeInfo.nMapHeight) {
                            dy = room_ty + -(dy - this.sizeInfo.nMapHeight + 1) + offset_y;
                        }
                        if(dx < 0) {
                            dx = room_tx + -(dx + 1) + room_width + offset_x;
                        }
                        else if(dx >= this.sizeInfo.nMapWidth) {
                            dx = room_tx + -(dx - this.sizeInfo.nMapWidth + 1) + offset_x;
                        }
                        this.mapInfo[dy][dx].type = ObjType.FLAT;
                        if(y * room_width + x == player_dir) {
                            p_ty = dy;
                            p_tx = dx;
                        }
                    }
                }

                let p_info = this.makeCharacterInfo(1, p_tx, p_ty);
                let p_ch = new Player(p_info);
                p_ch.makeGraph(0xFF0000);
                this.charaInfo.push(p_ch);
                this.mapInfo[p_ty][p_tx].charactor = p_ch;
                this.charaInfoWithName["Player"] = p_ch;

                if(this.grpMap != null) {
                    this.app.stage.removeChild(this.grpMap);
                }
                this.grpMap = this.makeImgMap();
                this.app.stage.addChild(this.grpMap);
                this.app.stage.addChild(i_ch.grpChara);
                this.app.stage.addChild(p_ch.grpChara);
                if(this.textResult != null) {
                    this.app.stage.removeChild(this.textResult);
                }
                this.textResult = new PIXI.Text;
                this.textResult.visible = false;
                this.app.stage.addChild(this.textResult);
            }
            else {
                for(let i = 0; i < this.nCharaNum; i++) {
                    while(true) {
                        let y = getRandomInt(0, this.sizeInfo.nMapHeight);
                        let x = getRandomInt(0, this.sizeInfo.nMapWidth);
                        let cell = this.mapInfo[y][x];
                        if(this.mapInfo[y][x].charactor == null && cell.room_id >= 0) {
                            let info = this.makeCharacterInfo(i, x, y);
                            let ch = null;
                            if(exist_player && i == 0) {
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
            }
        }

        Ready() {
            if(!this.downKeys[32]) {
                return;
            }
            this.app.stage.removeChildren();
            this.state = "Play";
            this.nDiffcult = 1;
            this.bPracticeMode = false;
            let elem = document.getElementById("diagonal_cert_diffcult");
            if(elem != null) {
                this.nDiffcult = parseInt(elem.value);
                elem.disabled = true;
            }
            elem = document.getElementById("diagonal_cert_practice");
            if(elem != null) {
                this.bPracticeMode = elem.checked;
                elem.disabled = true;
            }
            this.init('DIAGONAL_CERT', true);
        }

        Play() {
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
                this.judge = this.judgeClear();
                if(this.judge != "") {
                    if(this.judge == "Clear") {
                        this.textResult.text = "○";
                        this.textResult.style = {font:'メイリオ', fontSize: 48, fill:'white',
                                                stroke: 'white', strokeThickness: 2};
                        this.textResult.y = -14;
                        this.nPoint++;
                    }
                    else {
                        this.textResult.text = "×";
                        this.textResult.style = {font:'メイリオ', fontSize: 48, fill:'white',
                                                stroke: 'white', strokeThickness: 1};
                        this.textResult.y = -10;
                    }
                    this.textResult.x = this.nDispSizeX / 2 - 12;
                    this.textResult.visible = true;
                    this.textPoint.text = this.nPoint + " / " + this.nCertNum;
                    this.state = "Result";
                }
            }
            if(this.downKeys[27]) {
                this.End(true);
            }
            if(this.nLimitTime > 0) {
                let n_left_time = this.nLimitTime - (Date.now() - this.nStartTime);
                if(n_left_time < 0) {
                    n_left_time = 0;
                }
                this.textTime.text = "残り " + (n_left_time / 1000).toFixed(1) + " 秒";
                this.textTime.text += "\n　　　　　　　　　　　　　　　　 ";
            }
        }

        Result() {
            if(this.downKeys[27]) {
                this.End(true);
                return;
            }
            if(!this.downKeys[32]) {
                return;
            }
            this.nCertCount++;
            this.textCount.text = "第" + this.nCertCount + "問";
            if(this.nCertCount <= this.nCertNum) {
                this.state = "Play";
            }
            else {
                this.state = "End";
            }
            this.nStartTime = Date.now();
            this.init('DIAGONAL_CERT');
        }

        End(bForceEnd) {
            if(bForceEnd == null) {
                if(this.downKeys[13]) {
                    let url = "https://twitter.com/intent/tweet?text=";
                    url += "斜め軸検定 ";
                    url += (this.bPracticeMode) ? "練習" : "本番";
                    url += "で";
                    let level = ["初級", "中級", "上級", "超上級"];
                    url += level[this.nDiffcult - 1];
                    if(this.bClear) {
                        url += "に合格しました。";
                    }
                    else {
                        url += "に合格できませんでした。";
                    }
                    url += "%0D%0A[結果] " + this.nPoint + " / " + this.nCertNum;
                    url += "%0D%0Ahttps://koyubistrong.github.io/index.html?id=section_diagonal_cert";
                    window.open(url);
                    return;
                }
                if(!this.downKeys[27]) {
                    return;
                }
            }
            let elem = document.getElementById("diagonal_cert_diffcult");
            if(elem != null) {
                elem.disabled = false;
            }
            elem = document.getElementById("diagonal_cert_practice");
            if(elem != null) {
                elem.disabled = false;
            }
            this.state = "Ready";
            this.init('DIAGONAL_CERT');
        }

        judgeClear() {
            if(this.strGameType  == "DIAGONAL_CERT") {
                let b_time_over = false;
                if(this.nLimitTime >= 0) {
                    let n_left_time = this.nLimitTime - (Date.now() - this.nStartTime);
                    b_time_over = (n_left_time < 0);
                }
                if(!b_time_over && !this.downKeys[32]) {
                    return "";
                }
                let player = this.charaInfoWithName["Player"];
                let item = this.charaInfoWithName["Item"];
                if(player == null || item == null) {
                    return "";
                }
                let diff_x = item.x - player.x;
                let diff_y = item.y - player.y;
                let sign_x = Math.sign(diff_x);
                let sign_y = Math.sign(diff_y);
                
                let y = player.y;
                let x = player.x;
                while(true) {
                    this.mapInfo[y][x].type = ObjType.FLAT2
                    y += sign_y;
                    x += sign_x;
                    if(checkRange(x, y, this.sizeInfo.nMapWidth, this.sizeInfo.nMapHeight) == false) {
                        break;
                    }
                }
                this.makeImgMap(this.grpMap);
                if(Math.abs(diff_x) == Math.abs(diff_y)) {
                    return "Clear";
                }
                return "Failed";
            }
            return "";
        }

        makeImgMap(grpMap) {
            if(grpMap == null) {
                grpMap = new PIXI.Graphics();
            }
            grpMap.clear();
            let offset_x = this.nDrawOffsetX;
            let offset_y = this.nDrawOffsetY;
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
                    else if(this.mapInfo[y][x].type == ObjType.FLAT2) {
                        grpMap.beginFill(0x00EE00);
                    }
                    else {
                        grpMap.beginFill(0x777777);
                    }
                    grpMap.drawRect(offset_x + rx, offset_y + ry, this.sizeInfo.nCellWidth, this.sizeInfo.nCellHeight);
                }
            }
            grpMap.endFill();
            return grpMap;
        }

        makeCharacterInfo(id, x, y) {
            let grpChara = new PIXI.Graphics();
            let info = {id: id, grpChara: grpChara, x: x, y: y, bef_x: x, bef_y: y,
                rx: this.sizeInfo.nCellWidth * x * this.nUnit,
                ry: this.sizeInfo.nCellHeight * y * this.nUnit,
                direction: 6, tx: x, ty: y,
                speed_x: 0, speed_y: 0, no_move_count: 999999,
                actioned: false, cell_size: this.nCellSize,
                n_draw_offset_X: this.nDrawOffsetX,
                n_draw_offset_Y: this.nDrawOffsetY,
                nUnit: this.nUnit, hp: 20, bef_target_find: false
            };
            return info;
        }
    }
   
    return RogueGame;
  })();

var rg = new RogueGame();
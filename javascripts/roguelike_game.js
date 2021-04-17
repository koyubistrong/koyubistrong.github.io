var RogueGame = (function() {
    class RogueGame {
        init() {
            if(this.app == null) {
                let canvas = document.getElementById('roguelike_game')
                this.app = new PIXI.Application({
                    backgroundColor: 0x000000,
                });
                canvas.appendChild(this.app.view);
            }
            this.nCellSize = 8;
            this.nUnit = 100;
            this.initMap();
            this.initCharactor();
        }

        initMap() {
            const floor_div_width = 4;
            const floor_div_height = 3;
            const floor_height = 34;
            const floor_width = 56;
            const room_num = 8;
            const middle_aisle_num = 4;
            const connect_rate = 10;
            AutoMap2D.init();
            AutoMap2D.generate(floor_width, floor_height, 8, floor_div_width, floor_div_height, room_num, middle_aisle_num, connect_rate);

            this.mapInfo = AutoMap2D.getMap();
            //this.virtualMapInfo = AutoMap2D.getVirtualMap();
            this.sizeInfo = AutoMap2D.getSizeInfo();

            this.app.renderer.autoResize = true;
            this.app.renderer.resize(this.sizeInfo.nMapRealWidth + this.sizeInfo.nCellWidth * 2,
                this.sizeInfo.nMapRealHeight + this.sizeInfo.nCellHeight * 2);

            if(this.grpMap != null) {
                this.app.stage.removeChild(this.grpMap);
            }
            this.grpMap = new PIXI.Graphics();
            this.app.stage.addChild(this.grpMap);
            
            this.makeImgMap();
        }

        initCharactor() {
            if(this.charaInfo != null) {
                for(let i = 0; i < this.nCharaNum; i++) {
                    this.app.stage.removeChild(this.charaInfo[i].grpChara);
                }
            }
            this.charaInfo = [];
            this.nCharaNum = 80;
            for(let i = 0; i < this.nCharaNum; i++) {
                while(true) {
                    let y = getRandomInt(0, this.sizeInfo.nMapHeight);
                    let x = getRandomInt(0, this.sizeInfo.nMapWidth);
                    let cell = this.mapInfo[y][x];
                    if(this.mapInfo[y][x].charactor == null && cell.room_id >= 0) {
                        let grpChara = new PIXI.Graphics();
                        this.charaInfo.push({id: i, grpChara: grpChara, x: x, y: y, bef_x: x, bef_y: y,
                            rx: this.sizeInfo.nCellWidth * x * this.nUnit,
                            ry: this.sizeInfo.nCellHeight * y * this.nUnit,
                            direction: 6, bef_room_id: -1, tx: x, ty: y,
                            speed_x: 0, speed_y: 0, no_move_count: 0
                        });
                        this.mapInfo[y][x].charactor = this.charaInfo[this.charaInfo.length - 1];
                        let rad = this.sizeInfo.nCellWidth / 2;
                        grpChara.lineStyle(0);
                        grpChara.beginFill(0x888888);
                        grpChara.drawCircle(rad, rad, rad);
                        grpChara.x = this.divUnit(this.mapInfo[y][x].charactor.rx) + this.nCellSize;
                        grpChara.y = this.divUnit(this.mapInfo[y][x].charactor.ry) + this.nCellSize;
                        this.app.stage.addChild(grpChara);
                        break;
                    }
                }
            }
            if(this.main == null) {
                this.main = () => {
                    for(var i = 0; i < this.nCharaNum; i++) {
                        let ch = this.charaInfo[i];
                        let is_think = this.thinkChara(ch);
                        ch.speed_x = 200 * Math.sign(this.toReal(this.multUnit(ch.x)) - ch.rx);
                        ch.speed_y = 200 * Math.sign(this.toReal(this.multUnit(ch.y)) - ch.ry);
                        ch.rx += ch.speed_x;
                        ch.ry += ch.speed_y;
                        ch.grpChara.x = this.divUnit(ch.rx) + this.nCellSize;
                        ch.grpChara.y = this.divUnit(ch.ry) + this.nCellSize;

                        if(!is_think) {
                            continue;
                        }
                        if(ch.x == ch.bef_x && ch.y == ch.bef_y) {
                            ch.no_move_count++;
                        }
                        else {
                            ch.no_move_count = 0;
                        }
                        let pos_info = this.mapInfo[ch.y][ch.x];
                        let bef_info = this.mapInfo[ch.bef_y][ch.bef_x];
                        ch.bef_room_id = this.mapInfo[ch.bef_y][ch.bef_x].room_id;
                        ch.bef_x = ch.x;
                        ch.bef_y = ch.y;
                        [bef_info.charactor, pos_info.charactor] = [pos_info.charactor, bef_info.charactor];
                    }
                };
                this.app.ticker.add(this.main);
            }
        }

        thinkChara(ch) {
            if(ch.speed_x != 0 || ch.speed_y != 0) {
                return false;
            }
            let pos_info = this.mapInfo[ch.y][ch.x];
            let find_aisle = false;
            if(pos_info.room_id >= 0 && pos_info.middle_aisle == false) {
                if(ch.no_move_count >= 2 || ch.bef_room_id != pos_info.room_id) {
                    let target_list = this.searchObject("AISLE", {x: ch.x, y: ch.y}, -1, true, false, true);
                    if(target_list.length > 0) {
                        let target = target_list[getRandomInt(0, target_list.length)];
                        ch.tx = target[0].x;
                        ch.ty = target[0].y; 
                        find_aisle = true;
                    }
                }
            }
            else {
                let pos = this.checkMoveable(ch.x, ch.y, direction8[ch.direction]);
                if(pos != null) {
                    ch.tx = pos.x;
                    ch.ty = pos.y;
                }
                else {
                    let shuffle_dire = [];
                    let direction = direction8[ch.direction];
                    for(let i = 0; i < direction8.length; i++) {
                        shuffle_dire.push(direction8[i]);
                    }
                    shuffle(shuffle_dire);
                    let find = false;
                    for(let i = 0; i < shuffle_dire.length; i++) {
                        pos = this.checkMoveable(ch.x, ch.y, shuffle_dire[i]);
                        if(pos != null && shuffle_dire[i].x * -1 != direction.x &&
                            shuffle_dire[i].y * -1 != direction.y) {
                            ch.tx = pos.x;
                            ch.ty = pos.y;
                            find = true;
                            break;
                        }
                    }
                    pos = this.checkMoveable(ch.x, ch.y, {x: direction.x * -1, y: direction.y * -1});
                    if(!find && pos != null) {
                        ch.tx = pos.x;
                        ch.ty = pos.y;
                    }
                }
            }
            let diff_x = Math.sign(ch.tx - ch.x);
            let diff_y = Math.sign(ch.ty - ch.y);
            let target_trace = this.searchObject("POS", {x: ch.x, y: ch.y, tx: ch.tx, ty: ch.ty}, -1, false, true, false);
            if(target_trace.length > 0 && target_trace[0].length > 0) {
                diff_x = Math.sign(target_trace[0][target_trace[0].length - 1].x - ch.x);
                diff_y = Math.sign(target_trace[0][target_trace[0].length - 1].y - ch.y);
            }
            
            if(this.mapInfo[ch.y][ch.x + diff_x].type == ObjType.WALL) {
                diff_x = 0;
            }
            if(this.mapInfo[ch.y + diff_y][ch.x].type == ObjType.WALL) {
                diff_y = 0;
            }
            if(this.mapInfo[ch.y + diff_y][ch.x + diff_x].type == ObjType.WALL) {
                diff_x = 0;
                diff_y = 0;
            }
            if(this.mapInfo[ch.y + diff_y][ch.x + diff_x].charactor != null) {
                diff_x = 0;
                diff_y = 0;
            }
            ch.x = ch.x + diff_x;
            ch.y = ch.y + diff_y;
            for(let i = 0; i < direction8.length; i++) {
                if(direction8[i].x == diff_x && direction8[i].y == diff_y) {
                    ch.direction = i;
                }
            }
            return true;
        }

        searchObject(find_type, pos, id, only_room, once_find, ignore_chara) {
            let search = Array2D(this.sizeInfo.nMapHeight, this.sizeInfo.nMapWidth, false);
            let queue = [];
            let find_list = [];
            let trace = [];
            let room_id = this.mapInfo[pos.y][pos.x].room_id;
            trace.push({parent: null, x: pos.x, y: pos.y});
            queue.push({parent: trace[0], x: pos.x, y: pos.y});
            search[pos.y][pos.x] = true;
            while(queue.length > 0) {
                let p = queue[0];
                for(let i = 0; i < direction8.length; i++) {
                    let dx = p.x + direction8[i].x;
                    let dy = p.y + direction8[i].y;
                    if(checkRange(dx, dy, this.sizeInfo.nMapWidth, this.sizeInfo.nMapHeight) == false) continue;
                    if(search[dy][dx] == true) continue;
                    if(this.mapInfo[dy][dx].type == ObjType.WALL) continue;
                    if(!ignore_chara && this.mapInfo[dy][dx].charactor != null) continue;
                    if(direction8[i].diagonal) {
                        if(this.mapInfo[dy][p.x].type == ObjType.WALL ||
                            this.mapInfo[p.y][dx].type == ObjType.WALL) {
                                continue;
                        }
                    }
                    let node = {parent: p.parent, x: dx, y: dy};
                    trace.push(node);
                    if(find_type == "CHARA") {
                        if(this.mapInfo[dy][dx].charactor != null &&
                            this.mapInfo[dy][dx].charactor.id == id) {
                                find_list.push({node: node, x: dx, y: dy});
                        }
                    }
                    else if(find_type == "AISLE") {
                        if(this.mapInfo[dy][dx].room_id == id) {
                            find_list.push({node: node, x: dx, y: dy});
                        }
                    }
                    else if(find_type == "POS") {
                        if(dx == pos.tx && dy == pos.ty) {
                            find_list.push({node: node, x: dx, y: dy});
                        }
                    }
                    if(only_room && room_id != this.mapInfo[dy][dx].room_id) continue;
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
                find_trace[i] = [];
                while(node.parent != null) {
                    find_trace[i].push({x: node.x, y: node.y});
                    node = node.parent;
                }
            }
            return find_trace;
        }

        makeImgMap() {
            let offset_x = this.nCellSize;
            let offset_y = this.nCellSize;
            let colors = [0x0000FF, 0x00FF00, 0xFF0000, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0x880000, 0x008800, 0x000088, 0x8888800, 0x880088, 0x008888];
            for(var y = 0; y < this.sizeInfo.nMapHeight; y++) {
                for(var x = 0; x < this.sizeInfo.nMapWidth; x++) {
                    var ry = y * this.nCellSize;
                    var rx = x * this.nCellSize;
                    if(this.mapInfo[y][x].type == ObjType.FLAT) {
                        if(false && this.mapInfo[y][x].room_id >= 0) {
                            this.grpMap.beginFill(colors[this.mapInfo[y][x].room_id % colors.length]);
                        }
                        else {
                            this.grpMap.beginFill(0xFFFFFF);
                        }
                    }
                    else this.grpMap.beginFill(0x000000);
                    this.grpMap.drawRect(offset_x + rx, offset_y + ry, this.sizeInfo.nCellWidth, this.sizeInfo.nCellHeight);
                }
            }
            this.grpMap.endFill();
        }

        checkMoveable(x, y, direction) {
            let dx = x + direction.x;
            let dy = y + direction.y;
            if(checkRange(dx, dy, this.sizeInfo.nMapWidth, this.sizeInfo.nMapHeight) == false) {
                return null;
            }
            if(this.mapInfo[dy][dx].type == ObjType.WALL) {
                return null;
            }
            if(direction.diagonal) {
                if(this.mapInfo[dy][x].type == ObjType.WALL ||
                    this.mapInfo[y][dx].type == ObjType.WALL) {
                        return null;
                }
            }
            if(this.mapInfo[dy][dx].charactor != null) {
                return null;
            }
            return {x: dx, y: dy};
        }

        multUnit(v) { return v * this.nUnit; }
        divUnit(v) { return Math.round(v / this.nUnit); }
        toReal(v) { return v * this.nCellSize; }
        //toReal(v) { return Math.floor(v / this.nCellSize); }
    }
   
    return RogueGame;
  })();

var rg = new RogueGame();
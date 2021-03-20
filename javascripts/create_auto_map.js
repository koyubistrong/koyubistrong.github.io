

var AutoMap2D = (function() {

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        if(min >= max) return min;
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }

    function shuffle(arr) {
        for(var i = 0; i < arr.length; i++) {
            var r = getRandomInt(0, arr.length);
            var tmp = arr[i];
            arr[i] = arr[r];
            arr[r] = tmp;
        }
    }

    class AutoMap2D {
        
        static mapInfo;
        static nCellWidth;
        static nCellHeight;
        static nMapWidth;
        static nMapHeight;
        static nMapRealWidth;
        static nMapRealHeight;

        static mapVirtualInfo;

        static direction = [
            {x: -1, y: 0},
            {x: 1, y: 0},
            {x: 0, y: -1},
            {x: 0, y: 1}
        ];

        static init() {
            mapInfo = [];
            mapVirtualInfo = [];
            AutoMap2D.nCellHeight = AutoMap2D.nCellWidth = 0;
            AutoMap2D.nMapWidth = 0;
            AutoMap2D.nMapHeight = 0;
            AutoMap2D.nMapRealWidth = 0;
            AutoMap2D.nMapRealHeight = 0;
        }

        static initCustom() {
            AutoMap2D.initMap(56, 34, 8);
            //AutoMap2D.initMap(80, 80, 8);
            AutoMap2D.initVirtualMap(5, 4);
        }

        static initMap (width, height, cell_size) {
            var canvas = document.getElementById('create_auto_map');
            AutoMap2D.mapInfo = [];
            AutoMap2D.nCellHeight = AutoMap2D.nCellWidth = cell_size;
            AutoMap2D.nMapWidth = width;
            AutoMap2D.nMapHeight = height;
            AutoMap2D.nMapRealWidth = AutoMap2D.nCellWidth * AutoMap2D.nMapWidth;
            AutoMap2D.nMapRealHeight = AutoMap2D.nCellHeight * AutoMap2D.nMapHeight;
            canvas.width = AutoMap2D.nMapRealWidth;
            canvas.height = AutoMap2D.nMapRealHeight;
            for(var y = 0; y < AutoMap2D.nMapHeight; y++) {
                AutoMap2D.mapInfo[y] = []
                for(var x = 0; x < AutoMap2D.nMapWidth; x++) {
                    var color = "rgb(0, 0, 0)";
                    if((x + y) % 2 == 1) {
                        //color = "rgb(255, 255, 255)";
                    }
                    AutoMap2D.mapInfo[y][x] = {
                        color: color
                    };
                }
            }
            //AutoMap2D.lineTo(getRandomInt(0, AutoMap2D.nMapWidth),getRandomInt(0, AutoMap2D.nMapHeight),getRandomInt(0, AutoMap2D.nMapWidth),getRandomInt(0, AutoMap2D.nMapHeight),"rgb(255, 255, 255)");
            //AutoMap2D.lineZigzag("V", getRandomInt(0, AutoMap2D.nMapWidth),getRandomInt(0, AutoMap2D.nMapHeight),getRandomInt(0, AutoMap2D.nMapWidth),getRandomInt(0, AutoMap2D.nMapHeight),"rgb(255, 255, 255)");
           // AutoMap2D.lineRightAngle("H", getRandomInt(0, AutoMap2D.nMapWidth),getRandomInt(0, AutoMap2D.nMapHeight),getRandomInt(0, AutoMap2D.nMapWidth),getRandomInt(0, AutoMap2D.nMapHeight),"rgb(255, 255, 255)");
            //AutoMap2D.draw();
        }

        static initVirtualMap(width, height) {
            var cellWidth = AutoMap2D.nMapWidth / width;
            var minCellWidth = cellWidth - 1;
            var maxCellWidth = cellWidth + 1;

            var cellHeight = AutoMap2D.nMapHeight / height;
            var minCellHeight = cellHeight - 1;
            var maxCellHeight = cellHeight + 1;

            
            var arrWidthInterval = [];
            var widthTotal = 0;
            for(var x = 0; x < width; x++) {
                var w = getRandomInt(minCellWidth, maxCellWidth);
                if(x >= width - 1) w = AutoMap2D.nMapWidth - widthTotal;
                arrWidthInterval[x] = {
                    x: widthTotal,
                    width: w
                };
                widthTotal += w;
            }
            
           var arrHeightInterval = [];
            var heightTotal = 0;
            for(var y = 0; y < height; y++) {
                var h = getRandomInt(minCellHeight, maxCellHeight);
                if(y >= height - 1) h = AutoMap2D.nMapHeight - heightTotal;
                arrHeightInterval[y] = {
                    y: heightTotal,
                    height: h
                };
                heightTotal += h;
            }
            
            AutoMap2D.mapVirtualInfo = [];
            var arrHeightTotal = [];
            for(var y = 0; y < height; y++) {
                AutoMap2D.mapVirtualInfo[y] = []
                for(var x = 0; x < width; x++) {
                    /*
                    if(arrHeightTotal[x] == null) arrHeightTotal[x] = 0;
                    var h = getRandomInt(minCellHeight, maxCellHeight);
                    if(y >= height - 1) h = AutoMap2D.nMapHeight - arrHeightTotal[x] - 1;
                    */
                    AutoMap2D.mapVirtualInfo[y][x] = {
                        color: "rgb(0, 0, 0)",
                        use_room: false,
                        use_aisle: false,
                        x: arrWidthInterval[x].x + 1,
                        width: arrWidthInterval[x].width - 1,
                        vx: arrWidthInterval[x].x,
                        v_width: arrWidthInterval[x].width,
                        //y: arrHeightTotal[x],
                        //height: h,
                        y: arrHeightInterval[y].y + 1,
                        height: arrHeightInterval[y].height - 1,
                        vy: arrHeightInterval[y].y,
                        v_height: arrHeightInterval[y].height,
                        room_x: x,
                        room_y: y,
                        parent: null,
                        child: []
                    };
                    //arrHeightTotal[x] += h;
                }
            }

            var arrUseRoom = []
            //arrUseRoom = [{x: 4, y: 3}, {x: 1, y: 1}]
            for(var i = 0; i < 8; i++) {
                var ok = false;
                while(ok == false) {
                    var r = getRandomInt(0, width * height);
                    var x = r % width;
                    var y = Math.floor(r / width);
                    //x = arrUseRoom[i].x;
                   // y = arrUseRoom[i].y;
                    if(AutoMap2D.mapVirtualInfo[y][x].use_room == false) {
                        AutoMap2D.mapVirtualInfo[y][x].color = "rgb(255, 255, 255)";
                        AutoMap2D.mapVirtualInfo[y][x].use_room = true;
                        arrUseRoom.push({x: x, y: y});
                        ok = true;
                    }
                }
            }
            shuffle(arrUseRoom)

            for(var i = 0; i < arrUseRoom.length; i++) {
                var extend = getRandomInt(0, AutoMap2D.direction.length + 1);
                if(extend > 0) {
                    var x = arrUseRoom[i].x;
                    var y = arrUseRoom[i].y;
                    var ii = 0;
                    var d = getRandomInt(0, AutoMap2D.direction.length);
                    var curInfo = AutoMap2D.mapVirtualInfo[y][x];
                    while(ii < AutoMap2D.direction.length){
                        var bd = d;
                        var dx = x + AutoMap2D.direction[d].x;
                        var dy = y + AutoMap2D.direction[d].y;
                        d = (d + 1) % AutoMap2D.direction.length; 
                        ii++;
                        if(AutoMap2D.checkRange(dx, dy, width, height) == false) continue;
                        var dirInfo = AutoMap2D.mapVirtualInfo[dy][dx];
                        if(dirInfo.use_room == false) {
                            dirInfo.color = "rgb(255, 255, 255)";
                            dirInfo.use_room = true;
                            if(AutoMap2D.direction[bd].x < 0 || AutoMap2D.direction[bd].y < 0) {
                                curInfo.parent = dirInfo;
                                dirInfo.child.push(curInfo);
                                arrUseRoom[i].x = dx;
                                arrUseRoom[i].y = dy;
                            }
                            else {
                                dirInfo.parent = curInfo;
                                curInfo.child.push(dirInfo);
                            }
                            break;
                        }
                    }
                }
            }

            for(var y = 0; y < height; y++) {
                for(var x = 0; x < width; x++) {
                    var curInfo = AutoMap2D.mapVirtualInfo[y][x];
                    if(curInfo.parent != null) continue;
                    var ry = curInfo.y;
                    var rh = curInfo.height;
                    var rx = curInfo.x;
                    var rw = curInfo.width;
                    var color = curInfo.color;
                    for(var i = 0; i < curInfo.child.length; i++) {
                        var dirInfo = curInfo.child[i];
                        if(dirInfo.x != rx) {
                            rw += dirInfo.width;
                        }
                        if(dirInfo.y != ry) {
                            rh += dirInfo.height;
                        }
                    }
                    var rrx = getRandomInt(rx, rx + curInfo.width - 3);
                    var rry = getRandomInt(ry, ry + curInfo.height - 3);
                    var dfx = rrx - rx;
                    var dfy = rry - ry;
                    var rrw = getRandomInt(3, rw - dfx);
                    var rrh = getRandomInt(3, rh - dfy);
                    if(curInfo.width != rw) rrw = getRandomInt(curInfo.width - dfx + 1, rw - dfx);
                    if(curInfo.height != rh) rrh = getRandomInt(curInfo.height - dfy + 1, rh - dfy);
                    AutoMap2D.fillRect(rrx, rry, rrw, rrh, color);
                    curInfo.y = rry;
                    curInfo.x = rrx;
                    curInfo.width = rrw;
                    curInfo.height = rrh;
                }
            }
            var addedRoom = {}
            var addedRoom = Array(height);
            for(var y = 0; y < addedRoom.length; y++) {
                addedRoom[y] = Array(width).fill(false);
            }

            var trace = []
            for(var i = 0; i < arrUseRoom.length; i++) {
                var queue = [];
                var search = Array(height);
                for(var y = 0; y < search.length; y++) {
                    search[y] = Array(width).fill(false);
                }
                trace[i] = [{parent: null, x: arrUseRoom[i].x, y: arrUseRoom[i].y}];
                var infoParent = AutoMap2D.mapVirtualInfo[arrUseRoom[i].y][arrUseRoom[i].x];
                queue.push({parent: trace[i][0], x: trace[i][0].x, y: trace[i][0].y, level: 0});
                var find = false;
                while(queue.length > 0) {
                    var p = queue[0];
                    var info = AutoMap2D.mapVirtualInfo[p.y][p.x];
                    search[p.y][p.x] = true;
                    shuffle(AutoMap2D.direction);
                    for(var j = 0; j < AutoMap2D.direction.length; j++) {
                        var d = AutoMap2D.direction[j];
                        var dx = p.x + d.x;
                        var dy = p.y + d.y;
                        if(AutoMap2D.checkRange(dx, dy, width, height) == false) continue;
                        if(AutoMap2D.mapVirtualInfo[dy][dx].parent == infoParent) continue;
                        if(search[dy][dx]) continue;
                        var use_room = AutoMap2D.mapVirtualInfo[dy][dx].use_room;
                        trace[i].push({parent: p.parent, x: dx, y: dy, use_room: use_room, level: p.level + 1});
                        if(use_room == false) {
                            queue.push({parent: trace[i][trace[i].length - 1], x: dx, y: dy, level: p.level + 1});
                        }
                    }
                    queue.shift();
                }
                trace[i].sort(function (a, b) {
                    return a.level - b.level;
                });
            }

            var coordToId = function(x, y, width) {
                return x + y * width;
            }
            
            var addedRoomPair = Array(width * height);
            for(var i = 0; i < addedRoomPair.length; i++) {
                addedRoomPair[i] = Array(width * height).fill(false);
            }
            var count_conn = 0;
            var MAX_COUNT = 10;
            while(count_conn < MAX_COUNT) {
                for(var i = 0; i < trace.length; i++) {
                    var tr = trace[i];
                    var src_id = coordToId(arrUseRoom[i].x, arrUseRoom[i].y, width);
                    var find = false;
                    for(var j = 0; j < tr.length; j++) {
                        if(tr[j].use_room == null || tr[j].use_room == false) continue;
                        var node = tr[j];
                        var child = null;
                        var bef_x = 0;
                        var bef_y = 0;
                        var target_id = coordToId(node.x, node.y, width);
                        if(AutoMap2D.mapVirtualInfo[node.y][node.x].parent != null) {
                            var info = AutoMap2D.mapVirtualInfo[node.y][node.x].parent;
                            target_id = coordToId(info.room_x, info.room_y, width);
                        }
                        if(addedRoomPair[src_id][target_id]) continue;
                        //console.log("i: " + i + " j: " + j)
                        while(node != null) {
                            var parent = node.parent;
                            if(child == null && parent == null) break;
                            var info = AutoMap2D.mapVirtualInfo[node.y][node.x];
                            //AutoMap2D.fillRect(info.vx, info.vy, info.v_width, info.v_height, "rgb(128, 128, 128)");
                            var add_v_width = 0;
                            var add_v_height = 0;
                            if(child == null) {
                                if(info.parent != null) {
                                    if(info.room_x != info.parent.room_x) add_v_width = info.v_width;
                                    if(info.room_y != info.parent.room_y) add_v_height = info.v_height;
                                    info = info.parent;
                                }
                                if(node.x < parent.x) {
                                    bef_x = info.x + info.width;
                                    bef_y = info.y + getRandomInt(0, info.height);
                                }
                                else if(node.x > parent.x) {
                                    bef_x = info.x;
                                    bef_y = info.y + getRandomInt(0, info.height);
                                }
                                else if(node.y < parent.y) {
                                    bef_x = info.x + getRandomInt(0, info.width);
                                    bef_y = info.y + info.height;
                                }
                                else if(node.y > parent.y) {
                                    bef_x = info.x + getRandomInt(0, info.width);
                                    bef_y = info.y;
                                }
                            }
                            var next_x = 0;
                            var next_y = 0;
                            if(parent != null) {
                                if(node.x < parent.x) {
                                    next_x = info.vx + info.v_width + add_v_width;
                                    next_y = info.vy + getRandomInt(0, info.v_height);
                                }
                                else if(node.x > parent.x) {
                                    next_x = info.vx;
                                    next_y = info.vy + getRandomInt(0, info.v_height);
                                }
                                else if(node.y < parent.y) {
                                    next_x = info.vx + getRandomInt(0, info.v_width);
                                    next_y = info.vy + info.v_height + add_v_height;
                                }
                                else if(node.y > parent.y) {
                                    next_x = info.vx + getRandomInt(0, info.v_width);
                                    next_y = info.vy;
                                }
                            }
                            else {
                                if(info.parent != null) {
                                    info = info.parent;
                                }
                                if(node.x < child.x) {
                                    next_x = info.x + info.width;
                                    next_y = info.y + getRandomInt(0, info.height);
                                }
                                else if(node.x > child.x) {
                                    next_x = info.x;
                                    next_y = info.y + getRandomInt(0, info.height);
                                }
                                else if(node.y < child.y) {
                                    next_x = info.x + getRandomInt(0, info.width);
                                    next_y = info.y + info.height;
                                }
                                else if(node.y > child.y) {
                                    next_x = info.x + getRandomInt(0, info.width);
                                    next_y = info.y;
                                }
                            }  
                            var type = "H";
                            var zigzag = true;
                            if(child != null && parent != null && child.x != parent.x && child.y != parent.y) {
                                zigzag = false;
                            }
                            else {
                                if(parent != null) {
                                    if(node.x != parent.x) {
                                        type = "H"
                                    }
                                    if(node.y != parent.y) {
                                        type = "V"
                                    }
                                }
                                else {
                                    if(node.x != child.x) {
                                        type = "H"
                                    }
                                    if(node.y != child.y) {
                                        type = "V"
                                    }
                                }
                            }
                            //console.log("bef_x: " + bef_x + " bef_y: " + bef_y + " next_x: " + next_x + " next_y: " + next_y);
                            if(zigzag) {
                                AutoMap2D.lineZigzag(type, bef_x, bef_y, next_x, next_y, "rgb(255, 255, 255)");
                            }
                            else {
                                AutoMap2D.lineRightAngle(type, bef_x, bef_y, next_x, next_y, "rgb(255, 255, 255)");
                            }
                            child = node;
                            node = parent;
                            bef_x = next_x;
                            bef_y = next_y;
                        }
                        addedRoomPair[src_id][target_id] = true;
                        addedRoomPair[target_id][src_id] = true;
                        break;
                    }
                    count_conn++;
                    if(count_conn >= MAX_COUNT) {
                        break;
                    }
                }
            }
            AutoMap2D.draw();
            return;

            for(var i = 0; i < arrUseRoom.length; i++) {
                var queue = [];
                var search = Array(height);
                for(var y = 0; y < search.length; y++) {
                    search[y] = Array(width).fill(false);
                }
                var trace = [{parent: null, x: arrUseRoom[i].x, y: arrUseRoom[i].y}];
                var infoParent = AutoMap2D.mapVirtualInfo[arrUseRoom[i].y][arrUseRoom[i].x];
                queue.push({parent: trace[0], x: trace[0].x, y: trace[0].y});
                var find = false;
                while(queue.length > 0) {
                    var p = queue[0];
                    var info = AutoMap2D.mapVirtualInfo[p.y][p.x];
                    search[p.y][p.x] = true;
                    for(var j = 0; j < AutoMap2D.direction.length; j++) {
                        var d = AutoMap2D.direction[j];
                        var dx = p.x + d.x;
                        var dy = p.y + d.y;
                        if(AutoMap2D.checkRange(dx, dy, width, height) == false) continue;
                        if(AutoMap2D.mapVirtualInfo[dy][dx].parent == infoParent) continue;
                        if(search[dy][dx]) continue;
                        if(addedRoom[dy][dx]) continue;
                        var use_room = AutoMap2D.mapVirtualInfo[dy][dx].use_room;
                        trace.push({parent: p.parent, x: dx, y: dy, use_room: use_room});
                        if(use_room == false) {
                            queue.push({parent: trace[trace.length - 1], x: dx, y: dy});
                        }
                        else {
                            addedRoom[dy][dx] = true;
                            find = true;
                        }
                    }
                    queue.shift();
                    if(find == true) {
                        addedRoom[arrUseRoom[i].y][arrUseRoom[i].x] = true;
                        for(var k = 0; k < infoParent.child.length; k++) {
                            addedRoom[infoParent.child[k].room_y][infoParent.child[k].room_x] = true;
                        }
                        break;
                    }
                }
                for(var j = 0; j < trace.length; j++) {
                    if(trace[j].use_room == null || trace[j].use_room == false) continue;
                    var node = trace[j];
                    var child = null;
                    var bef_x = 0;
                    var bef_y = 0;
                    //console.log("i: " + i + " j: " + j)
                    while(node != null) {
                        var parent = node.parent;
                        if(child == null && parent == null) break;
                        var info = AutoMap2D.mapVirtualInfo[node.y][node.x];
                        //AutoMap2D.fillRect(info.vx, info.vy, info.v_width, info.v_height, "rgb(128, 128, 128)");
                        var add_v_width = 0;
                        var add_v_height = 0;
                        if(child == null) {
                            if(info.parent != null) {
                                if(info.room_x != info.parent.room_x) add_v_width = info.v_width;
                                if(info.room_y != info.parent.room_y) add_v_height = info.v_height;
                                info = info.parent;
                            }
                            if(node.x < parent.x) {
                                bef_x = info.x + info.width;
                                bef_y = info.y + getRandomInt(0, info.height);
                            }
                            else if(node.x > parent.x) {
                                bef_x = info.x;
                                bef_y = info.y + getRandomInt(0, info.height);
                            }
                            else if(node.y < parent.y) {
                                bef_x = info.x + getRandomInt(0, info.width);
                                bef_y = info.y + info.height;
                            }
                            else if(node.y > parent.y) {
                                bef_x = info.x + getRandomInt(0, info.width);
                                bef_y = info.y;
                            }
                        }
                        var next_x = 0;
                        var next_y = 0;
                        if(parent != null) {
                            if(node.x < parent.x) {
                                next_x = info.vx + info.v_width + add_v_width;
                                next_y = info.vy + getRandomInt(0, info.v_height);
                            }
                            else if(node.x > parent.x) {
                                next_x = info.vx;
                                next_y = info.vy + getRandomInt(0, info.v_height);
                            }
                            else if(node.y < parent.y) {
                                next_x = info.vx + getRandomInt(0, info.v_width);
                                next_y = info.vy + info.v_height + add_v_height;
                            }
                            else if(node.y > parent.y) {
                                next_x = info.vx + getRandomInt(0, info.v_width);
                                next_y = info.vy;
                            }
                        }
                        else {
                            if(info.parent != null) {
                                info = info.parent;
                            }
                            if(node.x < child.x) {
                                next_x = info.x + info.width;
                                next_y = info.y + getRandomInt(0, info.height);
                            }
                            else if(node.x > child.x) {
                                next_x = info.x;
                                next_y = info.y + getRandomInt(0, info.height);
                            }
                            else if(node.y < child.y) {
                                next_x = info.x + getRandomInt(0, info.width);
                                next_y = info.y + info.height;
                            }
                            else if(node.y > child.y) {
                                next_x = info.x + getRandomInt(0, info.width);
                                next_y = info.y;
                            }
                        }  
                        var type = "H";
                        var zigzag = true;
                        if(child != null && parent != null && child.x != parent.x && child.y != parent.y) {
                            zigzag = false;
                        }
                        else {
                            if(parent != null) {
                                if(node.x != parent.x) {
                                    type = "H"
                                }
                                if(node.y != parent.y) {
                                    type = "V"
                                }
                            }
                            else {
                                if(node.x != child.x) {
                                    type = "H"
                                }
                                if(node.y != child.y) {
                                    type = "V"
                                }
                            }
                        }
                        //console.log("bef_x: " + bef_x + " bef_y: " + bef_y + " next_x: " + next_x + " next_y: " + next_y);
                        if(zigzag) {
                            AutoMap2D.lineZigzag(type, bef_x, bef_y, next_x, next_y, "rgb(255, 255, 255)");
                        }
                        else {
                            AutoMap2D.lineRightAngle(type, bef_x, bef_y, next_x, next_y, "rgb(255, 255, 255)");
                        }
                        /*
                        if(node.x != parent.x) {
                            var lex = info.x;
                            var ley = info.y + getRandomInt(0, info.height);
                            var rtx = info.x + info.width - 1;
                            var rty = info.y + getRandomInt(0, info.height);
                            AutoMap2D.lineZigzag("H", lex, ley, rtx, rty, "rgb(255, 255, 255)");
                        }
                        if(node.y != parent.y) {
                            var lex = info.x + getRandomInt(0, info.width);
                            var ley = info.y;
                            var rtx = info.x + getRandomInt(0, info.width);
                            var rty = info.y + info.height - 1;
                            AutoMap2D.lineZigzag("V", lex, ley, rtx, rty, "rgb(255, 255, 255)");
                        }*/
                        child = node;
                        node = parent;
                        bef_x = next_x;
                        bef_y = next_y;
                    }
                }
            }

            AutoMap2D.draw();
        }

        static draw() {
            var canvas = document.getElementById('create_auto_map');
            var context = canvas.getContext('2d');
            for(var y = 0; y < AutoMap2D.nMapHeight; y++) {
                for(var x = 0; x < AutoMap2D.nMapWidth; x++) {
                    var ry = y * AutoMap2D.nCellHeight;
                    var rx = x * AutoMap2D.nCellWidth;
                    context.fillStyle = AutoMap2D.mapInfo[y][x].color;
                    context.fillRect(rx, ry, AutoMap2D.nCellWidth, AutoMap2D.nCellHeight);
                }
            }
            for(var y = 0; y < AutoMap2D.mapVirtualInfo.length; y++) {
                for(var x = 0; x < AutoMap2D.mapVirtualInfo[y].length; x++) {
                    var ry = AutoMap2D.mapVirtualInfo[y][x].vy * AutoMap2D.nCellHeight;
                    var rx = AutoMap2D.mapVirtualInfo[y][x].vx * AutoMap2D.nCellWidth;
                    context.globalAlpha = 0.5;
                    if((y + x) % 2 == 0) context.fillStyle = "rgba(128, 0, 0, 128)";
                    else context.fillStyle = "rgba(0, 128, 0, 128)";
                    //context.fillRect(rx, ry, AutoMap2D.mapVirtualInfo[y][x].v_width * AutoMap2D.nCellWidth, AutoMap2D.mapVirtualInfo[y][x].v_height * AutoMap2D.nCellHeight);
                }
            }
        }

        static fillRect(rx, ry, width, height, color) {
            for(var y = 0; y < height; y++) {
                for(var x = 0; x < width; x++) {
                    AutoMap2D.mapInfo[ry + y][rx + x].color = color;
                }
            }
        }

        static lineZigzag(type, rx, ry, tx, ty, color) {
            var hx = Math.floor((rx + tx) / 2);
            var hy = Math.floor((ry + ty) / 2);
            if(type == "H") {
                AutoMap2D.lineTo(rx, ry, hx, ry, color);
                AutoMap2D.lineTo(hx, ry, hx, ty, color);
                AutoMap2D.lineTo(tx, ty, hx, ty, color);
            }
            if(type == "V") {
                AutoMap2D.lineTo(rx, ry, rx, hy, color);
                AutoMap2D.lineTo(rx, hy, tx, hy, color);
                AutoMap2D.lineTo(tx, ty, tx, hy, color);
            }
        }

        static lineRightAngle(type, rx, ry, tx, ty, color) {
            if(type == "H") {
                AutoMap2D.lineTo(rx, ry, tx, ry, color);
                AutoMap2D.lineTo(tx, ty, tx, ry, color);
            }
            if(type == "V") {
                AutoMap2D.lineTo(rx, ry, rx, ty, color);
                AutoMap2D.lineTo(tx, ty, rx, ty, color);
            }
        }

        static lineTo(rx, ry, tx, ty, color) {
            var dx = Math.abs(tx - rx);
            var dy = Math.abs(ty - ry);
            var sx = 1;
            var sy = 1;
            if(rx >= tx) sx = -1;
            if(ry >= ty) sy = -1;
            var err = dx - dy;
            var befx = rx;
            var befy = ry;
            while(true) {
                AutoMap2D.mapInfo[ry][rx].color = color;
                if(rx != befx && ry != befy) {
                    AutoMap2D.mapInfo[befy + sy][befx].color = color;
                }
                befx = rx;
                befy = ry;
                if(rx == tx && ry == ty) break;
                var e2 = 2 * err;
                if(e2 > -dy) {
                    err = err - dy;
                    rx += sx;
                }
                if(e2 < dx) {
                    err = err + dx;
                    ry += sy;
                }
            }
        }

        static fillRectWithFrame(x, y, width, height, color) {
            AutoMap2D.fillRect(x + 1, y + 1, width - 1, height - 1, color);
        }

        static checkRange(x, y, width, height) {
            if(x < 0 || x >= width) return false;
            if(y < 0 || y >= height) return false;
            return true;
        }
    }
   
    return AutoMap2D;
  })();
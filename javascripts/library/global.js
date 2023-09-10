const getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    if(min >= max) return min;
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const shuffle = function(arr) {
    for(var i = 0; i < arr.length; i++) {
        var r = getRandomInt(0, arr.length);
        var tmp = arr[i];
        arr[i] = arr[r];
        arr[r] = tmp;
    }
}

const Array2D = function(w, h, val) {
    var array = Array(w);
    for(var i = 0; i < array.length; i++) {
        array[i] = Array(h).fill(val);
    }
    return array;
}

const checkRange = function(x, y, width, height) {
    if(x < 0 || x >= width) return false;
    if(y < 0 || y >= height) return false;
    return true;
}

const limitFormCheck = function(obj) {
    var min = parseInt(obj.min);
    var max = parseInt(obj.max);
    var val = parseInt(obj.value);
    if(isNaN(val)) {
        obj.value = obj.min;
        return;
    }
    if(val < min) {
        obj.value = obj.min;
    }
    if(val > max) {
        obj.value = obj.max;
    }
}

const GetQueryString = function() {
    var result = {};
    if( 1 < window.location.search.length ) {
        var query = window.location.search.substring( 1 );

        // クエリの区切り記号 (&) で文字列を配列に分割する
        var parameters = query.split( '&' );

        for( var i = 0; i < parameters.length; i++ ) {
            // パラメータ名とパラメータ値に分割する
            var element = parameters[ i ].split( '=' );

            var paramName = decodeURIComponent( element[ 0 ] );
            var paramValue = decodeURIComponent( element[ 1 ] );

            // パラメータ名をキーとして連想配列に追加する
            result[ paramName ] = paramValue;
        }
    }
    return result;
}

// ビジーwaitを使う方法
const sleep = function(waitMsec) {
    var startMsec = new Date();
  
    // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
    while (new Date() - startMsec < waitMsec);
}

const getCSV = function(func, url, sp, new_line, timeout)　{
    if(sp == null) {
        sp = ",";
    }
    if(new_line == null) {
        new_line = "\r\n";
    }
    if(timeout == null) {
        timeout = 10000;
    }
    var result = [];
    var req = new XMLHttpRequest();
    var is_end = false;
    req.ontimeout = function () {
        console.error("The request for " + url + " timed out.");
        func(null);
        is_end = true;
    }
    req.onload = function(){
        if(req.readyState != 4) {
            is_end = true;
            return;
        }
        if(req.status != 200) {
            is_end = true;
            return;
        }
        var str = req.responseText;
		var tmp = str.split(new_line);
        var count = 0;
		for(var i = 0; i < tmp.length; ++i){
            if(tmp[i][0] == null) continue;
            if(tmp[i][0].indexOf("#") === 0) continue;
			result[count] = tmp[i].split(sp);
            count++;
		}
        is_end = true;
        func(result);
    }
    req.open("get", url, true); // アクセスするファイルを指定
    req.timeout = timeout;
    req.send(null); // HTTPリクエストの発行

    return true;
}

const isSmartPhone= function() {
    // UserAgentからのスマホ判定
    if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
        return true;
    } else {
        return false;
    }
}

const direction8 = [{x: -1, y: -1, diagonal: true}, {x: 0, y: -1, diagonal: false}, {x: 1, y: -1, diagonal: true},
                    {x: -1, y:  0, diagonal: false}                               , {x: 1, y:  0, diagonal: false},
                    {x: -1, y:  1, diagonal: true}, {x: 0, y:  1, diagonal: false}, {x: 1, y:  1, diagonal: true},]

const direction4 = [{x: -1, y: 0},
                    {x: 1, y: 0},
                    {x: 0, y: -1},
                    {x: 0, y: 1}];

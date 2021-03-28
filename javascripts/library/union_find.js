class UnionFind {
    constructor(node_size) {
        this.parent = Array(node_size);
        this.height = Array(node_size).fill(1);
        for(var i = 0; i < node_size; ++i){
            this.parent[i] = i;
        }
    }
    Root(x){
        if(this.parent[x] == x){
            return x;
        }else{
            return this.parent[x] = this.Root(this.parent[x]);
        }
    }
    Union(x, y){
        var rx = this.Root(x)
        var ry = this.Root(y);
        if(rx == ry){
            return;
        }
        if(this.height[rx] < this.height[ry]) {
            var t = rx; rx = ry; ry = t;
        }
        this.height[rx] += this.height[ry];
        this.parent[ry] = rx;
    }
    Same(x, y) {
        var rx = this.Root(x);
        var ry = this.Root(y);
        return rx == ry;
    }
    Size(x) {
        return this.height[this.Root(x)];
    }
}
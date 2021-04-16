(function(definition) {
    /* global module, define */
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = definition();
    } else if (typeof define === 'function' && define.amd) {
        define([], definition);
    } else {
        var exports = definition();
        window.Astar = exports.Astar;
    }
})(function() {


    class Graph {

        constructor(...vertices) {

            this.vertices = new Map();
            this.meta = {};
            if (vertices.length)
                this.add(...vertices)
        }

        get size() {
            return this.vertices.size
        }

        add(...vertices) {
            //Add vertices
            vertices.forEach(node => {
                //Register this graph to node
                if (!this.vertices.has(this))
                    node.graphs.set(this, new Map());
                //Register node to this graph
                if (!this.vertices.has(node.id))
                    this.vertices.set(node.id, node)
            });
            return this
        }

        get(id) {
            return this.vertices.get(id) || null
        }

        delete(...vertices) {
            //Delete vertices
            vertices.forEach(node => {
                //Delete this node from its neighbors
                node.neighbors(this).forEach(neighbor => neighbor.graphs.get(this) && neighbor.graphs.get(this).delete(node.id));
                //Delete this graph from node
                node.graphs.delete(this);
                //Delete node from this graph
                this.vertices.delete(node.id)
            });
            return this
        }

        edge(a, b, {ab = 1, ba = 1} = {}) {
            //Check if vertices are on the same graph
            if ((!a.graphs.has(this))||(!b.graphs.has(this)))
                throw new Error("Vertices must be on the same graph");
            //Link or unlink node A to B
            if (isNaN(ab))
                a.graphs.get(this).delete(b.id);
            else
                a.graphs.get(this).set(b.id, ab);
            //Link or unlink node B to A
            if (isNaN(ba))
                b.graphs.get(this).delete(a.id);
            else
                b.graphs.get(this).set(a.id, ba);
            return this
        }

        cost(a, b) {
            return this.adjacent(a, b) ? a.graphs.get(this).get(b.id) : NaN
        }

        adjacent(a, b) {
            return b ? a.graphs.get(this).has(b.id) : false
        }

        connected(a, b, bfs = false) {
            const connectivity = (a.graphs.get(this).__connectivity === b.graphs.get(this).__connectivity);
            //If connectivity check, perform a BFS if needed
            if ((bfs)&&(connectivity)) {
                let found = false;
                const stack = [a], visited = new WeakSet([a]), marker = a.graphs.get(this).__connectivity;
                while (stack.length) {
                    //Get neighbors
                    const node = stack.shift();
                    const neighbors = node.neighbors(this);
                    //Iterate through neighbors to find second node
                    for (let neighbor of neighbors) {
                        //Check if second node
                        if (neighbor.id === b.id) {
                            found = true;
                            break
                        }
                        //Add neighbor if to stack if same connectivity
                        if ((!visited.has(neighbor))&&(neighbor.graphs.get(this).__connectivity === marker)) {
                            stack.push(neighbor);
                            visited.add(neighbor)
                        }
                    }
                }
                return found
            }
            return connectivity
        }

        connect() {
            //Initialization and reset connectivity markers
            let marker = 0;
            const vertices = [...this.vertices.values()];
            vertices.forEach(node => node.graphs.get(this).__connectivity = NaN);

            //Precompute connectivity
            for (let node of vertices) {
                //Pass if already treated
                if (!isNaN(node.graphs.get(this).__connectivity))
                    continue;
                //Start marking
                const stack = [node];
                marker++;
                //Stack processing
                while (stack.length) {
                    //Mark node
                    const cnode = stack.shift();
                    cnode.graphs.get(this).__connectivity = marker;
                    //Check its neighbors
                    cnode.neighbors(this).forEach(neighbor => {
                        if ((isNaN(neighbor.graphs.get(this).__connectivity))&&(stack.indexOf(neighbor) < 0))
                            stack.push(neighbor)
                    })
                }
            }
            return this
        }

        debug() {
            console.log(`${"ID".padEnd(8)} | ${"Neighbors".padEnd(32)} | Data`);
            for (let node of this.vertices.values())
                console.log(`${node.id.toString().padEnd(8)} | ${node.neighbors(this).map(n => n.id).join(", ").padEnd(32)} | ${JSON.stringify(node.data)}`)
        }
    }

    Graph.fromArray = function (array, data = {}) {
        //Order and layers
        const {order = "yx", layers = [{}]} = data;
        //Size of map
        const X = order === "xy" ? array.length : array[0].length;
        const Y = order === "xy" ? array[0].length : array.length;
        //Graphs
        const graphs = [];
        //Accessor (coordinates)
        const at = (x, y) => (order === "xy") ? array[x][y] : array[y][x];

        //Create graphs
        for (let layer of layers) {
            //Create graph
            const options = {...data, ...layer};
            const graph = new Graph();
            graph.meta = {...options, X, Y, torus:options.torus};
            graphs.push(graph);

            //Accessor (id), cost and linker
            const id = (x, y) => Graph.fromArray.id(x, y, graph.meta);
            const cost = options.cost||((a, b) => 1);
            const edge = (a, b) => b ? graph.edge(a, b, {ab:cost(a, b), ba:cost(b, a)}) : null;

            //Build graph
            for (let x = 0; x < X; x++)
                for (let y = 0; y < Y; y++) {
                    //Create node
                    const data = typeof at(x, y) === "object" ? at(x, y) : {v:at(x, y)};
                    const node = graph.add(graphs.length > 1 ? graphs[0].get(x, y) : new Node(id(x, y), {x, y, ...data})).get(id(x, y));
                    //Link direct neighbors
                    edge(node, graph.get(id(x-1, y)));
                    edge(node, graph.get(id(x+1, y)));
                    edge(node, graph.get(id(x, y-1)));
                    edge(node, graph.get(id(x, y+1)))
                }

            //Link diagonals (if enabled)
            if (options.diagonals)
                for (let x = 0; x < X; x++)
                    for (let y = 0; y < Y; y++) {
                        //Check adjacent vertices
                        const node = graph.get(id(x, y));
                        const lx = graph.adjacent(node, graph.get(id(x-1, y))), rx = graph.adjacent(node, graph.get(id(x+1, y)));
                        const oy = graph.adjacent(node, graph.get(id(x, y-1))), uy = graph.adjacent(node, graph.get(id(x, y+1)));
                        //Link strict diagonals neighbors
                        if (options.cutting === null) {
                            if (lx && oy)
                                edge(node, graph.get(id(x-1, y-1)));
                            if (lx && uy)
                                edge(node, graph.get(id(x-1, y+1)));
                            if (rx && oy)
                                edge(node, graph.get(id(x+1, y-1)));
                            if (rx && uy)
                                edge(node, graph.get(id(x+1, y+1)))
                        }
                        //Link loose diagonals neighbors
                        else {
                            if ((lx||oy)||(options.cutting))
                                edge(node, graph.get(id(x-1, y-1)));
                            if ((lx||uy)||(options.cutting))
                                edge(node, graph.get(id(x-1, y+1)));
                            if ((rx||oy)||(options.cutting))
                                edge(node, graph.get(id(x+1, y-1)));
                            if ((rx||uy)||(options.cutting))
                                edge(node, graph.get(id(x+1, y+1)))
                        }
                    }

            //Connectivity computing and id overriding
            graph.connect();
            graph.get = function (x, y) {
                //Handle special cases
                if (arguments.length === 1) {
                    //Id
                    if (typeof arguments[0] === "number") {
                        const id = arguments[0];
                        return this.vertices.get(id)||null
                    }
                    //Node
                    if (typeof arguments[0] === "object") {
                        const node = arguments[0];
                        return this.vertices.get(Graph.fromArray.id(node.data.x, node.data.y, this.meta))||null
                    }
                }
                //Coordinates
                return this.vertices.get(Graph.fromArray.id(x, y, this.meta))||null
            }
        }

        //Return
        return (arguments[1] && ("layers" in arguments[1])) ? graphs : graphs[0]
    };

    Graph.fromArray.id = function (x, y, {X, Y, torus = false}) {
        return torus ? ((y+Y)%Y)*X + (x+X)%X : (x>=0)&&(x<X)&&(y>=0)&&(y<Y) ? y*X + x : null
    };


    class Node {

        constructor(id, data = {}) {
            //Inherit id from data
            if (typeof arguments[0] === "object") {
                data = arguments[0];
                id = data.id
            }

            this.id = id;
            this.graphs = new Map();
            this.data = data;

        }

        neighbors(graph) {
            //If node is not a member of graph, return
            if (!this.graphs.has(graph)) return [];

            //Get neighbors
            const ids = [...this.graphs.get(graph).keys()];

            return ids.map(id => graph.get(id));
        }

    }

    class BinaryHeap {

        constructor(score = node => Number(node)) {

            this.nodes = [];
            this.score = score
        }

        get size() {
            return this.nodes.length
        }

        add(...nodes) {
            //Add nodes and bubble up
            nodes.forEach(node => {
                this.nodes.push(node);
                this.bubble(this.size - 1)
            });
            return this
        }

        delete(...nodes) {
            //Delete nodes and rebuild heap
            nodes.forEach(node => {
                //Search index of given node
                const i = this.nodes.indexOf(node);
                //Check if node is found
                if (~i) {
                    //Pop last node
                    const end = this.nodes.pop();
                    //Update position
                    if (i < this.size)
                        this.update(this.nodes[i] = end)
                }
            });
            return this
        }

        update(...nodes) {
            //Update nodes
            nodes.forEach(node => {
                //Search index of given node
                const i = this.nodes.indexOf(node);
                //Check if node is found, and recompute its position
                if (~i)
                    this.bubble(i).sink(i);
                //If node is not found, add node
                else
                    this.add(node)
            });
            return this
        }

        pop() {
            //Get root
            const root = this.top();
            //Delete root
            this.delete(root);
            return root
        }

        top() {
            return this.nodes[0] || null
        }

        bubble(n) {
            //Bubble up
            while (n > 0) {
                //Compute parent index and score
                const m = Math.floor((n + 1) / 2) - 1;
                const score = this.score(this.nodes[n]);
                //Check if node must bubble up
                //No need to bubble up
                if (score >= this.score(this.nodes[m]))
                    break;
                //Swap parent with current node
                [this.nodes[n], this.nodes[m]] = [this.nodes[m], this.nodes[n]];
                n = m
            }
            return this
        }

        sink(n) {
            //Sink down
            while (1) {
                //Compute child indexes and score
                let m = null;
                const r = (n+1)*2, l = r-1;
                const score = this.score(this.nodes[n]);
                //Check if node must sink down
                //Left child test
                if ((l < this.size)&&(this.score(this.nodes[l]) < score))
                    m = l;
                //Right child test
                if ((r < this.size)&&(this.score(this.nodes[r]) < (m ? this.score(this.nodes[m]) : score)))
                    m = r;
                //No need to sink down
                if (m === null)
                    break;
                //Swap child with current node
                [this.nodes[n], this.nodes[m]] = [this.nodes[m], this.nodes[n]];
                n = m
            }
            return this
        }
    }

    class Initialization {

        constructor(map, options = {}) {

            this.raw = [map, options];
            this.graphs = [];
            if (Array.isArray(map)) this.graphs = [Graph.fromArray.call(null, map, options)].flat()
        }

        route(start, goal, heuristic = Heuristics.manhattan, layer = 0) {
            const open = new BinaryHeap(node => node.estimated);
            const scores = new Map();
            const graph = this.graphs[layer];
            const heuristics = {estimate:heuristic, options:graph.meta};

            //Initialization
            start = graph.get(start);
            goal = graph.get(goal);
            open.add({node:start, estimated:0});
            scores.set(start, {score:0, from:null});

            //Compute path
            if (graph.connected(start, goal)) {
                while (open.size) {
                    //Current node
                    const current = open.pop().node;

                    if (current === goal)
                        break;

                    //Retrieve neighbors
                    current.neighbors(graph).map(node => {
                        //Compute new score
                        const score = (scores.has(current) ? scores.get(current).score : 0) + graph.cost(current, node);

                        //Save new score if it's better, and add it to discovered vertices
                        if (score < (scores.has(node) ? scores.get(node).score : Infinity)) {
                            scores.set(node, {score, from:current});
                            open.update({node, estimated:(score + heuristics.estimate(node, goal, heuristic.options))})
                        }
                    });

                    //Set current node as evaluated
                    open.delete(current)
                }
            }

            //Check if path found
            let route = [];
            if (scores.has(goal)) {
                //Rebuild path
                let current = goal;
                route.push(goal);
                while ((current = scores.get(current).from) !== null)
                    route.push(current);
                route = route.reverse()
            }
            return route;
        }
    }

    const Heuristics = {};

    Heuristics.manhattan = function (a, b, {multiplier = 1, torus = false, X = 0, Y = 0} = {}) {
        //Classic version
        let dx = Math.abs(b.data.x - a.data.x);
        let dy = Math.abs(b.data.y - a.data.y);

        //Torus version
        if (torus) {
            dx = Math.min(dx, b.data.x - a.data.x + X, a.data.x - b.data.x + X);
            dy = Math.min(dy, b.data.y - a.data.y + Y, a.data.y - b.data.y + Y)
        }

        return multiplier*(dx + dy)
    };

    Heuristics.diagonal = function (a, b, {multiplier = 1, diagonalMultiplier = 1.4, torus = false, X = 0, Y = 0} = {}) {
        //Classic version
        let dx = Math.abs(b.data.x - a.data.x);
        let dy = Math.abs(b.data.y - a.data.y);

        //Torus version
        if (torus) {
            dx = Math.min(dx, b.data.x - a.data.x + X, a.data.x - b.data.x + X);
            dy = Math.min(dy, b.data.y - a.data.y + Y, a.data.y - b.data.y + Y)
        }

        return multiplier*(dx + dy) + (diagonalMultiplier - 2*multiplier) * Math.min(dx, dy)
    };

    Heuristics.euclidian = function (a, b, {multiplier = 1, torus = false, X = 0, Y = 0} = {}) {
        //Classic version
        let dx = Math.abs(b.data.x - a.data.x);
        let dy = Math.abs(b.data.y - a.data.y);

        //Torus version
        if (torus) {
            dx = Math.min(dx, b.data.x - a.data.x + X, a.data.x - b.data.x + X);
            dy = Math.min(dy, b.data.y - a.data.y + Y, a.data.y - b.data.y + Y)
        }

        return multiplier * Math.sqrt(dx*dx + dy*dy)
    };

    return {Graph, Node, BinaryHeap, Initialization, Heuristics};

});


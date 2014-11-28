var NS = {};

$(function(){

  // set up SVG for D3
  var width  = 700,
      height = 300,
      colors = d3.scale.category10();

  var svg = d3.select('.network')
      .append('svg')
      .attr('width', '100%')
      .attr('height', height);

  // set up initial nodes and links
  //  - nodes are known by 'id', not by index in array.
  //  - reflexive edges are indicated on the node (as a bold black circle).
  //  - links are always source < target; edge directions are set by 'left' and 'right'.
  var nodes = [
    {id: 0, reflexive: true, visited: false, pre: null},
    {id: 1, reflexive: true, visited: false, pre: null},
    {id: 2, reflexive: true, visited: false, pre: null}
  ],
  lastNodeId = 2,
  links = [
    {source: nodes[0], target: nodes[1], left: false, right: true, capacity: Math.round(9 * Math.random()), flow: 0 }, //TODO: 0 to 9 inclusive?
    {source: nodes[1], target: nodes[2], left: false, right: true, capacity: Math.round(9 * Math.random()), flow: 0 }
  ];
  flow_path = [];
  source = nodes[0];
  sink = nodes[2];
  complete = false;
  max_flow = 0;

  // init D3 force layout
  var force = d3.layout.force()
      .nodes(nodes)
      .links(links)
      .size([width, height])
      .linkDistance(150)
      .charge(-500)
      .on('tick', tick)

  // define arrow markers for graph links
  svg.append('svg:defs').append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#000');

  svg.append('svg:defs').append('svg:marker')
      .attr('id', 'start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 4)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M10,-5L0,0L10,5')
      .attr('fill', '#000');

  // line displayed when dragging new nodes
  var drag_line = svg.append('svg:path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');

  // handles to link and node element groups
  var path = svg.append('svg:g').selectAll('path'),
      circle = svg.append('svg:g').selectAll('g');

  // mouse event vars
  var selected_node = null,
      selected_link = null,
      mousedown_link = null,
      mousedown_node = null,
      mouseup_node = null;

  function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
  }

  // update force layout (called automatically each iteration)
  function tick() {
    // draw directed edges with proper padding from node centers
    path.attr('d', function(d) {
      var deltaX = d.target.x - d.source.x,
          deltaY = d.target.y - d.source.y,
          dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
          normX = deltaX / dist,
          normY = deltaY / dist,
          sourcePadding = d.left ? 17 : 12,
          targetPadding = d.right ? 17 : 12,
          sourceX = d.source.x + (sourcePadding * normX),
          sourceY = d.source.y + (sourcePadding * normY),
          targetX = d.target.x - (targetPadding * normX),
          targetY = d.target.y - (targetPadding * normY);
      return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    });

    circle.attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  }

  // update graph (called when needed)
  function restart() {
    // path (link) group
    path = path.data(links);

    // update existing links
    path.classed('selected', function(d) { return d === selected_link; })
      .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
      .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
      .style('stroke', function(d) { return d.flow > 0 ? colors(4) : colors(1); });


    // add new links
    path.enter().append('svg:path')
      .attr('class', 'link')
      .classed('selected', function(d) { return d === selected_link; })
      .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
      .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
      .on('mousedown', function(d) {
        if(d3.event.ctrlKey) return;

        // select link
        mousedown_link = d;
        if(mousedown_link === selected_link) selected_link = null;
        else selected_link = mousedown_link;
        selected_node = null;
        restart();
      });

    // remove old links
    path.exit().remove();


    // circle (node) group
    // NB: the function arg is crucial here! nodes are known by id, not by index!
    circle = circle.data(nodes, function(d) { return d.id; });

    // update existing nodes (reflexive & selected visual states)
    circle.selectAll('circle')
      .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
      .classed('reflexive', function(d) { return d.reflexive; });

    // add new nodes
    var g = circle.enter().append('svg:g');

    g.append('svg:circle')
      .attr('class', 'node')
      .attr('r', 12)
      .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
      .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
      .classed('reflexive', function(d) { return d.reflexive; })
      .on('mouseover', function(d) {
        if(!mousedown_node || d === mousedown_node) return;
        // enlarge target node
        d3.select(this).attr('transform', 'scale(1.1)');
      })
      .on('mouseout', function(d) {
        if(!mousedown_node || d === mousedown_node) return;
        // unenlarge target node
        d3.select(this).attr('transform', '');
      })
      .on('mousedown', function(d) {
        if(d3.event.ctrlKey) return;

        // select node
        mousedown_node = d;
        if(mousedown_node === selected_node) selected_node = null;
        else selected_node = mousedown_node;
        selected_link = null;

        // reposition drag line
        drag_line
          .style('marker-end', 'url(#end-arrow)')
          .classed('hidden', false)
          .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

        restart();
      })
      .on('mouseup', function(d) {
        if(!mousedown_node) return;

        // needed by FF
        drag_line
          .classed('hidden', true)
          .style('marker-end', '');

        // check for drag-to-self
        mouseup_node = d;
        if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

        // unenlarge target node
        d3.select(this).attr('transform', '');

        // add link to graph (update if exists)
        source = mousedown_node;
        target = mouseup_node;
        var link;
        link = links.filter(function(l) {
          return (l.source === source && l.target === target);
        })[0];

        if(!link) {
          link = {source: source, target: target, left: false, right: true, flow: 0, capacity: Math.round(10 * Math.random())};
          links.push(link);
        }

        // select new link
        selected_link = link;
        selected_node = null;
        restart();
      });

    // show node IDs
    g.append('svg:text')
        .attr('x', 0)
        .attr('y', 4)
        .attr('class', 'id')
        .text(function(d) { return d.id; });

    // remove old nodes
    circle.exit().remove();

    // set the graph in motion
    force.start();
  }

  function mousedown() {
    // prevent I-bar on drag
    //d3.event.preventDefault();
    
    // because :active only works in WebKit?
    svg.classed('active', true);

    if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;

    // insert new node at point
    var point = d3.mouse(this),
        node = {id: ++lastNodeId, reflexive: false, visited: false, pre: null};
    node.x = point[0];
    node.y = point[1];
    nodes.push(node);

    restart();
  }

  function mousemove() {
    if(!mousedown_node) return;

    // update drag line
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

    restart();
  }

  function mouseup() {
    if(mousedown_node) {
      // hide drag line
      drag_line
        .classed('hidden', true)
        .style('marker-end', '');
    }

    // because :active only works in WebKit?
    svg.classed('active', false);

    // clear mouse event vars
    resetMouseVars();
  }

  function spliceLinksForNode(node) {
    var toSplice = links.filter(function(l) {
      return (l.source === node || l.target === node);
    });
    toSplice.map(function(l) {
      links.splice(links.indexOf(l), 1);
    });
  }

  // only respond once per keydown
  var lastKeyDown = -1;

  function keydown() {
    d3.event.preventDefault();

    if(lastKeyDown !== -1) return;
    lastKeyDown = d3.event.keyCode;

    // ctrl
    if(d3.event.keyCode === 17) {
      circle.call(force.drag);
      svg.classed('ctrl', true);
    }

    if(!selected_node && !selected_link) return;
    switch(d3.event.keyCode) {
      case 8: // backspace
      case 46: // delete
        if(selected_node) {
          nodes.splice(nodes.indexOf(selected_node), 1);
          spliceLinksForNode(selected_node);
        } else if(selected_link) {
          links.splice(links.indexOf(selected_link), 1);
        }
        selected_link = null;
        selected_node = null;
        restart();
        break;
      // When numeric values are entered, set the capacity
      case 48: // 0
        if(selected_link) {
          selected_link.capacity = 0;
        }
        restart();
        break;
      case 49: // 1
        if(selected_link) {
          selected_link.capacity = 1;
        }
        restart();
        break;
      case 50: // 2
        if(selected_link) {
          selected_link.capacity = 2;
        }
        restart();
        break;
      case 51: // 3
        if(selected_link) {
          selected_link.capacity = 3;
        }
        restart();
        break;
      case 52: // 4
        if(selected_link) {
          selected_link.capacity = 4;
        }
        restart();
        break;
      case 53: // 5
        if(selected_link) {
          selected_link.capacity = 5;
        }
        restart();
        break;
      case 54: // 6
        if(selected_link) {
          selected_link.capacity = 6;
        }
        restart();
        break;
        case 55: // 7
        if(selected_link) {
          selected_link.capacity = 7;
        }
        restart();
        break;
      case 56: // 8
        if(selected_link) {
          selected_link.capacity = 8;
        }
        restart();
        break;
      case 57: // 9
        if(selected_link) {
          selected_link.capacity = 9;
        }
        restart();
        break;
    }
  }

  function keyup() {
    lastKeyDown = -1;

    // ctrl
    if(d3.event.keyCode === 17) {
      circle
        .on('mousedown.drag', null)
        .on('touchstart.drag', null);
      svg.classed('ctrl', false);
    }
  }

  function bfs() {
    nodes.forEach(function(node) {
      node.visited = false;
      node.pre = null;
    });

    source.visited = true;
    Q = [source];
    done = false;

    while(Q.length > 0 && done == false) {
      u = Q.shift();
      outgoing_links = [];
      links.forEach(function(link) {
        if (link.source == u && link.capacity > 0 && link.target.visited == false) {
          v = link.target;
          v.visited = true;
          v.pre = u;
          Q.push(v);
          if (v == sink) {
            done = true;
          }
        }
      });
    }
    
    done = false;
    min_capacity = 999;
    head = sink;
    while(done == false && head != null) {
      tail = head.pre;
      links.forEach(function(link) {
        if (link.source == tail && link.target == head) {
          flow_path.push(link);
          
          if (link.capacity < min_capacity) {
            min_capacity = link.capacity;
          }
        }
      });
      head = tail;
      if (head == source) {
        done = true;
      }
    }

    flow_path.forEach(incrementFlowDecrementCapacity);

    function incrementFlowDecrementCapacity(link) {
      link.flow += min_capacity;
      link.capacity -= min_capacity;
    }

    if (min_capacity != 999) max_flow += min_capacity;
    flow_path.reverse();
    return min_capacity;
  }

  function start() {
    sources = [];
    sinks = [];
    nodes.forEach(function(node) {
      isSource = true;
      isSink = true;
      links.forEach(function(link) {
        if (link.source == node) isSink = false;
        if (link.target == node) isSource = false;
      });
      if (isSource) sources.push(node);
      else if (isSink) sinks.push(node);
    });

    if (sources.length != 1) {
      //TODO: multiple sources
      alert("There can only be exactly one source node");
    } else {
      source = sources[0];
    }

    if (sinks.length != 1) {
      //TODO multiple sinks
      alert("There can only be exactly one sink node");
    } else {
      sink = sinks[0];
    }

    bfs();
    restart();

    setTimeout(step, 500);
  }

  function step() {
    if (complete == false)
    { 
      if (flow_path.length == 0) {
        alert("Done! Maximum flow is " + max_flow);
        complete = true;
      }

      flow_path.forEach(function(link) {
        link.flow = 0;
      });
      flow_path = [];
      restart();

      sleep(500);

      bfs();
      restart();

      setTimeout(step, 500);
    }
  }

  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  // app starts here
  $('button').click(function() { 
    start(); 
  });

  svg.on('mousedown', mousedown)
    .on('mousemove', mousemove)
    .on('mouseup', mouseup);
  d3.select(window)
    .on('keydown', keydown)
    .on('keyup', keyup);
  restart();
})
room.registerElement('doomlevel', {
  wad: 'DOOM.WAD',
  map: 'E1M1',

  createChildren: function() {
    console.log('I am a doom map, rawr!');
    var scene = this.objects['3d'];
    while (!(scene instanceof THREE.Scene)) {
      scene = scene.parent;
    }
    var loader = new JSWad();
    loader.load(this.wad).then((wad) => {
      this.wadfile = wad;
      var map = wad.getMap(this.map);
      var geodata = map.getGeometry();
      var sectormap = map.getSectorMap();
      console.log('got some geo', geodata, sectormap, map);

      var geo = new THREE.BufferGeometry();
      geo.setIndex(new THREE.Uint32BufferAttribute(geodata.faces, 1));
      geo.addAttribute('position', new THREE.BufferAttribute(geodata.vertices, 3));
      geo.computeVertexNormals();

      var mat = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI/2, 0, 0));
      geo.applyMatrix(mat);

      var mesh = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({color: 0xffffff, envMap: scene.background, side: THREE.DoubleSide, roughness: 0.8}));
      this.objects['3d'].add(mesh);

      // make the floors/ceilings

      var floorverts = [],
          floorfaces = [],
          ceilingverts = [],
          ceilingfaces = [],
          floorvertoffset = 0,
          ceilingvertoffset = 0;

      for (var i = 0; i < sectormap.length; i++) {
        var linedefs = sectormap[i];
        var sectorverts = [];
        var edges = {};
        // Sort vertices into a sequential path around the perimeter
        for (var j = 0; j < linedefs.length; j++) {
          var linedef = linedefs[j];
          var side1 = map.getSidedef(linedef.side1),
              side2 = map.getSidedef(linedef.side2);

          var v1, v2;
          if (side1.sector == i) {
            v1 = map.getVertex(linedef.v1);
            v2 = map.getVertex(linedef.v2);
            edges[linedef.v1] = linedef.v2;
          } else if (side2 && side2.sector == i) {
            v1 = map.getVertex(linedef.v2);
            v2 = map.getVertex(linedef.v1);
            edges[linedef.v2] = linedef.v1;
          }
    
          sectorverts.push(v1, v2);
        }
        var vertexlist = [];
        var keys = Object.keys(edges);
        var first = keys[0];
        var current = first;
        // FIXME - some sectors don't seem to form closed loops (or my algorithm is shit).  Limit to 100 then bail - for now.
  var f = 0;
        do {
          vertexlist.push(map.getVertex(current));
          current = edges[current];
  console.log(' - check', current, first);
  f++;
        } while (current != first && f < 100);
        console.log(i, vertexlist, edges, linedefs);

        var sector = map.getSector(i);

        var shape = new THREE.Shape(vertexlist);
        var sectorfaces = THREE.ShapeUtils.triangulate(vertexlist, []);
        console.log(shape, sectorfaces);
        for (var j = 0; j < vertexlist.length; j++) {
          floorverts.push(vertexlist[j].x, vertexlist[j].y, sector.floorheight);
          ceilingverts.push(vertexlist[j].x, vertexlist[j].y, sector.ceilingheight);
        }
        for (var j = 0; j < sectorfaces.length; j++) {
          if (sector.floorpic != '-') floorfaces.push(sectorfaces[j][0] + floorvertoffset, sectorfaces[j][1] + floorvertoffset, sectorfaces[j][2] + floorvertoffset);
          if (sector.ceilingpic != '-') ceilingfaces.push(sectorfaces[j][0] + ceilingvertoffset, sectorfaces[j][1] + ceilingvertoffset, sectorfaces[j][2] + ceilingvertoffset);
        }

        if (sector.floorpic != '-') floorvertoffset += vertexlist.length;
        if (sector.ceilingpic != '-') ceilingvertoffset += vertexlist.length;
      }

      var floorgeo = new THREE.BufferGeometry();
      floorgeo.setIndex(new THREE.Uint16BufferAttribute(new Uint16Array(floorfaces), 1));
      floorgeo.addAttribute('position', new THREE.BufferAttribute(new Float32Array(floorverts), 3));
      floorgeo.computeVertexNormals();
      floorgeo.applyMatrix(mat);
      var floormesh = new THREE.Mesh(floorgeo, new THREE.MeshPhysicalMaterial({color: 0xff0000, envMap: scene.background, side: THREE.DoubleSide, roughness: 0.8}));
      this.objects['3d'].add(floormesh);

      var ceilinggeo = new THREE.BufferGeometry();
      ceilinggeo.setIndex(new THREE.Uint16BufferAttribute(new Uint16Array(ceilingfaces), 1));
      ceilinggeo.addAttribute('position', new THREE.BufferAttribute(new Float32Array(ceilingverts), 3));
      ceilinggeo.computeVertexNormals();
      ceilinggeo.applyMatrix(mat);
      var ceilingmesh = new THREE.Mesh(ceilinggeo, new THREE.MeshPhongMaterial({color: 0xff0000, side: THREE.DoubleSide}));
      this.objects['3d'].add(ceilingmesh);

      var textures = map.getTextures();

    });

    this.light = room.createObject('light', {
      col: V(1,.8,0),
      pos: V(player.pos),
      light_shadow: true,
      light_intensity: 6,
      light_range: 10
    });
  },
  onupdate: function() {
    if (this.light) {
      this.light.pos = V(player.pos.x, parseFloat(player.pos.y) + 1.2, player.pos.z);
    }
  }
});

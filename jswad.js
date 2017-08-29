class JSWad {
  constructor(fname) {
    this.lumps = [];
    this.lumpmap = {};
    this.palettes = [];
    this.iwad = false;
    this.ids = {
      IWAD: 0x44415749,
      PWAD: 0x44415750
    };
    if (fname) {
      this.load(fname);
    }
  }

  load(fname) {
    return new Promise((resolve, reject) => {
      fetch(fname).then((response) => {
        console.log('Loading wad:', fname);
        response.arrayBuffer().then((data) => {
          this.parse(data).then(resolve, reject);
        });
      });
    });
  }

  getMap(mapname) {
    var map = new JSWad.Map(this, mapname);
    return map;
  }

  getPatches() {
    if (!this.patches) {
      this.patches = [];

      var pnameslump = this.getLump('PNAMES');
      var pnames = new JSWad.PatchList();
      pnames.read(pnameslump.bytes);

      var palette = this.getPalette(0);

      for (var j = 0; j < pnames.numpatches; j++) {
        var patchname = pnames.patchnames[j];
        var patchlump = this.getLump(patchname);
        //console.log('get patch', j, tex.patches[j].patch, patchname, patchlump);
        if (patchlump) {
          var patchimage = new JSWad.PatchImage();
          patchimage.read(patchlump.bytes);
          var canvas = patchimage.getCanvas(palette);
          //document.body.appendChild(canvas);

          this.patches[j] = patchimage;
        } else {
          console.error('ERROR - failed to load patch', patchname);
        }
      }
    }
    return this.patches;
  }

  getTextures() {
    var pnames = this.lumps[this.lumpmap['PNAMES']],
        texture1 = this.getTextureList('TEXTURE1'),
        texture2 = this.getTextureList('TEXTURE2');


    console.log('textures!', texture1, texture2, pnames); 

    texture1.loadTextures(this);
    //texture2.loadTextures(this);

  }

  getTextureList(lumpname) {
    var texlump = this.lumps[this.lumpmap[lumpname]];
    var texlist = new JSWad.TextureList();
    texlist.read(texlump.bytes);
    return texlist;
  }

  getLump(lumpname) {
    return this.lumps[this.lumpmap[lumpname]];
  }

  getPalette(paletteid) {
    if (!this.palettes[paletteid]) {
      var palette = new JSWad.Palette();
      palette.read(this.getLump('PLAYPAL').bytes, 0);
      this.palettes[paletteid] = palette;
    }
    return this.palettes[paletteid];
  }


  parse(data, offset) {
    return new Promise((resolve, reject) => {
      if (!offset) offset = 0;
      console.log('Parsing...', data);
      var wadtype = JSWad.readUint32(data, offset);
      if (wadtype == this.ids.IWAD) {
        this.iwad = true;
      }

      var numlumps = JSWad.readUint32(data, offset + 4);
      var lumpoffsets = JSWad.readUint32(data, offset + 8);

      if (offset + lumpoffsets + (numlumps * 16) > data.length) {
        console.error("WAD.LoadFromData Error: Invalid lump info chunk.");
        return;
      }
      for (var i = 0; i < numlumps; i++) {
        var lump = new JSWad.Lump();
        var idx = offset + lumpoffsets + (i * 16);
        
        lump.read(data, 
                  JSWad.readUint32(data, idx),
                  JSWad.readUint32(data, idx + 4),
                  JSWad.readString(data, idx + 8, 8),
                  offset);
        //this.lumps[lump.name] = lump;
        this.lumps.push(lump);
        this.lumpmap[lump.name] = this.lumps.length-1; // FIXME - many lumps use non-unique names, so we're clobbering indices here
      }
      console.log('Done!', this);
      resolve(this);
    });
  }
  static readInt8(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Int8Array(data, offset, 1);
    return arr[0];
  }
  static readUint8(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint8Array(data, offset, 1);
    return arr[0];
  }
  static readUint8Array(data, offset, count) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint8Array(data, offset, count);
    return arr;
  }
  static readInt16(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Int16Array(data, offset, 1);
    return arr[0];
  }
  static readUint16(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint16Array(data, offset, 1);
    return arr[0];
  }
  static readUint16Array(data, offset, count) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint16Array(data, offset, count);
    return arr;
  }
  static readInt32(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Int32Array(data, offset, 1);
    return arr[0];
  }
  static readUint32(data, offset) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint32Array(data, offset, 1);
    return arr[0];
  }
  static readInt32Array(data, offset, count) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Int32Array(data, offset, count);
    return arr;
  }
  static readUint32Array(data, offset, count) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    var arr = new Uint32Array(data, offset, count);
    return arr;
  }
  static readString(data, offset, length) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    if (!length) length = data.byteSize;
    var arr = new Uint8Array(data, offset),
        str = '';
    for (var i = 0; i < length; i++) {
      var chr = arr[i];
      if (chr === 0) break;
      str += String.fromCharCode(chr);
    }
    return str;
  }
  static readStringArray(data, offset, length, count) {
    if (!(data instanceof ArrayBuffer)) {
      offset += data.byteOffset;
      data = data.buffer;
    }

    if (!count) return [];

    if (!length) length = data.byteSize / count;
    var arr = new Uint8Array(data, offset),
        strs = [];
    for (var i = 0; i < count; i++) {
      var str = '';
      var offset = i * length;
      for (var j = 0; j < length && offset + j < arr.length; j++) {
        var chr = arr[offset + j];
        if (chr === 0) break;
        str += String.fromCharCode(chr);
      }
      strs.push(str);
    }
    return strs;
  }
}
JSWad.Lump = class {
  constructor() {
    this.name = '';
    this.pos = 0;
    this.len = 0;
    this.bytes = false;
  }
  read(data, pos, len, name, offset) {
    if (!offset) offset = 0;

    this.name = name;
    this.pos = pos;
    this.len = len;
    this.bytes = new Uint8Array(data, offset + pos, len);
  }
}

JSWad.Map = class {
  constructor(wad, name) {
    this.things = [];
    this.linedefs = [];
    this.sidedefs = [];
    this.vertexes = [];
    this.segs = [];
    this.ssectors = [];
    this.nodes = [];
    this.sectors = [];

    this.wad = wad;

    this.classmap = {
      'THINGS': JSWad.Thing,
      'LINEDEFS': JSWad.Linedef,
      'SIDEDEFS': JSWad.Sidedef,
      'VERTEXES': JSWad.Vertex,
      'SEGS': JSWad.Segment,
      'SSECTORS': JSWad.Subsector,
      'NODES': JSWad.Node,
      'SECTORS': JSWad.Sector,
    };

    if (wad && name) {
      this.load(wad, name);
    }
  }

  load(wad, name) {
    var index = wad.lumpmap[name];
    var lumps = wad.lumps;
    console.log('load that map', name);

    this.readLump(this.things, lumps[index + 1], 'THINGS');
    this.readLump(this.linedefs, lumps[index + 2], 'LINEDEFS');
    this.readLump(this.sidedefs, lumps[index + 3], 'SIDEDEFS');
    this.readLump(this.vertexes, lumps[index + 4], 'VERTEXES');
    this.readLump(this.segs, lumps[index + 5], 'SEGS');
    this.readLump(this.ssectors, lumps[index + 6], 'SSECTORS');
    this.readLump(this.nodes, lumps[index + 7], 'NODES');
    this.readLump(this.sectors, lumps[index + 8], 'SECTORS');

    // TODO - read optional REJECT and BLOCKMAP lumps
  }

  readLump(list, lump, name) {
    if (this.classmap[name]) {
      var index = 0;
      var data = lump.bytes;
      while (index < data.length) {
        var obj = new this.classmap[name];
        obj.read(data, index);
        list.push(obj);
        index += obj.getByteSize();
      }
    }
  }

  getGeometry() {
    var vertices = [],
        faces = [];

    var sectormap = [];
    for (var i = 0; i < this.linedefs.length; i++) {
      var linedef = this.linedefs[i];

      var v1 = this.getVertex(linedef.v1),
          v2 = this.getVertex(linedef.v2);

      var side1 = this.getSidedef(linedef.side1),
          side2 = this.getSidedef(linedef.side2);

      var vertexOffset = vertices.length / 3,
          faceOffset = faces.length / 3;

      if (side1 && side2) {
        // Both sides are visible, we need to compare adjacent sectors to determine which faces to draw
        var sector1 = this.getSector(side1.sector),
            sector2 = this.getSector(side2.sector);

        if (!sectormap[side1.sector]) sectormap[side1.sector] = [];
        if (!sectormap[side2.sector]) sectormap[side2.sector] = [];
        sectormap[side1.sector].push(linedef);
        sectormap[side2.sector].push(linedef);

        var hasTop = false,
            hasMiddle = false,
            hasBottom = false;

        vertices.push(v1.x, v1.y, sector1.floorheight);
        vertices.push(v1.x, v1.y, sector1.ceilingheight);
        vertices.push(v2.x, v2.y, sector1.ceilingheight);
        vertices.push(v2.x, v2.y, sector1.floorheight);

        if (side1.midtexture != '-') {
          // counterlockwise
          faces.push(vertexOffset, vertexOffset + 2, vertexOffset + 1);
          faces.push(vertexOffset, vertexOffset + 3, vertexOffset + 2);
        }
        if (side2.midtexture != '-') {
          // clockwise
          faces.push(vertexOffset, vertexOffset + 1, vertexOffset + 2);
          faces.push(vertexOffset, vertexOffset + 2, vertexOffset + 3);
        }

        if (sector1.floorheight != sector2.floorheight) {
          hasBottom = true;
          vertices.push(v1.x, v1.y, sector2.floorheight);
          vertices.push(v2.x, v2.y, sector2.floorheight);

          if (side1.bottomtexture != '-') {
            // counterlockwise
            faces.push(vertexOffset + 4, vertexOffset, vertexOffset + 3);
            faces.push(vertexOffset + 4, vertexOffset + 3, vertexOffset + 5);
          }
          if (side2.bottomtexture != '-') {
            // clockwise
            faces.push(vertexOffset + 4, vertexOffset + 3, vertexOffset);
            faces.push(vertexOffset + 4, vertexOffset + 5, vertexOffset + 3);
          }
        }
        if (sector1.ceilingheight != sector2.ceilingheight) {
          hasTop = true;
          vertices.push(v1.x, v1.y, sector2.ceilingheight);
          vertices.push(v2.x, v2.y, sector2.ceilingheight);
          var bottomOffset = (hasBottom ? 2 : 0);

          if (side1.toptexture != '-') {
            // counterlockwise
            faces.push(vertexOffset + 1, vertexOffset + bottomOffset + 4, vertexOffset + bottomOffset + 5);
            faces.push(vertexOffset + 1, vertexOffset + bottomOffset + 5, vertexOffset + 2);
          }
          if (side2.toptexture != '-') {
            // clockwise
            faces.push(vertexOffset + 1, vertexOffset + bottomOffset + 4, vertexOffset + bottomOffset + 5);
            faces.push(vertexOffset + 1, vertexOffset + bottomOffset + 5, vertexOffset + 2);
          }
        }
      } else if (side1) {
        // Only one side is visible, so we only need to generate the middle section
        var sector = this.getSector(side1.sector);
        vertices.push(v1.x, v1.y, sector.floorheight);
        vertices.push(v1.x, v1.y, sector.ceilingheight);
        vertices.push(v2.x, v2.y, sector.ceilingheight);
        vertices.push(v2.x, v2.y, sector.floorheight);

        if (!sectormap[side1.sector]) sectormap[side1.sector] = [];
        sectormap[side1.sector].push(linedef);

        if (side1.midtexture != '-') {
          faces.push(vertexOffset, vertexOffset + 2, vertexOffset + 1);
          faces.push(vertexOffset, vertexOffset + 3, vertexOffset + 2);
        }
      }
    }

    // Store sector map so we can serve it up when asked
    this.sectormap = sectormap;

    return {
      vertices: new Float32Array(vertices),
      faces: new Int32Array(faces)
    };
  }

  getSectorMap() {
    return this.sectormap;
  }

  triangulate(vertices) {
  }
  
  isPointInTriangle(point, v1, v2, v3) {
  }

  getEntity(list, id) { return (id < 0 || id > list.length ? null : list[id]); }
  getLinedef(id) { return this.getEntity(this.linedefs, id); }
  getSidedef(id) { return this.getEntity(this.sidedefs, id); }
  getSector(id) { return this.getEntity(this.sectors, id); }
  getVertex(id) { return this.getEntity(this.vertexes, id); }
  getNode(id) { return this.getEntity(this.nodes, id); }
}
JSWad.Thing = class {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.type = 0;
    this.options = 0;
  }
  read(data, pos) {
    this.x = JSWad.readInt16(data, pos);
    this.y = JSWad.readInt16(data, pos + 2);
    this.angle = JSWad.readInt16(data, pos + 4);
    this.type = JSWad.readInt16(data, pos + 6);
    this.options = JSWad.readInt16(data, pos + 8);
  }
  getByteSize() { return 10; }
}
JSWad.Linedef = class {
  constructor() {
    this.v1 = 0;
    this.v2 = 0;
    this.flags = 0;
    this.special = 0;
    this.tag = 0;
    this.side1 = 0;
    this.side2 = 0;
  }
  read(data, pos) {
    this.v1 = JSWad.readUint16(data, pos);
    this.v2 = JSWad.readUint16(data, pos + 2);
    this.flags = JSWad.readInt16(data, pos + 4);
    this.special = JSWad.readInt16(data, pos + 6);
    this.tag = JSWad.readInt16(data, pos + 8);
    this.side1 = JSWad.readUint16(data, pos + 10);
    this.side2 = JSWad.readUint16(data, pos + 12);
  }
  getByteSize() { return 14; }
}
JSWad.Linedef.flags = {
  BLOCKPLAYER: 0x1,
  BLOCKMONSTERS: 0x2,
  TWOSIDED: 0x4,
}

JSWad.Sidedef = class {
  constructor() {
    this.textureoffset = 0;
    this.rowoffset = 0;
    this.toptexture = '-';
    this.bottomtexture = '-';
    this.midtexture = '-';
    this.sector = 0;
  }
  read(data, pos) {
    this.textureoffset = JSWad.readInt16(data, pos);
    this.rowoffset = JSWad.readInt16(data, pos + 2);
    this.toptexture = JSWad.readString(data, pos + 4, 8);
    this.bottomtexture = JSWad.readString(data, pos + 12, 8);
    this.midtexture = JSWad.readString(data, pos + 20, 8);
    this.sector = JSWad.readInt16(data, pos + 28);
  }
  getByteSize() { return 30; }
}
JSWad.Segment = class {
  constructor() {
    this.v1 = 0;
    this.v2 = 0;
    this.angle = 0;
    this.linedef = 0;
    this.side = 0;
    this.offset = 0;
  }
  read(data, pos) {
    this.v1 = JSWad.readUint16(data, pos);
    this.v2 = JSWad.readUint16(data, pos + 2);
    this.angle = JSWad.readInt16(data, pos + 4);
    this.linedef = JSWad.readUint16(data, pos + 6);
    this.side = JSWad.readInt16(data, pos + 8);
    this.offset = JSWad.readInt16(data, pos + 10);
  }
  getByteSize() { return 12; }
}
JSWad.Subsector = class {
  constructor() {
    this.numsegs = 0;
    this.firstseg = 0;
  }
  read(data, pos) {
    this.numsegs = JSWad.readUint16(data, pos);
    this.firstseg = JSWad.readInt16(data, pos + 2);
  }
  getByteSize() {
    return 4;
  }
}

JSWad.Node = class {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.boundingBoxLeft = new JSWad.BoundingBox();
    this.boundingBoxRight = new JSWad.BoundingBox();
    this.leftChild = 0;
    this.rightChild = 0;
  }
  read(data, pos) {
    this.x = JSWad.readInt16(data, pos);
    this.y = JSWad.readInt16(data, pos + 2);
    this.dx = JSWad.readInt16(data, pos + 4);
    this.dy = JSWad.readInt16(data, pos + 6);
    this.boundingBoxLeft.read(data, pos + 8);
    this.boundingBoxRight.read(data, pos + 16);
    this.leftChild = JSWad.readUint16(data, pos + 24);
    this.rightChild = JSWad.readUint16(data, pos + 26);
  }
  getByteSize() {
    return 28;
  }
}
JSWad.Vertex = class {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
  read(data, pos) {
    this.x = JSWad.readInt16(data, pos);
    this.y = JSWad.readInt16(data, pos + 2);
  }
  getByteSize() {
    return 4;
  }
}
JSWad.BoundingBox = class {
  constructor() {
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
  }
  read(data, pos) {
    this.x1 = JSWad.readInt16(data, pos);
    this.y1 = JSWad.readInt16(data, pos + 2);
    this.x2 = JSWad.readInt16(data, pos + 4);
    this.y2 = JSWad.readInt16(data, pos + 6);
  }
  getByteSize() {
    return 8;
  }
}
JSWad.Sector = class {
  constructor() {
    this.floorheight = 0;
    this.ceilingheight = 0;
    this.floorpic = '-';
    this.ceilingpic = '-';
    this.lightlevel = 0;
    this.special = 0;
    this.tag = 0;
  }
  read(data, pos) {
    this.floorheight = JSWad.readInt16(data, pos);
    this.ceilingheight = JSWad.readInt16(data, pos + 2);
    this.floorpic = JSWad.readString(data, pos + 4, 8);
    this.ceilingpic = JSWad.readString(data, pos + 12, 8);
    this.lightlevel = JSWad.readInt16(data, pos + 20);
    this.special = JSWad.readInt16(data, pos + 22);
    this.tag = JSWad.readInt16(data, pos + 24);
  }
  getByteSize() { return 26; }
}
JSWad.TextureList = class {
  constructor() {
    this.numtextures = 0;
    this.textureoffsets = [];
    this.textures = [];
  }
  read(data) {
    this.numtextures = JSWad.readInt32(data, 0);
    this.textureoffsets = JSWad.readInt32Array(data, 4, this.numtextures);

    for (var i = 0; i < this.numtextures; i++) {
      var tex = new JSWad.Texture();
      tex.read(data, this.textureoffsets[i]);
      this.textures.push(tex);
    }
  }
  loadTextures(wad) {
    var patches = wad.getPatches();
    for (var i = 0; i < this.textures.length; i++) {
      var tex = this.textures[i];
      console.log('- load texture:', tex);

      tex.loadTexture(patches);
    }
  }
}
JSWad.Texture = class {
  constructor() {
    this.name = '';
    this.flags = 0;
    this.scalex = 8;
    this.scaley = 8;
    this.width = 0;
    this.height = 0;
    this.columndirectory = null;
    this.patchcount = 0;
    this.patches = null;
  }
  read(data, pos) {
    this.name = JSWad.readString(data, pos, 8);
    this.flags = JSWad.readUint16(data, pos + 8);
    this.scalex = JSWad.readUint8(data, pos + 10);
    this.scaley = JSWad.readUint8(data, pos + 11);
    this.width = JSWad.readUint16(data, pos + 12);
    this.height = JSWad.readUint16(data, pos + 14);
    this.columndirectory = JSWad.readUint8Array(data, pos + 16, 4);
    this.patchcount = JSWad.readUint16(data, pos + 20);
    this.patches = [];
    for (var i = 0; i < this.patchcount; i++) {
      var patch = new JSWad.Patch();
      patch.read(data, pos + 22 + i * 10);
      this.patches.push(patch);
    }
  }
  loadTexture(patches) {
    if (!this.canvas) {
      var canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.width;
      var ctx = canvas.getContext('2d');

      for (var j = 0; j < this.patchcount; j++) {
        var patchimage = patches[this.patches[j].patch];
        var patch = this.patches[j]; 
        if (patchimage) {
          var patchcanvas = patchimage.getCanvas();
          ctx.drawImage(patchcanvas, patch.originx, patch.originy);
        }
      }

      var div = document.createElement('div');
      div.className = 'texture';
      div.innerHTML = '<h5>' + this.name + '</h5>';
      div.appendChild(canvas);
      document.body.appendChild(div);
      this.canvas = canvas;
    }
    return this.canvas;
  }
}
JSWad.PatchList = class {
  constructor() {
    this.numpatches = 0;
    this.patchnames = null;
  }
  read(data, pos) {
    if (!pos) pos = 0;
    this.numpatches = JSWad.readUint32(data, pos);
    this.patchnames = JSWad.readStringArray(data, pos + 4, 8, this.numpatches);
  }
}
JSWad.Patch = class {
  constructor() {
    this.originx = 0;
    this.originy = 0;
    this.patch = 0;
    this.stepdir = 0;
    this.colormap = 0;
  }
  read(data, pos) {
    this.originx = JSWad.readInt16(data, pos);
    this.originy = JSWad.readInt16(data, pos + 2);
    this.patch = JSWad.readInt16(data, pos + 4);
    this.stepdir = JSWad.readInt16(data, pos + 6);
    this.colormap = JSWad.readInt16(data, pos + 8);
  }
}
JSWad.PatchImage = class {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.offsetx = 0;
    this.offsety = 0;

    this.columnpointers = null;
    this.columns = null;

    this.canvas = false;
  }
  read(data, pos) {
    if (!pos) pos = 0;
    this.width = JSWad.readUint16(data, pos);
    this.height = JSWad.readUint16(data, pos, 2);
    this.offsetx = JSWad.readInt16(data, pos, 4);
    this.offsety = JSWad.readInt16(data, pos, 6);
    this.columnpointers = JSWad.readUint32Array(data, pos + 8, this.width);

    this.columns = [];
    for (var x = 0; x < this.width; x++) {
      var column = new JSWad.PatchImageColumn();
      column.read(data, this.columnpointers[x]);
      this.columns.push(column);
    }
  }
  getCanvas(palette) {
    if (!this.canvas) {
      var canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      var ctx = canvas.getContext('2d');
      var colors = new Uint8ClampedArray(this.width * this.height * 4);
      for (var x = 0; x < this.width; x++) {
        var column = this.columns[x];
        for (var y = column.offset; y < column.pixelcount; y++) {
          var color = palette.getColor(column.pixels[y]);
          var offset = ((y * this.width) + x) * 4;
          colors[offset] = color[0];
          colors[offset+1] = color[1];
          colors[offset+2] = color[2];
          colors[offset+3] = 255;
        }
      }
      var imagedata = new ImageData(colors, this.width, this.height);
      ctx.putImageData(imagedata, 0, 0);
      this.canvas = canvas;
    }

    return this.canvas;
  }
}
JSWad.PatchImageColumn = class {
  constructor() {
    this.offset = 0;
    this.pixelcount = 0;
    this.pixels = null;
  }
  read(data, pos) {
    this.offset = JSWad.readUint8(data, pos);
    this.pixelcount = JSWad.readUint8(data, pos + 1);
    this.pixels = JSWad.readUint8Array(data, pos + 3, this.pixelcount);
  }
}
JSWad.Palette = class {
  constructor() {
    this.colors = [];
  }
  read(data, pos) {
    if (!pos) pos = 0;
    var rgbdata = JSWad.readUint8Array(data, pos, 768);
    for (var i = 0; i < 256; i++) {
      var idx = i * 3;
      this.colors[i] = rgbdata.slice(idx, idx + 3);
    }
  }
  getColor(idx) {
    return this.colors[idx];
  }
}

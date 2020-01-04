import * as WadJS from './wadjs/src/wad.js';
window.WadJS = WadJS;

elation.elements.define('doom.client', class extends elation.elements.janus.viewer {
  init() {
    super.init();
    this.defineAttributes({
      wadsrc: { type: 'string', default: 'DOOMSW.WAD' },
      musicpath: { type: 'string' },
      map: { type: 'string' }
    });
/*
    elation.janusweb.init(args).then((client) => {
    });
*/
  }
  create() {
    var args = this.getClientArgs();
    args.uiconfig = 'https://baicoianu.com/~bai/doom/ui/doomui.json';
    args.container = this;
    let callback = (client) => {
      elation.events.add(client.janusweb.currentroom, 'room_load_complete', () => {
        this.level = client.janusweb.currentroom.jsobjects['doomlevel'];
        this.wad = this.level.wadfile;
        this.player = this.level.doomplayer;
        elation.events.fire({target: this, type: 'load'});
      });
    };
    if (this.autostart && this.autostart != 'false') {
      elation.janusweb.init(args).then(callback);
    } else {
      // FIXME add play button
      let start = () => {
        elation.janusweb.init(args).then(callback);
        document.body.removeEventListener('click', start);
      }
      document.body.addEventListener('click', start);
    }
  }
  getRoomURL() {
    return 'data:text/html,' + encodeURIComponent('<title>WebVR Doom | E1M1</title><fireboxroom><assets><AssetScript src="https://baicoianu.com/~bai/doom/doomlevel.js" /></assets><room require="linesegments" pos="10.65 0 36.1" shadows="true" pbr="false" ambient=".8 .8 .8" walk_speed="8" run_speed="10" xdir="-1 0 0" zdir="0 0 -1" defaultlights="false"><DoomLevel js_id="doomlevel" wad="' + this.wadsrc + '"' + (this.pwad ? ' pwad="' + this.pwad + '"' : '') + (this.musicpath ? ' musicpath="' + this.musicpath + '"' : '') + ' map="' + (this.map || 'E1M1') + '" scale=".0328 .0328 .0328" fog="true" fog_col="0 0 0" fog_density=".05"/><object id="sphere" pos="0 -9999 0" rotate_deg_per_sec="1" /></room></fireboxroom>');
  }
});

elation.elements.define('doom.base', class extends elation.elements.base {
  getWad() {
    if (!this.wad) {
      if (!this.loading) {
        //elation.events.add(this.client, 'load', () => { this.refresh() });
        this.loading = true;
      }
      var el = this.parentNode;
      while (el) {
        if (el instanceof elation.elements.doom.client) {
          this.client = el;
          this.wad = el.wad;

          break;
        }
        el = el.parentNode;
      }
    }
    if (!this.wad) {
      let client = document.querySelector('doom-client');
      if (client) {
        this.client = client;
        this.wad = client.wad;
      }
    }
    return this.wad;
  }
});
elation.elements.define('doom.automap', class extends elation.elements.base {
  init() {
    super.init();
console.log('a new automap appears');
    this.defineAttributes({
      map:         { type: 'object', default: null },
      mapscale:    { type: 'float', default: 1/4 },
      mapoffset:   { type: 'array', default: [0,0] },
      playerangle: { type: 'float', default: 0 },
      background:  { type: 'boolean', default: false },
      dragging:     { type: 'boolean', default: false },
      visible:     { type: 'boolean', default: true }
    });
  }

  create() {
    this.canvas = document.createElement('canvas');
    this.mapcanvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.mapcanvas.width = window.innerWidth;
    this.mapcanvas.height = window.innerHeight;

    this.canvas.width = 320;
    this.canvas.height = 240;

    // TODO - we're just doing this as a 2d cnvas overlay right now, but we should be attaching it to some player-held object
    this.appendChild(this.canvas);
/*
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = 0;
    this.canvas.style.left = 0;
    this.canvas.style.zIndex = 1000;
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.opacity = .4;
*/

    //this.texture = new THREE.Texture(this.canvas);
    var texture = false;
/*
    var obj = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 1.5), new THREE.MeshBasicMaterial({map: this.texture, color: 0xff0000, side: THREE.DoubleSide}));
console.log('new automap', obj);
    this.objects['3d'].add(obj);
*/
    // FIXME - should bind these at a lower level
    this.handleMousewheel = this.handleMousewheel.bind(this);
    this.handleMousedown = this.handleMousedown.bind(this);
    this.handleMousemove = this.handleMousemove.bind(this);
    this.handleMouseup = this.handleMouseup.bind(this);

    this.addEventListener('mousewheel', this.handleMousewheel);
    this.addEventListener('mousedown', this.handleMousedown);
    if (this.map) this.drawMap();
  }
  setLevel(level) {
    this.level = level;
    this.map = level.mapdata;

    this.drawMap();
  }
  updateBoundingBox() {
    var verts = this.map.vertexes;
    var bbox = {
      min: [Infinity, Infinity],
      max: [-Infinity, -Infinity]
    };
    for (var i = 0; i < verts.length; i++) {
      var v = verts[i];
      if (v.x < bbox.min[0]) bbox.min[0] = v.x;
      if (v.x > bbox.max[0]) bbox.max[0] = v.x;
      if (v.y < bbox.min[1]) bbox.min[1] = v.y;
      if (v.y > bbox.max[1]) bbox.max[1] = v.y;
    }

    this.boundingBox = bbox;
  }
  drawMap() {
    if (!this.mapcanvas) return;
    var ctx = this.mapcanvas.getContext('2d'),
        map = this.map;
    if (!this.map) return;

    var linedefs = map.linedefs;

    this.updateBoundingBox();
    var bbox = this.boundingBox;

    var mapscale = this.mapscale,
        offset = [-bbox.min[0], -bbox.max[1]];

    this.mapcanvas.width = bbox.max[0] - bbox.min[0];
    this.mapcanvas.height = bbox.max[1] - bbox.min[1];

    for (var i = 0; i < linedefs.length; i++) {
      var linedef = linedefs[i],
          v1 = map.getVertex(linedef.v1),
          v2 = map.getVertex(linedef.v2);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.strokeStyle = this.getLinedefColor(linedef);

      ctx.moveTo((v1.x + offset[0]) * mapscale, -(v1.y + offset[1]) * mapscale);
      ctx.lineTo((v2.x + offset[0]) * mapscale, -(v2.y + offset[1]) * mapscale);

      ctx.stroke();
      ctx.closePath();
    }
    if (this.texture) {
      this.texture.needsUpdate = true;
    }

  }
  getLinedefColor(linedef) {
    var color = '#fb0101'; // default red, solid one-sided wall
    var side1 = this.map.getSidedef(linedef.side1),
        side2 = this.map.getSidedef(linedef.side2),
        sector1 = (side1 ? this.map.getSector(side1.sector) : null),
        sector2 = (side2 ? this.map.getSector(side2.sector) : null);

    
    if (linedef.side2 != 65535 && !(linedef.flags & 0x0020)) {
      //if (linedef.type) {
      //if (sector1.floorheight == sector2.ceilingheight || sector2.floorheight == sector2.ceilingheight || sector1.tag || sector2.tag) {
      if (sector1.floorheight == sector2.floorheight && sector1.ceilingheight != sector2.ceilingheight) {
        color = '#ffff00'; // door (yellow)
      } else if (sector1.floorheight == sector2.floorheight) {
        color = '#cccccc'; // two-sided wall (brown)
      } else {
        color = '#aa8262'; // two-sided wall (brown)
      }
    }
    return color;
  }
  updateMap() {
    if (!this.visible || !this.canvas) return;
    var ctx = this.canvas.getContext('2d');

    //this.canvas.width = this.parentNode.offsetWidth - 16;
    //this.canvas.height = this.parentNode.offsetHeight - 16;
    this.canvas.width = this.offsetWidth;
    this.canvas.height = this.offsetHeight

    if (this.lastscale != this.mapscale) {
      this.drawMap();
    }
    this.lastscale = this.mapscale;

    if (this.background) {
      ctx.fillStyle = this.background;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    var playerx = (player.pos.x / this.level.scale.x - this.boundingBox.min[0]) * this.mapscale,
        playery = (player.pos.z / this.level.scale.z + this.boundingBox.max[1]) * this.mapscale;
    var offset = [(this.canvas.width) / 2 - playerx, (this.canvas.height) / 2 - playery];

    ctx.save();
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.translate(-this.mapoffset[0], -this.mapoffset[1]);
    ctx.rotate(-1 * (this.playerangle - Math.PI / 2));
    ctx.translate(-playerx, -playery);

    ctx.drawImage(this.mapcanvas, 0, 0);
    ctx.strokeStyle = '#00ff00';

    ctx.beginPath();
    ctx.moveTo(playerx, playery - 3);
    ctx.lineTo(playerx, playery + 3);
    ctx.moveTo(playerx - 3, playery);
    ctx.lineTo(playerx + 3, playery);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
  setPlayerAngle(angle) {
    this.playerangle = angle;
    this.refresh();
  }
  zoomIn() {
    this.mapscale *= 1.1;
    this.refresh();
  }
  zoomOut() {
    this.mapscale *= 0.9;
    this.refresh();
  }
  toggleVisibility() {
    this.visible = !this.visible;
    this.canvas.style.display = (this.visible ? 'block' : 'none');
  }
  render() {
    this.updateMap();
  }
  handleMousewheel(ev) {
    var amount = -ev.deltaY / 2000;
    this.mapscale *= 1 + amount;
    this.refresh();
    ev.preventDefault();
    ev.stopPropagation();
  }
  handleMousedown(ev) {
    this.dragstart = [this.mapoffset[0] + ev.clientX, this.mapoffset[1] + ev.clientY];
    this.dragging = true;
    ev.preventDefault();
    ev.stopPropagation();
    window.addEventListener('mousemove', this.handleMousemove);
    window.addEventListener('mouseup', this.handleMouseup);
  }
  handleMousemove(ev) {
    if (this.dragging) {
      this.mapoffset[0] = this.dragstart[0] - ev.clientX;
      this.mapoffset[1] = this.dragstart[1] - ev.clientY;
      this.refresh();
    }
  }
  handleMouseup(ev) {
    this.dragging = false;
    ev.stopPropagation();
    window.removeEventListener('mousemove', this.handleMousemove);
    window.removeEventListener('mouseup', this.handleMouseup);
  }
});
elation.elements.define('doom.hud', class extends elation.elements.doom.base {
  init() {
    super.init();
    this.defineAttributes({
      wadfile:     { type: 'object', default: null },
      health:      { type: 'integer', default: 100, set: this.refresh },
      invulnerable:{ type: 'boolean', default: false, set: this.refresh },
      armor:       { type: 'integer', default: 0, set: this.refresh },
      ammo:        { type: 'array', default: [50,0,0,0] },
      capacities:  { type: 'array', default: [200,50,50,300] },
      arms:        { type: 'array', default: [0,0,1,0,0,0,0,0] },
      keys:        { type: 'array', default: [0,0,0] },
      weapon:      { type: 'integer', default: 2, set: this.refresh },
      ammotypes:   { type: 'object', default: { 2: 0, 3: 1, 4: 0, 5: 2, 6: 3, 7: 3 } },
      scale:       { type: 'float', default: 3 }
    });
  }
  create() {
    this.canvas = document.createElement('canvas');
    this.getImages();
  }
  setWad(wadfile) {
    this.wad = wadfile;
/*
    this.wadfile = wadfile;
    this.images = this.wadfile.getHUDImages();
    this.updateFace();

    this.canvas.width = this.images.stbar.width;
    this.canvas.height = this.images.stbar.height;
    this.appendChild(this.canvas);

*/
    this.refresh();
  }
  getImages() {
    if (!this.images) {
      var wad = this.getWad();
      
      if (wad) {
        this.images = wad.getHUDImages();

        this.updateFace();

        if (this.images.stbar) {
          this.canvas.width = this.images.stbar.width;
          this.canvas.height = this.images.stbar.height;
          this.appendChild(this.canvas);
        }

        this.refresh();
      }
    }
    return this.images;
  }
  render() {
    var images = this.getImages();
    if (images && images.stbar) {
      var ctx = this.canvas.getContext('2d');
      
      this.canvas.width = images.stbar.width * this.scale;
      this.canvas.height = images.stbar.height * this.scale;

      ctx.drawImage(images.stbar.canvas, 0, 0, this.canvas.width, this.canvas.height);

      this.drawFace(ctx);
      this.drawHealth(ctx);
      this.drawAmmo(ctx);
      this.drawKeys(ctx);
      this.drawArmor(ctx);
    }
  }
  drawFace(ctx) {
    var image = this.images[this.faceid];
    ctx.drawImage(image.canvas, 148 * this.scale, 2 * this.scale, image.width * this.scale, image.height * this.scale);
  }
  updateFace() {
    var lookdir = 1;
    var rand = Math.random();
    if (rand < 0.2) lookdir = 0;
    else if (rand > 0.8) lookdir = 2;

    if (this.invulnerable) {
      this.faceid = 'stfgod0';
    } else if (this.health <= 0) {
      this.faceid = 'stfdead0';
    } else {
      var healthidx = 0;
      if (this.health < 10) healthidx = 4;
      else if (this.health < 25) healthidx = 3;
      else if (this.health < 50) healthidx = 2;
      else if (this.health < 75) healthidx = 1;

      this.faceid = 'stfst' + healthidx + lookdir;
    }

    this.refresh();

    setTimeout(() => this.updateFace(), 200 * Math.random() + 500);
  }
  padToLength(str, len) {
    if (typeof str != 'string') str = str.toString();
    while (str.length < len) str = ' ' + str;
    return str;
  }
  drawHealth(ctx) {
    this.drawString(ctx, this.padToLength(this.health, 3) + '%', 50, 10);
  }
  drawAmmo(ctx) {
    this.drawString(ctx, this.padToLength(this.ammo[this.ammotypes[this.weapon]], 3), 4, 10);

    var starms = this.images.starms;
    ctx.drawImage(starms.canvas, 104 * this.scale, 0, starms.width * this.scale, starms.height * this.scale);

    this.drawNumber(ctx, 2, 1, 111, 4, this.arms[2]);
    this.drawNumber(ctx, 3, 1, 123, 4, this.arms[3]);
    this.drawNumber(ctx, 4, 1, 135, 4, this.arms[4]);
    this.drawNumber(ctx, 5, 1, 111, 14, this.arms[5]);
    this.drawNumber(ctx, 6, 1, 123, 14, this.arms[6]);
    this.drawNumber(ctx, 7, 1, 135, 14, this.arms[7]);

    this.drawNumber(ctx, this.ammo[0], 3, 275, 4, true);
    this.drawNumber(ctx, this.capacities[0], 3, 300, 4, true);
    this.drawNumber(ctx, this.ammo[1], 3, 275, 10, true);
    this.drawNumber(ctx, this.capacities[1], 3, 300, 10, true);
    this.drawNumber(ctx, this.ammo[2], 3, 275, 16, true);
    this.drawNumber(ctx, this.capacities[2], 3, 300, 16, true);
    this.drawNumber(ctx, this.ammo[3], 3, 275, 22, true);
    this.drawNumber(ctx, this.capacities[3], 3, 300, 22, true);
  }
  drawKeys(ctx) {
    if (this.keys[0] == 1) {
      this.drawKey(ctx, 'stkeys0', 0);
    } else if (this.keys[0] == 2) {
      this.drawKey(ctx, 'stkeys3', 0);
    }
    if (this.keys[1] == 1) {
      this.drawKey(ctx, 'stkeys1', 1);
    } else if (this.keys[1] == 2) {
      this.drawKey(ctx, 'stkeys4', 1);
    }
    if (this.keys[2] == 1) {
      this.drawKey(ctx, 'stkeys2', 2);
    } else if (this.keys[2] == 2) {
      this.drawKey(ctx, 'stkeys5', 2);
    }
  }
  drawKey(ctx, key, slot) {
    var image = this.images[key];
    ctx.drawImage(image.canvas, 239 * this.scale, ((6.5 - image.height / 2) + slot * 10) * this.scale, image.width * this.scale, image.height * this.scale);
  }
  drawArmor(ctx) {
    this.drawString(ctx, this.padToLength(this.armor, 3) + '%', 180, 10);
  }
  drawString(ctx, str, x, y) {
    var staticmap = {
      '%': 'sttprcnt',
      '-': 'sttminus'
    };
    for (var i = 0; i < str.length; i++) {
      var offset = x + (i * 13);
      var chr = str[i];
      if (chr == ' ') {
        continue;
      } else {
        var imageid = staticmap[chr] || ('sttnum' + chr);
        var image = this.images[imageid];
        if (image) {
          ctx.drawImage(image.canvas, offset * this.scale, (y - image.height / 2) * this.scale, image.width * this.scale, image.height * this.scale);
        }
      }
    }
  }
  drawNumber(ctx, num, pad, x, y, enabled) {
    var imgbase = (enabled ? 'stysnum' : 'stgnum');
    var str = this.padToLength(num, pad);
    for (var i = 0; i < str.length; i++) {
      var offset = x + (i * 4);
      var chr = str[i];
      if (chr == ' ') {
        continue;
      } else {
        var image = this.images[imgbase + chr];
        if (image) {
          ctx.drawImage(image.canvas, offset * this.scale, y * this.scale, image.width * this.scale, image.height * this.scale);
        }
      }
    }
  }
});
elation.elements.define('doom.assets.textures', class extends elation.elements.doom.base {
  init() {
    super.init();
    this.defineAttributes({
      wad: { type: 'object' }
    });
  }
  onelementconnect() {
console.log('textures connected', this, this.wad);
    if (!this.texturelist) {
      var wad = this.getWad();
console.log('has wads', wad);
      var textures = wad.getTextures();
console.log('has textures', textures);

      var texturelist = [];
      for (var k in textures) {
        texturelist.push(textures[k]);
      }
      this.texturelist = elation.elements.create('ui-grid', {
        append: this,
        items: texturelist,
        itemcomponent: 'doom.assets.texture'
      });
    }
  }
});
elation.elements.define('doom.assets.texture', class extends elation.elements.ui.item {
  init() {
    super.init();
    this.defineAttributes({
      value: { type: 'object' },
      canvas: { type: 'object' },
      name: { type: 'string' },
    });
  }
  create() {
//console.log('hello create', this.value, this);
    this.panel = elation.elements.create('ui.flexpanel', {
      append: this,
      vertical: true
    });
    this.header = elation.elements.create('ui.text', {
      tag: 'h5',
      append: this.panel,
      text: this.value.name,
      noflex: true
    });
//console.log(this.container, this.args.canvas);
    this.canvaspanel = elation.elements.create('ui.flexpanel', {
      append: this.panel,
      class: 'texture_canvas'
    });
    if (this.value.canvas) {
      this.canvaspanel.appendChild(this.value.canvas);
    }
  }
  render() {
//console.log('hello render', this.value, this);
    super.render();
  }
});
elation.elements.define('doom.assets.patches', class extends elation.elements.doom.base {
  init() {
    super.init();
    this.defineAttributes({
      wad: { type: 'object' }
    });
  }
  onelementconnect() {
    if (!this.texturelist) {
      var wad = this.getWad();
      var textures = wad.getPatches();
  console.log(textures);

      var texturelist = [];
      for (var k in textures) {
        var tex = textures[k];
        tex.title = tex.name + ' (' + tex.width + 'x' + tex.height + ')';
        texturelist.push(tex);
      }
      this.texturelist = elation.elements.create('ui-grid', {
        append: this,
        items: texturelist,
        itemcomponent: 'doom.assets.patch',
      });
    }
  }
});
elation.elements.define('doom.assets.patch', class extends elation.elements.ui.item {
  init() {
    super.init();
    this.defineAttributes({
      value: { type: 'object' },
      canvas: { type: 'object' },
      name: { type: 'string' },
    });
  }
  create() {
    this.panel = elation.elements.create('ui.flexpanel', {
      append: this,
      vertical: true
    });
    this.header = elation.elements.create('ui.text', {
      tag: 'h5',
      append: this.panel,
      text: this.value.id,
      noflex: true
    });
//console.log(this.container, this.args.canvas);
    this.canvaspanel = elation.elements.create('ui.flexpanel', {
      append: this.panel,
      class: 'texture_canvas'
    });
    if (this.value.canvas) {
      this.canvaspanel.appendChild(this.value.canvas);
    }
  }
});
elation.elements.define('doom.assets.sprites', class extends elation.elements.doom.base {
  init() {
    super.init();
    this.defineAttributes({
      wad: { type: 'object' }
    });
console.log('make sprite viewer');
  }
  onelementconnect() {
    if (!this.assetgrid) {
  console.log('make sprite viewer REALLY');
      var wad = this.getWad();
      var assets = wad.getSprites();
  console.log(assets);

      var assetlist = [];
      for (var k in assets) {
        assetlist.push(assets[k]);
      }
      this.assetgrid = elation.elements.create('ui-grid', {
        append: this,
        items: assetlist,
        itemcomponent: 'doom.assets.sprite'
      });
    }
  }
});
elation.elements.define('doom.assets.sprite', class extends elation.elements.base {
  init() {
    super.init();
    this.defineAttributes({
      value: { type: 'object' },
      canvas: { type: 'object' },
      name: { type: 'string' },
    });
  }
  create() {
    this.panel = elation.elements.create('ui.flexpanel', {
      append: this,
      vertical: true
    });
    this.header = elation.elements.create('ui.text', {
      tag: 'h5',
      append: this.panel,
      text: this.value.id,
      noflex: true
    });
//console.log(this.container, this.args.canvas);
    this.canvaspanel = elation.elements.create('ui.flexpanel', {
      append: this.panel,
      class: 'texture_canvas'
    });
    if (this.value.canvas) {
      this.canvaspanel.appendChild(this.value.canvas);
    }
    this.setActiveFrame('A');
    elation.events.add(this, 'mouseover', () => this.startAnimation());
    elation.events.add(this, 'mouseout', () => this.stopAnimation());
  }
  setActiveFrame(frameid) {
    this.value.setActiveFrame(frameid);
    //var angles = Object.keys(this.sprite.frames[frameid]);
    //this.angleselector.setItems(angles);
  }
  setActiveAngle(angle) {
    this.value.setActiveAngle(angle);
  }
  startAnimation() {
    if (this.animtimer) {
      this.stopAnimation();
    }
    this.animtimer = setInterval(() => {
      if (this.value.frameHasAngles(this.value.frame)) {
        this.value.angle = (this.value.angle % 8) + 1;
      } else {
        this.value.angle = 0;
      }
      this.value.animate(); 
    }, 200);
  }
  stopAnimation() {
    if (this.animtimer) {
      clearInterval(this.animtimer);
      this.animtimer = false;
    }
  }
});
/*
elation.component.add('doom.assets.sprite2', function() {
  init() {
    this.sprite = this.args;
    this.addclass('texture');
    this.header = elation.ui.label({
      tag: 'h5',
      append: this,
      label: this.sprite.id
    });
    var frames = Object.keys(this.sprite.frames);
    this.frameselector = elation.ui.select({
      append: this,
      items: frames,
      events: {
        change: this.handleFrameChange.bind(this)
      }
    });
    this.angleselector = elation.ui.select({
      append: this,
      items: [],
      events: {
        change: this.handleAngleChange.bind(this)
      }

    });
    elation.events.add(this, 'ui_list_item_unselect', elation.bind(this, this.stopAnimation));
    this.setActiveFrame(frames[0]);
//console.log(this.container, this.sprite.canvas);
    var canvascontainer = elation.ui.content({
      classname: 'canvas_container',
      append: this,
      content: this.sprite.canvas
    });
  }
  this.handleFrameChange = function(ev) {
console.log('boing', ev);
    this.setActiveFrame(ev.target.value);
  }
  this.handleAngleChange = function(ev) {
console.log('boing', ev);
    this.setActiveAngle(ev.target.value);
  }
  this.setActiveFrame = function(frameid) {
    this.sprite.setActiveFrame(frameid);
    var angles = Object.keys(this.sprite.frames[frameid]);
    this.angleselector.setItems(angles);
  }
  this.setActiveAngle = function(angle) {
    this.sprite.setActiveAngle(angle);
  }
  this.startAnimation = function() {
    if (this.animtimer) {
      this.stopAnimation();
    }
    this.animtimer = setInterval(() => this.sprite.animate(), 200);
console.log('START!', this.animtimer, this);
  }
  this.stopAnimation = function() {
    if (this.animtimer) {
      clearInterval(this.animtimer);
      this.animtimer = false;
    }
  }
}, elation.ui.panel_vertical);
*/
elation.elements.define('doom.assets.sounds', class extends elation.elements.doom.base {
  init() {
    super.init();
    this.defineAttributes({
      wad: { type: 'object' }
    });
  }
  onelementconnect() {
    if (!this.assetgrid) {
      var wad = this.getWad();
      var assets = wad.getSounds();

      var assetlist = [];
      for (var k in assets) {
        assets[k].name = k;
        assetlist.push(assets[k]);
      }
      this.assetgrid = elation.elements.create('ui-grid', {
        append: this,
        items: assetlist,
        itemcomponent: 'doom.assets.sound'
      });
    }
  }
});
elation.elements.define('doom.assets.sound', class extends elation.elements.ui.item {
  init() {
    super.init();
    this.defineAttributes({
      value: { type: 'object' },
      canvas: { type: 'object' },
      name: { type: 'string' },
    });
  }
  create() {
    this.panel = elation.elements.create('ui.flexpanel', {
      append: this,
      vertical: true
    });
    this.header = elation.elements.create('ui.text', {
      append: this.panel,
      text: this.value.name,
      noflex: true
    });
    this.canvaspanel = elation.elements.create('ui.flexpanel', {
      append: this.panel,
      class: 'texture_canvas'
    });
    this.button = elation.elements.create('ui.button', {
      append: this.canvaspanel,
      label: '▶',
      title: 'Play'
    });
    this.button.addEventListener('click', (ev) => this.play());
/*
    this.buttonreverse = elation.elements.create('ui.button', {
      append: this.canvaspanel,
      label: '◀',
      title: 'Reverse'
    });
    this.buttonreverse.addEventListener('click', (ev) => this.play(true));
*/
  }
  play(reverse=false) {
    let audio = player.ears.children[0].context;
    var buffer = audio.createBuffer(1, this.value.samples, this.value.rate);
    if (reverse) {
      buffer.getChannelData(0).set([...this.value.pcm].reverse());
    } else {
      buffer.getChannelData(0).set(this.value.pcm);
    }

    var source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(audio.destination);
    source.start(0);
  }
});
elation.elements.define('doom-assets-button', class extends elation.elements.base {
  create() {
    let button = elation.elements.create('ui.button', {
      append: this,
      label: 'View Assets'
    });
    button.addEventListener('click', () => this.showViewer());
  }
  showViewer() {
    if (!this.viewer) {
      this.viewer = elation.elements.create('doom-assets-viewer', {
        append: document.body
      });
    } else {
      this.viewer.show();
    }
  }
});
elation.elements.define('doom-assets-viewer', class extends elation.elements.base {
  create() {
    this.window = elation.elements.create('ui.window', {
      append: this,
      windowtitle: 'Asset Viewer',
      center: true,
      middle: true,
      width: '50vw',
      height: '50vh'
    });
    setTimeout(() => {
      this.window.setcontent(elation.template.get('doom.assets.viewer'));
    }, 1000);
  }
});

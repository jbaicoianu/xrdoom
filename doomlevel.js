room.registerElement('doomlevel', {
  wad: 'DOOM.WAD',
  pwad: '',
  map: 'E1M1',
  musicpath: 'https://spispopd.lol/music/doom/',
  showthings: false,
  thingdefs: {},

  create: function() {
    this.frametime = 0;
    this.lastframe = 0;
/*
    this.light = room.createObject('light', {
      col: V(1,.8,0),
      pos: V(player.pos),
      light_shadow: true,
      light_intensity: 6,
      light_range: 10
    });
*/

    this.initializeThings();

    try {
      this.loader = new WadJS.WadFile();
      this.loader.load(this.wad).then((wad) => {
        this.wadfile = wad;
        if (this.pwad) {
          this.loader.load(this.pwad).then((pwad) => {
            //this.setPWAD(pwad);
            this.loadMap(this.map);
          });
        } else {
          this.loadMap(this.map);
        }
        this.sounds = this.wadfile.getSounds();
        let audio = player.ears.children[0].context;
        for (let k in this.sounds) {
          let sound = this.sounds[k];
          console.log('register room sound', k, sound);
          var buffer = audio.createBuffer(1, sound.samples, sound.rate);
          buffer.getChannelData(0).set(sound.pcm);
          room.loadNewAsset('sound', { id: k, buffer: buffer, rate: this.sounds[k].rate });
        }
      });
    } catch (e) {
      console.log('Doom init failed', e);
    }
    this.doomplayer = this.createObject('doomplayer', {collision_id: 'sphere', collision_scale: V(24)});
  },
  update(dt) {
    this.frametime = performance.now();
    if (this.things && this.frametime >= this.lastframe + 333) {
      for (let i = 0; i < this.things.length; i++) {
        this.things[i].advanceFrame(this.frametime);
      }
      this.lastframe = this.frametime;
    }
  },
  initializeThings: function() {
    // See http://doom.wikia.com/wiki/Thing_types for full details

    // Artifact items
    this.thingdefs[2023] = 'doomthing_Berserk';
    this.thingdefs[2026] = 'doomthing_ComputerMap';
    this.thingdefs[2014] = 'doomthing_HealthPotion';
    this.thingdefs[2024] = 'doomthing_Invisibility';
    this.thingdefs[2022] = 'doomthing_Invulnerability';
    this.thingdefs[2045] = 'doomthing_LightAmplificationVisor';
    this.thingdefs[83]   = 'doomthing_Megasphere';
    this.thingdefs[2013] = 'doomthing_SoulSphere';
    this.thingdefs[2015] = 'doomthing_SpiritualArmor';

    // Powerups
    this.thingdefs[8]    = 'doomthing_Backpack';
    this.thingdefs[2019] = 'doomthing_BlueArmor';
    this.thingdefs[2018] = 'doomthing_GreenArmor';
    this.thingdefs[2012] = 'doomthing_Medikit';
    this.thingdefs[2025] = 'doomthing_RadiationSuit';
    this.thingdefs[2011] = 'doomthing_Stimpack';

    // Weapons
    this.thingdefs[2006] = 'doomthing_BFG9000';
    this.thingdefs[2002] = 'doomthing_Chaingun';
    this.thingdefs[2005] = 'doomthing_Chainsaw';
    this.thingdefs[2004] = 'doomthing_PlasmaRifle';
    this.thingdefs[2003] = 'doomthing_RocketLauncher';
    this.thingdefs[2001] = 'doomthing_Shotgun';
    this.thingdefs[82]   = 'doomthing_SuperShotgun';

    // Ammp
    this.thingdefs[2007] = 'doomthing_AmmoClip';
    this.thingdefs[2048] = 'doomthing_AmmoBox';
    this.thingdefs[2047] = 'doomthing_CellCharge';
    this.thingdefs[17]   = 'doomthing_CellBox';
    this.thingdefs[2010] = 'doomthing_Rocket';
    this.thingdefs[2046] = 'doomthing_RocketBox';
    this.thingdefs[2008] = 'doomthing_Shells';
    this.thingdefs[2049] = 'doomthing_ShellBox';

    // Keys
    this.thingdefs[5]    = 'doomthing_BlueKeycard';
    this.thingdefs[40]   = 'doomthing_BlueSkullKey';
    this.thingdefs[13]   = 'doomthing_RedKeycard';
    this.thingdefs[38]   = 'doomthing_RedSkullKey';
    this.thingdefs[6]    = 'doomthing_YellowKeycard';
    this.thingdefs[39]   = 'doomthing_YellowSkullKey';

    // Monsters
    this.thingdefs[68]   = 'doomthing_Arachnotron';
    this.thingdefs[64]   = 'doomthing_ArchVile';
    this.thingdefs[3003] = 'doomthing_BaronOfHell';
    this.thingdefs[3005] = 'doomthing_Cacodemon';
    this.thingdefs[65]   = 'doomthing_Chaingunner';
    this.thingdefs[72]   = 'doomthing_CommanderKeen';
    this.thingdefs[16]   = 'doomthing_Cyberdemon';
    this.thingdefs[3002] = 'doomthing_Demon';
    this.thingdefs[3004] = 'doomthing_FormerHumanTrooper';
    this.thingdefs[9]    = 'doomthing_FormerHumanSergeant';
    this.thingdefs[69]   = 'doomthing_HellKnight';
    this.thingdefs[3001] = 'doomthing_Imp';
    this.thingdefs[3006] = 'doomthing_LostSoul';
    this.thingdefs[67]   = 'doomthing_Mancubus';
    this.thingdefs[71]   = 'doomthing_PainElemental';
    this.thingdefs[66]   = 'doomthing_Revenant';
    this.thingdefs[58]   = 'doomthing_Spectre';
    this.thingdefs[7]    = 'doomthing_SpiderMastermind';
    this.thingdefs[84]   = 'doomthing_WolfensteinSS';

    // Obstacles
    this.thingdefs[2035] = 'doomthing_Barrel';
    this.thingdefs[70]   = 'doomthing_BurningBarrel';
    this.thingdefs[43]   = 'doomthing_BurntTree';
    this.thingdefs[35]   = 'doomthing_Candelabra';
    this.thingdefs[41]   = 'doomthing_EvilEye';
    this.thingdefs[28]   = 'doomthing_SkullStack';
    this.thingdefs[42]   = 'doomthing_SkullFloat';
    this.thingdefs[2028] = 'doomthing_FloorLamp';
    this.thingdefs[53]   = 'doomthing_HangingLeg';
    this.thingdefs[52]   = 'doomthing_HangingLegs';
    this.thingdefs[78]   = 'doomthing_HangingTorsoBrainRemoved';
    this.thingdefs[75]   = 'doomthing_HangingTorsoLookingDown';
    this.thingdefs[77]   = 'doomthing_HangingTorsoLookingUp';
    this.thingdefs[76]   = 'doomthing_HangingTorsoOpenSkull';
    this.thingdefs[50]   = 'doomthing_HangingVictimArmsOut';
    this.thingdefs[74]   = 'doomthing_HangingVictimGutsBrainRemoved';
    this.thingdefs[73]   = 'doomthing_HangingVictimGutsRemoved';
    this.thingdefs[51]   = 'doomthing_HangingVictimOneLegged';
    this.thingdefs[49]   = 'doomthing_HangingVictimTwitching';
    this.thingdefs[25]   = 'doomthing_ImpaledHuman';
    this.thingdefs[54]   = 'doomthing_LargeBrownTree';
    this.thingdefs[29]   = 'doomthing_SkullPile';
    this.thingdefs[55]   = 'doomthing_ShortFirestickBlue';
    this.thingdefs[56]   = 'doomthing_ShortFirestickGreen';
    this.thingdefs[31]   = 'doomthing_ShortPillarGreen';
    this.thingdefs[36]   = 'doomthing_ShortPillarGreenHeart';
    this.thingdefs[57]   = 'doomthing_ShortFirestickRed';
    this.thingdefs[33]   = 'doomthing_ShortPillarRed';
    this.thingdefs[37]   = 'doomthing_ShortPillarRedSkull';
    this.thingdefs[86]   = 'doomthing_ShortTechnoFloorLamp';
    this.thingdefs[27]   = 'doomthing_SkullPole';
    this.thingdefs[47]   = 'doomthing_Stalagmite';
    this.thingdefs[44]   = 'doomthing_TallFirestickBlue';
    this.thingdefs[45]   = 'doomthing_TallFirestickGreen';
    this.thingdefs[30]   = 'doomthing_TallPillarGreen';
    this.thingdefs[46]   = 'doomthing_TallFirestickRed';
    this.thingdefs[32]   = 'doomthing_TallPillarRed';
    this.thingdefs[85]   = 'doomthing_TallTechnoFloorLamp';
    this.thingdefs[48]   = 'doomthing_TallTechnoPillar';
    this.thingdefs[26]   = 'doomthing_TwitchingImpaledHuman';

    // Decorations
    this.thingdefs[10]   = 'doomthing_BloodyMess';
    this.thingdefs[12]   = 'doomthing_BloodyMess2';
    this.thingdefs[34]   = 'doomthing_Candle';
    this.thingdefs[22]   = 'doomthing_DeadCacodemon';
    this.thingdefs[21]   = 'doomthing_DeadDemon';
    this.thingdefs[18]   = 'doomthing_DeadFormerHuman';
    this.thingdefs[19]   = 'doomthing_DeadFormerSergeant';
    this.thingdefs[20]   = 'doomthing_DeadImp';
    this.thingdefs[23]   = 'doomthing_DeadLostSoul';
    this.thingdefs[15]   = 'doomthing_DeadPlayer';
    this.thingdefs[62]   = 'doomthing_HangingLeg';
    this.thingdefs[60]   = 'doomthing_HangingLegs';
    this.thingdefs[59]   = 'doomthing_HangingVictimArmsOut';
    this.thingdefs[61]   = 'doomthing_HangingVictimOneLegged';
    this.thingdefs[63]   = 'doomthing_HangingVictimTwitching';
    this.thingdefs[79]   = 'doomthing_PoolOfBlood';
    this.thingdefs[80]   = 'doomthing_PoolOfBlood2';
    this.thingdefs[24]   = 'doomthing_PoolOfBloodAndFlesh';
    this.thingdefs[81]   = 'doomthing_PoolOfBrains';

    // Other
    this.thingdefs[88]   = 'doomthing_BossBrain';
    this.thingdefs[11]   = 'doomthing_DeathmatchStart';
    this.thingdefs[1]    = 'doomthing_Player1Start';
    this.thingdefs[2]    = 'doomthing_Player2Start';
    this.thingdefs[3]    = 'doomthing_Player3Start';
    this.thingdefs[4]    = 'doomthing_Player4Start';
    this.thingdefs[89]   = 'doomthing_SpawnShooter';
    this.thingdefs[87]   = 'doomthing_SpawnSpot';
    this.thingdefs[14]   = 'doomthing_TeleportLanding';

  },
  loadMap: function(mapname) {
    if (this.currentmap && this.currentmap.parent) {
      this.currentmap.parent.remove(this.currentmap);
      this.stopMusic();
      if (this.things) {
        for (let i = 0; i < this.things.length; i++) {
          // FIXME - dumb hack, the player should keep track of its own things
          if (this.doomplayer.rockets.indexOf(this.things[i]) == -1) {
            this.things[i].die();
          }
        }
      }
    }
    var currentmap = this.currentmap = new THREE.Object3D();
    var wad = this.wadfile;

    this.mapnum = this.parseMapName(mapname);

    var map = wad.getMap(mapname);
    this.mapdata = map;

    this.doomplayer.setLevel(this);

    var textures = wad.getTextures();
    var geometries = map.getGeometry();
    var sectormap = map.getSectorMap();
    console.log('got some geo', geometries, sectormap, map, textures);

    /*    
    if (!this.automap) { 
      this.automap = room.createObject('doomautomap', { pos: V(player.pos) });
    }
    this.automap.setLevel(this); 
    */

    this.geometries = {};
    for (var k in geometries) {
      var geodata = geometries[k];
      var geo = new THREE.BufferGeometry();
      geo.setIndex(new THREE.Uint32BufferAttribute(geodata.index, 1));
      geo.setAttribute('position', new THREE.BufferAttribute(geodata.position, 3).setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute('uv', new THREE.BufferAttribute(geodata.uv, 2).setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute('color', new THREE.BufferAttribute(geodata.color, 3).setUsage(THREE.DynamicDrawUsage));
      geo.computeVertexNormals();

      var mat = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI/2, 0, 0));
      geo.applyMatrix(mat);

      var texture = null;
      if (textures[k.toLowerCase()]) {
        texture = new THREE.Texture(textures[k.toLowerCase()].getPOT());
        if (texture.image) texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
      }
      var mat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        roughness: 0.8,
        map: texture,
        transparent: (textures[k.toLowerCase()] ? textures[k.toLowerCase()].transparent : false),
        vertexColors: THREE.VertexColors
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      currentmap.add(mesh);

      //var collidermesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color: 0xffff00, opacity: .2, transparent: true, side: THREE.DoubleSide}));
      //this.colliders.add(collidermesh);

      this.geometries[k] = geo;
    }

    // make the floors/ceilings

    var floorverts = [],
        floorcolors = [],
        floorfaces = [],
        ceilingverts = [],
        ceilingcolors = [],
        ceilingfaces = [],
        floorvertoffset = 0,
        ceilingvertoffset = 0;

    var texturegroups = {};
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
      // FIXME - ok, it seems like the sectors which cause problems are those which fully enclose other sectors, eg, those with holes
      //         Our current algorithm picks a random segment and follows it until it loops back on itself, then tries to triangulate
      //         that. This fails if we start on a segment that's part of a "hole" - all our segment normals face outwards, and 
      //         triangulation fails.  We should detect this, mark it as a hole, and continue until all segments are accounted for,
      //         and we have exactly one sequence of segments whose normals face inwards, and 0 or more "hole" segments

var f = 0;
      do {
        vertexlist.push(new THREE.Vector2().copy(map.getVertex(current)));
        current = edges[current];
//console.log(' - check', current, first);
f++;
      } while (current != first && f < 100);
      console.log(i, vertexlist, edges, linedefs);

      if (vertexlist.indexOf(undefined) != -1) {
        console.error('undefined vertices in vertex list!', vertexlist, linedef, side1, side2);
        continue;
      }

      var sector = map.getSector(i);

      var hasfloor = sector.floorpic != '-';
      var hasceiling = sector.ceilingpic != '-';

      var shape = new THREE.Shape(vertexlist);
      var sectorfaces = THREE.ShapeUtils.triangulateShape(vertexlist, []);
      var lightlevel = sector.lightlevel / 255;
      //console.log(shape, sectorfaces);
      var newceilingverts = [],
          newceilingcolors = [];
      var floorverts = [];
      for (var j = 0; j < vertexlist.length; j++) {
        if (hasfloor) {
          floorverts.push(vertexlist[j].x, vertexlist[j].y, sector.floorheight);
        }
        if (hasceiling) {
          newceilingverts.unshift(vertexlist[j].x, vertexlist[j].y, sector.ceilingheight);
        }
      }

      if (hasfloor) {
        var floor = map.getTextureGroup(sector.floorpic);
        var floorverts = floor.add(floorverts, sectorfaces, sector);
        texturegroups[sector.floorpic] = floor;
        sector.addFloorVertices(floorverts);
      }
      if (hasceiling) {
        var ceiling = map.getTextureGroup(sector.ceilingpic);
        var ceilingverts = ceiling.add(newceilingverts, sectorfaces, sector);
        texturegroups[sector.ceilingpic] = ceiling;
        sector.addCeilingVertices(ceilingverts);
      }
    }

    for (var k in texturegroups) {
      var texturegroup = texturegroups[k];
      var geodata = texturegroup.getBuffers();

      var geo = new THREE.BufferGeometry();
      geo.setIndex(new THREE.Uint32BufferAttribute(geodata.index, 1));
      geo.setAttribute('position', new THREE.BufferAttribute(geodata.position, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(geodata.uv, 2));
      geo.setAttribute('color', new THREE.BufferAttribute(geodata.color, 3));
      geo.computeVertexNormals();

      var mat = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI/2, 0, 0));
      geo.applyMatrix(mat);

      var texture = null;
      if (textures[k.toLowerCase()]) {
        texture = new THREE.Texture(textures[k.toLowerCase()].getPOT());
        if (texture.image) texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
      }
      var mat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        roughness: 0.8,
        map: texture,
        transparent: (textures[k.toLowerCase()] ? textures[k.toLowerCase()].transparent : false),
        vertexColors: THREE.VertexColors
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      currentmap.add(mesh);

      //var collidermesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color: 0xffff00, opacity: .2, transparent: true, side: THREE.DoubleSide}));
      //this.colliders.add(collidermesh);
      //this.setCollider('mesh', {mesh: collidermesh});

      this.geometries[k] = geo; // FIXME - is it possible that this texture was already used as a wall texture?
    }

    var spawnpoints = map.getThingsByType(1);
    if (spawnpoints.length > 0) {
      var spawnpoint = spawnpoints[0];
      //var playerheight = this.mapdata.getHeight(spawnpoint.x, spawnpoint.y);

      var currentsector = map.getSectorAt(spawnpoint.x, spawnpoint.y);
      var playerheight = currentsector.floorheight;
      var newy = (playerheight * this.scale.y);

      player.pos = V(spawnpoint.x * this.scale.x, newy, -spawnpoint.y * this.scale.z);
    }

    this.objects['3d'].add(currentmap);
    let collidermap = currentmap.clone();
    collidermap.traverse(n => { if (n.material) n.material = new THREE.MeshPhongMaterial({color: 0xffff00, opacity: .2, transparent: true}) });
    this.collidable = false;
    this.colliders.add(collidermap);
    this.setCollider('mesh', {mesh: collidermap});
console.log('beh');
    //this.collision_trigger = true;

    if (this.showthings) {
      this.createThings();
    }
    this.startMusic();
    this.refresh();

  },

  parseMapName: function(name) {
    var doom1 = new RegExp(/E(\d)M(\d)/),
        doom2 = new RegExp(/MAP(\d)(\d)/);
    if (m = name.match(doom1)) {
      return [parseInt(m[1]), parseInt(m[2])];
    } else if (m = name.match(doom2)) {
      return [parseInt(m[1]), parseInt(m[2])];
    }
  },

  createThings: function() {
    //this.statemachine = new DoomStateManager();
    var things = this.mapdata.things;
    this.things = [];
    for (var i = 0; i < things.length; i++) {
      var thingprops = things[i];
      if ((thingprops.options & 0x04) && !(thingprops.options & 0x10)) {
        let newthing = this.createThing(thingprops);
        if (newthing) {
          this.things.push(newthing);
        }
      }
    }
  },

  createThing: function(thingprops) {
    if (this.thingdefs[thingprops.type]) {
      var thingdef = this.thingdefs[thingprops.type];
      var height = this.mapdata.getHeight(thingprops.x, thingprops.y);
      return this.createObject(thingdef, {
        //statemachine: this.statemachine,
        map: this.mapdata,
        pos: V(thingprops.x, height, -thingprops.y),
        //angle: thingprops.angle,
        rotation: V(0, thingprops.angle - 90, 0),
        options: thingprops.options,
      });
    }
  },

  startMusic: function() {
    var soundname = 'd_e' + this.mapnum[0] + 'm' + this.mapnum[1];
    room.loadNewAsset('sound', {
      id: soundname,
      src: this.musicpath + soundname + '.ogg',
    });
    this.music = this.createObject('sound', {
      id: soundname,
      loop: true,
      rect: '-100 -100 100 100',
      gain: .2
    });
    this.music.play();
  },
  stopMusic: function() {
    this.music.stop();
    this.music.rect = '9999 9999 10000 1000'; 
    this.removeChild(this.music);
  },

  setSectorCeilingHeight(sectorid, height) {
/*
    var sector = this.mapdata.getSector(sectorid);
    var sidedefs = this.mapdata.getSidedefsBySector(sectorid);
    for (var i = 0; i < sidedefs.length; i++) {
      var sidedef = sidedefs[i];
      if (sidedef.midtexture != '-') {
        var geo = this.geometries[sidedef.midtexture];
        var verts = sidedef.quads.middle;
        geo.attributes.position.array[verts[1] * 3 + 1] = height;
        geo.attributes.position.array[verts[2] * 3 + 1] = height;
        geo.attributes.position.needsUpdate = true;
      }
      // FIXME - this needs to look at the adjacent sector heights, and adjust top and bottom verts accordingly
      if (sidedef.toptexture != '-') {
        var geo = this.geometries[sidedef.toptexture];
        var verts = sidedef.quads.bottom;
        geo.attributes.position.array[verts[0] * 3 + 1] = height;
        geo.attributes.position.array[verts[3] * 3 + 1] = height;
        geo.attributes.position.needsUpdate = true;
      }
    }
    if (sector.ceilingvertices) {
      var geo = this.geometries[sector.ceilingpic];
      for (var i = 0; i < sector.ceilingvertices.length; i++) {
        var vert = sector.ceilingvertices[i];
        geo.attributes.position.array[vert * 3 + 1] = height;
      }
      geo.attributes.position.needsUpdate = true;
    }
    sector.ceilingheight = height;
*/
    var sector = this.mapdata.getSector(sectorid);
    var sidedefs = this.mapdata.getSidedefsBySector(sectorid);
    var geometries = {};
    for (var i = 0; i < sidedefs.length; i++) {
      var sidedef = sidedefs[i],
          flipside = sidedef.flipside,
          othersector = (flipside ? this.mapdata.getSector(flipside.sector) : null);

      if (sidedef.midtexture != '-') {
        var geo = this.geometries[sidedef.midtexture];
        var verts = sidedef.quads.middle;
        geo.attributes.position.array[verts[1] * 3 + 1] = height;
        geo.attributes.position.array[verts[2] * 3 + 1] = height;
        geometries[geo.uuid] = geo;
      }
      if (flipside && flipside.midtexture != '-') {
        var geo = this.geometries[flipside.midtexture];
        var verts = flipside.quads.middle;
        geo.attributes.position.array[verts[1] * 3 + 1] = height;
        geo.attributes.position.array[verts[2] * 3 + 1] = height;
        geometries[geo.uuid] = geo;
        if (sector.floorheight == othersector.floorheight) {
          geo.attributes.position.array[verts[0] * 3 + 1] = height;
          geo.attributes.position.array[verts[3] * 3 + 1] = height;
        }
      }

      // FIXME - this needs to look at the adjacent sector heights, and adjust top and bottom verts accordingly
      if (sidedef.bottomtexture != '-') {
        var geo = this.geometries[sidedef.bottomtexture];
        var verts = sidedef.quads.bottom;
        geo.attributes.position.array[verts[1] * 3 + 1] = height;
        geo.attributes.position.array[verts[2] * 3 + 1] = height;
        geometries[geo.uuid] = geo;
        if (sector.floorheight == othersector.floorheight) {
          geo.attributes.position.array[verts[0] * 3 + 1] = height;
          geo.attributes.position.array[verts[3] * 3 + 1] = height;
        }
      }
      if (flipside && flipside.bottomtexture != '-') {
        var geo = this.geometries[flipside.bottomtexture];
        var verts = flipside.quads.bottom;
        geo.attributes.position.array[verts[1] * 3 + 1] = height;
        geo.attributes.position.array[verts[2] * 3 + 1] = height;
        if (sector.floorheight == othersector.floorheight) {
          geo.attributes.position.array[verts[0] * 3 + 1] = height;
          geo.attributes.position.array[verts[3] * 3 + 1] = height;
        }

        geometries[geo.uuid] = geo;
      }
      if (flipside && flipside.toptexture != '-') {
        var geo = this.geometries[flipside.toptexture];
        var verts = flipside.quads.top;
        geo.attributes.position.array[verts[0] * 3 + 1] = height;
        geo.attributes.position.array[verts[3] * 3 + 1] = height;
        geometries[geo.uuid] = geo;
        if (sector.ceilingheight == othersector.ceilingheight) {
          geo.attributes.position.array[verts[1] * 3 + 1] = height;
          geo.attributes.position.array[verts[2] * 3 + 1] = height;
        }
        var uvs = flipside.getUVs('top', sector.ceilingheight, othersector.ceilingheight, flipside.toptexture);
        geo.attributes.uv.array[verts[0] * 2] = uvs[0];
        geo.attributes.uv.array[verts[0] * 2 + 1] = uvs[1];
        geo.attributes.uv.array[verts[1] * 2] = uvs[2];
        geo.attributes.uv.array[verts[1] * 2 + 1] = uvs[3];
        geo.attributes.uv.array[verts[2] * 2] = uvs[4];
        geo.attributes.uv.array[verts[2] * 2 + 1] = uvs[5];
        geo.attributes.uv.array[verts[3] * 2] = uvs[6];
        geo.attributes.uv.array[verts[3] * 2 + 1] = uvs[7];
        geo.attributes.uv.needsUpdate = true;
      }
    }
    if (sector.ceilingvertices) {
      var geo = this.geometries[sector.ceilingpic];
      geometries[geo.uuid] = geo;
      for (var i = 0; i < sector.ceilingvertices.length; i++) {
        var vert = sector.ceilingvertices[i];
        geo.attributes.position.array[vert * 3 + 1] = height;
      }
    }

    for (var k in geometries) {
      var geo = geometries[k];
      geo.attributes.position.needsUpdate = true;
      geo.computeBoundingSphere();
    }

    sector.ceilingheight = height;
//console.log('SET THE CEILING HEIGHT', sectorid, sector, height);
  },
  raiseSectorFloorTo(sectorid, end, speed) {
    var now = performance.now(),
        dt = (this.lasttime ? (now - this.lasttime) / 1000 : 0);

    var sector = this.mapdata.getSector(sectorid);

    this.lasttime = now;
    var newheight = sector.floorheight + speed * dt;
//console.log('raise floor:', sectorid, sector.floorheight, newheight, end, sector);
    this.setSectorFloorHeight(sectorid, Math.min(newheight, end));
    if (newheight < end) {
      setTimeout(this.raiseSectorFloorTo.bind(this, sectorid, end, speed), 16);
    } else {
      this.lasttime = 0;
    }
  },
  setSectorFloorHeight(sectorid, height) {
    var sector = this.mapdata.getSector(sectorid);
    var sidedefs = this.mapdata.getSidedefsBySector(sectorid);
    var geometries = {};
    for (var i = 0; i < sidedefs.length; i++) {
      var sidedef = sidedefs[i],
          flipside = sidedef.flipside,
          othersector = (flipside ? this.mapdata.getSector(flipside.sector) : null);

      if (sidedef.midtexture != '-') {
        var geo = this.geometries[sidedef.midtexture];
        var verts = sidedef.quads.middle;
        geo.attributes.position.array[verts[0] * 3 + 1] = height;
        geo.attributes.position.array[verts[3] * 3 + 1] = height;
        geometries[geo.uuid] = geo;
      }
      if (flipside && flipside.midtexture != '-') {
        var geo = this.geometries[flipside.midtexture];
        var verts = flipside.quads.middle;
        geo.attributes.position.array[verts[0] * 3 + 1] = height;
        geo.attributes.position.array[verts[3] * 3 + 1] = height;
        geometries[geo.uuid] = geo;
      }

      // FIXME - this needs to look at the adjacent sector heights, and adjust top and bottom verts accordingly
      if (sidedef.bottomtexture != '-') {
        var geo = this.geometries[sidedef.bottomtexture];
        var verts = sidedef.quads.bottom;
        geo.attributes.position.array[verts[0] * 3 + 1] = height;
        geo.attributes.position.array[verts[3] * 3 + 1] = height;
        geometries[geo.uuid] = geo;
        if (sector.floorheight == othersector.floorheight) {
          geo.attributes.position.array[verts[1] * 3 + 1] = height;
          geo.attributes.position.array[verts[2] * 3 + 1] = height;
        }
      }
      if (flipside && flipside.bottomtexture != '-') {
        var geo = this.geometries[flipside.bottomtexture];
        var verts = flipside.quads.bottom;
        geo.attributes.position.array[verts[1] * 3 + 1] = height;
        geo.attributes.position.array[verts[2] * 3 + 1] = height;
        geometries[geo.uuid] = geo;
        if (sector.floorheight == othersector.floorheight) {
          geo.attributes.position.array[verts[1] * 3 + 1] = height;
          geo.attributes.position.array[verts[2] * 3 + 1] = height;
        }
      }
    }
    if (sector.floorvertices) {
      var geo = this.geometries[sector.floorpic];
      geometries[geo.uuid] = geo;
      for (var i = 0; i < sector.floorvertices.length; i++) {
        var vert = sector.floorvertices[i];
        geo.attributes.position.array[vert * 3 + 1] = height;
      }
    }

    for (var k in geometries) {
      var geo = geometries[k];
      geo.attributes.position.needsUpdate = true;
      geo.computeBoundingSphere();
    }

    sector.floorheight = height;
//console.log('SET THE FLOOR HEIGHT', sectorid, sector, height);
  },
  raiseSectorFloorTo(sectorid, end, speed) {
    var now = performance.now(),
        dt = (this.lasttime ? (now - this.lasttime) / 1000 : 0);

    var sector = this.mapdata.getSector(sectorid);

    this.lasttime = now;
    var newheight = sector.floorheight + speed * dt;
//console.log('raise floor:', sectorid, sector.floorheight, newheight, end, sector);
    this.setSectorFloorHeight(sectorid, Math.min(newheight, end));
    if (newheight < end) {
      setTimeout(this.raiseSectorFloorTo.bind(this, sectorid, end, speed), 16);
    } else {
      this.lasttime = 0;
    }
  },
  lowerSectorFloorTo(sectorid, end, speed, lasttime) {
    var now = performance.now(),
        dt = (lasttime ? (now - lasttime) / 1000 : 0);

    var sector = this.mapdata.getSector(sectorid);

    var newheight = sector.floorheight - speed * dt;
//console.log('lower floor:', sectorid, sector.floorheight, newheight, end, sector);
    this.setSectorFloorHeight(sectorid, Math.max(newheight, end));
    if (newheight > end) {
      setTimeout(this.lowerSectorFloorTo.bind(this, sectorid, end, speed, now), 16);
    }
  },
  raiseSectorCeilingTo(sectorid, end, speed) {
    var now = performance.now(),
        dt = (this.lasttime ? (now - this.lasttime) / 1000 : 0);

    var sector = this.mapdata.getSector(sectorid);

    this.lasttime = now;
    var newheight = sector.ceilingheight + speed * dt;
//console.log('raise ceiling:', sectorid, sector.ceilingheight, newheight, end, sector);
    this.setSectorCeilingHeight(sectorid, Math.min(newheight, end));
    if (newheight < end) {
      setTimeout(this.raiseSectorCeilingTo.bind(this, sectorid, end, speed), 16);
    } else {
      this.lasttime = 0;
    }
  },
  lowerSectorCeilingTo(sectorid, end, speed, lasttime) {
    var now = performance.now(),
        dt = (lasttime ? (now - lasttime) / 1000 : 0);

    var sector = this.mapdata.getSector(sectorid);

    var newheight = sector.ceilingheight - speed * dt;
//console.log('lower ceiling:', sectorid, sector.ceilingheight, newheight, end, sector);
    this.setSectorCeilingHeight(sectorid, Math.max(newheight, end));
    if (newheight > end) {
      setTimeout(this.lowerSectorCeilingTo.bind(this, sectorid, end, speed, now), 16);
    }
  },
  playSound(name, volume, position, velocity) {
    if (this.wadfile.sounds[name]) {
      let sound = this.wadfile.sounds[name];
      let audio = player.ears.children[0].context;
      var buffer = audio.createBuffer(1, sound.samples, sound.rate);
      buffer.getChannelData(0).set(sound.pcm);

      var source = audio.createBufferSource();
      source.buffer = buffer;
      if (position) {
        let output = audio.createPanner();
        output.position = position.toArray();
        source.connect(output);
        output.connect(audio.destination);
      } else {
        source.connect(audio.destination);
      }
      source.start(0);
    }
  },
  onupdate: function(ev) {
    if (this.light) {
      var now = new Date().getTime();
      this.light.pos = translate(V(player.pos.x, player.pos.y + 1.6, player.pos.z), V(Math.sin(now / 1000), 0, Math.cos(now / 1000)));
    }
  },
});

room.registerElement('doomplayer', {
  level: null,
  map: null,
  angle: 0,
  height: 56,
  usedistance: 48,
  noclip: false,

  createChildren: function() {
    // No visible children, unless we want the doom marine to self-shadow...
console.log('PLAYER', this.parent);

    this.rockets = [
      this.parent.createObject('doomthing_Missile', { pos: V(0,0,0) }),
      this.parent.createObject('doomthing_Missile', { pos: V(0,0,0) }),
      this.parent.createObject('doomthing_Missile', { pos: V(0,0,0) }),
      this.parent.createObject('doomthing_Missile', { pos: V(0,0,0) }),
      this.parent.createObject('doomthing_Missile', { pos: V(0,0,0) }),
      this.parent.createObject('doomthing_Missile', { pos: V(0,0,0) }),
    ];
    this.currentrocket = 0;

    this.keybuffer = '';

    this.cheats = {
      'IDCLEV\\d\\d': this.cheatSetLevel,
      'IDSPISPOPD': this.cheatToggleNoclip,
      'IDCLIP': this.cheatToggleNoclip
    };
    this.weapons = {
      chainsaw: false,
      pistol: true,
      shotgun: false,
      chaingun: false,
      rocketlauncher: false,
      plasmagun: false,
      bfg: false
    }

    room.onKeyDown = this.onkeydown;
    room.onMouseDown = this.onmousedown;
    room.onMouseUp = this.onmouseup;

    this.wallforce = player.addForce('static', V(0));

    this.addEventListener('trigger', (ev) => console.log('triggered', ev));

  },

  setLevel: function(level) {
    this.level = level;
    this.map = level.mapdata;
    var automap = this.getAutomap();
    if (automap) {
      automap.setLevel(level);
    }
    if (!this.hud) {
      this.getHUD();
    }
    for (let i = 0; i < this.rockets.length; i++) {
      level.appendChild(this.rockets[i]);
      this.rockets[i].level = level;
    }
  },
  getAutomap: function() {
    if (!this.automap) {
      this.automap = document.getElementsByTagName('doom-automap')[0]; //room.createObject('doomautomap', { pos: V(player.pos) });
      //this.automap = room.createObject('doomautomap', { pos: V(player.pos) });
      if (this.automap) {
        this.automap.setLevel(this.level); 
      }
    }
    return this.automap;
  },
  getHUD: function() {
    if (!this.hud) {
      this.hud = document.getElementsByTagName('doom-hud')[0];
      if (this.hud) {
        this.hud.setWad(this.map.wad); 
      }
    }
    return this.hud;
  },

  use: function() {
    var dir = V(player.view_dir.x, -player.view_dir.z, 0);
    var map = this.map;
    var intersections = map.getIntersections(new WadJS.Vertex(player.pos.x / this.level.scale.x, -player.pos.z / this.level.scale.z), dir, this.usedistance);
    if (intersections.length > 0) {
      let handled = false;
      for (var i = 0; i < intersections.length; i++) {
        var segment = intersections[i][0];
        var linedef = map.getLinedef(segment.linedef);
        var side1 = map.getSidedef((segment.side == 0 ? linedef.side1 : linedef.side2)),
            side2 = map.getSidedef((segment.side == 0 ? linedef.side2 : linedef.side1));
  //console.log('is it a door?', linedef, segment, side1, side2);
        if (linedef.type) {
          if (linedef.type == 11) {
  //console.log('no, it\'s an exit', this);
            var digits = [this.level.mapnum[0], this.level.mapnum[1] + 1];
            if (this.level.wadfile.version == 'doom1') {
              mapname = 'E' + digits[0] + 'M' + digits[1];
            } else {
              mapname = 'MAP' + digits[0] + digits[1];
            }
            console.log('Set level:', mapname);

            this.level.playSound('DSSWTCHN');
            this.level.loadMap(mapname);
            handled = true;
          } else {
  //console.log('IT IS!');
            this.openDoor(linedef, side1);
            handled = true;
          }
          break;
        }
      }
      if (!handled) {
        this.level.playSound('DSOOF');
      }
    }
  },

  openDoor: function(linedef, playerside) {
    var doorside = playerside.flipside;
    var linesector = this.map.getSector(playerside.sector);
    var sectors = (linedef.tag ? this.map.getSectorsByTag(linedef.tag) : [this.map.getSector(doorside.sector)]);
/*
    var sectorid = linedef.tag || doorside.sector;
console.log(linedef, doorside, linesector, 'tagged?', linedef.tag, sectorid, doorside);
    var doorsector = this.map.getSector(sectorid);
console.log('door side!', doorside, doorsector);
*/
console.log('all the sectors', sectors);
    var params = this.getLinedefParams(linedef);
    for (var i = 0; i < sectors.length; i++) {
      var sector = sectors[i];
      var adjacent = sector.getAdjacentSectors();
      var minheight = linesector.ceilingheight;
console.log('adjacent', adjacent);
      for (var i = 0; i < adjacent.length; i++) {
        if (adjacent[i].ceilingheight < minheight) {
          minheight = adjacent[i].ceilingheight;
        }
      }

      // FIXME - each door should be independently timed and controlled, eg, we should have a 'doomdoor' type
      if (params.type == 'door') {
        let v1 = this.map.getVertex(linedef.v1),
            v2 = this.map.getVertex(linedef.v2);
        let middle = V((v1.x + v2.x) / 2, 0, -(v1.y + v2.y) / 2);
        if (params.subtype == 'open' || params.subtype == 'open_wait_close') {
          this.level.raiseSectorCeilingTo(sector.id, minheight - 4, 40);
          //this.parent.playSound('DSDOROPN');
console.log('lets figure this out', linedef, v1, v2, middle);
          this.level.createObject('sound', { id: 'DSDOROPN', pos: middle, gain: 1, singleshot: true});
          if (params.subtype == 'open_wait_close') {
            setTimeout(() => {
              this.level.lowerSectorCeilingTo(sector.id, sector.floorheight, 40);
              //this.parent.playSound('DSDORCLS');
              this.level.createObject('sound', { id: 'DSDORCLS', pos: middle, gain: 1, singleshot: true});
            }, params.delay + 2000);
          }
        } else if (params.subtype == 'close' || params.subtype == 'close_wait_open') {
          this.level.lowerSectorCeilingTo(sector.id, sector.floorheight, 40);
          this.level.createObject('sound', { id: 'DSDORCLS', pos: middle, gain: 1, singleshot: true});
          if (params.subtype == 'close_wait_open') {
            setTimeout(() => {
              this.level.raiseSectorCeilingTo(sector.id, minheight - 4, 40);
              this.level.createObject('sound', { id: 'DSDOROPN', pos: middle, gain: 1, singleshot: true});
            }, params.delay + 2000);
          }
        }
      }
    } 
  },
  getLinedefParams: function(linedef) {
    var params = {
      type: 'door',
      subtype: 'open_wait_close', // open, close, open_wait_close, close_wait_open
      speed: 'normal',
      trigger: 'push', // push, switched, walkover, gun
      repeat: true,
      lock: false,
      delay: 4000
    };

    // Types based on http://doom.wikia.com/wiki/Linedef_type
    // FIXME - surely these are bitmasks, everything Carmack did was bitmasks. Need to find a proper table

    switch (linedef.type) {
      case 2:
      case 31:
      case 32:
      case 33:
      case 34:
      case 46:
      case 61:
      case 86:
      case 99:
      case 103:
      case 106:
      case 109:
      case 112:
      case 115:
      case 118:
      case 133:
      case 134:
      case 135:
      case 136:
      case 137:
        params.subtype = 'open';
        break;
      case 3:
      case 42:
      case 50:
      case 75:
      case 110:
      case 107:
      case 113:
      case 116:
        params.subtype = 'close';
        break;
      case 1:
      case 4:
      case 26:
      case 27:
      case 28:
      case 29:
      case 63:
      case 90:
      case 108:
      case 105:
      case 111:
      case 114:
      case 117:
        params.subtype = 'open_wait_close';
        break;
      case 16:
      case 76:
      case 175:
      case 196:
        params.subtype = 'close_wait_open';
        break;
    }

    return params;
  },

  jump: function() {
    player.vel.y = 10;
  },

  cheatSetLevel: function(cheatstr) {
    var level = cheatstr.substr(6);

    var digits = level.split('');

    var mapname;
    if (this.level.wadfile.version == 'doom1') {
      mapname = 'E' + digits[0] + 'M' + digits[1];
    } else {
      mapname = 'MAP' + digits[0] + digits[1];
    }
    console.log('Set level via cheat:', mapname);

    this.level.loadMap(mapname);
  },
  cheatToggleNoclip: function() {
    this.noclip = !this.noclip;
    console.log('Toggled clipping ' + (this.noclip ? 'off' : 'on'));
  },
  
  onupdate: function(ev) {
    var dt = ev.data;

    if (!this.level) return;
    var playerdir = this.level.worldToLocal(normalized(V(player.dir.x, 0, player.dir.z)));
    var playerangle = Math.atan2(playerdir.z, playerdir.x);
    this.angle = playerangle;
    var automap = this.getAutomap();
    if (automap) { // && (automap.playerangle != playerangle || !automap.pos.equals(player.pos))) {
      automap.setPlayerAngle(playerangle);
    }

    if (!this.noclip && this.map) {
      var playerpos = this.level.worldToLocal(V(player.pos.x, -player.pos.z, player.pos.y));
      var playervel = this.level.worldToLocal(V(player.vel.x, -player.vel.z, player.vel.y)).multiplyScalar(dt).add(scalarMultiply(this.level.worldToLocal(normalized(V(player.vel.x, -player.vel.z, player.vel.y))), .5));
      
      var map = this.map;
      // Handle wall collisions
      var speed = playervel.length();
      if (speed > 1e-3) {
        var intersections = map.getIntersections(new WadJS.Vertex(player.pos.x / this.level.scale.x, -player.pos.z / this.level.scale.z), scalarMultiply(playervel, 1 / speed), speed);
        if (intersections.length > 0) {
          //console.log('boing!', intersections);

          var intersection = intersections[0],
              seg = intersection[0],
              linedef = map.getLinedef(seg.linedef),
              side0 = map.getSidedef(linedef.side1),
              side1 = map.getSidedef(linedef.side2),
              sector0 = map.getSector(side0.sector),
              sector1 = (side1 ? map.getSector(side1.sector) : false);
        
          var currentside = (seg.side == 0 ? side0 : side1);
          var currentsector = (seg.side == 0 ? sector0 : sector1),
              othersector = (seg.side == 0 ? sector1 : sector0);
          //console.log(currentsector, othersector, side0, side1);
          if (!othersector || ((othersector.floorheight - playerpos.z > 24 || othersector.ceilingheight - playerpos.z - this.height < 0) && currentside.middletex != '-')) {
            // A wall is considered solid if:
            //  - there's nothing on the other side
            //  - the floor of the sector we're moving into is > 24 units high
            player.pos = translate(player.pos, scalarMultiply(player.vel, -dt));
            var v1 = map.getVertex(linedef.v1),
                v2 = map.getVertex(linedef.v2);
            var diff = V(v2.x - v1.x, 0, v2.y - v1.y);
            var normal = normalized((seg.side == 0 ? V(diff.z, 0, -diff.x) : V(-diff.z, 0, diff.x)));
            var dot = normal.dot(player.vel);
            var speed = player.vel.length();
            // FIXME - need to calculate proper reflection force here, and push back against the player as long as they're in contact with the wall
            //this.wallforce.update(scalarMultiply(normal, -dot * 100));
            //player.vel = translate(player.vel, scalarMultiply(normal, -dot));
          } else {
            this.wallforce.update(V(0));
          }
        }
      }

      // Handle height
      var currentsector = this.map.getSectorAt(player.pos.x / this.level.scale.x, -player.pos.z / this.level.scale.z);
      var playerheight = currentsector.floorheight;
      var newy = (playerheight * this.level.scale.y);
      var stepheight = 24 * this.level.scale.y;
      if (player.pos.y > newy) {
        player.vel = translate(player.vel, scalarMultiply(V(0,-9.8,0), dt));
        this.playerOnGround = false;
        //player.pos.y = playerheight / 100 - 1;
      } else {
        //player.accel = V(0,0,0);
//console.log(newy, playerheight);
        this.playerOnGround = true;
        if (player.pos.y < newy && newy - player.pos.y < stepheight) {
          player.pos.y = newy;
        } else if (playerheight == Infinity) {
          player.pos = translate(player.pos, scalarMultiply(player.vel, -dt));
          player.vel = V(0,0,0);
        }
      }
    }
  },
  onkeydown: function(ev) {
    if (ev.keyCode == ' ' && this.playerOnGround) {
      //this.jump();
      this.use();
    } else if (ev.keyCode == '+') {
      this.automap.zoomIn();
    } else if (ev.keyCode == '-') {
      this.automap.zoomOut();
    } else if (ev.keyCode == 'TAB') {
      this.automap.toggleVisibility();
    }

    if (this.lastkey == 'I' && ev.keyCode == 'D') {
      // clear cheat keybuffer if "ID" is typed (actually set it to I so when we add the D it contains the value we expect)
      this.keybuffer = 'I';
    }
    this.lastkey = ev.keyCode;

    if (this.keybuffer.length >= 1) {
      this.keybuffer += ev.keyCode;

      if (this.keybuffer.indexOf('ID') == 0) {
        for (var k in this.cheats) {
          var re = new RegExp(k);
          if (this.keybuffer.match(re)) {
            if (this.cheats[k]) {
              this.cheats[k](this.keybuffer);
            }
            this.keybuffer = '';
          }
        }
      }
    }
  },
  onmousedown: function(ev) {
    if (ev.button === 0 && player.enabled) {
      this.rockets[this.currentrocket++ % this.rockets.length].fire(this.parent.worldToLocal(V(player.pos)), V(player.dir));
    }
  },
  onmouseup: function(ev) {
  }
});
room.registerElement('doomrocket', {
});

room.registerElement('doomsprite', {
  sprite: null,
  frame: 'A',
  angle: 0,

  textures: {},

  createChildren() {
    this.elapsedframetime = 0;
    this.currentframe = 0;
    this.spriteduh = this.sprite
    this.billboard = 'y';
    if (this.sprite) {
      // TODO - register this sprite as an AssetImage, so we can use it via image_id
      this.sprite.animate();
      this.plane = this.createObject('Object', {
        id: 'plane',
        scale: V(this.sprite.canvas.width,this.sprite.canvas.height,1),
        pos: V(0,28,0),
        //image_id: this.sprite.id,
        tex_linear: true,
        cull_face: 'none'
      });
      this.advanceFrame(0);

setTimeout(() => {
      //this.plane.objects['3d'].children[1].children[0].onBeforeRender = (renderer, scene, camera) => { this.draw(false, camera) };
}, 2000);
    }
  },
  //onupdate() {
    //this.draw();
  //},
  advanceFrame(elapsedframetime) {
    if (elapsedframetime > 0 && this.distanceTo(player) > 20) return; // FIXME - quick hack to reduce sprice processing

    this.currentframe = (this.currentframe + 1) % this.frame.length;
    this.draw(true);
  },
  draw(force, camera) {
    if (!force && this.distanceTo(camera.position) > 20) return; // FIXME - quick hack to reduce sprice processing
    var sprite = this.spriteduh;

    if (sprite && this.plane) {
      let camerapos = (camera ? camera.getWorldPosition(V()) : V(player.pos));
      var angle = (sprite.frameHasAngles(this.frame[this.currentframe]) ? this.getAngleToViewer(camerapos) : 0);
      var frameid = this.frame[this.currentframe] + angle;
      var assetid = sprite.id + frameid;
      if (this.plane.image_id != assetid) {
        var canvas = sprite.frames[this.frame[this.currentframe]][angle].canvas;
        if (!this.textures[assetid]) {
          room.loadNewAsset('image', { id: assetid, canvas: canvas, tex_linear: false, hasalpha: true });
          this.textures[assetid] = room.getAsset('image', assetid);
        }
        this.plane.image_id = assetid;
        this.plane.scale.x = canvas.width;
        this.plane.scale.y = canvas.height;
        this.plane.pos.y = canvas.height / 2;
      }
    }
    //this.zdir = player.dir;
    //this.ydir = V(0,1,0);
  },
  getAngleToViewer(viewerpos) {
    if (!this.parent) {
      this.die();
      return 1;
    }
    let ppos = this.parent.worldToLocal(viewerpos);
    ppos.y = 0;

    let dir = ppos.clone().normalize();
    let angle = (Math.atan2(dir.x, dir.z) + Math.PI);
    // Add 22.5 degrees to our angle so that the angle snap lines up with what we'd expect
    angle += Math.PI/8;
    // Normalize angle to 0 <= angle < 2 * Math.PI
    if (angle >= 2 * Math.PI) {
      angle -= 2 * Math.PI;
    }

    // Snap the angle to the closest 45 degree increment, and get the index for the angle
    let snapangle = Math.floor((angle) / (Math.PI/4)) + 1;
    
    return snapangle;
  }
});
room.registerElement('doomthing_Generic', {
  statemachine: null,
  map: null,
  type: null,
  spritename: '',
  spriteframe: 'A',
  height: 20,
  radius: 16,
  artifact: false,
  pickup: false,
  weapon: false,
  monster: false,
  obstacle: false,
  shootable: false,
  hanging: false,
  hitpoints: 0,
  

  create() {
    if (this.type) {
      //this.actor = this.statemachine.create(this.type);
    }
    this.createSprite();
  },
  createSprite() {
    this.sprite = this.createObject('doomsprite', {
      sprite: this.map.wad.getSprite(this.spritename),
      frame: this.spriteframe
    });
/*
    this.pointer = this.createObject('object', {
      id: 'cone',
      scale: V(5,50,5),
      rotation: V(-90,0,0),
      pos: V(0,25,0),
      col: 'red'
    });
*/
    if (this.height && this.radius && (this.obstacle || this.shootable || this.pickup)) {
      this.setCollider('cylinder', {height: this.height, radius: this.radius, offset: new THREE.Vector3(0, this.height / 2, 0)});
      if (!this.obstacle) {
        this.collision_trigger = true;
        this.collidable = false;
      }
      this.addEventListener('physics_collide', (ev) => console.log(this, ev));
    }
    //this.collision_scale = V(24,48,24);
    //this.collision_id = 'cylinder';
  },
  advanceFrame(frametime) {
    if (this.sprite) {
      this.sprite.advanceFrame(frametime);
    }
  },
  playSound(name) {
    if (this.map.wad.sounds[name]) {
      let sound = this.map.wad.sounds[name];
      let audio = player.ears.children[0].context;
      var buffer = audio.createBuffer(1, sound.samples, sound.rate);
      buffer.getChannelData(0).set(sound.pcm);

      var source = audio.createBufferSource();
      source.buffer = buffer;
      source.connect(audio.destination);
      source.start(0);
    }
  },
  oncollide(ev) {
    console.log('oh boing', this, ev);
  }
});

// Artifacts
room.extendElement('doomthing_Generic', 'doomthing_Berserk', {
  spritename: 'PSTR',
  spriteframe: 'A',
  pickup: true,
  artifact: true,
});
room.extendElement('doomthing_Generic', 'doomthing_ComputerMap', {
  spritename: 'PMAP',
  spriteframe: 'ABCDCB',
  pickup: true,
  artifact: true,
});
room.extendElement('doomthing_Generic', 'doomthing_HealthPotion', {
  spritename: 'BON1',
  spriteframe: 'ABCDCB',
  pickup: true,
  artifact: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Invisibility', {
  spritename: 'PINS',
  spriteframe: 'ABCD',
  pickup: true,
  artifact: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Invulnerability', {
  spritename: 'PINV',
  spriteframe: 'ABCD',
  pickup: true,
  artifact: true,
});
room.extendElement('doomthing_Generic', 'doomthing_LightAmplificationVisor', {
  spritename: 'PVIS',
  spriteframe: 'AB',
  pickup: true,
  artifact: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Megasphere', {
  spritename: 'MEGA',
  spriteframe: 'ABCD',
  pickup: true,
  artifact: true,
});
room.extendElement('doomthing_Generic', 'doomthing_SoulSphere', {
  spritename: 'SOUL',
  spriteframe: 'ABCDCB',
  pickup: true,
  artifact: true,
});
room.extendElement('doomthing_Generic', 'doomthing_SpiritualArmor', {
  spritename: 'BON2',
  spriteframe: 'ABCDCB',
  pickup: true,
  artifact: true,
});

//Powerups
room.extendElement('doomthing_Generic', 'doomthing_Backpack', {
  spritename: 'BPAK',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Stimpack', {
  spritename: 'STIM',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Medikit', {
  spritename: 'MEDI',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_GreenArmor', {
  spritename: 'ARM1',
  spriteframe: 'AB',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_BlueArmor', {
  spritename: 'ARM2',
  spriteframe: 'AB',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_RadiationSuit', {
  spritename: 'SUIT',
  pickup: true,
});

// Weapons
room.extendElement('doomthing_Generic', 'doomthing_BFG9000', {
  spritename: 'BFUG',
  spriteframe: 'A',
  pickup: true,
  weapon: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Chaingun', {
  spritename: 'MGUN',
  spriteframe: 'A',
  pickup: true,
  weapon: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Chainsaw', {
  spritename: 'CSAW',
  spriteframe: 'A',
  pickup: true,
  weapon: true,
});
room.extendElement('doomthing_Generic', 'doomthing_PlasmaRifle', {
  spritename: 'PLAS',
  spriteframe: 'A',
  pickup: true,
  weapon: true,
});
room.extendElement('doomthing_Generic', 'doomthing_RocketLauncher', {
  spritename: 'LAUN',
  spriteframe: 'A',
  pickup: true,
  weapon: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Shotgun', {
  spritename: 'SHOT',
  spriteframe: 'A',
  pickup: true,
  weapon: true,
});
room.extendElement('doomthing_Generic', 'doomthing_SuperShotgun', {
  spritename: 'SGN2',
  spriteframe: 'A',
  pickup: true,
  weapon: true,
});

// Ammo
room.extendElement('doomthing_Generic', 'doomthing_AmmoClip', {
  spritename: 'CLIP',
  spriteframe: 'A',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_AmmoBox', {
  spritename: 'AMMO',
  spriteframe: 'A',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_CellCharge', {
  spritename: 'CELL',
  spriteframe: 'A',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_CellBox', {
  spritename: 'CELP',
  spriteframe: 'A',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Rocket', {
  spritename: 'ROCK',
  spriteframe: 'A',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_RocketBox', {
  spritename: 'BROK',
  spriteframe: 'A',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Shells', {
  spritename: 'SHEL',
  spriteframe: 'A',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_ShellBox', {
  spritename: 'SBOX',
  spriteframe: 'A',
  pickup: true,
});

// Keys
room.extendElement('doomthing_Generic', 'doomthing_BlueKeycard', {
  spritename: 'BKEY',
  spriteframe: 'AB',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_BlueSkullKey', {
  spritename: 'BSKU',
  spriteframe: 'AB',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_RedKeycard', {
  spritename: 'RKEY',
  spriteframe: 'AB',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_RedSkullKey', {
  spritename: 'RSKU',
  spriteframe: 'AB',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_YellowKeycard', {
  spritename: 'YKEY',
  spriteframe: 'AB',
  pickup: true,
});
room.extendElement('doomthing_Generic', 'doomthing_YellowSkullKey', {
  spritename: 'YSKU',
  spriteframe: 'AB',
  pickup: true,
});

// Monsters
room.extendElement('doomthing_Generic', 'doomthing_Arachnotron', {
  spritename: 'BSPI',
  spriteframe: 'AB',
  height: 64,
  radius: 64,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 500,
});
room.extendElement('doomthing_Generic', 'doomthing_ArchVile', {
  type: 'MT_VILE',
  spritename: 'VILE',
  spriteframe: 'AB',
  height: 56,
  radius: 20,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 700,
});
room.extendElement('doomthing_Generic', 'doomthing_BaronOfHell', {
  spritename: 'BOSS',
  spriteframe: 'AB',
  height: 64,
  radius: 24,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 1000,
});
room.extendElement('doomthing_Generic', 'doomthing_Cacodemon', {
  spritename: 'HEAD',
  spriteframe: 'AB',
  height: 56,
  radius: 31,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 400,
});
room.extendElement('doomthing_Generic', 'doomthing_Chaingunner', {
  spritename: 'CPOS',
  spriteframe: 'AB',
  height: 56,
  radius: 20,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 70,
});
room.extendElement('doomthing_Generic', 'doomthing_CommanderKeen', {
  spritename: 'KEEN',
  spriteframe: 'AB',
  height: 72,
  radius: 16,
  monster: true,
  obstacle: true,
  shootable: true,
  hanging: true,
  hitpoints: 100,
});
room.extendElement('doomthing_Generic', 'doomthing_Cyberdemon', {
  spritename: 'CYBR',
  spriteframe: 'AB',
  height: 110,
  radius: 40,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 4000,
});
room.extendElement('doomthing_Generic', 'doomthing_Demon', {
  spritename: 'SARG',
  spriteframe: 'AB',
  height: 56,
  radius: 30,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 150,
});
room.extendElement('doomthing_Generic', 'doomthing_FormerHumanTrooper', {
  spritename: 'POSS',
  spriteframe: 'AB',
  height: 56,
  radius: 20,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 20,
});
room.extendElement('doomthing_Generic', 'doomthing_FormerHumanSergeant', {
  spritename: 'SPOS',
  spriteframe: 'AB',
  height: 56,
  radius: 30,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 30,
});
room.extendElement('doomthing_Generic', 'doomthing_HellKnight', {
  spritename: 'BOS2',
  spriteframe: 'AB',
  height: 64,
  radius: 24,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 500,
});
room.extendElement('doomthing_Generic', 'doomthing_Imp', {
  spritename: 'TROO',
  spriteframe: 'AB',
  height: 56,
  radius: 20,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 60,
});
room.extendElement('doomthing_Generic', 'doomthing_LostSoul', {
  spritename: 'SKUL',
  spriteframe: 'AB',
  height: 56,
  radius: 16,
  monster: true,
  obstacle: true,
  shootable: true,
  hanging: true,
  hitpoints: 100,
});
room.extendElement('doomthing_Generic', 'doomthing_Mancubus', {
  spritename: 'FATT',
  spriteframe: 'AB',
  height: 64,
  radius: 48,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 600,
});
room.extendElement('doomthing_Generic', 'doomthing_PainElemental', {
  spritename: 'PAIN',
  spriteframe: 'AB',
  height: 56,
  radius: 31,
  monster: true,
  obstacle: true,
  shootable: true,
  hanging: true,
  hitpoints: 400,
});
room.extendElement('doomthing_Generic', 'doomthing_Revenant', {
  spritename: 'SKEL',
  spriteframe: 'AB',
  height: 56,
  radius: 20,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 300,
});
room.extendElement('doomthing_Generic', 'doomthing_Spectre', {
  spritename: 'SARG',
  spriteframe: 'AB',
  height: 56,
  radius: 30,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 150,
});
room.extendElement('doomthing_Generic', 'doomthing_SpiderMastermind', {
  spritename: 'SPID',
  spriteframe: 'AB',
  height: 100,
  radius: 128,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 3000,
});
room.extendElement('doomthing_Generic', 'doomthing_WolfensteinSS', {
  spritename: 'SSWV',
  spriteframe: 'AB',
  height: 56,
  radius: 20,
  monster: true,
  obstacle: true,
  shootable: true,
  hitpoints: 50,
});

// Obstacles
room.extendElement('doomthing_Generic', 'doomthing_Barrel', {
  spritename: 'BAR1',
  spriteframe: 'AB',
  height: 42,
  radius: 10,
  shootable: true,
  obstacle: true,
  hitpoints: 500,
  create() {
    this.createSprite();
    this.light = this.createObject('light', {
      col: V(0,1,0),
      pos: V(0, this.height, 0),
      light_intensity: 4,
/*
      light_range: 16,
      light_shadow: true
*/
      light_range: 4,
      light_shadow: false
    });
  },
  advanceFrame(frametime) {
    this.light.light_intensity = 4 + Math.random() * 2;
    if (this.sprite) {
      this.sprite.advanceFrame(frametime);
    }
  },
});
room.extendElement('doomthing_Generic', 'doomthing_BurningBarrel', {
  spritename: 'FCAN',
  spriteframe: 'ABC',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_BurntTree', {
  spritename: 'TRE1',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Candelabra', {
  spritename: 'CBRA',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
  create() {
    this.createSprite();
    this.light = this.createObject('light', {
      col: V(1,1,0),
      pos: V(0, this.height * 3, 0),
      light_intensity: 6,
/*
      light_range: 16,
      light_shadow: true
*/
      light_range: 6,
      light_shadow: false
    });
  },
  advanceFrame(frametime) {
    this.light.light_intensity = 4 + Math.random() * 4;
    if (this.sprite) {
      this.sprite.advanceFrame(frametime);
    }
  },
});
room.extendElement('doomthing_Generic', 'doomthing_EvilEye', {
  spritename: 'CEYE',
  spriteframe: 'ABCB',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_SkullStack', {
  spritename: 'POL2',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_SkullFloat', {
  spritename: 'FSKU',
  spriteframe: 'ABC',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_FloorLamp', {
  spritename: 'COLU',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
  create() {
    this.createSprite();
    this.light = this.createObject('light', {
      col: V(1,1,.9),
      pos: V(0, this.height * 2, 0),
      light_intensity: 12,
      /*
      light_range: 16,
      light_shadow: true
      */
      light_range: 6,
      light_shadow: false
    });
  },
});
room.extendElement('doomthing_Generic', 'doomthing_HangingLeg', {
  spritename: 'GOR5',
  spriteframe: 'A',
  height: 52,
  radius: 16,
  hanging: true,
});
room.extendElement('doomthing_Generic', 'doomthing_HangingLegs', {
  spritename: 'GOR4',
  spriteframe: 'A',
  height: 68,
  radius: 16,
  hanging: true,
});
room.extendElement('doomthing_Generic', 'doomthing_HangingTorsoBrainRemoved', {
  spritename: 'HDB6',
  spriteframe: 'A',
  height: 64,
  radius: 16,
  hanging: true,
});
room.extendElement('doomthing_Generic', 'doomthing_HangingTorsoLookingDown', {
  spritename: 'HDB3',
  spriteframe: 'A',
  height: 64,
  radius: 16,
  hanging: true,
});
room.extendElement('doomthing_Generic', 'doomthing_HangingTorsoLookingUp', {
  spritename: 'HDB5',
  spriteframe: 'A',
  height: 64,
  radius: 16,
  hanging: true,
});
room.extendElement('doomthing_Generic', 'doomthing_HangingTorsoOpenSkull', {
  spritename: 'HDB4',
  spriteframe: 'A',
  height: 64,
  radius: 16,
  hanging: true,
});
room.extendElement('doomthing_Generic', 'doomthing_HangingVictimArmsOut', {
  spritename: 'GOR2',
  spriteframe: 'A',
  height: 84,
  radius: 16,
  hanging: true,
});
room.extendElement('doomthing_Generic', 'doomthing_HangingVictimGutsBrainRemoved', {
  spritename: 'HDB2',
  spriteframe: 'A',
  height: 88,
  radius: 16,
  hanging: true,
});
room.extendElement('doomthing_Generic', 'doomthing_HangingVictimGutsRemoved', {
  spritename: 'HDB1',
  spriteframe: 'A',
  height: 88,
  radius: 16,
  hanging: true,
});
room.extendElement('doomthing_Generic', 'doomthing_HangingVictimOneLegged', {
  spritename: 'GOR3',
  spriteframe: 'A',
  height: 84,
  radius: 16,
  hanging: true,
});
room.extendElement('doomthing_Generic', 'doomthing_HangingVictimTwitching', {
  spritename: 'GOR1',
  spriteframe: 'ABCB',
  height: 68,
  radius: 16,
  hanging: true,
});
room.extendElement('doomthing_Generic', 'doomthing_ImpaledHuman', {
  spritename: 'POL1',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_LargeBrownTree', {
  spritename: 'TRE2',
  spriteframe: 'A',
  height: 150,
  radius: 10,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_SkullPile', {
  spritename: 'POL3',
  spriteframe: 'AB',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_ShortFirestickBlue', {
  spritename: 'SMBT',
  spriteframe: 'ABCD',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_ShortFirestickGreen', {
  spritename: 'SMGT',
  spriteframe: 'ABCD',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_ShortPillarGreen', {
  spritename: 'COL2',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_ShortPillarGreenHeart', {
  spritename: 'COL5',
  spriteframe: 'AB',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_ShortFirestickRed', {
  spritename: 'SMRT',
  spriteframe: 'ABCD',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_ShortPillarRed', {
  spritename: 'COL4',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_ShortPillarRedSkull', {
  spritename: 'COL6',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_ShortTechnoFloorLamp', {
  spritename: 'TLP2',
  spriteframe: 'ABCD',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_SkullPole', {
  spritename: 'POL4',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_Stalagmite', {
  spritename: 'SMIT',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_TallFirestickBlue', {
  spritename: 'TBLU',
  spriteframe: 'ABCD',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_TallFirestickGreen', {
  spritename: 'TGRN',
  spriteframe: 'ABCD',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_TallPillarGreen', {
  spritename: 'COL1',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_TallFirestickRed', {
  spritename: 'TRED',
  spriteframe: 'ABCD',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_TallPillarRed', {
  spritename: 'COL3',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_TallTechnoFloorLamp', {
  spritename: 'TLMP',
  spriteframe: 'ABCD',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_TallTechnoPillar', {
  spritename: 'ELEC',
  spriteframe: 'A',
  height: 16,
  radius: 16,
  obstacle: true,
});
room.extendElement('doomthing_Generic', 'doomthing_TwitchingImpaledHuman', {
  spritename: 'POL6',
  spriteframe: 'AB',
  height: 16,
  radius: 16,
  obstacle: true,
});

// Decorations
room.extendElement('doomthing_Generic', 'doomthing_BloodyMess', {
  spritename: 'PLAY',
  spriteframe: 'W',
});
room.extendElement('doomthing_Generic', 'doomthing_BloodyMess2', {
  spritename: 'PLAY',
  spriteframe: 'W',
});
room.extendElement('doomthing_Generic', 'doomthing_Candle', {
  spritename: 'CAND',
});
room.extendElement('doomthing_Generic', 'doomthing_DeadCacodemon', {
  spritename: 'HEAD',
  spriteframe: 'L',
});
room.extendElement('doomthing_Generic', 'doomthing_DeadDemon', {
  spritename: 'SARG',
  spriteframe: 'N',
});
room.extendElement('doomthing_Generic', 'doomthing_DeadFormerHuman', {
  spritename: 'POSS',
  spriteframe: 'L',
});
room.extendElement('doomthing_Generic', 'doomthing_DeadFormerSergeant', {
  spritename: 'SPOS',
  spriteframe: 'L',
});
room.extendElement('doomthing_Generic', 'doomthing_DeadImp', {
  spritename: 'TROO',
  spriteframe: 'M',
});
room.extendElement('doomthing_Generic', 'doomthing_DeadLostSoul', {
  spritename: 'SKUL',
  spriteframe: 'K',
});
room.extendElement('doomthing_Generic', 'doomthing_DeadPlayer', {
  spritename: 'PLAY',
  spriteframe: 'N',
});
room.extendElement('doomthing_Generic', 'doomthing_PoolOfBlood', {
  spritename: 'POB1',
  spriteframe: 'A',
});
room.extendElement('doomthing_Generic', 'doomthing_PoolOfBlood2', {
  spritename: 'POB2',
  spriteframe: 'A',
});
room.extendElement('doomthing_Generic', 'doomthing_PoolOfBloodAndFlesh', {
  spritename: 'POL5',
  spriteframe: 'A',
});
room.extendElement('doomthing_Generic', 'doomthing_PoolOfBrains', {
  spritename: 'BRS1',
  spriteframe: 'A',
});

// Other
room.extendElement('doomthing_Generic', 'doomthing_BossBrain', {
  spritename: 'BBRN',
  spriteframe: 'A',
});
room.extendElement('doomthing_Generic', 'doomthing_DeathmatchStart', {
  spritename: false,
});
room.extendElement('doomthing_Generic', 'doomthing_Player1Start', {
  spritename: 'PLAY',
  spriteframe: 'AB',
});
room.extendElement('doomthing_Generic', 'doomthing_Player2Start', {
  spritename: 'PLAY',
  spriteframe: 'AB',
});
room.extendElement('doomthing_Generic', 'doomthing_Player3Start', {
  spritename: 'PLAY',
  spriteframe: 'AB',
});
room.extendElement('doomthing_Generic', 'doomthing_Player4Start', {
  spritename: 'PLAY',
  spriteframe: 'AB',
});
room.extendElement('doomthing_Generic', 'doomthing_SpawnShooter', {
  spritename: false,
});
room.extendElement('doomthing_Generic', 'doomthing_SpawnSpot', {
  spritename: false,
});
room.extendElement('doomthing_Generic', 'doomthing_TeleportLanding', {
  spritename: false,
});
room.extendElement('doomthing_Generic', 'doomthing_Missile', {
  spritename: 'MISL',
  spriteframe: 'A',

  dir: V(),
  speed: 512,
  radius: 2,

  createChildren: function() {
    this.active = false;

    this.light = this.createObject('light', {
      pos: V(0),
      light_intensity: 6,

      /*
      light_range: 24,
      light_shadow: true,
      //light_shadow_near: 2,
      */

      light_range: 8,
      light_shadow: false,

      col: V(1,.7,0)
    });
    this.setCollider('sphere', {radius: this.radius, offset: new THREE.Vector3(0, 24, 0)});
    this.addEventListener('collision', (ev) => this.explode());
  },
  fire: function(pos, dir) {
    this.pos = translate(pos, V(0,24,0));
    this.ydir = V(0,1,0);
    this.zdir = dir;

    this.vel = scalarMultiply(dir, -this.speed);

    if (!this.map) {
      this.map = this.parent.mapdata;
    }

    if (!this.sprite) {
      this.sprite = this.createObject('doomsprite', {
        sprite: this.map.wad.getSprite(this.spritename),
        frame: this.spriteframe
      });
      this.parent.things.push(this);

      //this.parent.things.push(this.sprite);
    }
    this.spriteframe = 'A';
    this.sprite.frame = 'A';
    this.sprite.pos.y = 0;
    this.active = true;
    this.visible = true;
    this.light.light_intensity = 6;
    this.light.col = V(1,.7,0);
    this.collidable = true;
    this.pickable = false;
    this.sprite.draw(true);
    this.createObject('sound', { id: 'DSRLAUNC', pos: V(0), gain: 1, singleshot: true});
  },

  onupdate() {
    if (this.sprite) {
//console.log(this.sprite.getAngleToViewer(player.pos), this.zdir, this.xdir, this.ydir);
      this.sprite.draw(true);
    }
    if (this.active) {
      let hits = this.raycast(V(0,0,-1));
      for (let i = 0; i < hits.length; i++) {
        let hit = hits[i];
        if (hit.distance < this.radius) {
          this.explode(hit.object);
          break;
        }
      }
    }
  },

  explode() {
    if (!this.collidable) return;
    this.vel = V(0,0.001,0);
    this.spriteframe = 'BCD';
    this.sprite.frame = 'B';
    this.sprite.currentframe = 0;
    this.sprite.draw(true);
    this.sprite.pos.y = -24;
    this.active = false;
    this.light.light_intensity = 16;
    this.light.col = V(.5,0,0);
    //this.level.playSound('DSBAREXP', 100, this.getWorldPosition());
    room.createObject('sound', { pos: this.getWorldPosition(), id: 'DSBAREXP', auto_play: true, gain: 1, singleshot: true });
    this.collidable = false;
    this.pickable = false;

    let shootables = [],
        things = this.parent.things;
    let pos = this.localToWorld(V(0));
    for (let i = 0; i < things.length; i++) {
      let thing = things[i];
      if (thing.shootable) {
        shootables.push({thing: thing, distance: thing.distanceTo(pos)});
      }
    } 
    shootables.sort((a, b) => a.distance - b.distance);
//console.log('my shootables', shootables);
    // TODO - apply area-effect damage

  },
  advanceFrame(frametime) {
    if (this.sprite) {
      if (this.sprite.frame == 'A') {
        this.sprite.pos.y  = 0;
      } else if (this.sprite.frame == 'B') {
        this.sprite.frame = 'C';
        this.light.light_intensity = 12;
      } else if (this.sprite.frame == 'C') {
        this.sprite.frame = 'D';
        this.light.light_intensity = 8;
      } else if (this.sprite.frame == 'D') {
        this.visible = false;
        this.pos.y = -9999;
      }
      this.sprite.advanceFrame(frametime);
    }
  },
});

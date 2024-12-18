THREE.VertexColors = true; // legacy
const settings = {
  thinglights: true,
  thinglightshadows: false,
};


room.registerElement('doomlevel', {
  wad: 'DOOM.WAD',
  pwad: '',
  map: 'E1M1',
  musicpath: 'https://spispopd.lol/music/doom/',
  showthings: false,
  obstacle: true,
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

    this.transition = player.createObject('doomtransition', { pos: V(-1.05, 0.7, -1), scale: V(2.1, 1.5, 1) }); // FIXME - should center based on screen resolution, etc

    this.wads = new WadJS.WadGroup();
    this.loadWads();

  },
  async loadWads() {
    try {
      let wad = await this.wads.load(this.wad);
      if (this.pwad) {
        let pwads = this.pwad.split(' ');
        for (let i = 0; i < pwads.length; i++) {
          await this.wads.load(pwads[i]);
        }
      }
      this.doomplayer = this.createObject('doomplayer', {wad: this.wads, map: { wad: this.wads }, /*collision_id: 'sphere', collision_scale: V(24),*/ autosync: true, js_id: player.getUsername() + '_avatar'});
      this.loadMap(this.map);
      this.sounds = this.wads.getSounds();
      this.engine.systems.sound.getRealListenerAsync().then(listener => {
        let audio = listener.context;
console.log(listener, audio);
        for (let k in this.sounds) {
          let sound = this.sounds[k];
          //console.log('register room sound', k, sound);
          var buffer = audio.createBuffer(1, sound.samples, sound.rate);
          buffer.getChannelData(0).set(sound.pcm);
          room.loadNewAsset('sound', { id: k, buffer: buffer, rate: this.sounds[k].rate });
        }
      });
    } catch (e) {
      console.log('Doom init failed', e);
    }
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
    this.transition.reset();

    if (this.currentmap && this.currentmap.parent) {
      this.currentmap.parent.remove(this.currentmap);

      if (this.collider && this.collider.parent) {
        this.collider.parent.remove(this.collider);
      }
      if (this.debug) {
        this.debug.die();
      }
    }
console.log('spawn new map', this, mapname);
    this.currentmap = this.createObject('doomlevel-map', {
      wads: this.wads,
      mapname: mapname,
    });
    this.currentmap.addEventListener('mapload', ev => {
      this.doomplayer.setLevel(ev.target);
      this.transition.begin();
    });
  }
});
room.registerElement('doomlevel-map', {
  map: null,
  mapname: '',
  wads: null,
  depth_write: true,
  depth_test: true,
  showceilings: true,

  create() {
    this.things = [];
    this.load();
  },
  load() {
/*
      this.stopMusic();
      if (this.things) {
        for (let i = 0; i < this.things.length; i++) {
          // FIXME - dumb hack, the player should keep track of its own things
          if (this.doomplayer.rockets.indexOf(this.things[i]) == -1) {
            this.removeChild(this.things[i]);
            this.things[i].stop();
            this.things[i].die();
          }
        }
      }
    }
*/
    var currentmap = this.currentmap = new THREE.Object3D();
    var wad = this.wads;

    this.mapnum = this.parseMapName(this.mapname);

    var map = (this.map ? this.map : wad.getMap(this.mapname));
    //this.map = mapname;
    this.mapdata = map;

    //this.parent.doomplayer.setLevel(this);

    var textures = wad.getTextures();
    var geometries = map.getGeometry();
    var sectormap = map.getSectorMap();
    //console.log('got some geo', geometries, sectormap, map, textures);

    //let restrictsectors = [72,74]; // back room
    //let restrictsectors = [37]; // front room steps
    let restrictsectors = false;//[22, 23]; // courtyard tunnel vomitorium

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
      geo.applyMatrix4(mat);

      var texture = null;
      if (textures[k.toLowerCase()]) {
        if (!textures[k.toLowerCase()].canvas) {
          textures[k.toLowerCase()].loadTexture(wad.getPalette(), wad.getPatches());
        }
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
        roughness: .9,
				specularIntensity: 0,
				specularColor: new THREE.Color('black'),
        map: texture,
        transparent: (textures[k.toLowerCase()] ? textures[k.toLowerCase()].transparent : false),
        vertexColors: THREE.VertexColors,
        depthWrite: (this.depth_write === null ? true : this.depth_write),
        depthTest: (this.depth_test === null ? true : this.depth_test),
        name: k,
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.name = 'sector-' + k + '-walls';
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.renderOrder = this.renderorder;
/*
      if (mat.transparent) {
        mesh.renderOrder = 999;
      }
*/
      currentmap.add(mesh);

      var collidermesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color: 0xffff00, opacity: .2, transparent: true, side: THREE.DoubleSide}));
      this.colliders.add(collidermesh);

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
    let sectorshapes = this.getSectorShapes(map);
    for (let i = 0; i < sectorshapes.length; i++) {
if (restrictsectors && restrictsectors.indexOf(i) == -1) continue;
      if (!sectorshapes[i]) {
        console.warn('Sectorshape ' + i + ' is empty', sectorshapes);
        continue;
      }
      var sector = map.getSector(i);
      let vertexlist = sectorshapes[i].vertexlist.slice(0);
      var hasfloor = sector.floorpic != '-';
      var hasceiling = sector.ceilingpic != '-';
      var linedefs = sectormap[i];

      let holes = this.getContainedSectors(vertexlist, sectorshapes);
//console.log(i, sector, vertexlist, sectorshapes[i], linedefs, holes, sectormap);
//if (holes.length > 0) { console.log('holes!', sector, vertexlist, holes, holes.map(hole => new THREE.Path().setFromPoints([...hole, hole[0]]))); }
      //var sectorfaces = THREE.ShapeUtils.triangulateShape(vertexlist, holes.map(hole => new THREE.Path().setFromPoints([...hole, hole[0]])));
      holes.forEach(hole => this.sliceSector(vertexlist, hole));

      var sectorfaces = THREE.ShapeUtils.triangulateShape(vertexlist, []);
      var lightlevel = sector.lightlevel / 255;
      //console.log(shape, sectorfaces);
      var newceilingverts = [],
          newceilingcolors = [];
      var floorverts = [];
      if (hasfloor) {
        for (let j = 0; j < vertexlist.length; j++) {
          floorverts.push(vertexlist[j].x, vertexlist[j].y, sector.floorheight);
        }
      }
      if (hasceiling) {
        for (let j = vertexlist.length - 1; j >= 0; j--) {
          newceilingverts.unshift(vertexlist[j].x, vertexlist[j].y, sector.ceilingheight);
        }
      }

      if (hasfloor) {
        var floor = map.getTextureGroup(sector.floorpic);
        var floorverts = floor.add(floorverts, sectorfaces, sector);
        texturegroups[sector.floorpic] = floor;
        sector.addFloorVertices(floorverts);
      }
      if (this.showceilings && hasceiling) {
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
      geo.applyMatrix4(mat);

      var texture = null;
      if (textures[k.toLowerCase()]) {
        if (!textures[k.toLowerCase()].canvas) {
          textures[k.toLowerCase()].loadTexture(wad.getPalette(), wad.getPatches());
        }
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
				specularIntensity: 0,
				specularColor: new THREE.Color('black'),
        map: texture,
        transparent: (textures[k.toLowerCase()] ? textures[k.toLowerCase()].transparent : false),
        vertexColors: THREE.VertexColors,
        depthWrite: (this.depth_write === null ? true : this.depth_write),
        depthTest: (this.depth_test === null ? true : this.depth_test),
        name: k,
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.renderOrder = this.renderorder;
/*
      if (mat.transparent) {
        mesh.renderOrder = 999;
      }
*/
      currentmap.add(mesh);

      //var collidermesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color: 0xffff00, opacity: .2, transparent: true, side: THREE.DoubleSide}));
      //this.colliders.add(collidermesh);
      //this.setCollider('mesh', {mesh: collidermesh});

      if (this.geometries[k]) {
        this.geometries[k] = THREE.BufferGeometryUtils.mergeBufferGeometries([this.geometries[k], geo]);
      } else {
        this.geometries[k] = geo; // FIXME - is it possible that this texture was already used as a wall texture?
      }
    }

    var spawnpoints = map.getThingsByType(1);
    if (spawnpoints.length > 0) {
      var spawnpoint = spawnpoints[0];
      //var playerheight = this.mapdata.getHeight(spawnpoint.x, spawnpoint.y);

      var currentsector = map.getSectorAt(spawnpoint.x, spawnpoint.y);
      var playerheight = currentsector.floorheight;
      var newy = (playerheight * this.parent.scale.y);

/*
      room.spawnpoint.position.set(spawnpoint.x * this.parent.scale.x, newy, -spawnpoint.y * this.parent.scale.z);
      room.spawnpoint.quaternion.setFromEuler(new THREE.Euler(0, (spawnpoint.angle - 90) * THREE.Math.DEG2RAD, 0));
      player.reset_position();
*/
    }

    this.objects['3d'].add(currentmap);
    let collidermap = currentmap.clone();
    collidermap.userData.thing = this;
    collidermap.traverse(n => { if (n.material) n.material = new THREE.MeshPhongMaterial({color: 0xffff00, opacity: .2, transparent: true}) });
    this.collidable = false;
    this.colliders.add(collidermap);
console.log('COLLIDER', collidermap);
    this.setCollider('mesh', {mesh: collidermap});
    this.collider = collidermap;
    //this.collision_trigger = true;

    currentmap.traverse(n => n.userData.thing = this._target);

    if (this.showthings) {
      this.thingpool = this.createObject('objectpool', {
      });
      this.createThings();
    }
    //this.startMusic();

    if (this.showdebug) {
      this.enableDebug(true);
    }

    this.dispatchEvent({type: 'mapload'});
    this.refresh();
  },
  enableDebug(showAllSectors=false) {
    if (!this.debug) {
      this.debug = this.createObject('doomdebugger', {doomplayer: this.doomplayer, showallsectors: showAllSectors});
    } else {
      this.debug.reset();
      this.appendChild(this.debug);
    }
  },
  disableDebug() {
    if (this.debug) {
      this.removeChild(this.debug);
    }
  },
  getSectorShapes(map) {
    let sectormap = map.getSectorMap();
    let shapes = [];
    for (var i = 0; i < sectormap.length; i++) {
      let linedefs = sectormap[i];
      if (!linedefs) {
        console.warn('Missing linedef ' + i, linedefs, map);
        continue;
      }
      let sectorverts = [];
      let edges = {};
      // Sort vertices into a sequential path around the perimeter
      for (let j = 0; j < linedefs.length; j++) {
        let linedef = linedefs[j];
        let side1 = map.getSidedef(linedef.side1),
            side2 = map.getSidedef(linedef.side2);

        let v1, v2;
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
        if (!current) break;
        vertexlist.push(new THREE.Vector2().copy(map.getVertex(current)));
        current = edges[current];
//console.log(' - check', current, first);
f++;
      } while (current != first && f < 100);

      if (vertexlist.indexOf(undefined) != -1) {
        console.error('undefined vertices in vertex list!', vertexlist, linedef, side1, side2);
        continue;
      }

      var shape = new THREE.Shape(vertexlist);
      if (!THREE.ShapeUtils.isClockWise(vertexlist)) {
        vertexlist.reverse();
      }
      shapes[i] = {
        vertexlist,
        edges,
        linedefs,
        shape,
      };
    }
    return shapes;
  },
  getContainedSectors(sector, sectorshapes) {
    let contained = [];
    for (let i = 0; i < sectorshapes.length; i++) {
      if (!sectorshapes[i]) {
        console.warn('Sector shape ' + i + ' is empty', sectorshapes, sector);
        continue;
      }
      if (this.sectorContainsShape(sector, sectorshapes[i].vertexlist)) {
        let vertexlist = sectorshapes[i].vertexlist.slice(0);
        contained.push(vertexlist);
      }
    }
    return contained;
  },
  sectorContainsShape(sector, shape) {
    // First, check the bounding box of each sector, if we're fully outside then no need to check the vertices
    let bbox1 = this.getBoundingBox(sector),
        bbox2 = this.getBoundingBox(shape);
    //console.log(bbox1, bbox2, bbox1.containsBox(bbox2));
    if (!bbox1.equals(bbox2) && bbox1.containsBox(bbox2)) {
      // We have a potentially overlapping sector, let's check the vertices and make sure it's fully contained
      // Start by picking any vector that isn't shared with the potentially-containing sector
      let vertex = this.getExclusiveVertex(shape, sector);
      if (vertex) {
        return this.pointIsInPolygon(vertex, sector);
      }
    }
    return false;
  },
  getExclusiveVertex(sector1, sector2) {
    for (let i = 0; i < sector1.length; i++) {
      for (let j = 0; j < sector2.length; j++) {
        if (!sector1[i].equals(sector2[j])) {
          return sector1[i];
        }
      }
    } 
    return null;
  },
  getSectorClosestPoints(sector1, sector2) {
    let closest = [sector1[0], sector2[0]],
        dist = Infinity;

    for (let i = 0; i < sector1.length; i++) {
      for (let j = 0; j < sector2.length; j++) {
        let newdist = sector1[i].distanceTo(sector2[j]);
        if (newdist < dist) {
          closest[0] = sector1[i];
          closest[1] = sector2[j];
          dist = newdist;
        }
      }
    }

    return closest;
  },
  sliceSector(sector, hole) {
//console.log('slice!', sector, hole);
    if (THREE.ShapeUtils.isClockWise(hole)) {
      hole = hole.slice(0).reverse()
//console.log('it was reversed, fix it', );
    }
    let closest = this.getSectorClosestPoints(sector, hole),
        idx1 = sector.indexOf(closest[0]),
        idx2 = hole.indexOf(closest[1]);
    if (idx1 != -1 && idx2 != -1) {
      //console.log('ok split it up', closest, idx1, idx2, sector, hole);
      //sector.splice((idx1+1)%sector.length, 0, ...hole.slice(idx2).concat(hole.slice(0, idx2)).concat([hole[idx2], sector[idx1]]));
      // Inject the hole's vertices into our containing sector's vertex list, spltting each list at their closest points.
      // See https://ianbelcher.me/tech-blog/building-a-webxr-version-of-doom for a detailed explanation
      sector.splice((idx1+1)%sector.length, 0, ...hole.slice(idx2), ...hole.slice(0, idx2), ...[hole[idx2], sector[idx1]]);
    }
  },
  getBoundingBox(sector) {
    let bbox = new THREE.Box2();
    for (let i = 0; i < sector.length; i++) {
      bbox.expandByPoint(sector[i]);
    }
    return bbox;
  },
  // pointIsInPolygon function, and much of the logic involved with triangulating floors and ceilings, provided by Ian Belcher 
  // https://ianbelcher.me/tech-blog/building-a-webxr-version-of-doom
  pointIsInPolygon(point, polygon) {
    // Ray-trace along x axis. Find all points where:
    // 1) a polygon edge crossed over the x axis at a position xIntersect
    // 2) where the start vertex of the edge and the y vertex are equal we need to walk out
    //    and find the next vertex that is off that axis and ensure that one diverges above
    //    and the other below.
    // 3) Count the number of instance the above happens where the intersect has a value less
    //    than x. If we have an odd number of results, the point is inside the polygon.
    let intersectingEdges = 0;
    for (let edgeIndex = 0; edgeIndex < polygon.length; edgeIndex += 1) {
      const nextIndex = index => (index !== polygon.length - 1 ? index + 1 : 0);
      const previousIndex = index => (index ? index - 1 : polygon.length - 1);
      let edgeIndexNext = nextIndex(edgeIndex);
      let edgeIndexPrevious = previousIndex(edgeIndex);

      if (
        (polygon[edgeIndex].y < point.y && polygon[edgeIndexNext].y > point.y)
        || (polygon[edgeIndex].y > point.y && polygon[edgeIndexNext].y < point.y)
      ) {
        // We have an intersection of the x axis. Calculate the xIntersect.
        const totalRise = polygon[edgeIndexNext].y - polygon[edgeIndex].y;
        const intersectRise = point.y - polygon[edgeIndex].y;
        const totalRun = polygon[edgeIndexNext].x - polygon[edgeIndex].x;
        const xIntersect = ((intersectRise / totalRise) * totalRun) + polygon[edgeIndex].x;

        if (xIntersect < point.x) {
          intersectingEdges += 1;
        }
      }

      if (
        polygon[edgeIndex].x < point.x
        && polygon[edgeIndex].y === point.y
        && polygon[edgeIndexPrevious].y !== point.y
      ) {
        while (polygon[edgeIndexNext].y === point.y) {
          edgeIndexNext = nextIndex(edgeIndexNext);
        }
        while (polygon[edgeIndexPrevious].y === point.y) {
          edgeIndexPrevious = previousIndex(edgeIndexPrevious);
        }
        if (
          (polygon[edgeIndexPrevious].y < point.y && polygon[edgeIndexNext].y > point.y)
          || (polygon[edgeIndexPrevious].y > point.y && polygon[edgeIndexNext].y < point.y)
        ) {
          // We have a shared point on the y axis. The xIntersect is simply
          // equal to the polygons x value which checked was < x above
          intersectingEdges += 1;
        }
      }
    }

    return intersectingEdges % 2 > 0;
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
console.log('got tons of things', things);
    //this.things = [];
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
    this.stopMusic();

    room.loadNewAsset('sound', {
      id: soundname,
      src: this.musicpath + soundname + '.ogg',
    });
    if (this.music) {
      this.music.id = soundname;
      //this.music.play();
    } else {
      this.music = this.createObject('sound', {
        id: soundname,
        loop: true,
        rect: '-100 -100 100 100',
        gain: .2
      });
      this.music.play();
    }
  },
  stopMusic: function() {
console.log('stop lebvel music', this.music);
    if (this.music) {
      //this.music.die();
      this.music.stop();
      this.music.rect = '9999 9999 10000 1000'; 
      //this.removeChild(this.music);
    }
  },

  setSectorCeilingHeight(sectorid, height) {
    var sector = this.mapdata.getSector(sectorid);
    sector.ceilingheight = height;
    this.updateSectorGeometry(sectorid);
  },
  updateSectorGeometry: function(sectorid) {
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
        geo.attributes.position.array[verts[1] * 3 + 1] = sector.ceilingheight;
        geo.attributes.position.array[verts[2] * 3 + 1] = sector.ceilingheight;
        geo.attributes.position.array[verts[0] * 3 + 1] = sector.floorheight;
        geo.attributes.position.array[verts[3] * 3 + 1] = sector.floorheight;
        geometries[geo.uuid] = geo;
      }
      if (flipside && flipside.midtexture != '-') {
        var geo = this.geometries[flipside.midtexture];
        var verts = flipside.quads.middle;
        geo.attributes.position.array[verts[1] * 3 + 1] = sector.ceilingheight;
        geo.attributes.position.array[verts[2] * 3 + 1] = sector.ceilingheight;
        geometries[geo.uuid] = geo;
        if (sector.floorheight == othersector.floorheight) {
          geo.attributes.position.array[verts[0] * 3 + 1] = sector.ceilingheight;
          geo.attributes.position.array[verts[3] * 3 + 1] = sector.ceilingheight;
        } else {
          //geo.attributes.position.array[verts[0] * 3 + 1] = sector.floorheight;
          //geo.attributes.position.array[verts[3] * 3 + 1] = sector.floorheight;
        }
      }

      // FIXME - this needs to look at the adjacent sector heights, and adjust top and bottom verts accordingly
      if (sidedef.bottomtexture != '-') {
        var geo = this.geometries[sidedef.bottomtexture];
        var verts = sidedef.quads.bottom;
        geo.attributes.position.array[verts[1] * 3 + 1] = sector.ceilingheight;
        geo.attributes.position.array[verts[2] * 3 + 1] = sector.ceilingheight;
        geometries[geo.uuid] = geo;
        if (sector.floorheight == othersector.floorheight) {
          geo.attributes.position.array[verts[0] * 3 + 1] = sector.ceilingheight;
          geo.attributes.position.array[verts[3] * 3 + 1] = sector.ceilingheight;
        } else {
          //geo.attributes.position.array[verts[0] * 3 + 1] = sector.floorheight;
          //geo.attributes.position.array[verts[3] * 3 + 1] = sector.floorheight;
        }
      }
      if (flipside && flipside.bottomtexture != '-') {
        var geo = this.geometries[flipside.bottomtexture];
        var verts = flipside.quads.bottom;
        geo.attributes.position.array[verts[1] * 3 + 1] = sector.floorheight;
        geo.attributes.position.array[verts[2] * 3 + 1] = sector.floorheight;
        if (sector.floorheight == othersector.floorheight) {
          geo.attributes.position.array[verts[0] * 3 + 1] = sector.ceilingheight;
          geo.attributes.position.array[verts[3] * 3 + 1] = sector.ceilingheight;
        } else {
          //geo.attributes.position.array[verts[0] * 3 + 1] = sector.floorheight;
          //geo.attributes.position.array[verts[3] * 3 + 1] = sector.floorheight;
        }

        geometries[geo.uuid] = geo;
      }
      if (flipside && flipside.toptexture != '-') {
        var geo = this.geometries[flipside.toptexture];
        var verts = flipside.quads.top;
        geo.attributes.position.array[verts[0] * 3 + 1] = sector.ceilingheight;
        geo.attributes.position.array[verts[3] * 3 + 1] = sector.ceilingheight;
        geometries[geo.uuid] = geo;
        if (sector.ceilingheight == othersector.ceilingheight) {
          geo.attributes.position.array[verts[1] * 3 + 1] = sector.ceilingheight;
          geo.attributes.position.array[verts[2] * 3 + 1] = sector.ceilingheight;
        } else {
          //geo.attributes.position.array[verts[1] * 3 + 1] = sector.floorheight;
          //geo.attributes.position.array[verts[2] * 3 + 1] = sector.floorheight;
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
        // FIXME - need to flip ceiling face normals
        geo.attributes.position.array[vert * 3 + 1] = sector.ceilingheight;
      }
    }
    if (sector.floorvertices) {
      var geo = this.geometries[sector.floorpic];
      geometries[geo.uuid] = geo;
      for (var i = 0; i < sector.floorvertices.length; i++) {
        var vert = sector.floorvertices[i];
        geo.attributes.position.array[vert * 3 + 1] = sector.floorheight;
      }
    }

    for (var k in geometries) {
      var geo = geometries[k];
      geo.attributes.position.needsUpdate = true;
      geo.computeBoundingSphere();
    }

    //sector.ceilingheight = height;
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
/*
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
*/
    sector.floorheight = height;
    this.updateSectorGeometry(sectorid);
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
    if (!this.wads.sounds) this.wads.getSounds();
    if (this.wads.sounds[name]) {
      let sound = this.wads.sounds[name];
      let audio = player.ears.children[0].context;
      var buffer = audio.createBuffer(1, sound.samples, sound.rate);
      buffer.getChannelData(0).set(sound.pcm);

      var source = audio.createBufferSource();
      source.buffer = buffer;
      if (position) {
        let output = audio.createPanner();
        output.positionX.value = position.x;
        output.positionY.value = position.y;
        output.positionZ.value = position.z;
console.log('MY POSITION', output.positionX, output.positionY, output.positionZ, output);
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
room.registerElement('doomtransition', {
  colwidth: 2,
  speed: .03,
  maxdev: .4,
  maxdiff: .05,

  create() {
    this.createGeometry();
    this.reset();
    //this.startTransition();
  },
  createGeometry() {
    let composer = this.engine.systems.render.views.main.composer;
    let renderTarget = composer.renderTarget1;

    let geo = new THREE.BufferGeometry();
    let columns = Math.floor(renderTarget.width / this.colwidth);
    this.columns = columns;

    let pos = new Float32Array(6 * columns * 3),
        uvs = new Float32Array(6 * columns * 2);

    for (let i = 0; i < columns; i++) {
      let uvoffset = i * 6 * 2,
          posoffset = i * 6 * 3;
      // bottom left
      pos[posoffset] = i  / columns;
      pos[posoffset + 1] = 0;
      uvs[uvoffset] = i  / columns;
      uvs[uvoffset + 1] = 0;
      // bottom right
      pos[posoffset + 3] = (i + 1)  / columns;
      pos[posoffset + 4] = 0;
      uvs[uvoffset + 2] = (i + 1) / columns;
      uvs[uvoffset + 3] = 0;
      // top left
      pos[posoffset + 6] = i / columns;
      pos[posoffset + 7] = 1;
      uvs[uvoffset + 4] = i / columns;
      uvs[uvoffset + 5] = 1;

      // top left
      pos[posoffset + 9] = i / columns;
      pos[posoffset + 10] = 1;
      uvs[uvoffset + 6] = i  / columns;
      uvs[uvoffset + 7] = 1;
      // bottom right
      pos[posoffset + 12] = (i + 1)  / columns;
      pos[posoffset + 13] = 0;
      uvs[uvoffset + 8] = (i + 1) / columns;
      uvs[uvoffset + 9] = 0;
      // top right
      pos[posoffset + 15] = (i + 1)  / columns;
      pos[posoffset + 16] = 1;
      uvs[uvoffset + 10] = (i + 1) / columns;
      uvs[uvoffset + 11] = 1;
    }
    

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    this.loadNewAsset('object', { id: 'fadestrips', object: new THREE.Mesh(geo) });
    this.createObject('object', { id: 'fadestrips', image_id: 'oldscreen', cull_face: 'none', scale: V(1), lighting: false, depth_test: false, renderorder: 100,})

    this.stripgeo = geo;
    
  },
  reset() {
    this.updateTexture();
    this.resetStrips();
  },
  updateTexture() {
    // save current screen to texture
    let composer = this.engine.systems.render.views.main.composer;
    let renderTarget = this.renderTarget,
        renderTarget2 = this.renderTarget2;
    if (!renderTarget) {
      renderTarget = this.renderTarget = composer.renderTarget1.clone();
      renderTarget2 = this.renderTarget2 = composer.renderTarget1.clone();
      this.copypass = new THREE.ShaderPass(THREE.CopyShader);
      this.gammapass = new THREE.ShaderPass(THREE.GammaCorrectionShader);
      this.loadNewAsset('image', { id: 'oldscreen', texture: renderTarget.texture, hasalpha: true, });
    }
    this.copypass.render(composer.renderer, renderTarget, composer.readBuffer, 0, false);
  },
  resetStrips() {
    // Map texture to geometry made up of vertical strips
    // Assign a random negative start time to each strip, so we can animate them falling at constant speed but with different offsets
    this.columntimes = [];
    let ct = this.columntimes;
    for (let i = 0; i < this.columns; i++) {
      //this.columntimes[i] = -Math.random() / 2;
      if (i == 0) {
        ct[i] = -Math.random() * this.maxdev;
      } else {
        ct[i] = Math.min(0, Math.max(-this.maxdev, ct[i - 1] + (Math.random() * this.maxdiff) - this.maxdiff / 2));
      }
    }
  },
  begin() {
    this.active = true;
  },
  update(dt) {
    if (this.active) {
      if (!this.stripgeo) return;

      let geo = this.stripgeo,
          pos = geo.attributes.position.array,
          uvs = geo.attributes.uv.array;

      let ct = this.columntimes;

      let alldone = true;
      // Animate the top positions and bottom uv map values for each strip to simulate melting
      for (let i = 0; i < this.columns; i++) {
        let uvoffset = i * 6 * 2,
            posoffset = i * 6 * 3;

        let y = Math.min(1, Math.max(0, ct[i]));

        pos[posoffset + 7] = 1 - y
        pos[posoffset + 10] = 1 - y;
        pos[posoffset + 16] = 1 - y;

        uvs[uvoffset + 1] = y;
        uvs[uvoffset + 3] = y;
        uvs[uvoffset + 9] = y;

        ct[i] += this.speed;
        alldone = (alldone && y == 1);
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.uv.needsUpdate = true;
      this.active = !alldone;

      if (alldone) {
        console.log('it finished!');
      }
    }
  }
});

room.registerElement('doomplayer', {
  level: null,
  wad: null,
  map: null,
  angle: 0,
  height: 56,
  radius: 24,
  usedistance: 48,
  noclip: false,

  _tmpvec: V(),
  _tmpvec2: V(),

  createChildren: function() {
    // No visible children, unless we want the doom marine to self-shadow...
console.log('PLAYER', this.parent);
    //let level = {wad: this.parent.wadfile};
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

    this.sprite = this.createObject('doomthing_Player1Start', {
      map: this.map,
      autosync: true,
      js_id: player.getUsername() + '_avatar_sprite',
      visible: false
    });
console.log('player sprite', this.sprite);
    //this.parent.things.push(this.sprite);

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
    if (this.rockets) {
      this.rockets.forEach(rocket => rocket.die());
    }
      let rocketname = player.getUsername() + '_rocket_';
      this.rockets = [
        this.parent.createObject('doomthing_Missile', { pos: V(0,-9999,0), map: { wad: this.wad }, level: level, autosync: true, js_id: rocketname + '1'}),
        this.parent.createObject('doomthing_Missile', { pos: V(0,-9998,0), map: { wad: this.wad }, level: level, autosync: true, js_id: rocketname + '2'}),
        this.parent.createObject('doomthing_Missile', { pos: V(0,-9997,0), map: { wad: this.wad }, level: level, autosync: true, js_id: rocketname + '3'}),
        this.parent.createObject('doomthing_Missile', { pos: V(0,-9996,0), map: { wad: this.wad }, level: level, autosync: true, js_id: rocketname + '4'}),
        this.parent.createObject('doomthing_Missile', { pos: V(0,-9995,0), map: { wad: this.wad }, level: level, autosync: true, js_id: rocketname + '5'}),
        this.parent.createObject('doomthing_Missile', { pos: V(0,-9994,0), map: { wad: this.wad }, level: level, autosync: true, js_id: rocketname + '6'}),
      ];
      for (let i = 0; i < this.rockets.length; i++) {
        level.things.push(this.rockets[i]);
        this.rockets[i].level = level;
      }
/*
    } else {
      for (let i = 0; i < this.rockets.length; i++) {
        level.appendChild(this.rockets[i]);
        this.rockets[i].level = level;
      }
    }
*/
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
console.log(intersections);
    let handled = false;
    if (intersections.length > 0) {
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
            if (this.wad.iwad.version == 'doom1') {
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
        //this.level.createObject('sound', { id: 'DSOOF', gain: 1, singleshot: true});
      }
    }
    return handled;
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
    var params = this.getLinedefParams(linedef);
    for (var i = 0; i < sectors.length; i++) {
      var sector = sectors[i];

      var adjacent = sector.getAdjacentSectors();
      var minheight = linesector.ceilingheight;
      for (var j = 0; j < adjacent.length; j++) {
        if (adjacent[j].ceilingheight < minheight) {
          minheight = adjacent[j].ceilingheight;
        }
      }


      // FIXME - each door should be independently timed and controlled, eg, we should have a 'doomdoor' type
console.log('go door go', linedef, params);
      let v1 = this.map.getVertex(linedef.v1),
          v2 = this.map.getVertex(linedef.v2);
      let middle = V((v1.x + v2.x) / 2, 0, -(v1.y + v2.y) / 2);
      if (params.type == 'door') {
        let newheight = sector.findLowestCeilingSurrounding();
console.log('current height is', sector.ceilingheight, newheight. minheight);
        if (params.subtype == 'open' || params.subtype == 'open_wait_close') {
          this.level.raiseSectorCeilingTo(sector.id, newheight - 4, 40);
          this.parent.playSound('DSDOROPN');
          //this.level.createObject('sound', { id: 'DSDOROPN', pos: middle, gain: 1, singleshot: true});
          if (params.subtype == 'open_wait_close') {
            setTimeout(() => {
              this.level.lowerSectorCeilingTo(sector.id, sector.floorheight, 40);
              this.parent.playSound('DSDORCLS');
              //this.level.createObject('sound', { id: 'DSDORCLS', pos: middle, gain: 1, singleshot: true});
            }, params.delay + 2000);
          }
        } else if (params.subtype == 'close' || params.subtype == 'close_wait_open') {
          this.level.lowerSectorCeilingTo(sector.id, sector.floorheight, 40);
          this.level.createObject('sound', { id: 'DSDORCLS', pos: middle, gain: 1, singleshot: true});
          if (params.subtype == 'close_wait_open') {
            setTimeout(() => {
              this.level.raiseSectorCeilingTo(sector.id, newheight - 4, 40);
              this.level.createObject('sound', { id: 'DSDOROPN', pos: middle, gain: 1, singleshot: true});
            }, params.delay + 2000);
          }
        }
      } else if (params.type == 'floor') {
        let newheight = sector.findHighestFloorSurrounding();
        if (params.subtype == 'lowest_neighbor_ceiling') {
          this.level.lowerSectorFloorTo(sector.id, newheight + params.offset, 40);
          this.parent.playSound('DSDOROPN');
          //this.level.createObject('sound', { id: 'DSPSTART', pos: middle, gain: 1, singleshot: true});
          setTimeout(() => {
            this.level.createObject('sound', { id: 'DSPSTOP', pos: middle, gain: 1, singleshot: true});
          }, params.delay + 2000);
        } else if (params.subtype == 'close' || params.subtype == 'close_wait_open') {
          this.level.lowerSectorCeilingTo(sector.id, sector.floorheight, 40);
          this.level.createObject('sound', { id: 'DSDORCLS', pos: middle, gain: 1, singleshot: true});
          if (params.subtype == 'close_wait_open') {
            setTimeout(() => {
              this.level.raiseSectorCeilingTo(sector.id, newheight - 4, 40);
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
      offset: 0,
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
      case 36:
        params.type = 'floor';
        params.subtype = 'lowest_neighbor_ceiling';
        params.offset = 8;
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
    if (this.wad.iwad.version == 'doom1') {
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

return;
    if (!this.level) return;
    var playerdir = this.level.worldToLocal(this._tmpvec.set(player.dir.x, 0, player.dir.z).normalize()).normalize();
    var playerangle = Math.atan2(playerdir.z, playerdir.x);
    this.angle = playerangle;
    var automap = this.getAutomap();
    if (automap) { // && (automap.playerangle != playerangle || !automap.pos.equals(player.pos))) {
      automap.setPlayerAngle(playerangle);
    }

    if (!this.noclip && this.map) {
      var playerpos = this.level.worldToLocal(this._tmpvec.set(player.pos.x, -player.pos.z, player.pos.y));

playerpos.x = Math.round(playerpos.x);
playerpos.y = Math.round(playerpos.y);
playerpos.z = Math.round(playerpos.z);

      //var playervel = this.level.worldToLocal(V(player.vel.x, -player.vel.z, player.vel.y)).multiplyScalar(dt).add(scalarMultiply(this.level.worldToLocal(normalized(V(player.vel.x, -player.vel.z, player.vel.y))), .5));
      let nextpos = this.level.worldToLocal(this._tmpvec2.set(player.vel.x, -player.vel.z, player.vel.y).multiplyScalar(dt)).add(playerpos);
      playervel = nextpos.clone().sub(playerpos); // allocation
//console.log('dt', dt, playerpos, playervel, nextpos);
      
      var map = this.map;
      // Handle wall collisions
      var speed = playervel.length();
      if (speed > 1e-10) {
        let intersections = map.getSphereIntersections(new WadJS.Vertex(playerpos.x, playerpos.y), playervel, this.radius); // allocation
        let touching = false;
        if (intersections.length > 0) {
          let intersection = intersections[0],
              seg = intersection[0],
              linedef = map.getLinedef(seg.linedef),
              side0 = map.getSidedef(linedef.side1),
              side1 = map.getSidedef(linedef.side2),
              sector0 = map.getSector(side0.sector),
              sector1 = (side1 ? map.getSector(side1.sector) : false),
              v1 = map.getVertex(linedef.v1),
              v2 = map.getVertex(linedef.v2),
              currentside = (seg.side == 0 ? side0 : side1),
              currentsector = (seg.side == 0 ? sector0 : sector1),
              othersector = (seg.side == 0 ? sector1 : sector0);

          //console.log(currentsector, othersector, side0, side1);
          if (!othersector || ((othersector.floorheight - playerpos.z > 24 || othersector.ceilingheight - playerpos.z - this.height < 0) && currentside.middletex != '-')) {
            touching = true;
            console.log('boing!', intersections, playervel, playerpos, nextpos);
            // A wall is considered solid if:
            //  - there's nothing on the other side
            //  - the floor of the sector we're moving into is > 24 units high
            //let playerworldpos = this.level.localToWorld(V(playerpos));
            //player.pos.set(playerworldpos.x, playerworldpos.z, -playerworldpos.y);
            let diff = V(v2.x - v1.x, 0, v2.y - v1.y), // allocation
                normal = (seg.side == 0 ? V(-diff.z, 0, diff.x).normalize() : V(diff.z, 0, -diff.x).normalize()), // allocation
                speed = player.vel.length(),
                dot = normal.dot(normalized(player.vel)); // allocation
//console.log('boink', playerpos, playerdir, playervel, player.vel, normal, dot);

//player.moveForce.force.set(0,0,0);
            // FIXME - need to calculate proper reflection force here, and push back against the player as long as they're in contact with the wall
            this.wallforce.update(scalarMultiply(player.moveForce.force, -dot));
//console.log('new wallforce', this.wallforce.force, player.moveForce.force);
            player.vel = translate(player.vel, scalarMultiply(normal, -dot * speed)); // allocation
playerpos.x = intersection[1].x;
playerpos.z = -intersection[1].y;
            let playerworldpos = this.level.localToWorld(V(playerpos)); // allocation
            player.pos.x = playerworldpos.x;
            player.pos.z = playerworldpos.z;

          }
        }
        if (!touching) {
          this.wallforce.update(V(0,0,0));
        }
      }
      this.pos = this.level.worldToLocal(V(player.pos)); // allocation
let angle = -this.angle * 180 / Math.PI + 90;
//console.log(angle);
      this.rotation.y = angle;
//console.log('wallforce', this.wallforce.force);

      // Handle height
      var currentsector = this.map.getSectorAt(player.pos.x / this.level.scale.x, -player.pos.z / this.level.scale.z);
      this.lastsector = currentsector;
      var playerheight = currentsector.floorheight;
      var newy = (playerheight * this.level.scale.y);
      var stepheight = 24 * this.level.scale.y;
      if (player.pos.y > newy) {
        player.vel = translate(player.vel, scalarMultiply(V(0,-9.8 * 3,0), dt)); // Gravity is a magic number tuned to feel like the original game
        if (this.playerOnGround) {
          this.dropFromHeight = player.pos.y;
        }
        this.playerOnGround = false;
        //player.pos.y = playerheight / 100 - 1;
      } else {
        //player.accel = V(0,0,0);
//console.log(newy, playerheight);
        if (!this.playerOnGround) {
          let dropheight = (this.dropFromHeight - player.pos.y) / this.level.scale.y;
          if (dropheight > 48) {
            console.log('crunch!', dropheight);
            this.level.playSound('DSOOF');
          }
        }
        if (player.pos.y < newy && newy - player.pos.y < stepheight) {
          player.pos.y = newy;
        } else if (playerheight == Infinity) {
          player.pos = translate(player.pos, scalarMultiply(player.vel, -dt));
          player.vel = V(0,0,0);
        } else if (this.playerOnGround) {
          player.vel.y = 0;
          player.pos.y = currentsector.floorheight * this.level.scale.y;
        }
        this.playerOnGround = true;
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
      if (!this.use()) {
        // If we're close enough to activate a switch or door, we do that instead of firing
        this.rockets[this.currentrocket++ % this.rockets.length].fire(this.parent.worldToLocal(V(player.pos)), V(player.dir));
      }
    }
  },
  onmouseup: function(ev) {
  }
});


room.registerElement('doomthing_Generic', {
  sprite: null,
  spriteframe: 'A',
  angle: 0,
  statemachine: null,
  map: null,
  type: null,
  spritename: '',
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
  maxdist: 20,
  skipbillboard: false,

  textures: {},

  _tmpvec: V(),
  _tmpvec2: V(),
  create() {
    this.createSprite();
//console.log('create sprite', this, this.createLight);
    if (this.createLight) {
      this.createLight();
    }
    if (this.height && this.radius && (this.obstacle || this.shootable || this.pickup)) {
      this.setCollider('cylinder', {height: this.height, radius: this.radius, offset: new THREE.Vector3(0, this.height / 2, 0)});
      if (!this.obstacle) {
        this.collision_trigger = true;
        this.collidable = false;
      }
      //this.addEventListener('physics_collide', (ev) => console.log(this, ev));
    }

  },

  createSprite() {
    let spritedef = this.map.wad.getSprite(this.spritename);
    this.elapsedframetime = 0;
    this.currentframe = 0;
    if (spritedef) {
      this.sprite = spritedef;
      // TODO - register this sprite as an AssetImage, so we can use it via image_id
//console.log('new sprite', this.spritename, spritedef, this);
      this.plane = this.createObject('Object', {
        id: 'plane',
        //scale: V(this.sprite.canvas.width,this.sprite.canvas.height,1),
        billboard: (this.skipbillboard ? false : 'y'),
        pos: V(0,28,0),
        //image_id: this.sprite.id,
        tex_linear: true,
        //cull_face: 'none',
        pickable: false,
        collidable: false,
        texture_offset: V(0),
        texture_repeat: V(1),
        depth_test: this.depth_test,
        depth_write: this.depth_write,
      });
      this.advanceFrame(0);

//setTimeout(() => {
      //this.plane.objects['3d'].children[1].children[0].onBeforeRender = (renderer, scene, camera) => { this.draw(false, camera) };
//}, 2000);
    }
  },
  //onupdate() {
    //this.draw();
  //},
  advanceFrame(elapsedframetime) {
    if (elapsedframetime > 0 && this.distanceToSquared(player) > this.maxdist * this.maxdist) return; // FIXME - quick hack to reduce sprite processing

if (this.debugme) debugger;
    if (isNaN(this.currentframe)) this.currentframe = 0;
    this.currentframe = (this.currentframe + 1) % this.spriteframe.length;

    if (this.updateLight) {
      this.updateLight();
    }
    this.draw(true);
  },
  draw(force, camera) {
    if (!force && camera && this.distanceToSquared(camera.position) > this.maxdist * this.maxdist) return; // FIXME - quick hack to reduce sprite processing
    let sprite = this.sprite,
        tmpvec = this._tmpvec;

    if (sprite && this.plane) {
      if (!camera) camera = player.camera;
      let camerapos = camera.getWorldPosition(tmpvec.set(0,0,0));
      let angle = (sprite.frameHasAngles(this.spriteframe[this.currentframe]) ? this.getAngleToViewer(camerapos) : 0);
/*
      var frameid = this.frame[this.currentframe] + angle;
*/
      let frame = sprite.frames[this.spriteframe[this.currentframe]][angle];
      let assetid = sprite.id + '_sheet';
      if (this.plane.image_id != assetid) {
        let canvas = sprite.getSpriteSheet();
//console.log('set canvas thing', assetid, canvas);
        if (!this.textures[assetid]) {
          room.loadNewAsset('image', { id: assetid, canvas: canvas, tex_linear: false, hasalpha: true });
          this.textures[assetid] = room.getAsset('image', assetid);
        }
        this.plane.image_id = assetid;
      }
      let offset = sprite.getSpriteSheetFrame(this.spriteframe[this.currentframe], angle);
      this.plane.scale.x = frame.width;
      this.plane.scale.y = frame.height;
      this.plane.pos.y = frame.height / 2;
      this.plane.texture_offset.set(offset[0], offset[1]);
      this.plane.texture_repeat.set(offset[2], offset[3]);
      this.plane.updateTextureOffsets();
//console.log(this.frame[this.currentframe], angle, this.plane.texture_offset);
    }
    //this.zdir = player.dir;
    //this.ydir = V(0,1,0);
  },
  getAngleToViewer(viewerpos) {
    let tmpvec = this._tmpvec2;
    let ppos = this.worldToLocal(viewerpos);
    ppos.y = 0;

    let dir = tmpvec.copy(ppos).normalize();
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
room.registerElement('doomdoor', {
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
  createLight() {
    if (settings.thinglights) {
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
    }
  },
  updateLight(frametime) {
    if (this.light) {
      this.light.light_intensity = 4 + Math.random() * 2;
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
  createLight() {
    if (settings.thinglights) {
      this.light = this.createObject('light', {
        col: V(1,1,0),
        pos: V(0, this.height * 3, 0),
        light_intensity: 6,
        light_shadow: settings.thinglightshadows,
        light_range: (settings.thinglightshadows ? 16 : 6),
      });
    }
  },
  updateLight() {
    if (this.light) {
      this.light.light_intensity = 4 + Math.random() * 4;
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
  createLight() {
    if (settings.thinglights) {
      this.light = this.createObject('light', {
        col: V(1,1,.9),
        pos: V(0, this.height * 2, 0),
        light_intensity: 12,
        light_shadow: settings.thinglightshadows,
        light_range: (settings.thinglightshadows ? 16 : 6),
      });
    }
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

  createLight() {
    if (settings.thinglights) {
      this.light = this.createObject('light', {
        col: V(1,1,1),
        pos: V(0, this.height * 3, 0),
        light_intensity: 12,
        light_shadow: settings.thinglightshadows,
        light_range: (settings.thinglightshadows ? 16 : 6),
      });
    }
  },
  updateLight() {
    if (this.light) {
      this.light.light_intensity = 10 + 2 * (Math.sin(new Date().getTime() / 500) + 1);
    }
  }
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
  maxdist: Infinity,

  dir: V(),
  speed: 512,
  radius: 2,

  createLight() {
    this.active = false;

    this.light = this.createObject('light', {
      pos: V(0),
      light_intensity: 6,

      light_shadow: settings.thinglightshadows,
      light_range: (settings.thinglightshadows ? 24 : 8),

      col: V(1,.7,0)
    });
    //this.setCollider('sphere', {radius: this.radius, offset: new THREE.Vector3(0, 24, 0)});
    //this.addEventListener('collision', (ev) => this.explode());
  },
  fire(pos, dir) {
    this.pos = translate(pos, V(0,24,0));
    this.ydir = V(0,1,0);
    this.zdir = dir;

    this.vel = scalarMultiply(dir, -this.speed);

    if (!this.map) {
      this.map = this.parent.mapdata;
    }

/*
    if (!this.sprite) {
      this.sprite = this.createObject('doomsprite2', {
        sprite: this.map.wad.getSprite(this.spritename),
        frame: this.spriteframe,
        depth_write: false,
      });
      this.parent.things.push(this);
*/

    //}
      //this.parent.things.push(this.sprite);
    //this.spriteframe = 'A';
    //this.plane.pos.y = 0;
    this.active = true;
    this.visible = true;
    this.light.light_intensity = 6;
    this.light.col = V(1,.7,0);
    this.collidable = true;
    this.pickable = false;
    this.spriteframe = 'A';
    this.currentframe = 0;
    this.draw(true);
    //this.createObject('sound', { id: 'DSRLAUNC', pos: V(0), gain: 1, singleshot: true});
    this.level.playSound('DSRLAUNC', 100, this.level.localToWorld(pos.clone()));
console.log(this.level.localToWorld(this.localToWorld(V(0,0,-.1))), this.level.localToWorld(this.pos.clone()), this);
  },

  onupdate() {
//console.log(this.sprite.getAngleToViewer(player.pos), this.zdir, this.xdir, this.ydir);
//console.log('up', this.getWorldPosition());
    this.draw(true);
    if (this.active) {
      let hits = this.raycast();
      for (let i = 0; i < hits.length; i++) {
        let hit = hits[i];
        if (hit.object && hit.object.obstacle && hit.distance < this.radius) {
          this.explode(hit.object);
          break;
        }
      }
    }
  },

  explode() {
    if (!this.collidable) return;
    this.collidable = false;
    this.vel = V(0,0.001,0);
    this.spriteframe = 'BCD';
this.currentframe = 0;
    //this.sprite.frame = 'B';
    //this.sprite.currentframe = 0;
    //this.sprite.draw(true);
    //this.plane.pos.y = -24;
    //this.active = false;
    this.light.light_intensity = 16;
    this.light.col = V(.5,0,0);
    this.level.playSound('DSBAREXP', 100, this.getWorldPosition());
    //room.createObject('sound', { pos: this.getWorldPosition(), id: 'DSBAREXP', auto_play: true, gain: 1, singleshot: true });
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
  updateLight() {
    let frame = this.spriteframe[this.currentframe];

    if (this.light) {
      if (frame == 'A') {
this.currentframe = 0;
        //this.plane.pos.y  = 0;
      } else if (frame == 'B') {
this.currentframe = 0;
        //this.frame = 'C';
        this.light.light_intensity = 12;
      } else if (frame == 'C') {
        //this.frame = 'D';
this.currentframe = 1;
        this.light.light_intensity = 8;
      } else if (frame == 'D') {
        //this.visible = false;
        this.pos.y = -9999;
      }
this.draw(true);
    }
  },
});
//room.require('linesegments').then(() => {
  elation.template.add('doomdebugger', `
    <doom-assets-button></doom-assets-button>
    <div class="debuggergrid">
      <doom-debugger-map id="doomdebuggermap"></doom-debugger-map>
      <doom-debugger-sector id="doomdebuggersector"></doom-debugger-sector>
      <doom-debugger-linedef id="doomdebuggerlinedef"></doom-debugger-linedef>
    </div>
  `);
  elation.template.add('doomdebugger.map', `
    <h1>{level}</h1>
    <ul>
      <li>Things: {map.things.length}</li>
      <li>Sectors: {map.sectors.length}</li>
      <li>Linedefs: {map.linedefs.length}</li>
      <li>Vertexes: {map.vertexes.length}</li>
    </ul>
  `);
  elation.template.add('doomdebugger.sector', `
    <h1>Sector {sector.id}</h1>
    <ul>
      <li>
        <h3>Ceiling:</h3>
        <ul>
          <li>Texture: {sector.ceilingpic}</li>
          <li><doom-debugger-texture-preview id="ceilingtexture" name="{sector.ceilingpic}"></doom-debugger-texture-preview></li>
          <li>Height:{sector.ceilingheight}
        </ul>
      </li>
      <li>
        <h3>Floor:</h3>
        <ul>
          <li>Texture: {sector.floorpic}</li>
          <li><doom-debugger-texture-preview id="floortexture" name="{sector.floorpic}"></doom-debugger-texture-preview></li>
          <li>Height: {sector.floorheight}</li>
        </ul>
      </li>
      <li><h3>Light: {sector.lightlevel}</h3></li>
      <li><h3>Tag: {sector.tag}</h3></li>
    </ul> 
  `);
  elation.template.add('doomdebugger.linedef', `
    {?linedef}
      <h1>Linedef {linedefnum}</h1>
      <ul>
        <li>v1: {linedef.v1} ({v1.x}, {v1.y})</li>
        <li>v2: {linedef.v2} ({v2.x}, {v2.y})</li>
        <li>flags: {linedef.flags}</li>
        <li>type: {linedef.type}</li>
        <li>tag: {linedef.tag}</li>
      </ul>
    {/linedef}
  `);
  elation.elements.define('doom-debugger-map', class extends elation.elements.base { });
  elation.elements.define('doom-debugger-sector', class extends elation.elements.base { });
  elation.elements.define('doom-debugger-linedef', class extends elation.elements.base { });
  elation.elements.define('doom-debugger-texture-preview', class extends elation.elements.base {
    init() {
      this.defineAttributes({
        name: {type: 'string'},
      });
      let wad = room.objects['doomlevel'].wads;
      let texture = wad.getTexture(this.name);

      if (texture.canvas) {
        this.appendChild(texture.canvas);
      }
    }
  });
  room.registerElement('doomdebugger', {
    doomplayer: null,
    showallsectors: false,
    create() {
      this.sectors = {};
      this.cursor = this.createObject('object', {
        id: 'sphere',
        scale: V(4),
        col: 'yellow',
        depth_test: true,
        depth_write: false,
        opacity: 1,
      });
      this.cursorghost = this.createObject('object', {
        id: 'sphere',
        scale: V(3),
        col: 'red',
        opacity: .2,
        transparent: true,
        depth_test: false,
        depth_write: false,
        pos: this.cursor.pos,
      });
      this.debugwindow = elation.elements.create('ui-window', {
        append: document.body,
        title: 'Doom Debugger',
        left: 1,
        bottom: 1,
      });
      this.debugwindow.setcontent('');
      this.debugelements = elation.elements.fromTemplate('doomdebugger', this.debugwindow.content);
      if (this.showallsectors) {
        this.debugAllSectors();
      }
    },
    reset() {
      for (let k in this.sectors) {
        if (this.sectors[k].parent === this) {
          this.removeChild(this.sectors[k]);
        }
        delete this.sectors[k];
      }
      if (this.showallsectors) {
        this.debugAllSectors();
      }
    },
    update() {
      let doomplayer = this.doomplayer;
      if (doomplayer && doomplayer.map) {
        let hits = player.raycast();
        // TODO - now that we have all our sidedefs and vertices marked, we can implement some basic editing functionality
        // - show information about selected sector / sidedef / vertex / thing
        // - allow modification (geometry, textures, etc)
        let data = {
          level: doomplayer.level.map,
          map: doomplayer.map,
          sector: false,
          linedef: false,
          vertex: false,
          linedefnum: -1,
        };
        for (let i = 0; i < hits.length; i++) {
          if (!data.sector && hits[i].object.tag == 'DOOMLEVEL') {
            let cursorpos = this.worldToLocal(V(hits[i].point));
            this.cursor.pos = cursorpos;
            this.cursorghost.opacity = .2;
            //let len = cursorpos.length();
            //cursorpos.normalize().multiplyScalar(len * .9999);
            let sector = doomplayer.map.getSectorAt(cursorpos.x, -cursorpos.z);
            data.sector = sector;
            if (sector !== this.currentsector) {
              //console.log(sector);
              this.setSector(sector);
              //this.debugwindow.setcontent(elation.template.get('doomdebugger.sector', data));
              if (this.debugelements.doomdebuggermap) { 
                this.debugelements.doomdebuggermap.innerHTML = elation.template.get('doomdebugger.map', data);
              }
              if (this.debugelements.doomdebuggersector) { 
                this.debugelements.doomdebuggersector.innerHTML = elation.template.get('doomdebugger.sector', data);
              }
            }
          } else if (!data.linedef && hits[i].object.tag == 'LINESEGMENTS') {
            let linedef = hits[i].object.getMetadata(hits[i].index);
            if (linedef && !data.linedef) {
              data.linedef = linedef;
              data.linedefnum = data.map.linedefs.indexOf(linedef);
            }
          }
        }
        
        if (data.linedef) {
if (!this.wireframe_linedef) {
      this.wireframe_linedef = this.createObject('linesegments', {
        positions: [],
        colors: [],
        depth_test: false,
        depth_write: true,
        opacity: .5,
        //scale: V(1000)
        pickable: false,
        collidable: false,
        linewidth: 5,
      });
}
if (this.wireframe_linedef) {
          let map = doomplayer.map,
              v1 = map.getVertex(data.linedef.v1),
              v2 = map.getVertex(data.linedef.v2);
          let floor1 = V(v1.x, data.sector.floorheight, -v1.y),
              floor2 = V(v2.x, data.sector.floorheight, -v2.y),
              ceil1 = V(v1.x, data.sector.ceilingheight, -v1.y),
              ceil2 = V(v2.x, data.sector.ceilingheight, -v2.y);
          let color = V(0, 1, 0);
          this.wireframe_linedef.positions[0] = floor1;
          this.wireframe_linedef.positions[1] = floor2;
          this.wireframe_linedef.positions[2] = ceil1;
          this.wireframe_linedef.positions[3] = ceil2;
          this.wireframe_linedef.colors[0] = color;
          this.wireframe_linedef.colors[1] = color;
          this.wireframe_linedef.colors[2] = color;
          this.wireframe_linedef.colors[3] = color;
          this.wireframe_linedef.updateLine();
          data.v1 = v1;
          data.v2 = v2;
        } else {
          this.wireframe_linedef.positions[0].set(0,-999,0);
          this.wireframe_linedef.positions[1].set(0,-999,0);
          this.wireframe_linedef.positions[2].set(0,-999,0);
          this.wireframe_linedef.positions[3].set(0,-999,0);
          this.wireframe_linedef.updateLine();
        }
}
        if (this.debugelements.doomdebuggerlinedef && data.linedef) { 
          this.debugelements.doomdebuggerlinedef.innerHTML = elation.template.get('doomdebugger.linedef', data);
        }
/*
        if (this.currentsector) {
          let sector = this.currentsector,
              map = sector.map,
              sectormap = map.getSectorMap(),
              linedefs = sectormap[sector.id];
          //data.linedef = linedefs[0];
        }
*/
      }
    },
    setSector(sector) {
      for (let k in this.sectors) {
        if (this.sectors[k] && this.sectors[k] !== sector && this.sectors[k].parent === this) {
          //this.removeChild(this.sectors[k]);
        }
      }

      if (!this.showallsectors) {
        if (this.currentsector && this.sectors[this.currentsector.id]) {
          this.sectors[this.currentsector.id].hide();
        }
      } else {
        if (!this.sectors[sector.id]) {
          this.sectors[sector.id] = this.createObject('doomdebugger_sector', {
            map: this.doomplayer.map,
            level: this.doomplayer.level,
            sector: sector,
            lighting: false,
            fog: false,
            js_id: 'doomdebugger_sector_' + this.doomplayer.level.map + '_' + sector.id,
            //pos: this.worldToLocal(V(player.cursor_pos)),
          });
        } else {
          //this.sectors[sector.id].pos = this.worldToLocal(V(player.cursor_pos));
          this.appendChild(this.sectors[sector.id]);
        }
      }
      this.currentsector = sector;

      //this.debugwindow.setcontent('<h1>Sector ' + sector.id + '</h1>');
    },
    debugAllSectors() {
      console.log('ALL SECTORS', this.doomplayer.map.sectors);
      for (let i = 0; i < this.doomplayer.map.sectors.length; i++) {
        let sector = this.doomplayer.map.sectors[i];
        this.sectors[sector.id] = this.createObject('doomdebugger_sector', {
          map: this.doomplayer.map,
          level: this.doomplayer.level,
          sector: sector,
          lighting: false,
          fog: false,
          js_id: 'doomdebugger_sector_' + this.doomplayer.level.map + '_' + sector.id,
          //pos: this.worldToLocal(V(player.cursor_pos)),
        });
      }
    }
  });

  room.registerElement('doomdebugger_sector', {
    map: null,
    level: null,
    sector: null,
    create() {
      //this.createObject('text', { text: this.sector.id, pos: V(0, 1, 0) });
      let sector = this.sector,
          map = sector.map,
          sectormap = map.getSectorMap(),
          linedefs = sectormap[sector.id];

      if (!linedefs) return;
      let linedefpoints = [],
          linedefcolors = [],
          linedefmeta = [],
          verts = {};
      for (let i = 0; i < linedefs.length; i++) {
        let linedef = linedefs[i],
            v1 = map.getVertex(linedef.v1),
            v2 = map.getVertex(linedef.v2);

        let linedefcolor = this.getLinedefColor(linedef);

        verts[linedef.v1] = v1;
        verts[linedef.v2] = v2;

        let floor1 = V(v1.x, sector.floorheight, -v1.y),
            floor2 = V(v2.x, sector.floorheight, -v2.y),
            ceil1 = V(v1.x, sector.ceilingheight, -v1.y),
            ceil2 = V(v2.x, sector.ceilingheight, -v2.y);

        let floormid = floor1.clone().add(floor2).multiplyScalar(.5),
            dir = floor1.clone().sub(floor2).normalize(),
            floortick = floormid.clone();

        let side1 = map.getSidedef(linedef.side1);
        if (side1.sector == sector.id) {
          floortick.add(dir.cross(V(0,1,0)).multiplyScalar(-5));
        } else {
          floortick.add(dir.cross(V(0,1,0)).multiplyScalar(5));
        }

        let ceilmid = floormid.clone(),
            ceiltick = floortick.clone();
        ceilmid.y = ceiltick.y = sector.ceilingheight;

        linedefpoints.push(floor1, floor2);
        linedefpoints.push(floormid, floortick);
        linedefpoints.push(ceil1, ceil2);
        linedefpoints.push(ceilmid, ceiltick);

        linedefcolors.push(linedefcolor, linedefcolor, linedefcolor, linedefcolor, linedefcolor, linedefcolor, linedefcolor, linedefcolor);
        linedefmeta.push(linedef, linedef, linedef, linedef, linedef, linedef, linedef, linedef);
      }

      let vertpoints = [];
      let centerpoint = V();
      for (let k in verts) {
        let v = verts[k],
            floor = V(v.x, sector.floorheight, -v.y),
            ceil = V(v.x, sector.ceilingheight, -v.y);
        vertpoints.push(floor);
        vertpoints.push(ceil);

        linedefpoints.push(floor, ceil);
        linedefcolors.push(V(.3), V(.3));
        linedefmeta.push(null, null);
        centerpoint.add(floor);
      }
      centerpoint.divideScalar(vertpoints.length);

      this.wireframe_dimmed = this.createObject('linesegments', {
        positions: linedefpoints,
        colors: linedefcolors,
        depth_test: false,
        depth_write: true,
        opacity: .4,
        //scale: V(1000)
        pickable: false,
        collidable: false,
        linewidth: 2,
        renderorder: 10,
        fog: false,
      });
/*
      this.wireframe_clipped = this.createObject('linesegments', {
        positions: linedefpoints,
        colors: linedefcolors,
        metadata: linedefmeta,
        depth_test: true,
        depth_write: true,
        opacity: 1,
        //scale: V(1000)
        linewidth: 2,
        fog: false,
      });
*/
/*
      this.bleh = this.createObject('object', {
        id: 'cube',
        pos: centerpoint,
        scale: V(10)
      });
      this.vertices = this.createObject('particle', {
        col: '#ffff00',
        scale: V(.2),
        depthtest: false,
        depthwrite: false
      });
      for (let i = 0; i < vertpoints.length; i++) {
        this.vertices.setPoint(i, vertpoints[i], null, null, V(0,1,0));
      }
      this.label = this.createObject('paragraph', {
        text: '<h1 style="background: blue; color: green;">Sector: ' + this.sector.id + '</h1>',
        billboard: 'y',
        depth_test: false,
        depth_write: false,
        //scale: V(200),
        pos: centerpoint
      });
*/
    },
    show() {
      this.visible = true;
      this.collidable = true;
      this.pickable = true;
    },
    hide() {
      this.visible = false;
      this.collidable = false;
      this.pickable = false;
    },
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
      return V().fromArray(new THREE.Color(color).toArray());
    }
  });
  room.registerElement('doomdebugger_wireframe', {
    map: null,
    level: null,
    depth_test: true,
    create() {
      let map = this.map,
          geom = map.getGeometry(),
          sectormap = map.getSectorMap();
      let linedefpoints = [],
          linedefcolors = [],
          linedefmeta = [];
      for (let sectorid = 0; sectorid < map.sectors.length; sectorid++) {
        let sector = map.sectors[sectorid],
            linedefs = sectormap[sector.id];
        let verts = {};
        if (!linedefs) continue;
        for (let i = 0; i < linedefs.length; i++) {
          let linedef = linedefs[i],
              v1 = map.getVertex(linedef.v1),
              v2 = map.getVertex(linedef.v2);

          let linedefcolor = this.getLinedefColor(linedef);

          verts[linedef.v1] = v1;
          verts[linedef.v2] = v2;

          let floor1 = V(v1.x, sector.floorheight, -v1.y),
              floor2 = V(v2.x, sector.floorheight, -v2.y),
              ceil1 = V(v1.x, sector.ceilingheight, -v1.y),
              ceil2 = V(v2.x, sector.ceilingheight, -v2.y);

          let floormid = floor1.clone().add(floor2).multiplyScalar(.5),
              dir = floor1.clone().sub(floor2).normalize(),
              floortick = floormid.clone();

          let side1 = map.getSidedef(linedef.side1);
          if (side1.sector == sector.id) {
            floortick.add(dir.cross(V(0,1,0)).multiplyScalar(-5));
          } else {
            floortick.add(dir.cross(V(0,1,0)).multiplyScalar(5));
          }

          let ceilmid = floormid.clone(),
              ceiltick = floortick.clone();
          ceilmid.y = ceiltick.y = sector.ceilingheight;

          linedefpoints.push(floor1, floor2);
          linedefpoints.push(floormid, floortick);
          linedefpoints.push(ceil1, ceil2);
          linedefpoints.push(ceilmid, ceiltick);

          linedefcolors.push(linedefcolor, linedefcolor, linedefcolor, linedefcolor, linedefcolor, linedefcolor, linedefcolor, linedefcolor);
          linedefmeta.push(linedef, linedef, linedef, linedef, linedef, linedef, linedef, linedef);
        }

        let vertpoints = [];
        let centerpoint = V();
        for (let k in verts) {
          let v = verts[k],
              floor = V(v.x, sector.floorheight, -v.y),
              ceil = V(v.x, sector.ceilingheight, -v.y);
          vertpoints.push(floor);
          vertpoints.push(ceil);

          linedefpoints.push(floor, ceil);
          linedefcolors.push(V(.3), V(.3));
          linedefmeta.push(null, null);
          centerpoint.add(floor);
        }
        centerpoint.divideScalar(vertpoints.length);
      }
      this.wireframe_dimmed = this.createObject('linesegments', {
        positions: linedefpoints,
        colors: linedefcolors,
        depth_test: this.depth_test,
        depth_write: true,
        opacity: .15,
        transparent: this.transparent,
        //scale: V(1000)
        pickable: false,
        collidable: false,
        linewidth: 1,
        fog: false,
        renderorder: this.renderorder,
      });
    },
    show() {
      this.visible = true;
      this.collidable = true;
      this.pickable = true;
    },
    hide() {
      this.visible = false;
      this.collidable = false;
      this.pickable = false;
    },
    getLinedefColor(linedef) {
      var color = '#fb0101'; // default red, solid one-sided wall
      var map = this.map,
          side1 = map.getSidedef(linedef.side1),
          side2 = map.getSidedef(linedef.side2),
          sector1 = (side1 ? map.getSector(side1.sector) : null),
          sector2 = (side2 ? map.getSector(side2.sector) : null);

      
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
      return V().fromArray(new THREE.Color(color).toArray());
    }
  });
//});

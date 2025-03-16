import("https://baicoianu.com/~bai/doom/doomclient.js").then(() => {
room.registerElement('doom-scroll', {
  create() {
    document.fonts.load('10px Doom').then(() => {
      if (room.pendingCustomElements == 0) {
        this.loadWAD();
      } else {
        elation.events.add(room, 'room_load_complete_customelements', ev => this.loadWAD());
      }
    });
  },
  async loadWAD() {
    this.iwad = new WadJS.WadGroup();
    await this.iwad.load('DOOM.WAD');

    this.loadTexture('flat5_4');
    this.loadTexture('gray4');
    this.loadTexture('skinmet1');
    this.loadTexture('skintek1');
    this.loadTexture('skintek2');
    this.loadTexture('starg3');
    this.loadTexture('sw1exit');
    this.loadTexture('marbface');
    this.loadTexture('lite5');
    this.loadTexture('support3');
    this.loadTexture('comptile');
    this.loadTexture('compblue');
    this.loadTexture('shawn2');
    this.loadTexture('sw1brn2');
    this.loadTexture('sw2brn2');

    this.collection = elation.elements.create('collection-jsonapi', {
      //endpoint: 'wadlist-flat5.json',
      //endpoint: 'wadlist-details.json',
      endpoint: 'doom_levels_metadata_fixed.json',
    });
    this.list = this.createObject('doom-scroll-list', {
      collection: this.collection,
      pos: V(.5, 0, -3.15),
    });
    this.logo = this.list.createObject('object', {
      id: 'plane',
      image_id: 'doomscroll',
      scale: V(4, 1, 1),
      pos: V(0, 1, 0)
    })
    this.infobox = this.createObject('doom-scroll-infobox', {
      pos: V(0,1.75,.3),
      iwad: this.iwad.iwad,
      js_id: 'doomscroll-infobox',
    });

    this.list.addEventListener('itemselect', ev => this.showInfo(ev.target));

    window.addEventListener('popstate', ev => {
      if (document.location.hash) {
        let levelname = document.location.hash.substr(1);
        if (this.infobox.item && this.infobox.item.data.name == levelname) return;
        this.showInfoByName(levelname);
      } else {
        this.infobox.hide();
      }
    });
    // Select initial item if a hash was passed in
    if (document.location.hash) {
      elation.events.add(this.collection, 'collection_load', ev => {
        let levelname = document.location.hash.substr(1);
        setTimeout(() => {
          this.showInfoByName(levelname);
        }, 250);
      });
    }
  },
  loadTexture(name) {
    let tex = this.iwad.getTexture(name);
    this.loadNewAsset('image', { id: name, canvas: tex.canvas, tex_linear: false,});
console.log('did tex', name, tex);

  },
  showInfo(item) {
    this.infobox.show(item);
  },
  showInfoByName(levelname) {
    let found = false;
    if (this.list && this.list.itempool && this.list.itempool.objectpool) {
      for (let i = 0; i < this.list.itempool.objectpool.length; i++) {
        let item = this.list.itempool.objectpool[i];
        if (item.data.name == levelname) {
          this.infobox.show(item);
          found = true;
          break;
        }
      }
    }
    if (!found) {
      for (let i = 0; i < this.collection.items.length; i++) {
        let item = this.collection.items[i];
        if (item.name == levelname) {
          let listitem = this.createObject('doom-scroll-item', { pos: V(0,0,-2000), scale: V(.01), iwad: this.iwad});
          listitem.setData(item);
          this.infobox.show(listitem);
          break;
        }
      }
    }
  },
  hideInfo() {
    this.infobox.hide();
  },
  updateDistance() {
    let layoutwidth = (window.screen.orientation.angle == 90 ? 0 : 0);
    let distance = layoutwidth / Math.tan(player.camera.camera.fov * player.camera.camera.aspect * 0.5 * (Math.PI / 180));
    //this.list.pos.z = -3.15 + -distance;
    //this.logo.pos.z = -distance;
    player.pos.z = -distance;
  },
  update() {
    this.updateDistance();
  }
});
room.registerElement('doom-scroll-infobox', {
  iwad: null,
  wadpath: 'https://xrdoom.com/wads/doom',
  create() {
    this.createObjects();
  },
  createObjects() {
    this.layout = this.createObject('snaplayout');
    if (!this.layout) {
      setTimeout(() => { this.createObjects() }, 100);
      return;
    }

    this.content = this.layout.createObject('object');
    this.backdrop = this.content.createObject('object', { id: 'plane', image_id: 'skinmet1', collision_id: 'cube', collidable: false, scale: V(3,2,1), collision_scale: V(1,1,.01)});
    this.shelf = this.content.createObject('object', { id: 'cube', image_id: 'support3', collision_id: 'cube', collidable: false, scale: V(.4,.1,3), rotation: V(0, 90, 0), pos: V(0, -1.05, .2), texture_repeat: V(.333, 2)});
    this.closebutton = this.layout.createObject('object', { id: 'cube', image_id: 'sw1exit', scale: V(.1, .1, .01), pos: V(1.4, 0.9, .02), texture_repeat: V(.2812, .11111), texture_offset: V(.375, .4444), collision_id: 'cube', collidable: false, });
    this.closebutton.addEventListener('click', ev => this.hide());
    //this.cover = this.content.createObject('object', { id: 'plane', col: 'black', collision_id: 'cube', collidable: false, scale: V(2.6,1.5,.02), pos: V(0,-.005,.125), cull_face: 'none', visible: false, depth_test: true, depth_write: false, renderorder: -10,});

    // draw solid map, depth write and test enabled
    // draw wireframe, depth write and test disabled
    // clear depth buffer
    // draw cover, depth test disabled, depth write enabled, color write disabled
    // draw the rest of the owl


    this.cover = this.content.createObject('object', { id: 'cube', col: 'blue', collision_id: 'cube', collidable: false, scale: V(2.6,1.5,.02), pos: V(0,-.005,.125), cull_face: 'none', visible: true, depth_test: true, depth_write: true, transparent: false, renderorder: -1, color_write: false, onbeforerender: ev => console.log('before!'), pickable: false});
    //this.cover = this.content.createObject('object', { id: 'plane', col: 'blue', collision_id: 'cube', collidable: false, scale: V(2.6,1.5,.02).multiplyScalar(4), pos: V(0,-.005,-4), cull_face: 'none', visible: false, depth_test: false, depth_write: true, renderorder: 8, opacity: .99});
  },
  async setItem(item) {
    if (item === this.item) return;
    if (!this.infoboxcss) {
      this.infoboxcss = await fetch('doomscroll-infobox.css').then(res => res.text());
    }

    this.cover.hide();
    this.selectedhologram = false;
    if (this.holograms) {
      this.holograms.forEach(w => w.die());
    }
    this.item = item;

    let thumbass = item.getThumbAsset();
    if (!this.thumb) {
      this.thumb = this.content.createObject('object', { id: 'plane', pos: V(-.85, .25, .01), image_id: thumbass.name });
    } else {
      this.thumb.image_id = thumbass.name;
    }

/*
    if (!this.websurface) {
      //this.info = this.createObject('paragraph', { pos: V(0, 0, .01), text: ''});
      this.websurface = this.content.createObject('object', { pos: V(.5, 0, .01), scale: V(1.6, 1.5, 1), id: 'plane', websurface_id: item.data.text});
console.log('created websurface', this.websurface);
    } else {
      this.websurface.websurface_id = item.data.text;
console.log('updated websurface', this.websurface);
    }
*/
    this.scrollpos = 0;
    if (!this.info) {
      this.info = this.content.createObject('paragraph', { pos: V(.48, -.05, .01), scale: V(.8, .75, 1), collidable: false, pickable: true, back_col: V(1), renderorder: 8, lighting: false });
      this.info.addEventListener('wheel', ev => {
        let lines = 0;
        if (this.textcache) {
          lines = this.textcache.split('\n').length;
        }

        let lineend = (lines * 22);// - 960;

        this.scrollpos = Math.max(0, Math.min(lineend, this.scrollpos + ev.deltaY));
        if (this.scrolltimer) {
          clearTimeout(this.scrolltimer);
        }
        //this.updateText(false); 
        this.scrolltimer = setTimeout(() => {
          this.updateText(false); 
          this.scrolltimer = false;
        }, 1000/60);
        ev.stopPropagation();
        ev.preventDefault();
      });
    }
    //setTimeout(() => {
      // FIXME - this is to work around a bug with Apache where requesting a file on an iso file system with invalid data causes a bus error and terminates all other downloads, remove it when we move to AWS
      this.updateText();
    //}, 1000);
    this.getPWAD().then(pwad => {
      this.pwad = pwad;
      this.getLevelPreviews(pwad);
      this.updateStats(pwad);
    });

    window.location.hash = item.data.name;
  },
  async updateText(clear=true) {
    if (!this.item) return;
    if (!this.info.css) {
      this.info.css = this.infoboxcss;
    }
    let notfound = 'No README found';
    if (clear) {
      this.info.text = '<pre>Loading...</pre>';
      if (this.item.data.text) {
        text = await fetch(this.item.data.text).then(res => res.text()).catch(e => notfound);
        text = text.replace('\x1a', ''); // strip EOF char
        this.textcache = text;
      } else {
        text = notfound;
      }
    } else {
      text = this.textcache;
    }
    this.info.text = '<div class="prescroll"><pre style="top: -' + this.scrollpos + 'px">' + text + '</pre></div>';
  },
  async updateStats(wads, map) {
    let { wad, pwad } = wads;
    if (!this.stats) {
      this.stats = this.content.createObject('paragraph', { pos: V(-.47, -1, .01), scale: V(.8, .75, 1), collidable: false, pickable: false, back_alpha: 0, renderorder: 11, depth_write: false, lighting: false});
    }
    if (!this.stats.css) {
      this.stats.css = this.infoboxcss;
    }
    let mapnames = pwad.getMapNames().sort().join(' '),
        hasTextures = (pwad.hasTextures(wad.textures, wad.getPatchNames()) ? 'yes' : 'no'),
        hasSounds = (pwad.hasSounds() ? 'yes' : 'no')
        hasMusic = (pwad.hasMusic() ? 'yes' : 'no')
        gamemodes = { single: 'no', coop: 'no', deathmatch: 'no' };

console.log(wad, pwad, mapnames);

    let stattext;
    let maps = [];
    let items = {
      spawnsingle: 0,
      spawncoop: 0,
      spawndm: 0,
      keys: 0,
      powerups: 0,
      weapons: 0,
      ammo: 0,
      monsters: 0,
    };
    let secrets = 0;
    if (map) {
      maps.push(map);
    } else {
      pwad.getMapNames().forEach(mapname => maps.push(pwad.getMap(mapname)));
    }
      
    maps.forEach(map => {
      map.things.forEach(thing => {
        switch (thing.type) {
          case 1:
            items.spawnsingle++;
            break;
          case 2:
          case 3:
          case 4:
            items.spawncoop++;
             break;
          case 11:
            items.spawndm++;
            break;
          case 7:
          case 9:
          case 16:
          case 58:
          case 64:
          case 65:
          case 66:
          case 67:
          case 68:
          case 69:
          case 71:
          case 72:
          case 84:
          case 3001:
          case 3002:
          case 3003:
          case 3004:
          case 3005:
          case 3006:
            items.monsters++;
            break;
          case 2001:
          case 2002:
          case 2003:
          case 2004:
          case 2005:
          case 2006:
          case 82:
            items.weapons++;
            break;
          case 17:
          case 2007:
          case 2008:
          case 2010:
          case 2046:
          case 2047:
          case 2048:
          case 2049:
            items.ammo++;
            break;
          case 5:
          case 6:
          case 13:
          case 38:
          case 39:
          case 40:
            items.keys++;
            break;
          case 83:
          case 2013:
          case 2014:
          case 2015:
          case 2022:
          case 2023:
          case 2024:
          case 2026:
          case 2045:
          case 8:
          case 2011:
          case 2012:
          case 2018:
          case 2019:
          case 2025:
            items.powerups++;
            break;
        }
      });
      map.sectors.forEach(sector => {
        if (sector.special == 9) secrets++;
      });

      if (items.spawnsingle > 0) gamemodes.single = 'yes';
      if (items.spawndm > 0) gamemodes.deathmatch = 'yes';
      if (items.spawncoop > 0) {
        items.spawncoop += items.spawnsingle; // Single player spawn counts as a coop spawn
        gamemodes.coop = 'yes';
      }
    });
    if (map) {
console.log('items', items, map);
      stattext = `
        <table class="stats map">
          <tr><td>Vertices</td><td>${map.vertexes.length}</td></tr>
          <tr><td>Linedefs</td><td>${map.linedefs.length}</td></tr>
          <tr><td>Sectors</td><td>${map.sectors.length}</td></tr>
          <tr><td>Secrets</td><td>${secrets}</td></tr>
          <tr><td>Things</td><td>${map.things.length}</td></tr>
          <tr><td>Spawns</td><td>
            <ul>
              ${items.spawnsingle > 0 ? '<li class="spawns single">Single Player</li>' : ''}
              ${items.spawncoop > 1 ? '<li class="spawns coop">' + items.spawncoop + ' Co-op</li>' : ''}
              ${items.spawndm > 0 ? '<li class="spawns dm">' + items.spawndm + ' Deathmatch</li>' : ''}
            </ul>
          </td></tr>
          <tr><td>Items</td><td>
            <ul>
              ${items.monsters > 0 ? '<li class="monsters">' + items.monsters + ' monsters</li>' : ''}
              ${items.powerups > 0 ? '<li class="powerups">' + items.powerups + ' powerups</li>' : ''}
              ${items.weapons > 0 ? '<li class="weapons">' + items.weapons + ' weapons</li>' : ''}
              ${items.ammo > 0 ? '<li class="ammo">' + items.ammo + ' ammo</li>' : ''}
              ${items.keys > 0 ? '<li class="keys">' + items.keys + ' key' + (items.keys > 1 ? 's' : '') + '</li>' : ''}
            </ul>
          </td></tr>
        </table>
      `;
      this.stats.pos.set(-.325, -.25, .2);
    } else {
      let iwadname = (mapnames.match(/^MAP\d\d/) ? 'Doom 2' : 'Doom');

      stattext = `
        <table class="stats">
          <tr><td>Game</td><td>${iwadname}</td></tr>
          <tr><td>Levels</td><td>${mapnames}</td></tr>
          <tr><td>Textures</td><td>${hasTextures}</td></tr>
          <tr><td>Sounds</td><td>${hasSounds}</td></tr>
          <tr><td>Music</td><td>${hasMusic}</td></tr>
          <tr><td>Game Modes</td><td>
            <ul>
              <li class="${gamemodes.single}">Single</li>
              <li class="${gamemodes.coop}">Co-op</li>
              <li class="${gamemodes.deathmatch}">Deathmatch</li>
            </ul>
          </td></tr>
        </table>
      `;
      this.stats.pos.set(-.47, -1, .01);
    }
    this.stats.text = stattext;
  },
  show(item) {
    if (item) this.setItem(item);
    this.layout.snap();
  },
  hide() {
    this.item = null;
    //window.location.hash = '';
    history.pushState("", document.title, window.location.pathname + window.location.search);
    this.layout.unsnap();
  },
  async getLevelPreviews(wads) {
    let { wad, pwad} = wads;
    let maps = pwad.getMapNames().sort();
    let x = -1;

    this.holograms = [];
    maps.forEach(mapname => {
      let map = wad.getMap(mapname);
      let hologram = this.content.createObject('doom-scroll-map-hologram', { pos: V(x, -1, .2), map: map, wads: wads, level: mapname, item: this.item});
      hologram.addEventListener('hologram_expand', ev => this.selectLevel(hologram));
      hologram.addEventListener('hologram_contract', ev => this.deselectLevel());
      this.holograms.push(hologram);
      x += .5
    });
  },
  async getPWAD() {
    let wadurl = this.item.data.url;
    if (!wadurl) {
      wadurl = `${this.wadpath}/${this.item.data.name}/${this.item.data.wadfile}`;
    }
    let wad = new WadJS.WadGroup();
    wad.iwad = this.iwad;
    let pwad = await wad.load(wadurl);
    return {wad, pwad};
  },
  selectLevel(hologram) {
    //hologram.pos = V(0, -.2, 1.4);
    this.cover.show();
    //this.cover.pickable = true;
    if (this.selectedhologram && this.selectedhologram !== hologram) {
      this.selectedhologram.expand(false);
    }
    this.selectedhologram = hologram;
    this.updateStats(this.pwad, hologram.map);
  },
  deselectLevel(hologram) {
    this.cover.hide();
    //this.cover.pickable = false;
    this.selectedhologram = false;
    this.updateStats(this.pwad);
  },
});
room.registerElement('doom-scroll-list', {
  collection: null,
  columns: 1,
  itemmargin: 3.2,
  scrollspeed: 15,
  scrolldelay: 350,
  scrolldelayrepeat: 150,

  create() {
    this.mass = 1;
    this.friction = this.addForce('friction', 10);
/*
    window.addEventListener('wheel', ev => { 
console.log('wheely', ev);
      let amount = ev.deltaY / 10;
      if (this.pos.y >= 0 || (this.pos.y < 0 && amount > 0)) {
        this.vel.y += amount;
        this.handleScroll();
      }
    });
*/
    window.addEventListener('touchstart', ev => {
      if (!this.touchInitialized) {
        this.initializeTouchScrolling();
      }
    });

    this.initializeTouchScrolling();

    let scrollrepeat = false;

    this.addControlContext('doomscroll', {
      'closeinfo': {
        defaultbindings: 'keyboard_esc',
        onchange: ev => { this.parent.hideInfo(); },
      },
      'scroll_up': {
        defaultbindings: 'keyboard_up',
        //onchange: ev => { this.vel.y = -ev.value * this.scrollspeed; this.friction.update(ev.value ? 0 : 10); }
        onchange: ev => { this.keyRepeat(() => this.scrollUp(), ev.value); }
      },
      'scroll_down': {
        defaultbindings: 'keyboard_down',
        //onchange: ev => { this.vel.y = ev.value * this.scrollspeed; this.friction.update(ev.value ? 0 : 10); }
        onchange: ev => { this.keyRepeat(() => this.scrollDown(), ev.value); }
      },
      'paginate_up': {
        defaultbindings: 'keyboard_pgup',
        onchange: ev => { this.keyRepeat(() => this.pageUp(), ev.value); }
      },
      'paginate_down': {
        defaultbindings: 'keyboard_pgdn,keyboard_space',
        onchange: ev => { this.keyRepeat(() => this.pageDown(), ev.value); }
      },
      'home': {
        defaultbindings: 'keyboard_home',
        onchange: ev => { if (ev.value == 1) this.scrollToTop(); }
      },
      'end': {
        defaultbindings: 'keyboard_end',
        onchange: ev => { if (ev.value == 1) this.scrollToBottom(); }
      },
    });
    this.activateControlContext('doomscroll');

    let length = 500,
        aspect = 2,
        scale = 15,
        repeaty = 2000;
    this.backdrop = this.createObject('object', { id: 'plane', image_id: 'skintek1', pos: V(0, -(scale * (repeaty - 3)) / 2, -6.5), scale: V(scale * 3, scale * repeaty), texture_repeat: V(3, repeaty * aspect), pickable: false, collidable: false, });

    this.itempool = this.createObject('objectpool', { objecttype: 'doom-scroll-item', max: 50, parentobj: this, static: true, pickable: false, collidable: false, });

    if (this.collection) {
      elation.events.add(this.collection, 'collection_load', ev => this.handleScroll(0, 6));
      this.collection.load();
    }

    let monsters = [
      //'doomthing_Arachnotron',
      //'doomthing_ArchVile',
      'doomthing_Cyberdemon',
      'doomthing_BaronOfHell',
      'doomthing_BaronOfHell',
      'doomthing_Cacodemon',
      'doomthing_Cacodemon',
      //'doomthing_Chaingunner',
      //'doomthing_CommanderKeen',
      'doomthing_Demon',
      'doomthing_Demon',
      'doomthing_Demon',
      'doomthing_Demon',
      'doomthing_FormerHumanTrooper',
      'doomthing_FormerHumanTrooper',
      'doomthing_FormerHumanTrooper',
      'doomthing_FormerHumanTrooper',
      'doomthing_FormerHumanTrooper',
      'doomthing_FormerHumanTrooper',
      'doomthing_FormerHumanTrooper',
      'doomthing_FormerHumanTrooper',
      'doomthing_FormerHumanSergeant',
      'doomthing_FormerHumanSergeant',
      'doomthing_FormerHumanSergeant',
      'doomthing_FormerHumanSergeant',
      'doomthing_FormerHumanSergeant',
      'doomthing_FormerHumanSergeant',
      'doomthing_FormerHumanSergeant',
      //'doomthing_HellKnight',
      'doomthing_Imp',
      'doomthing_Imp',
      'doomthing_Imp',
      'doomthing_Imp',
      'doomthing_Imp',
      'doomthing_Imp',
      'doomthing_LostSoul',
      'doomthing_LostSoul',
      'doomthing_LostSoul',
      'doomthing_LostSoul',
      'doomthing_LostSoul',
      //'doomthing_Mancubus',
      //'doomthing_PainElemental',
      //'doomthing_Revenant',
      'doomthing_Spectre',
      'doomthing_Spectre',
      'doomthing_Spectre',
      //'doomthing_SpiderMastermind',
      //'doomthing_WolfensteinSS',
    ];

    this.things = [];
    this.things.push(this.createObject('doomthing_Cyberdemon', {
        map: { wad: this.parent.iwad },
        js_id: player.getUsername() + '_avatar_sprite',
        scale: V(.0328),
        pos: V(4, -1, -4.5),
        rotation: V(0,125,0),
        pickable: false,
        collidable: false,
      })
    );
    for (let i = 1; i < 30; i++) {
      let type = monsters[Math.floor(Math.random() * monsters.length)];
      let side = (i % 2 ? -1 : 1); //Math.random() <= .5 ? -1 : 1;
      let spriteframe = 'AB';
      if (Math.random() > .25) {
        spriteframe += 'CD';
        if (Math.random() > .5) {
          spriteframe += 'EF';
        }
      }
      let monster = this.createObject(type, {
        map: { wad: this.parent.iwad },
        js_id: player.getUsername() + '_avatar_sprite',
        scale: V(.0328),
        pos: V(side * 4.5, -i * 4 - 1, -4.5),
        rotation: (side == -1 ? V(0,-125,0) : V(0,125,0)),
        pickable: false,
        collidable: false,
        spriteframe: spriteframe,
      });
      this.things.push(monster);
    }
    this.lastframe = 0;
  },
  update(dt) {
    this.frametime = performance.now();
    // Animate monsters
    if (this.things && this.frametime >= this.lastframe + 333) {
      for (let i = 0; i < this.things.length; i++) {
        this.things[i].advanceFrame(this.frametime);
      }
      this.lastframe = this.frametime;
    }
    let fudge = .1;
    let currow = Math.floor((this.pos.y * this.itemmargin * fudge) - 2);

    if (currow != this.lastrow || this.lastcount != this.collection.items.length) {
//console.log('I scrolled', currow, this.pos.y, this.columns);
      this.lastrow = currow;
      this.lastcount = this.collection.items.length;
      this.updateItems(currow, currow + 5);
    }
  },
  updateItems(startrow, endrow) {
    let items = this.collection.items;
    let start = Math.max(0, startrow * this.columns),
        end = Math.max(0, Math.min(items.length, endrow * this.columns));
//console.log('show items', start, end, startrow, endrow);
    for (let i = start; i < end; i++) {
      let x = i % this.columns,
          y = Math.floor(i / this.columns);
      //let obj2 = this.createObject('object', { id: 'plane', image_id: 'gray4', pos: V(-3 + (1.2 * x), 1.2 * y - 1, -3.15), texture_repeat: "1 .5", collision_id: 'plane'});
      //let item = this.createObject('doom-scroll-item', { x: x, y: y, z: -3.15 });
      let item = this.itempool.find({data: items[i]});;
      if (!item) {
        item = this.itempool.grab({
          x: x,
          y: y,
          z: 0,
          margin: this.itemmargin,
          pickable: false,
          collidable: false,
          iwad: this.parent.iwad,
        });
        item.setData(items[i]);
      }
      //item.addEventListener('itemselect', ev => this.dispatchEvent(item));
      if (!item.parent || item.parent !== this) this.appendChild(item);
      item.setXY(x, y);
//console.log('new item', item, item.parent);
    }
  },
  initializeTouchScrolling() {
    this.touchInitialized = true;
    document.body.style.overflowY = 'auto';
    document.body.style.height = '1000000px';
    janus.engine.client.style.position = 'fixed';
    window.addEventListener('scroll', ev => this.handleTouchScroll(ev));
  },
  handleTouchScroll(ev) {
    this.pos.y = document.body.scrollTop / 200;
    this.vel.y = 0;
  },
  handleScroll() {
  },
  scrollDown() {
    this.vel.y = this.scrollspeed;
  },
  scrollUp() {
    this.vel.y = -this.scrollspeed;
  },
  pageDown() {
    this.vel.y = 100;
  },
  pageUp() {
    this.vel.y = -100;
  },
  scrollToTop() {
    if (this.pos.y > 20) {
      this.pos.y = 20;
      this.vel.y = -245;
    } else {
      this.pos.y = 0;
      this.vel.y = 0;
    }
  },
  scrollToBottom() {
    let endpos = Math.floor(this.collection.items.length / this.columns) * 1.2;
    if (this.pos.y < endpos - 20) {
      this.pos.y = endpos - 20;
      this.vel.y = 245;
    } else {
      this.pos.y = endpos;
      this.vel.y = 0;
    }
  },
  keyRepeat(func, active) {
    if (active) {
      func();
      if (this.repeattimer) clearTimeout(this.repeattimer);
      this.repeattimer = setTimeout(() => {
        func();
        this.repeattimer = setInterval(() => func(), this.scrolldelayrepeat);
      }, this.scrolldelay);
    } else {
      clearTimeout(this.repeattimer);
    }
  }
});
room.registerElement('doom-scroll-item', {
  x: 0,
  y: 0,
  z: 0,
  margin: 1.2,
  data: null,
  iwad: null,

  create() {
    this.setXY(this.x, this.y);
    this.backdrop = this.createObject('object', { id: 'plane', image_id: 'flat5_4', texture_repeat: "1 .5", collision_id: 'plane', static: false, pickable: true, collidable: false, scale: V(5, 2.5, 1), pos: V(2.5, 0, 0), texture_repeat: V(5,2.5) });
    this.backdrop.addEventListener('click', ev => { ev.preventDefault(); this.select(); });
    //this.backdrop.addEventListener('mouseover', ev => this.scale = V(1.1));
    //this.backdrop.addEventListener('mouseout', ev => this.scale = V(1));

    this.mapholder = this.createObject('doom-scroll-map-hologram-preview', { pos: V(.74, .54, 0.021), scale: V(1.25) });
    this.mapcontainer = this.createObject('object', { pos: V(0, .2, .5), scale: V(.0005), rotation: V(45, 0, 0) });
    this.mapcontainer2 = this.mapcontainer.createObject('object', { rotate_deg_per_sec: 10 });

    //this.mappreview.setMap(this.mapcontainer);
    this.mapcount = this.createObject('text', { text: '', pos: V(1.325, -.025, .025), font_scale: false, font_size: .1, align: 'right', thickness: 0 });
  },
  generateThumb() {
    let thumbass = this.getThumbAsset();
  },
  getThumbAsset() {
    let levelname = '';
    if (this.data) {
      levelname = this.data.name;
    }
    let thumbid = 'level-thumb-' + levelname;
    let thumbass = this.getAsset('image', thumbid);
    if (!thumbass) {
      let ass = this.getAsset('image', 'marbface');
      let canvas = document.createElement('canvas');
/*
      canvas.width = ass.canvas.width;
      canvas.height = ass.canvas.height;
*/
      canvas.width = 512;
      canvas.height = 256;

      let ctx = canvas.getContext('2d');
      ctx.drawImage(ass.canvas, 10, 10);
      ctx.font = '14px Doom';
      ctx.fillStyle = '#ccc';
      ctx.strokeStyle = '1px black';

/*
      let levelname = '';
      if (this.data) {
        levelname = this.data.name;
      }
      ctx.fillText(levelname, 4, 124);
      ctx.strokeText(levelname, 4, 124);
*/

      ctx.font = '24px Doom';
      ctx.fillStyle = '#a00';
/*
      ctx.fillText("Title :", ass.canvas.width + 10, 24);
      ctx.strokeText("Title :", ass.canvas.width + 10, 24);
*/
      
      //ctx.fillStyle = '#ccc';
      ctx.fillText(this.data.title, ass.canvas.width + 20, 32);
      ctx.strokeText(this.data.title, ass.canvas.width + 20, 32);
      this.writeLabelText(ctx, "Author :", this.data.author, ass.canvas.width + 20, 66);
      this.writeLabelText(ctx, "Levels :", this.data.levels.join(' '), ass.canvas.width + 20, 110);

      this.writeDescriptionText(ctx, this.data.description, 10, ass.canvas.height + 30);


      // TODO - load asset on parent so it can be used across item objects as we scroll
      this.parent.parent.loadNewAsset('image', { id: thumbid, canvas: canvas, hasalpha: true });
      thumbass = this.getAsset('image', { id: thumbid });
    }
    return thumbass; 
  },
  writeLabelText(ctx, label, text, x, y, size=18, color="#ccc", labelcolor="#900") {
      ctx.font = size + 'px Doom';
      ctx.fillStyle = labelcolor;
      ctx.strokeStyle = '1px black';

      ctx.fillText(label, x, y);
      ctx.strokeText(label, x, y);

      ctx.fillStyle = color;

      ctx.fillText(text, x, y + size + 4);
      ctx.strokeText(text, x, y + size + 4);
  },
  writeDescriptionText(ctx, text, x, y, size=18, color="#ccc") {
      ctx.font = 'normal ' + size + 'px sans-serif';
      ctx.fillStyle = color;
      ctx.strokeStyle = '1px black';

      let lines = [''],
          curline = 0,
          maxlen = 60;
      let words = text.split(' ');
      words.forEach(word => {
        if (lines[curline].length + word.length > maxlen) {
          curline++;
          lines[curline] = '';
        }
        lines[curline] += word + ' ';
      });

      for (let linenum = 0; linenum < 5; linenum++) {
        if (linenum > lines.length - 1) break;
        let line = lines[linenum];
        if (linenum == 4) line += '...';
        ctx.fillText(line, x, y + linenum * (size + 2));

        //ctx.strokeText(line, x, y + linenum * (size + 2));
      }

  },
  select() {
    this.dispatchEvent({type: 'itemselect', bubbles: true});
  },
  setXY(x, y) {
    this.x = x;
    this.y = y;
    this.pos = V(-3 + this.margin * this.x, this.margin * -this.y - 1, this.z);
  },
  setData(data) {
    this.data = data;

    this.generateThumb();

    let levelname = this.data.name,
        thumbid = 'level-thumb-' + levelname;
    if (!this.thumb) {
      //this.thumb = this.createObject('object', { id: 'plane', image_id: thumbid, scale: V(1.8), pos: V(1,.2,.02), static: false, pickable: false, collidable: false,});
      this.thumb = this.createObject('object', { id: 'plane', image_id: thumbid, scale: V(5, 2.5, 1), pos: V(2.5,0,.02), static: false, pickable: false, collidable: false, transparent: true});
      //this.thumbimg = this.createObject('object', { id: 'plane', col: 'blue', image_id: 'https://xrdoom.com/wads/doom/morgana/morgana-E1M1.gif', scale: V(1.25, 1.25, 1), pos: V(.73,.53,.025), static: false, pickable: false, collidable: false, transparent: true});
      let firstlevel = data.levels[0];
    } else if (thumbid != this.thumb.image_id) {
      this.thumb.image_id = thumbid;
    }
    let imgsrc = `https://xrdoom.com/wads/doom/${data.name}/${data.name}-${data.levels[0]}.gif`;
    if (!this.thumbimg || this.id != imgsrc) {
      if (this.thumbimg)  this.thumbimg.die();
      //this.thumbimg = this.createObject('image', { id: imgsrc, scale: V(0.6, 0.6, .01), pos: V(.76,.49,.025), static: false, pickable: false, collidable: false, transparent: true, lighting: false});
    }

    if (this.mappreview) {
      this.mappreview.parent.removeChild(this.mappreview);
      this.mappreview.die();
      this.mappreview = false;
    }
    this.loadMap(this.data.url);
  },
  async getPWAD(wadurl) {
    let wad = new WadJS.WadGroup();
    wad.iwad = this.iwad.iwad;
    let pwad = await wad.load(wadurl);
    return {wad, pwad};
  },
  async loadMap(wadurl, mapname) {
    let wads = await this.getPWAD(wadurl);
    let mapnames = wads.pwad.getMapNames().sort();
    let map = wads.wad.getMap(mapnames[0]);
    //this.hologram = this.container.createObject('doom-scroll-map-hologram', { map: map, wads: wads, level: mapname, item: this.item, rotatespeed: 0, showthings: false, });
    //hologram.toggleThings(false);
    if (this.mappreview) {
      this.mappreview.parent.removeChild(this.mappreview);
      this.mappreview.die();
      this.mappreview = false;
    }
    this.mappreview = this.mapcontainer2.createObject('doomdebugger_wireframe', { pos: V(0, .2, 0), map: map, depth_test: true, renderorder: 4, transparent: true });
    this.mapholder.setMap(this.mappreview, mapnames.length);
    if (mapnames.length > 1) {
      this.mapcount.text = '+' + (mapnames.length - 1) + ' more';
      this.mapcount.visible = true;
    } else {
      this.mapcount.visible = false;
      this.mapcount.text = '';
    }
  },
});
room.registerElement('doom-scroll-map-hologram', {
  wads: null,
  map: null,
  level: null,
  item: null,
  showthings: true,
  rotatespeed: 20,

  create() {
    //this.base = this.createObject('object', { id: 'cylinder', scale: V(.2, .02, .2), col: V(.2),  metalness: 0, roughness: .2, });
    this.collision_scale = V(.2, .25, .2);
    this.collision_pos = V(0, .125, 0);
    this.collision_id = 'cube';
    this.collidable = false;

    this.addEventListener('mouseover', ev => this.handleMouseOver(ev));
    this.addEventListener('mouseout', ev => this.handleMouseOut(ev));
    this.addEventListener('mousedown', ev => this.handleMouseDown(ev));
    this.addEventListener('touchstart', ev => this.handleMouseDown(ev));
    this.addEventListener('wheel', ev => this.handleWheel(ev));

    this.layout = this.createObject('layout-template', { transitioneasing: 'ease-out-cubic', transitiontime: 350 });
    let masterlayout = this.layout.createObject('layout-master');
    let labelslot = masterlayout.createObject('layout-slot', { slotname: 'label', pos: V(0, .25, 0) });
    let controlslot = masterlayout.createObject('layout-slot', { slotname: 'controls', pos: V(0, .25, 0), scale: V(.000001) });
    let holoslot = masterlayout.createObject('layout-slot', { slotname: 'hologram', pos: V(0, .1, 0) });
    let colliderslot = masterlayout.createObject('layout-slot', { slotname: 'collider', pos: V(0, 0, 0), scale: V(.25, 1, 1) });
    let explodedlayout = this.layout.createObject('layout-alternate', { layoutname: 'exploded' });
    explodedlayout.createObject('layout-slot', { slotname: 'label', pos: this.worldToLocal(this.parent.localToWorld(V(-.95, 0.575, .2))), scale: V(2) });
    explodedlayout.createObject('layout-slot', { slotname: 'controls', pos: this.worldToLocal(this.parent.localToWorld(V(-.65, 0.65, .2))), scale: V(1) });
    explodedlayout.createObject('layout-slot', { slotname: 'hologram', pos: this.worldToLocal(this.parent.localToWorld(V(0, -.15, -4))), scale: V(20), rotation: V(40, 0, 0) });
    explodedlayout.createObject('layout-slot', { slotname: 'collider', pos: this.worldToLocal(this.parent.localToWorld(V(0, 0, .2))), scale: V(1.8) });

    //this.layout.layouts['default'] = this.layout.createObject('layout-alternate', {layoutname: 'default'}).copy(masterlayout);
    //this.layout.layouts['exploded'] = explodedlayout;


    //this.label = this.createObject('text', { text: this.level, pos: V(0, .25, 0), font: 'doomfont', font_scale: false, font_size: .04, thickness: .002, col: '#900', });
    this.label = labelslot.createObject('text', {
      text: this.level,
      font: 'doomfont',
      font_scale: false,
      font_size: .04,
      thickness: .002,
      col: '#900',
      wireframe: false,
    });
    //this.addEventListener('click', ev => this.handleClick(ev));
    //this.holoeffect = this.createObject('object', { id: 'cone', scale: V(.3, .2, .3), col: 'darkred', rotation: V(180, 0, 0), opacity: .3, pos: V(0, .2, 0), depth_test: false, });
    
    this.controls = controlslot.createObject('doom-scroll-map-hologram-controls');

    let scale = .00005;
    this.container = holoslot.createObject('object', { rotate_deg_per_sec: this.rotatespeed, pos: V(0,0,0), scale: V(scale) });
    this.container2 = this.container.createObject('object');
    let dragcollider = colliderslot.createObject('object', { collision_id: 'cube', scale: V(1.5, .75, .01), xid: 'cube', col: 'blue', opacity: .2 });
    //let fuck = colliderslot.createObject('object', { scale: V(15, 5, 0.1), id: 'cube', col: 'green', opacity: .2, depth_test: false, depth_write: true, renderorder: -1, pos: V(0, 0, -10), depth_func: 'always', js_id: 'fuck' });

    dragcollider.addEventListener('click', ev => { });

    let geoms = this.map.getGeometry();
    let wireframe = this.container2.createObject('doomdebugger_wireframe', { pos: V(0, .2, 0), map: this.map, depth_test: false, renderorder: -2, transparent: true, });
    this.mapwireframe = wireframe;
    this.mapitems = wireframe.createObject('particle', { scale: V(.04), depth_write: true, depth_test: false, renderorder: -1, lighting: false, });
    this.mapitems.pickable = true;
    this.mapitems.addEventListener('mouseover', ev => { console.log('this item', ev); });
    this.updateMapItems(this.map);
    if (!this.showthings) {
      this.mapwireframe.removeChild(this.mapitems);
    }

    this.recenter(-.5);

    this.controls.addEventListener('toggletextures', ev => this.toggleTextures(ev.data));
    this.controls.addEventListener('togglethings', ev => this.toggleThings(ev.data));
    this.controls.addEventListener('exportmap', ev => this.exportMap());
    this.controls.addEventListener('playmap', ev => this.playMap());
    
/*
setTimeout(() => {
    let geom = wireframe.wireframe_dimmed.objects['3d'].children[0].geometry;
    geom.computeBoundingBox();
    let bbox = geom.boundingBox;

    let size = V().subVectors(bbox.max, bbox.min);
    let center = V().addVectors(bbox.min, bbox.max).multiplyScalar(-scale * .5);
console.log('my center!', center, size, bbox);
    //wireframe.pos = center; 
console.log('my wireframe!', wireframe, this);
}, 200);
*/
    //wireframe.scale = V(scale * 1 / Math.max(size.x, size.z));
  },
  recenter(multiplier) {
    let bbox = this.map.getBoundingBox();
    let size = V().subVectors(bbox.max, bbox.min);
    let center = V().addVectors(bbox.min, bbox.max).multiplyScalar(multiplier);
    this.mapwireframe.pos = center; 
    if (this.levelpreview) {
      this.levelpreview.pos = center; 
    }
  },
  updateMapItems(map) {
    let things = map.things,
        mapitems = this.mapitems;
    let pointnum = 0;
    for (let i = 0; i < things.length; i++) {
      let thing = things[i];
      let height = map.getHeight(thing.x, thing.y);
      let thingcolor = this.getColorForThing(thing);
      if (thingcolor) {
        mapitems.setPoint(pointnum++, V(thing.x, height, -thing.y), null, null, thingcolor);
      }
    }
  },
  getColorForThing(thing) {
    switch (thing.type) {
      // spawns
      case 1:
      case 2:
      case 3:
      case 4:
      case 11:
        return V(0,1,0);
      // monsters
      case 7:
      case 9:
      case 16:
      case 58:
      case 64:
      case 65:
      case 66:
      case 67:
      case 68:
      case 69:
      case 71:
      case 72:
      case 84:
      case 3001:
      case 3002:
      case 3003:
      case 3004:
      case 3005:
      case 3006:
        return V(.5,0,0);
      // weapons
      case 2001:
      case 2002:
      case 2003:
      case 2004:
      case 2005:
      case 2006:
      case 82:
        return V(1,1,0);
      // ammo
      case 17:
      case 2007:
      case 2008:
      case 2010:
      case 2046:
      case 2047:
      case 2048:
      case 2049:
        return V(.1,.1,0);
      // keys
      case 5:
      case 6:
      case 13:
      case 38:
      case 39:
      case 40:
        return V(1,0,1);
      // powerups
      case 83:
      case 2013:
      case 2014:
      case 2015:
      case 2022:
      case 2023:
      case 2024:
      case 2026:
      case 2045:
      case 8:
      case 2011:
      case 2012:
      case 2018:
      case 2019:
      case 2025:
        return V(0,0,1);
    }
  },
  handleMouseOver(ev) {
    //this.scale = V(1.2);
  },
  handleMouseOut(ev) {
    if (!this.dragpos) {
      this.scale = V(1);
    }
  },
  handleEvent(ev) {
    if (ev.type == 'mousemove' || ev.type == 'touchmove') this.handleMouseMove(ev);
    else if (ev.type == 'mouseup' || ev.type == 'touchend') this.handleMouseUp(ev);
  },
  handleMouseDown(ev) {
    if (this.spintimer) clearTimeout(this.spintimer);
    this.container.objects.dynamics.linearDamping = .001;
    this.container.objects.dynamics.angularDamping = .001;
    this.container2.objects.dynamics.angularDamping = .001;
    let clientX = (ev.touches ? ev.touches[0].clientX : ev.clientX),
        clientY = (ev.touches ? ev.touches[0].clientY : ev.clientY);
    this.dragpos = [clientX, clientY];
    this.dragstartpos = [ev.clientX, ev.clientY];
    this.dragtype = (ev.button == 1 || (ev.touches && ev.touches.length > 1) ? 'pan' : 'rotate');
    this.dragdiff = [0, 0];
    this.container.rotate_deg_per_sec = 0; 
    window.addEventListener('mousemove', this);
    window.addEventListener('mouseup', this);
    window.addEventListener('touchmove', this);
    window.addEventListener('touchend', this);
    ev.stopPropagation();
    ev.preventDefault();
  },
  handleMouseMove(ev) {
    if (this.dragpos) {
      let clientX = (ev.touches ? ev.touches[0].clientX : ev.clientX),
          clientY = (ev.touches ? ev.touches[0].clientY : ev.clientY);
      let newpos = [clientX, clientY];
      let diff = [this.dragpos[0] - newpos[0], this.dragpos[1] - newpos[1]];
      this.dragdiff[0] += diff[0];
      this.dragdiff[1] += diff[1];
      this.dragpos = newpos;
      if (this.spintimer) clearTimeout(this.spintimer);
    }
  },
  handleMouseUp(ev) {
    this.dragpos = false;
    window.removeEventListener('mousemove', this);
    window.removeEventListener('mouseup', this);
    window.removeEventListener('touchmove', this);
    window.removeEventListener('touchend', this);
    if (this.spintimer) clearTimeout(this.spintimer);
    //this.spintimer = setTimeout(() => this.resetSpin(), 3000);
    let clientX = (ev.changedTouches ? ev.changedTouches[0].clientX : ev.clientX),
        clientY = (ev.changedTouches ? ev.changedTouches[0].clientY : ev.clientY);
    if (Math.abs(this.dragstartpos[0] - clientX) <= 2 && Math.abs(this.dragstartpos[1] - clientY) <= 2) {
      this.expand();
    }
  },
  handleClick(ev) {
    console.log('select it!', this);
  },
  handleWheel(ev) {
    let zoom = (ev.deltaY > 0 ? .9 : 1.1);
    this.container.scale.multiplyScalar(zoom);
    ev.stopPropagation();
    ev.preventDefault();
  },
  expand(throwevent=true) {
    if (!this.expanded) {
      this.expanded = true;
      this.layout.setLayout('exploded');
      this.mapwireframe.wireframe_dimmed.transparent = false;
      this.mapwireframe.wireframe_dimmed.lineobj.material.blending = THREE.AdditiveBlending;
      if (throwevent) this.dispatchEvent({type: 'hologram_expand'});
    } else {
      this.expanded = false;
      this.layout.setLayout('default');
      this.mapwireframe.wireframe_dimmed.transparent = true;
      this.mapwireframe.wireframe_dimmed.lineobj.material.blending = THREE.NormalBlending;
      this.resetSpin();
      if (throwevent) this.dispatchEvent({type: 'hologram_contract'});
    }
    //this.container.pos = V(0, 1, 1.5);
  },
  update(dt) {
    if (this.dragpos) {
      let diff = this.dragdiff;
      if (this.dragtype == 'pan') {
        //this.container2.pos.add(this.container.objects.dynamics.worldToLocalDir(V(diff[0], diff[1], 0).multiplyScalar(10)));
        let rot = this.container.rotation.radians.y;
        //this.container2.pos.add(V(diff[0], 0, diff[1]).applyAxisAngle(V(0,1,0), -rot).multiplyScalar(-10));
        // FIXME - this still gets weird in one quadrant
        this.container2.pos.add(V(diff[0] * Math.cos(rot) + diff[1] * Math.sin(rot), 0, diff[1] * Math.cos(rot) + diff[0] * Math.sin(rot)).multiplyScalar(-10));
      } else {
        //this.container.angular.add(this.container.objects.dynamics.localToWorldDir(V(0, -diff[0] * Math.PI/16, 0)));
        this.container.angular.add(V(0, -diff[0] * Math.PI/16, 0));
//console.log(this.container.rotation.euler);
        //this.container.angular.add(V(-diff[1] * Math.PI/16, 0, 0));
      }
      this.dragdiff[0] = 0;
      this.dragdiff[1] = 0;
    }
  },
  resetSpin() {
    this.container.objects.dynamics.angularDamping = 1;
    this.container.rotate_deg_per_sec = 5; 
    this.container.scale = V(.00005);
    this.container2.pos = V(0);
    setTimeout(() => { this.container.rotate_deg_per_sec = 10; }, 100);
    setTimeout(() => { this.container.rotate_deg_per_sec = 15; }, 200);
    setTimeout(() => { this.container.rotate_deg_per_sec = 20; }, 300);
    this.spintimer = false;
    //this.scale = V(1);
  },
  toggleThings(on) {
    if (!on && this.mapitems.parent) {
      this.mapwireframe.removeChild(this.mapitems);
    } else if (on && !this.mapitems.parent) {
      this.mapwireframe.appendChild(this.mapitems);
    }
  },
  toggleTextures(on) {
console.log('toggle textures', on, this.levelpreview);
    if (on) {
      if (!this.levelpreview) {
        this.levelpreview = this.container2.createObject('doomlevel-map', {
          wads: this.wads.wad,
          map: this.map,
          showceilings: false,
          depth_test: false,
          depth_write: true,
          pickable: false,
          renderorder: -5,
        });
console.log('new level', this.levelpreview);
        this.recenter(-.5);
      } else {
        this.container2.appendChild(this.levelpreview);
      }
    } else {
      if (this.levelpreview) {
        this.container2.removeChild(this.levelpreview);
      }
    }
  },
  exportMap() {
    console.log('do the export', this);
    this.toggleTextures(true);
    let exporter = new THREE.GLTFExporter();
    setTimeout(() => {
			this.levelpreview.objects['3d'].traverse(n => {
				n.oldUserData = n.userData;
				n.userData = {}
			});
			let clone = this.levelpreview.objects['3d'].clone();
			let scale = 1/32;
			clone.position.multiplyScalar(scale);
			clone.scale.set(scale, scale, scale);
console.log('my clone', clone.position, clone);
			this.levelpreview.objects['3d'].traverse(n => {
				n.userData = n.oldUserData;
				delete n.oldUserData;
			});
      exporter.parse(clone, (data) => {
        let filedata = new Blob([data], {type: 'model/gltf-binary'});

        var url = window.URL.createObjectURL(filedata);

        let d = new Date(),
            ts = d.getFullYear() + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0') + d.getHours().toString().padStart(2, '0') + d.getMinutes().toString().padStart(2, '0') + d.getSeconds().toString().padStart(2, '0');

        var a = document.createElement('A');
        a.style.display = 'none';
        document.body.appendChild(a);
        a.href = url;
        a.download = this.item.data.name + '_' + this.level + ' - ' + ts + '.glb';
        a.click();
        window.URL.revokeObjectURL(url);
      }, { binary: true });
    }, 250);
  },
  playMap() {
    let wad = this.item.data;
    let m = this.level.match(/^E(\d)M(\d)$/);
    let warp = '1 1';
    if (m) {
      warp = m[1] + ' ' + m[2];
    } else {
      m = this.level.match(/^MAP(\d+)$/);
      if (m) {
        warp = m[1];
      }
    }
    window.open('emularity-v2.html?wadname=' + encodeURIComponent(wad.name) + '&wadurl=' + encodeURIComponent(wad.url) + '&warp=' + encodeURIComponent(warp));
  },
  saveAsGif(frames=15, length=1000) {
    console.log('eoeoeo', this);
    this.container.rotate_deg_per_sec = 0;
    this.container.rotation = V(0);
    let deg_per_frame = 360 / frames;
    let timer = setInterval(() => {
      this.container.rotation.y += deg_per_frame;
    }, length / frames); 
    setTimeout(() => clearInterval(timer), length);
  }
});
room.registerElement('doom-scroll-map-hologram-controls', {
  create() {
    //this.backdrop = this.createObject('object', { id: 'cube', scale: V(2.48, .16, .01), pos: V(.65, -.02, -.01), image_id: 'shawn2', opacity: .9, lighting: false, texture_repeat: V(.5, 1.2), texture_rotation: 1.57079, });

    // toggle textures
    this.texturetoggle = this.createObject('doom-scroll-toggle', {
      label: 'textures',
      active: false,
    });
    this.texturetoggle.addEventListener('activate', ev => this.dispatchEvent({type: 'toggletextures', data: true}));
    this.texturetoggle.addEventListener('deactivate', ev => this.dispatchEvent({type: 'toggletextures', data: false}));
    
    // show things
    this.thingtoggle = this.createObject('doom-scroll-toggle', {
      label: 'things',
      pos: V(.5, 0, 0),
    });
    this.thingtoggle.addEventListener('activate', ev => this.dispatchEvent({type: 'togglethings', data: true}));
    this.thingtoggle.addEventListener('deactivate', ev => this.dispatchEvent({type: 'togglethings', data: false}));
    // export
    this.exportbutton = this.createObject('doom-scroll-button', {
      label: 'export',
      pos: V(1.6, 0, 0),
    });
    this.playbutton = this.createObject('doom-scroll-button', {
      label: 'play',
      pos: V(1.3, 0, 0),
    });
    this.exportbutton.addEventListener('activate', ev => this.dispatchEvent({type: 'exportmap'}));
    this.playbutton.addEventListener('activate', ev => this.dispatchEvent({type: 'playmap'}));
    // launch client
  }
});
room.registerElement('doom-scroll-toggle', {
  label: '',
  active: true,
  create() {
    this.button = this.createObject('object', {
      id: 'plane',
      image_id: (this.active ? 'sw2brn2' : 'sw1brn2'),
      texture_offset: V(.3125, .1953125),
      texture_repeat: V(.375, .1875),
      scale: V(.04),
      lighting: false,
    });
    this.text = this.createObject('text', {
      text: this.label,
      font: 'doomfont',
      font_scale: false,
      font_size: .04,
      align: 'left',
      verticalalign: 'middle',
      thickness: .002,
      col: '#900',
      pos: V(.04, 0, 0),
    });
    this.backdrop = this.createObject('object', {
      //id: 'cube',
      //col: 'blue',
      //opacity: .7,
      collision_id: 'cube',
      scale: V(.4, .05, .01),
      pos: V(.18, -.005, .01),
    });
    this.backdrop.addEventListener('mouseover', ev => this.handleMouseOver(ev));
    this.backdrop.addEventListener('mouseout', ev => this.handleMouseOut(ev));
    this.backdrop.addEventListener('mousedown', ev => this.handleMouseDown(ev));
    this.backdrop.addEventListener('click', ev => this.handleClick(ev));
  },
  toggleButton() {
    this.active = !this.active;
    this.button.image_id = (this.active ? 'sw2brn2' : 'sw1brn2');
    if (this.active) {
      this.dispatchEvent({type: 'activate'});
    } else {
      this.dispatchEvent({type: 'deactivate'});
    }
  },
  handleMouseOver(ev) {
    this.text.col = '#d00';
  },
  handleMouseOut(ev) {
    this.text.col = '#900';
  },
  handleMouseDown(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  },
  handleClick(ev) {
    this.toggleButton();
    ev.stopPropagation();
    ev.preventDefault();
  },
});
room.registerElement('doom-scroll-map-hologram-preview', {
  create() {
    this.rendertarget = new THREE.WebGLRenderTarget( 256, 256, {
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
    });

    this.loadNewAsset('image', { id: 'mapview', texture: this.rendertarget.texture });

    this.plane = this.createObject('object', {
      id: 'plane',
      col: 'white',
      lighting: false,
      image_id: 'mapview',
    });
    //this.thinger = this.createObject('object', { id: 'cube', col: 'blue', lighting: false, pos: V(0, 0, -4), cull_face: 'none', scale: V(1), angular: V(10, 25, 0) });
    this.scene = new THREE.Scene();
    //this.scene.add(this.thinger.objects['3d']);
    //this.scene.background = new THREE.Color(0xff0000);
    //this.camera = new THREE.PerspectiveCamera();
    this.camera = new THREE.OrthographicCamera();
    this.scene.add(this.camera);

    this.mapcontainer = this.createObject('object', { pos: V(0, 0, -5), scale: V(.0005), rotation: V(90, 0, 0) });
    this.mapcontainer2 = this.mapcontainer.createObject('object', { rotate_deg_per_sec: -10 });
    this.scene.add(this.mapcontainer.objects['3d']);
  },
  setMap(map) {
    if (this.map) {
      this.mapcontainer2.removeChild(this.map);
    }
    this.map = map;
    this.mapcontainer2.appendChild(this.map);
    this.recenter();
  },
  recenter() {
    let map = this.map.map;
    let min = [Infinity, Infinity],
        max = [-Infinity, -Infinity];
    map.vertexes.forEach(v => {
      if (v.x < min[0]) min[0] = v.x;
      if (v.x > max[0]) max[0] = v.x;
      if (v.y < min[1]) min[1] = v.y;
      if (v.y > max[1]) max[1] = v.y;
    });

    let center = [(max[0] + min[0]) / 2, (max[1] + min[1]) / 2];
    this.map.pos.x = -center[0];
    this.map.pos.z = center[1];

    let size = Math.sqrt(Math.pow(Math.max(Math.abs(min[0]), Math.abs(max[0])), 2) + Math.pow(Math.max(Math.abs(min[1]), Math.abs(max[1])), 2)) * .0005 * .8;

    if (this.camera instanceof THREE.OrthographicCamera) {
      this.camera.left = -size;
      this.camera.right = size;
      this.camera.bottom = -size;
      this.camera.top = size;
      this.camera.updateProjectionMatrix();
    } else {
      // TODO - fit perspective camera to map
    }
  },
  update(dt) {
    if (this.scene && this.rendertarget) {
      let renderer = this.engine.systems.render.renderer;
      let rt = renderer.getRenderTarget();
      renderer.setRenderTarget(this.rendertarget);
      renderer.render(this.scene, this.camera);
      renderer.setRenderTarget(rt);
    }
  }
});
room.registerElement('doom-scroll-button', {
  label: '',
  create() {
    this.text = this.createObject('text', {
      text: this.label,
      font: 'doomfont',
      font_scale: false,
      font_size: .04,
      align: 'left',
      verticalalign: 'middle',
      thickness: .002,
      col: '#900',
    });
    this.backdrop = this.createObject('object', {
      //id: 'cube',
      //col: 'blue',
      //opacity: .7,
      collision_id: 'cube',
      scale: V(.4, .05, .01),
      pos: V(.2, -.005, .01),
    });
    this.backdrop.addEventListener('mouseover', ev => this.handleMouseOver(ev));
    this.backdrop.addEventListener('mouseout', ev => this.handleMouseOut(ev));
    this.backdrop.addEventListener('mousedown', ev => this.handleMouseDown(ev));
    this.backdrop.addEventListener('click', ev => this.handleClick(ev));
  },
  handleMouseOver(ev) {
    this.text.col = '#d00';
  },
  handleMouseOut(ev) {
    this.text.col = '#900';
  },
  handleMouseDown(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  },
  handleClick(ev) {
    this.dispatchEvent({type: 'activate'});
    ev.stopPropagation();
    ev.preventDefault();
  },
});
});
room.registerElement('doom-scroll-minimap', {
  create() {
    document.fonts.load('10px Doom').then(() => {
      if (room.pendingCustomElements == 0) {
        this.loadWAD();
      } else {
        elation.events.add(room, 'room_load_complete_customelements', ev => this.loadWAD());
      }
    });
    this.container = this.createObject('object', { rotation: V(45, 0, 0), pos: V(0, 1.5, -1), scale: V(5) });
  },
  async loadWAD() {
    this.iwad = new WadJS.WadGroup();
    await this.iwad.load('DOOM.WAD');

  },
  async getPWAD(wadurl) {
    let wad = new WadJS.WadGroup();
    wad.iwad = this.iwad.iwad;
    let pwad = await wad.load(wadurl);
    return {wad, pwad};
  },
  async loadMap(wadurl, mapname) {
    let wads = await this.getPWAD(wadurl);
    let map = wads.wad.getMap(mapname);
    this.hologram = this.container.createObject('doom-scroll-map-hologram', { map: map, wads: wads, level: mapname, item: this.item, rotatespeed: 0, showthings: false, });
    //hologram.toggleThings(false);
    return this.hologram;
  },
  async sleep(n) {
    return new Promise(resolve => setTimeout(resolve, n));
  },
  async recordGIF(wadurl, mapname) {
    if (this.hologram) this.hologram.die();
    try {
      let hologram = await this.loadMap(wadurl, mapname);
      if (!window.gifenc) {
        window.gifenc = await import('https://unpkg.com/gifenc');
      }
      await this.sleep(100);
      let steps = 18,
      frames = [];
      let gif = new gifenc.GIFEncoder();
      let palette = false;
      for (let i = 1; i < steps + 1; i++) {
        //this.engine.client.view.render(1000/16);
        await new Promise(resolve => requestAnimationFrame(() => {
          hologram.rotation = V(0, i * (360 / steps), 0);
          resolve();
        }));
        frames[i] = await this.engine.client.view.screenshotSingle({format: 'rgba'});

        let frameopts = {delay: 150};
        if (i == 1) {
          palette = gifenc.quantize(frames[i], 16);
          frameopts.palette = palette;
          frameopts.first = true;
          frameopts.delay = 0;
        }
        let indexedFrame = gifenc.applyPalette(frames[i], palette);
        gif.writeFrame(indexedFrame, 128, 128, frameopts);
      }
      gif.finish();
      let output = gif.bytes();

      //this.uploadToS3(wadurl, mapname, output);
      return output;
    } catch (e) {
      console.error('ERROR:', wadurl, mapname, e);
      return false;
    }
  },
  async processList(listurl) {
    let res = await fetch(listurl),
        j = await res.json();

    AWS.config.update({
        region: 'us-west-2', // e.g., 'us-west-2'
        credentials: new AWS.Credentials(JSON.parse(localStorage['aws-credentials'])),
    });

    let successes = [],
        failures = [];

    let pending = 0;
    for (let i = 0; i < j.length; i++) {
      let m = j[i];
      if (m.levels.length == 0) {
        failures.push({success: false, wadname: m.name, mapname: 'UNKNOWN' } );
        continue;
      }
      let levelname = m.levels[0].toUpperCase();
      let gifdata = await this.recordGIF(m.url, levelname);
      pending++;
      if (gifdata) {
        this.uploadToS3(m.url, m.name, levelname, gifdata).then(response => {
          if (response.success) {
            successes.push(response);
          } else {
            failures.push(response);
          }
          pending--;
        });
      } else {
        failures.push({success: false, wadname: m.name, mapname: levelname } );
        pending--;
      }
    }

    let f = async (resolve) => {
      if (pending > 0) {
        setTimeout(f, 100, resolve);
        return false;
      }
      resolve();
    }
    await new Promise(resolve => { f(resolve) });

    console.log('Done!', pending);
    console.log(successes.length + ' succeeded', successes);
    console.log(failures.length + ' failed', failures);
  },
  async uploadToS3(wadurl, wadname, mapname, gifdata) {
    let parts = wadurl.split('/');
    parts.pop();
    parts.push(`${wadname}-${mapname}.gif`);
    let gifurl = parts.join('/');
    parts.shift();
    parts.shift();
    parts.shift();
    let s3key = parts.join('/');
    //console.log('upload', gifurl, s3key, gifdata);

    let presignedUrl = await this.generatePresignedUrl(s3key, 'image/gif');
    try {
        // Use the Fetch API to upload the data to S3
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'image/gif' // Set the correct MIME type
            },
            body: gifdata // Uint8Array as the body
        });

        if (!response.ok) {
            throw new Error(`Failed to upload data: ${response.statusText}`);
        }

        console.log('Data uploaded successfully!', s3key);
        return {success: true, wadname, mapname, gifurl};
    } catch (error) {
        console.error('Error uploading data:', error);
        return { success: false, wadname, mapname, error: error.msg };
    }
  },
  async generatePresignedUrl(key, contentType) {
    const s3 = new AWS.S3();
    const params = {
        Bucket: 'spispopd.lol',
        Key: key,
        Expires: 60, // URL expires in 60 seconds
        ContentType: contentType
    };

    return new Promise((resolve, reject) => {
        s3.getSignedUrl('putObject', params, (err, url) => {
            if (err) {
                reject(err);
            } else {
                resolve(url);
            }
        });
    });
  }
});

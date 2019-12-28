class DoomStateManager {
  constructor(funcs) {
    this.actors = [];
    this.funcs = funcs;
    this.ticktime = 33;
  }
  load(definitionfile) {
    return this.loadDefinitions(definitionfile);
  }
  loadDefinitions(file) {
    return new Promise((resolve, reject) => {
      fetch(file).then((r) => {
        r.json().then((json) => {
          this.loadDefinitionJSON(json);
          resolve(this);
        });
      });
    });
  }
  loadDefinitionJSON(json) {
    this.loadThings(json.things);
    this.loadStates(json.states);
  }
  loadThings(things) {
    this.thingdefs = things;
  }
  loadStates(states) {
    this.states = {};
    for (var k in states) {
      var state = states[k];
      this.states[k] = {
        sprite: state[0],
        frame:  state[1],
        delay:  state[2],
        func:   state[3],
        next:   state[4],
        blah1:  state[5],
        blah2:  state[6],
      };
    }
  }
  create(type) {
    var actor = new DoomActor(type, this.thingdefs[type]);
    this.add(actor);
  }
  add(actor) {
    actor.setFuncs(this.funcs);
    actor.setStates(this.states);
    this.actors.push(actor);
  }
  tick() {
    //console.log('tick');
    for (var i = 0; i < this.actors.length; i++) {
      if (this.actors[i].sleeptime >= 0) {
        this.actors[i].tick(this);
      }
    }
  }
  start() {
    this.timer = setInterval(() => this.tick(), this.ticktime);
  }
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = false;
    }
  }
  setTickTime(ticktime) {
    this.ticktime = ticktime;
    this.stop();
    this.start();
  }
}
class DoomActor {
  constructor(type, thingdef) {
    this.type = type;
    this.funcs = false;
    this.states = false;
    this.sleeptime = 0;
    this.currentstate = null;
    this.nextstate = null;
    this.target = false;
    this.threshold = 0;
    this.health = 0;
    this.flags = {};
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.height = 0;

    this.info = {
      id: thingdef[0],
      spawnstate: thingdef[1],
      spawnhealth: thingdef[2],
      seestate: thingdef[3],
      seesound: thingdef[4],
      reactiontime: thingdef[5],
      attacksound: thingdef[6],
      painstate: thingdef[7],
      painchance: thingdef[8],
      painsound: thingdef[9],
      meleestate: thingdef[10],
      missilestate: thingdef[11],
      deathstate: thingdef[12],
      xdeathstate: thingdef[13],
      deathsound: thingdef[14],
      speed: thingdef[15],
      radius: thingdef[16],
      height: thingdef[17],
      mass: thingdef[18],
      damage: thingdef[19],
      activesound: thingdef[20],
      flags: thingdef[21],
      raisestate: thingdef[22],
    };
  }
  setStates(states) {
    this.states = states;
    this.reset();
  }
  reset() {
    if (this.info.spawnstate) {
      this.setState(this.info.spawnstate);
    }
    this.health = this.info.spawnhealth;
    for (var i = 0; i < this.info.flags.length; i++) {
      var flag = this.info.flags[i];
      this.flags[flag] = true;
    }
    this.height = this.info.height;
  }
  tick(manager) {
    if (this.sleeptime-- == 0 && this.nextstate) {
      this.setActiveState(this.nextstate, manager);
    }
    //console.log('tick', this.sleeptime);
  }
  setFuncs(funcs) {
    // TODO - at some point, it might be nice if actors can override specific functions
    this.funcs = funcs;
  }
  setActiveState(state, manager) {
    // Applies the settings for the specified state
    this.currentstate = state;

    var current = this.states[state];
    if (current) {
      this.setState(current.next);
    }

    // update frame
    //console.log('set sprite frame:', current);
    this.dispatchEvent({type: 'sprite_frame', data: {sprite: current.sprite, frame: current.frame}});

    // Call function
    if (this.funcs && current.func) {
      if (this.funcs[current.func]) {
        this.funcs[current.func].call(manager, this);
      } else {
        console.log('Unknown state function:', current.func);
      }
    }

  }
  setState(next, delay) {
    // Set up next frame
    var state = this.states[next];
    if (state) {
      if (delay === undefined) {
        delay = (this.nextstate ? state.delay : Math.floor(Math.random() * state.delay));
      }
      this.sleeptime = delay - 1;
    } else {
      this.sleeptime = -1;
    }
    this.nextstate = next;
  }
  setTarget(target) {
    this.target = target;
  }
  playSound(sound) {
    this.dispatchEvent({type: 'sound', sound: sound});
  }
  dispatchEvent(ev) {
    console.log('TODO - implement event dispatching', ev, this);
  }
  hasFlag(flag) {
    if (Array.isArrag(flag)) {
      for (var i = 0; i < flag.length; i++) {
        if (this.flags[flag[i]]) {
          return true;
        }
      }
    } else {
      return this.flags[flag] === true;
    }
    return false;
  }
  addFlag(flag) {
    if (Array.isArrag(flag)) {
      for (var i = 0; i < flag.length; i++) {
        this.flags[flag[i]] = true;
      }
    } else {
      this.flags[flag] = true;
    }
  }
  removeFlag(flag) {
    this.flags[flag] = false;
  }
}

import {globalize} from './utils.js'
import * as p_mobj from './p_mobj.js';

globalize(p_mobj);
//
// Extended player object info: player_t
//
export class player_t
{
    constructor() {
        this.mo = new mobj_t();
        this.playerstate = null;
        this.cmd = null;

        // Determine POV,
        //  including viewpo    this.bobbing during movement.
        // Focal origin above r.z
        this.viewz = 0;
        // Base height above floor for viewz.
        this.viewheight = 0;
        // Bob/squat speed.
        this.deltaviewheight = 0;
        // bounded/scaled total momentum.
        this.bob = 0;

        // This is only used between levels,
        // mo->health is used during levels.
        this.health = 100; 
        this.armorpoints = 0;
        // Armor type is 0-2.
        this.armortype = 0;      

        // Power ups. invinc and invis are tic counters.
        this.powers = []; //[NUMPOWERS]
        this.cards = []; //[NUMCARDS]
        this.backpack = false;
    
    // Frags, kills of other players.
        this.frags = []; //[MAXPLAYERS]
        this.readyweapon = null;
    
    // Is wp_nochange if not changing.
        this.pendingweapon = null;

        this.weaponowned = []; //[NUMWEAPONS]
        this.ammo = []; //[NUMAMMO]
        this.maxammo = []; //[NUMAMMO]

        // True if button down last tic.
        this.attackdown = false;
        this.usedown = false;

        // Bit flags, for cheats and debug.
        // See cheat_t, above.
        this.cheats = 0;         

        // Refired shots are less accurate.
        this.refire = 0;         

        // For     this.ermission stats.
        this.killcount = 0;
        this.itemcount = 0;
        this.secretcount = 0;

        // H    this.messages.
        this.message = "";
    
        // For screen flashing (red or bright).
        this.damagecount = 0;
        this.bonuscount = 0;

        // Who did damage (NULL for floors/ceilings).
        this.attacker = null;
    
        // So gun flashes light up areas.
        this.extralight = 0;

        // Current PLAYPAL, ???
        //  can be set to REDCOLORMAP for pain, etc.
        this.fixedcolormap = 0;

        // Player skin colorshift,
        //  0-3 for which color to draw player.
        this.colormap = 0;       

        // Overlay view sprites (gun, etc).
        this.psprites = []; //[NUMPSPRITES]

        // True if secret level has been done.
        this.didsecret = false;      

    }
}


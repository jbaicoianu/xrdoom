import {Enum} from './enum.js'
import {globalize} from './utils.js'
import * as doomdef from './doomdef.js';

globalize(doomdef);
//
// NOTES: mobj_t
//
// mobj_ts are used to tell the refresh where to draw an image,
// tell the world simulation when objects are contacted,
// and tell the sound driver how to position a sound.
//
// The refresh uses the next and prev links to follow
// lists of things in sectors as they are being drawn.
// The sprite, frame, and angle elements determine which patch_t
// is used to draw the sprite if it is visible.
// The sprite and frame values are allmost allways set
// from state_t structures.
// The statescr.exe utility generates the states.h and states.c
// files that contain the sprite/frame numbers from the
// statescr.txt source file.
// The xyz origin point represents a point at the bottom middle
// of the sprite (between the feet of a biped).
// This is the default origin position for patch_ts grabbed
// with lumpy.exe.
// A walking creature will have its z equal to the floor
// it is standing on.
//
// The sound code uses the x,y, and subsector fields
// to do stereo positioning of any sound effited by the mobj_t.
//
// The play simulation uses the blocklinks, x,y,z, radius, height
// to determine when mobj_ts are touching each other,
// touching lines in the map, or hit by trace lines (gunshots,
// lines of sight, etc).
// The mobj_t->flags element has various bit flags
// used by the simulation.
//
// Every mobj_t is linked into a single sector
// based on its origin coordinates.
// The subsector_t is found with R_PointInSubsector(x,y),
// and the sector_t can be found with subsector->sector.
// The sector links are only used by the rendering code,
// the play simulation does not care about them at all.
//
// Any mobj_t that needs to be acted upon by something else
// in the play world (block movement, be shot, etc) will also
// need to be linked into the blockmap.
// If the thing has the MF_NOBLOCK flag set, it will not use
// the block links. It can still interact with other things,
// but only as the instigator (missiles will run into other
// things, but nothing can run into a missile).
// Each block in the grid is 128*128 units, and knows about
// every line_t that it contains a piece of, and every
// interactable mobj_t that has its origin contained.  
//
// A valid mobj_t is a mobj_t that has the proper subsector_t
// filled in for its xy coordinates and is linked into the
// sector from which the subsector was made, or has the
// MF_NOSECTOR flag set (the subsector_t needs to be valid
// even if MF_NOSECTOR is set), and is linked into a blockmap
// block or has the MF_NOBLOCKMAP flag set.
// Links should only be modified by the P_[Un]SetThingPosition()
// functions.
// Do not change the MF_NO? flags while a thing is valid.
//
// Any questions?
//

//
// Misc. mobj flags
//
export var mobjtype_t = Enum.define({
    // Call P_SpecialThing when touched.
    MF_SPECIAL          : 1,
    // Blocks.
    MF_SOLID            : 2,
    // Can be hit.
    MF_SHOOTABLE        : 4,
    // Don't use the sector links (invisible but touchable).
    MF_NOSECTOR         : 8,
    // Don't use the blocklinks (inert but displayable)
    MF_NOBLOCKMAP       : 16,                    

    // Not to be activated by sound, deaf monster.
    MF_AMBUSH           : 32,
    // Will try to attack right back.
    MF_JUSTHIT          : 64,
    // Will take at least one step before attacking.
    MF_JUSTATTACKED     : 128,
    // On level spawning (initial position),
    //  hang from ceiling instead of stand on floor.
    MF_SPAWNCEILING     : 256,
    // Don't apply gravity (every tic),
    //  that is, object will float, keeping current height
    //  or changing it actively.
    MF_NOGRAVITY        : 512,

    // Movement flags.
    // This allows jumps from high places.
    MF_DROPOFF          : 0x400,
    // For players, will pick up items.
    MF_PICKUP           : 0x800,
    // Player cheat. ???
    MF_NOCLIP           : 0x1000,
    // Player: keep info about sliding along walls.
    MF_SLIDE            : 0x2000,
    // Allow moves to any height, no gravity.
    // For active floaters, e.g. cacodemons, pain elementals.
    MF_FLOAT            : 0x4000,
    // Don't cross lines
    //   ??? or look at heights on teleport.
    MF_TELEPORT         : 0x8000,
    // Don't hit same species, explode on block.
    // Player missiles as well as fireballs of various kinds.
    MF_MISSILE          : 0x10000,      
    // Dropped by a demon, not level spawned.
    // E.g. ammo clips dropped by dying former humans.
    MF_DROPPED          : 0x20000,
    // Use fuzzy draw (shadow demons or spectres),
    //  temporary player invisibility powerup.
    MF_SHADOW           : 0x40000,
    // Flag: don't bleed when shot (use puff),
    //  barrels and shootable furniture shall not bleed.
    MF_NOBLOOD          : 0x80000,
    // Don't stop moving halfway off a step,
    //  that is, have dead bodies slide down all the way.
    MF_CORPSE           : 0x100000,
    // Floating to a height for a move, ???
    //  don't auto float to target's height.
    MF_INFLOAT          : 0x200000,

    // On kill, count this enemy object
    //  towards intermission kill total.
    // Happy gathering.
    MF_COUNTKILL        : 0x400000,
    
    // On picking up, count this item object
    //  towards intermission item total.
    MF_COUNTITEM        : 0x800000,

    // Special handling: skull in flight.
    // Neither a cacodemon nor a missile.
    MF_SKULLFLY         : 0x1000000,

    // Don't spawn this object
    //  in death match mode (e.g. key cards).
    MF_NOTDMATCH        : 0x2000000,

    // Player sprites in multiplayer modes are modified
    //  using an internal color lookup table for re-indexing.
    // If 0x4 0x8 or 0xc,
    //  use a translation table for player colormaps
    MF_TRANSLATION      : 0xc000000,
    // Hmm ???.
    MF_TRANSSHIFT       : 26

});


// Map Object definition.
export class mobj_t
{
    constructor() {
        // List: thinker links.
        this.thinker = null;

        // Info for drawing: position.
        this.x = 0;
        this.y = 0;
        this.z = 0;

        // More list: links in sector (if needed)
        this.snext = null;
        this.sprev = null;

        //More drawing info: to determine current sprite.
        this.angle = 0;  // orientation
        this.sprite = 0; // used to find patch_t and flip value
        this.frame = 0;  // might be ORed with FF_FULLBRIGHT

        // Interaction info, by BLOCKMAP.
        // Links in blocks (if needed).
        this.bnext = null;
        this.bprev = null;
        
        this.subsector = null;

        // The closest interval over all contacted Sectors.
        this.floorz = 0;
        this.ceilingz = 0;

        // For movement checking.
        this.radius = 0;
        this.height = 0; 

        // Momentums, used to update position.
        this.momx = 0;
        this.momy = 0;
        this.momz = 0;

        // If == validcount, already checked.
        this.validcount = 0;

        this.type = 0;
        this.info = null;   // &mobjinfo[mobj->type]
        
        this.tics = 0;   // state tic counter
        this.state = null;
        this.flags = 0;
        this.health = 0;

        // Movement direction, movement generation (zig-zagging).
        this.movedir = 0;        // 0-7
        this.movecount = 0;      // when 0, select a new dir

        // Thing being chased/attacked (or NULL),
        // also the originator for missiles.
        this.target = null;

        // Reaction time: if non 0, don't attack yet.
        // Used by player to freeze a bit after teleporting.
        this.reactiontime = 0;   

        // If >0, the target will be chased
        // no matter what (even if shot)
        this.threshold = 0;

        // Additional info record for player avatars only.
        // Only valid if type == MT_PLAYER
        this.player = null;

        // Player number last looked for.
        this.lastlook = 0;       

        // For nightmare respawn.
        this.spawnpoint = null;     

        // Thing being chased/attacked for tracers.
        this.tracer = null; 
        
    }
};



export function P_SetMobjState ( mobj, state )
{
    var st;

    do
    {
        if (state == 'S_NULL')
        {
            mobj.state = 'S_NULL';
            P_RemoveMobj (mobj);
            return false;
        }

        st = states[state];
        mobj.state = st;
        mobj.tics = st.tics;
        mobj.sprite = st.sprite;
        mobj.frame = st.frame;

        // Modified handling.
        // Call action functions when the state is set
        if (st.action.acp1)            
            st.action.acp1(mobj);      
        
        state = st.nextstate;
    } while (!mobj.tics);
                                
    return true;
}


//
// P_ExplodeMissile  
//
export function P_ExplodeMissile (mo)
{
    mo.momx = mo.momy = mo.momz = 0;

    P_SetMobjState (mo, mobjinfo[mo.type].deathstate);

    mo.tics -= P_Random()&3;

    if (mo.tics < 1)
        mo.tics = 1;

    mo.removeFlag('MF_MISSILE');

    if (mo.info.deathsound)
        S_StartSound (mo, mo.info.deathsound);
}


//
// P_XYMovement  
//
const STOPSPEED = 0x1000
const FRICTION = 0xe800

export function P_XYMovement (mo) 
{       
    var ptryx;
        ptryy;
        player;
        xmove;
        ymove;
                        
    if (!mo.momx && !mo.momy)
    {
        if (mo.hasFlag('MF_SKULLFLY'))
        {
            // the skull slammed into something
            mo.removeFlag('MF_SKULLFLY');
            mo.momx = mo.momy = mo.momz = 0;

            P_SetMobjState (mo, mo.info.spawnstate);
        }
        return;
    }
        
    player = mo.player;
                
    if (mo.momx > MAXMOVE)
        mo.momx = MAXMOVE;
    else if (mo.momx < -MAXMOVE)
        mo,momx = -MAXMOVE;

    if (mo.momy > MAXMOVE)
        mo.momy = MAXMOVE;
    else if (mo.momy < -MAXMOVE)
        mo.momy = -MAXMOVE;
                
    xmove = mo.momx;
    ymove = mo.momy;
        
    do
    {
        if (xmove > MAXMOVE/2 || ymove > MAXMOVE/2)
        {
            ptryx = mo.x + xmove/2;
            ptryy = mo.y + ymove/2;
            xmove >>= 1;
            ymove >>= 1;
        }
        else
        {
            ptryx = mo.x + xmove;
            ptryy = mo.y + ymove;
            xmove = ymove = 0;
        }
                
        if (!P_TryMove (mo, ptryx, ptryy))
        {
            // blocked move
            if (mo.player)
            {   // try to slide along it
                P_SlideMove (mo);
            }
            else if (mo.hasFlag('MF_MISSILE'))
            {
                // explode a missile
                if (ceilingline &&
                    ceilingline.backsector &&
                    ceilingline.backsector.ceilingpic == skyflatnum)
                {
                    // Hack to prevent missiles exploding
                    // against the sky.
                    // Does not handle sky floors.
                    P_RemoveMobj (mo);
                    return;
                }
                P_ExplodeMissile (mo);
            }
            else
                mo.momx = mo.momy = 0;
        }
    } while (xmove || ymove);
    
    // slow down
    if (player && player.cheats & CF_NOMOMENTUM)
    {
        // debug option for no sliding at all
        mo.momx = mo.momy = 0;
        return;
    }

    if (mo.flags & (MF_MISSILE | MF_SKULLFLY) )
        return;         // no friction for missiles ever
                
    if (mo.z > mo.floorz)
        return;         // no friction when airborne

    if (mo.flags & MF_CORPSE)
    {
        // do not stop sliding
        //  if halfway off a step with some momentum
        if (mo.momx > FRACUNIT/4
            || mo.momx < -FRACUNIT/4
            || mo.momy > FRACUNIT/4
            || mo.momy < -FRACUNIT/4)
        {
            if (mo.floorz != mo.subsector.sector.floorheight)
                return;
        }
    }

    if (mo.momx > -STOPSPEED
        && mo.momx < STOPSPEED
        && mo.momy > -STOPSPEED
        && mo.momy < STOPSPEED
        && (!player
            || (player.cmd.forwardmove== 0
                && player.cmd.sidemove == 0 ) ) )
    {
        // if in a walking frame, stop moving
        if ( player&&(unsigned)((player.mo.state - states)- S_PLAY_RUN1) < 4)
            P_SetMobjState (player.mo, S_PLAY);
        
        mo.momx = 0;
        mo.momy = 0;
    }
    else
    {
        mo.momx = FixedMul (mo.momx, FRICTION);
        mo.momy = FixedMul (mo.momy, FRICTION);
    }
}

//
// P_ZMovement
//
export function P_ZMovement (mo)
{
    var dist,
        delta;
    
    // check for smooth step up
    if (mo.player && mo.z < mo.floorz)
    {
        mo.player.viewheight -= mo.floorz-mo.z;

        mo.player.deltaviewheight
            = (VIEWHEIGHT - mo.player.viewheight)>>3;
    }
    
    // adjust height
    mo.z += mo.momz;
        
    if ( mo.flags & MF_FLOAT
         && mo.target)
    {
        // float down towards target if too close
        if ( !(mo.flags & MF_SKULLFLY)
             && !(mo.flags & MF_INFLOAT) )
        {
            dist = P_AproxDistance (mo.x - mo.target.x,
                                    mo.y - mo.target.y);
            
            delta =(mo.target.z + (mo.height>>1)) - mo.z;

            if (delta<0 && dist < -(delta*3) )
                mo.z -= FLOATSPEED;
            else if (delta>0 && dist < (delta*3) )
                mo.z += FLOATSPEED;                    
        }
        
    }
    
    // clip movement
    if (mo.z <= mo.floorz)
    {
        // hit the floor

        // Note (id):
        //  somebody left this after the setting momz to 0,
        //  kinda useless there.
        if (mo.flags & MF_SKULLFLY)
        {
            // the skull slammed into something
            mo.momz = -mo.momz;
        }
        
        if (mo.momz < 0)
        {
            if (mo.player
                && mo.momz < -GRAVITY*8)       
            {
                // Squat down.
                // Decrease viewheight for a moment
                // after hitting the ground (hard),
                // and utter appropriate sound.
                mo.player.deltaviewheight = mo.momz>>3;
                S_StartSound (mo, sfx_oof);
            }
            mo.momz = 0;
        }
        mo.z = mo.floorz;

        if ( (mo.flags & MF_MISSILE)
             && !(mo.flags & MF_NOCLIP) )
        {
            P_ExplodeMissile (mo);
            return;
        }
    }
    else if (! (mo.flags & MF_NOGRAVITY) )
    {
        if (mo.momz == 0)
            mo.momz = -GRAVITY*2;
        else
            mo.momz -= GRAVITY;
    }
        
    if (mo.z + mo.height > mo.ceilingz)
    {
        // hit the ceiling
        if (mo.momz > 0)
            mo.momz = 0;
        {
            mo.z = mo.ceilingz - mo.height;
        }

        if (mo.flags & MF_SKULLFLY)
        {       // the skull slammed into something
            mo.momz = -mo.momz;
        }
        
        if ( (mo.flags & MF_MISSILE)
             && !(mo.flags & MF_NOCLIP) )
        {
            P_ExplodeMissile (mo);
            return;
        }
    }
} 



//
// P_NightmareRespawn
//
export function P_NightmareRespawn (mobj)
{
    var x,
        y,
        z, 
        ss, 
        mo,
        mthing;
                
    x = mobj.spawnpoint.x << FRACBITS; 
    y = mobj.spawnpoint.y << FRACBITS; 

    // somthing is occupying it's position?
    if (!P_CheckPosition (mobj, x, y) ) 
        return; // no respwan

    // spawn a teleport fog at old spot
    // because of removal of the body?
    mo = P_SpawnMobj (mobj.x,
                      mobj.y,
                      mobj.subsector.sector.floorheight , MT_TFOG); 
    // initiate teleport sound
    S_StartSound (mo, "sfx_telept");

    // spawn a teleport fog at the new spot
    ss = R_PointInSubsector (x,y); 

    mo = P_SpawnMobj (x, y, ss.sector.floorheight , MT_TFOG); 

    S_StartSound (mo, "sfx_telept");

    // spawn the new monster
    mthing = mobj.spawnpoint;
        
    // spawn it
    if (mobj.info.flags & MF_SPAWNCEILING)
        z = ONCEILINGZ;
    else
        z = ONFLOORZ;

    // inherit attributes from deceased one
    mo = P_SpawnMobj (x,y,z, mobj.type);
    mo.spawnpoint = mobj.spawnpoint;  
    mo.angle = ANG45 * (mthing.angle/45);

    if (mthing.options & MTF_AMBUSH)
        mo.flags |= MF_AMBUSH;

    mo.reactiontime = 18;
        
    // remove the old monster,
    P_RemoveMobj (mobj);
}


//
// P_MobjThinker
//
export function P_MobjThinker (mobj)
{
    // momentum movement
    if (mobj.momx
        || mobj.momy
        || (mobj.flags&MF_SKULLFLY) )
    {
        P_XYMovement (mobj);

        // FIXME: decent NOP/NULL/Nil function pointer please.
        if (mobj.thinker.function.acv == -1)
            return;             // mobj was removed
    }
    if ( (mobj.z != mobj.floorz)
         || mobj.momz )
    {
        P_ZMovement (mobj);
        
        // FIXME: decent NOP/NULL/Nil function pointer please.
        if (mobj.thinker.function.acv == -1)
            return;             // mobj was removed
    }

    
    // cycle through states,
    // calling action functions at transitions
    if (mobj.tics != -1)
    {
        mobj.tics--;
                
        // you can cycle through multiple states in a tic
        if (!mobj.tics)
            if (!P_SetMobjState (mobj, mobj.state.nextstate) )
                return;         // freed itself
    }
    else
    {
        // check for nightmare respawn
        if (! (mobj.flags & MF_COUNTKILL) )
            return;

        if (!respawnmonsters)
            return;

        mobj.movecount++;

        if (mobj.movecount < 12*35)
            return;

        if ( leveltime&31 )
            return;

        if (P_Random () > 4)
            return;

        P_NightmareRespawn (mobj);
    }

}


//
// P_SpawnMobj
//
export function P_SpawnMobj ( x, y, z, type )
{
    var mobj,
        st,
        info;
        
    //mobj = Z_Malloc (sizeof(*mobj), PU_LEVEL, NULL);
    //memset (mobj, 0, sizeof (*mobj));
    mobj = new mobj_t();

    info = mobjinfo[type];
        
    mobj.type = type;
    mobj.info = info;
    mobj.x = x;
    mobj.y = y;
    mobj.radius = info.radius;
    mobj.height = info.height;
    mobj.flags = info.flags;
    mobj.health = info.spawnhealth;

    if (gameskill != sk_nightmare)
        mobj.reactiontime = info.reactiontime;
    
    mobj.lastlook = P_Random () % MAXPLAYERS;
    // do not set the state with P_SetMobjState,
    // because action routines can not be called yet
    st = states[info.spawnstate];

    mobj.state = st;
    mobj.tics = st.tics;
    mobj.sprite = st.sprite;
    mobj.frame = st.frame;

    // set subsector and/or block links
    P_SetThingPosition (mobj);
        
    mobj.floorz = mobj.subsector.sector.floorheight;
    mobj.ceilingz = mobj.subsector.sector.ceilingheight;

    if (z == ONFLOORZ)
        mobj.z = mobj.floorz;
    else if (z == ONCEILINGZ)
        mobj.z = mobj.ceilingz - mobj.info.height;
    else 
        mobj.z = z;

    mobj.thinker.function.acp1 = P_MobjThinker;
        
    P_AddThinker (mobj.thinker);

    return mobj;
}


//
// P_RemoveMobj
//
var itemrespawnque = new Array(ITEMQUESIZE);
var itemrespawntime = new Array(ITEMQUESIZE);
var iquehead;
var iquetail;


export function P_RemoveMobj (mobj)
{
    if ((mobj.flags & MF_SPECIAL)
        && !(mobj.flags & MF_DROPPED)
        && (mobj.type != MT_INV)
        && (mobj.type != MT_INS))
    {
        itemrespawnque[iquehead] = mobj.spawnpoint;
        itemrespawntime[iquehead] = leveltime;
        iquehead = (iquehead+1)&(ITEMQUESIZE-1);

        // lose one off the end?
        if (iquehead == iquetail)
            iquetail = (iquetail+1)&(ITEMQUESIZE-1);
    }
        
    // unlink from sector and block lists
    P_UnsetThingPosition (mobj);
    
    // stop any playing sound
    S_StopSound (mobj);
    
    // free block
    P_RemoveThinker (mobj);
}

//
// P_RespawnSpecials
//
export function P_RespawnSpecials ()
{
    var x,
        y,
        z,
        ss, 
        mo,
        mthing,
        i;

    // only respawn items in deathmatch
    if (deathmatch != 2)
        return; // 

    // nothing left to respawn?
    if (iquehead == iquetail)
        return;         

    // wait at least 30 seconds
    if (leveltime - itemrespawntime[iquetail] < 30*35)
        return;                 

    mthing = itemrespawnque[iquetail];
        
    x = mthing.x << FRACBITS; 
    y = mthing.y << FRACBITS; 
          
    // spawn a teleport fog at the new spot
    ss = R_PointInSubsector (x,y); 
    mo = P_SpawnMobj (x, y, ss.sector.floorheight , MT_IFOG); 
    S_StartSound (mo, "sfx_itmbk");

    // find which type to spawn
    for (i=0 ; i< NUMMOBJTYPES ; i++)
    {
        if (mthing.type == mobjinfo[i].doomednum)
            break;
    }
    
    // spawn it
    if (mobjinfo[i].flags & MF_SPAWNCEILING)
        z = ONCEILINGZ;
    else
        z = ONFLOORZ;

    mo = P_SpawnMobj (x,y,z, i);
    mo.spawnpoint = mthing;   
    mo.angle = ANG45 * (mthing.angle/45);

    // pull it from the que
    iquetail = (iquetail+1)&(ITEMQUESIZE-1);
}

//
// P_SpawnPlayer
// Called when a player is spawned on the level.
// Most of the player structure stays unchanged
//  between levels.
//
export function P_SpawnPlayer (mthing)
{
    var p,
        x,
        y,
        z,
        mobj,
        i;

    // not playing?
    if (!playeringame[mthing.type-1])
        return;
                
    p = players[mthing.type-1];

    if (p.playerstate == PST_REBORN)
        G_PlayerReborn (mthing.type-1);

    x           = mthing.x << FRACBITS;
    y           = mthing.y << FRACBITS;
    z           = ONFLOORZ;
    mobj        = P_SpawnMobj (x,y,z, MT_PLAYER);

    // set color translations for player sprites
    if (mthing.type > 1)               
        mobj.flags |= (mthing.type-1)<<MF_TRANSSHIFT;
                
    mobj.angle = ANG45 * (mthing.angle/45);
    mobj.player = p;
    mobj.health = p.health;

    p.mo = mobj;
    p.playerstate = PST_LIVE;  
    p.refire = 0;
    p.message = NULL;
    p.damagecount = 0;
    p.bonuscount = 0;
    p.extralight = 0;
    p.fixedcolormap = 0;
    p.viewheight = VIEWHEIGHT;

    // setup gun psprite
    P_SetupPsprites (p);
    
    // give all cards in death match mode
    if (deathmatch)
        for (i=0 ; i<NUMCARDS ; i++)
            p.cards[i] = true;
                        
    if (mthing.type-1 == consoleplayer)
    {
        // wake up the status bar
        ST_Start ();
        // wake up the heads up text
        HU_Start ();            
    }
}


//
// P_SpawnMapThing
// The fields of the mapthing should
// already be in host byte order.
//
export function P_SpawnMapThing (mthing)
{
    var i,
        bit,
        mobj,
        x,
        y,
        z;
                
    // count deathmatch start positions
    if (mthing.type == 11)
    {
        if (deathmatch_p < deathmatchstarts[10])
        {
            // FIXME (bai) - this does weird pointer math to copy valies into an array, need to duplicate this somehow
            //memcpy (deathmatch_p, mthing, sizeof(*mthing));
            //deathmatch_p++;
            deathmatch_p = mthing;
        }
        return;
    }
        
    // check for players specially
    if (mthing.type <= 4)
    {
        // save spots for respawning in network games
        playerstarts[mthing.type-1] = mthing;
        if (!deathmatch)
            P_SpawnPlayer (mthing);

        return;
    }

    // check for apropriate skill level
    if (!netgame && (mthing.options & 16) )
        return;
                
    if (gameskill == sk_baby)
        bit = 1;
    else if (gameskill == sk_nightmare)
        bit = 4;
    else
        bit = 1<<(gameskill-1);

    if (!(mthing.options & bit) )
        return;
        
    // find which type to spawn
    for (i=0 ; i< NUMMOBJTYPES ; i++)
        if (mthing.type == mobjinfo[i].doomednum)
            break;
        
    if (i==NUMMOBJTYPES)
        I_Error ("P_SpawnMapThing: Unknown type %i at (%i, %i)",
                 mthing.type,
                 mthing.x, mthing.y);
                
    // don't spawn keycards and players in deathmatch
    if (deathmatch && mobjinfo[i].flags & MF_NOTDMATCH)
        return;
                
    // don't spawn any monsters if -nomonsters
    if (nomonsters
        && ( i == MT_SKULL
             || (mobjinfo[i].flags & MF_COUNTKILL)) )
    {
        return;
    }
    
    // spawn it
    x = mthing.x << FRACBITS;
    y = mthing.y << FRACBITS;

    if (mobjinfo[i].flags & MF_SPAWNCEILING)
        z = ONCEILINGZ;
    else
        z = ONFLOORZ;
    
    mobj = P_SpawnMobj (x,y,z, i);
    mobj.spawnpoint = mthing;

    if (mobj.tics > 0)
        mobj.tics = 1 + (P_Random () % mobj.tics);
    if (mobj.flags & MF_COUNTKILL)
        totalkills++;
    if (mobj.flags & MF_COUNTITEM)
        totalitems++;
                
    mobj.angle = ANG45 * (mthing.angle/45);
    if (mthing.options & MTF_AMBUSH)
        mobj.flags |= MF_AMBUSH;
}

//
// GAME SPAWN FUNCTIONS
//


//
// P_SpawnPuff
//
//extern fixed_t attackrange;

export function P_SpawnPuff ( x, y, z )
{
    var th;
        
    z += ((P_Random()-P_Random())<<10);

    th = P_SpawnMobj (x,y,z, MT_PUFF);
    th.momz = FRACUNIT;
    th.tics -= P_Random()&3;

    if (th.tics < 1)
        th.tics = 1;
        
    // don't make punches spark on the wall
    if (attackrange == MELEERANGE)
        P_SetMobjState (th, S_PUFF3);
}

//
// P_SpawnBlood
// 
export function P_SpawnBlood ( x, y, z, damage )
{
    var th;
        
    z += ((P_Random()-P_Random())<<10);
    th = P_SpawnMobj (x,y,z, MT_BLOOD);
    th.momz = FRACUNIT*2;
    th.tics -= P_Random()&3;

    if (th.tics < 1)
        th.tics = 1;
                
    if (damage <= 12 && damage >= 9)
        P_SetMobjState (th,S_BLOOD2);
    else if (damage < 9)
        P_SetMobjState (th,S_BLOOD3);
}



//
// P_CheckMissileSpawn
// Moves the missile forward a bit
//  and possibly explodes it right there.
//
export function P_CheckMissileSpawn (th)
{
    th.tics -= P_Random()&3;
    if (th.tics < 1)
        th.tics = 1;
    
    // move a little forward so an angle can
    // be computed if it immediately explodes
    th.x += (th.momx>>1);
    th.y += (th.momy>>1);
    th.z += (th.momz>>1);

    if (!P_TryMove (th, th.x, th.y))
        P_ExplodeMissile (th);
}


//
// P_SpawnMissile
//
export function P_SpawnMissile ( source, dest, type )
{
    var th,
        an,
        dist;

    th = P_SpawnMobj (source.x,
                      source.y,
                      source.z + 4*8*FRACUNIT, type);
    
    if (th.info.seesound)
        S_StartSound (th, th.info.seesound);

    th.target = source;        // where it came from
    an = R_PointToAngle2 (source.x, source.y, dest.x, dest.y);      

    // fuzzy player
    if (dest.flags & MF_SHADOW)
        an += (P_Random()-P_Random())<<20;      

    th.angle = an;
    an >>= ANGLETOFINESHIFT;
    th.momx = FixedMul (th.info.speed, finecosine[an]);
    th.momy = FixedMul (th.info.speed, finesine[an]);
        
    dist = P_AproxDistance (dest.x - source.x, dest.y - source.y);
    dist = dist / th.info.speed;

    if (dist < 1)
        dist = 1;

    th.momz = (dest.z - source.z) / dist;
    P_CheckMissileSpawn (th);
        
    return th;
}


//
// P_SpawnPlayerMissile
// Tries to aim at a nearby monster
//
export function P_SpawnPlayerMissile ( source, type )
{
    var th,
        an,
        x,
        y,
        z,
        slope;
    
    // see which target is to be aimed at
    an = source.angle;
    slope = P_AimLineAttack (source, an, 16*64*FRACUNIT);
    
    if (!linetarget)
    {
        an += 1<<26;
        slope = P_AimLineAttack (source, an, 16*64*FRACUNIT);

        if (!linetarget)
        {
            an -= 2<<26;
            slope = P_AimLineAttack (source, an, 16*64*FRACUNIT);
        }

        if (!linetarget)
        {
            an = source.angle;
            slope = 0;
        }
    }
                
    x = source.x;
    y = source.y;
    z = source.z + 4*8*FRACUNIT;
        
    th = P_SpawnMobj (x,y,z, type);

    if (th.info.seesound)
        S_StartSound (th, th.info.seesound);

    th.target = source;
    th.angle = an;
    th.momx = FixedMul( th.info.speed,
                         finecosine[an>>ANGLETOFINESHIFT]);
    th.momy = FixedMul( th.info.speed,
                         finesine[an>>ANGLETOFINESHIFT]);
    th.momz = FixedMul( th.info.speed, slope);

    P_CheckMissileSpawn (th);
}


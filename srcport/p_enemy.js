import {Enum} from './enum.js';
import {globalize} from './utils.js'
import * as doomdefs from './doomdef.js';
import * as g_game from './g_game.js';
import * as p_sight from './p_sight.js';

globalize(doomdefs);
globalize(g_game);
globalize(p_sight);

var dirtype_t = Enum.define([
  'DI_EAST',
  'DI_NORTHEAST',
  'DI_NORTH',
  'DI_NORTHWEST',
  'DI_WEST',
  'DI_SOUTHWEST',
  'DI_SOUTH',
  'DI_SOUTHEAST',
  'DI_NODIR',
  'NUMDIRS'
]);

globalize(dirtype_t);

var opposite = [
  DI_WEST, DI_SOUTHWEST, DI_SOUTH, DI_SOUTHEAST,
  DI_EAST, DI_NORTHEAST, DI_NORTH, DI_NORTHWEST,
  DI_NODIR
];
var diags = [DI_NORTHWEST, DI_NORTHEAST, DI_SOUTHWEST, DI_SOUTHEAST];

//
// ENEMY THINKING
// Enemies are allways spawned
// with targetplayer = -1, threshold = 0
// Most monsters are spawned unaware of all players,
// but some can be made preaware
//


//
// Called by P_NoiseAlert.
// Recursively traverse adjacent sectors,
// sound blocking lines cut off traversal.
//

var soundtarget;

export function P_RecursiveSound ( sec, soundblocks )
{
    var i,
        check,
        other;
  
    // wake up all monsters in this sector
    if (sec.validcount == validcount
        && sec.soundtraversed <= soundblocks+1)
    {
        return;   // already flooded
    }
    
    sec.validcount = validcount;
    sec.soundtraversed = soundblocks+1;
    sec.soundtarget = soundtarget;
  
    for (i=0 ;i<sec.linecount ; i++)
    {
        check = sec.lines[i];
        if (! (check.hasFlag('ML_TWOSIDED')) )
            continue;
  
        P_LineOpening (check);

        if (openrange <= 0)
            continue; // closed door
  
        if ( sides[ check.sidenum[0] ].sector == sec)
            other = sides[ check.sidenum[1] ].sector;
        else
            other = sides[ check.sidenum[0] ].sector;
      
        if (check.hasFlag('ML_SOUNDBLOCK'))
        {
            if (!soundblocks)
                P_RecursiveSound (other, 1);
        }
        else
            P_RecursiveSound (other, soundblocks);
    }
}

//
// P_NoiseAlert
// If a monster yells at a player,
// it will alert other monsters to the player.
//
export function P_NoiseAlert ( target, emmiter )
{
    soundtarget = target;
    validcount++;
    P_RecursiveSound (emmiter.subsector.sector, 0);
}

//
// P_CheckMeleeRange
//
export function P_CheckMeleeRange (actor) {
    var pl,
        dist;
    
    if (!actor.target)
        return false;
      
    pl = actor.target;
    dist = P_AproxDistance (pl.x - actor.x, pl.y - actor.y);

    if (dist >= MELEERANGE - 20 + pl.info.radius)
        return false;
    
    if (! P_CheckSight (actor, actor.target) )
        return false;
                
    return true;    
}

//
// P_CheckMissileRange
//
export function P_CheckMissileRange (actor)
{
    var dist;

    if (! P_CheckSight (actor, actor.target) )
        return false;
    
    if ( actor.hasFlag('MF_JUSTHIT') )
    {
        // the target just hit the enemy,
        // so fight back!
        actor.removeFlag('MF_JUSTHIT');
        return true;
    }
    
    if (actor.reactiontime)
        return false; // do not attack yet
      
    // OPTIMIZE: get this from a global checksight
    dist = P_AproxDistance ( actor.x - actor.target.x,
                             actor.y - actor.target.y) - 64;
      
    if (!actor.info.meleestate)
        dist -= 128; // no melee attack, so fire more

    dist >>= 16;

    if (actor.type == 'MT_VILE')
    {
        if (dist > 14*64) 
            return false; // too far away
    }
    

    if (actor.type == 'MT_UNDEAD')
    {
        if (dist < 196) 
            return false; // close for fist attack
        dist >>= 1;
    }
    

    if (actor.type == 'MT_CYBORG'
        || actor.type == 'MT_SPIDER'
        || actor.type == 'MT_SKULL')
    {
        dist >>= 1;
    }
      
    if (dist > 200)
        dist = 200;
      
    if (actor.type == 'MT_CYBORG' && dist > 160)
        dist = 160;
      
    if (P_Random () < dist)
        return false;
      
    return true;
}

//
// P_Move
// Move in the current direction,
// returns false if the move is blocked.
//
var xspeed = [FRACUNIT,47000,0,-47000,-FRACUNIT,-47000,0,47000],
    yspeed = [0,47000,FRACUNIT,47000,0,-47000,-FRACUNIT,-47000];

export function P_Move (actor) {
    var tryx,
        tryy,
        ld,
        try_ok,
        good;
    
    if (actor.movedir == DI_NODIR)
        return false;
                
    if (actor.movedir >= 8)
        I_Error ("Weird actor.movedir!");
                
    tryx = actor.x + actor.info.speed * xspeed[actor.movedir];
    tryy = actor.y + actor.info.speed * yspeed[actor.movedir];

    try_ok = P_TryMove (actor, tryx, tryy);

    if (!try_ok)
    {
        // open any specials
        if (actor.hasFlag('MF_FLOAT') && floatok)
        {
            // must adjust height
            if (actor.z < tmfloorz)
                actor.z += FLOATSPEED;
            else
                actor.z -= FLOATSPEED;

            actor.addFlag('MF_INFLOAT');
            return true;
        }
                
        if (!numspechit)
            return false;
                        
        actor.movedir = DI_NODIR;
        good = false;
        while (numspechit--)
        {
            ld = spechit[numspechit];
            // if the special is not a door
            // that can be opened,
            // return false
            if (P_UseSpecialLine (actor, ld,0))
                good = true;
        }
        return good;
    }
    else
    {
        actor.removeFlag('MF_INFLOAT');
    }
        
        
    if (! (actor.hasFlag('MF_FLOAT') ) )
        actor.z = actor.floorz;

    return true; 
}

//
// TryWalk
// Attempts to move actor on
// in its current (ob->moveangle) direction.
// If blocked by either a wall or an actor
// returns FALSE
// If move is either clear or blocked only by a door,
// returns TRUE and sets...
// If a door is in the way,
// an OpenDoor call is made to start it opening.
//
export function P_TryWalk (actor)
{ 
    if (!P_Move (actor))
    {
        return false;
    }

    actor.movecount = P_Random()&15;
    return true;
}



export function P_NewChaseDir (actor)
{
    var deltax,
        deltay;
    
    var d = [];
    
    var tdir,
        olddir;
        turnaround;

    if (!actor.target)
        I_Error ("P_NewChaseDir: called with no target");
        
    olddir = actor.movedir;
    turnaround=opposite[olddir];

    deltax = actor.target.x - actor.x;
    deltay = actor.target.y - actor.y;

    if (deltax>10*FRACUNIT)
        d[1]= DI_EAST;
    else if (deltax<-10*FRACUNIT)
        d[1]= DI_WEST;
    else
        d[1]= DI_NODIR;

    if (deltay<-10*FRACUNIT)
        d[2]= DI_SOUTH;
    else if (deltay>10*FRACUNIT)
        d[2]= DI_NORTH;
    else
        d[2]= DI_NODIR;

    // try direct route
    if (d[1] != DI_NODIR
        && d[2] != DI_NODIR)
    {
        actor.movedir = diags[((deltay<0)<<1)+(deltax>0)];
        if (actor.movedir != turnaround && P_TryWalk(actor))
            return;
    }

    // try other directions
    if (P_Random() > 200
    ||  abs(deltay)>abs(deltax))
    {
        tdir=d[1];
        d[1]=d[2];
        d[2]=tdir;
    }

    if (d[1]==turnaround)
        d[1]=DI_NODIR;
    if (d[2]==turnaround)
        d[2]=DI_NODIR;
    
    if (d[1]!=DI_NODIR)
    {
        actor.movedir = d[1];
        if (P_TryWalk(actor))
        {
            // either moved forward or attacked
            return;
        }
    }

    if (d[2]!=DI_NODIR)
    {
        actor.movedir =d[2];

        if (P_TryWalk(actor))
            return;
    }

    // there is no direct path to the player,
    // so pick another direction.
    if (olddir!=DI_NODIR)
    {
        actor.movedir =olddir;

        if (P_TryWalk(actor))
            return;
    }

    // randomly determine direction of search
    if (P_Random()&1)   
    {
        for ( tdir=DI_EAST;
              tdir<=DI_SOUTHEAST;
              tdir++ )
        {
            if (tdir!=turnaround)
            {
            actor.movedir =tdir;
            
            if ( P_TryWalk(actor) )
                return;
            }
        }
    }
    else
    {
        for ( tdir=DI_SOUTHEAST;
              tdir != (DI_EAST-1);
              tdir-- )
        {
            if (tdir!=turnaround)
            {
                actor.movedir =tdir;
                
                if ( P_TryWalk(actor) )
                    return;
            }
        }
    }

    if (turnaround !=  DI_NODIR)
    {
        actor.movedir =turnaround;
        if ( P_TryWalk(actor) )
            return;
    }

    actor.movedir = DI_NODIR;  // can not move
}
//
// P_LookForPlayers
// If allaround is false, only look 180 degrees in front.
// Returns true if a player is targeted.
//
export function P_LookForPlayers ( actor, allaround )
{
    var c,
        stop,
        player,
        sector,
        an,
        dist;
                
    //sector = actor.subsector.sector;
    sector = 0;
        
    c = 0;
    stop = (actor.lastlook-1)&3;
        
    for ( ; ; actor.lastlook = (actor.lastlook+1)&3 )
    {
        if (!playeringame[actor.lastlook])
            continue;
                        
        if (c++ == 2
            || actor.lastlook == stop)
        {
            // done looking
            return false;       
        }
        
        player = players[actor.lastlook];

        if (player.health <= 0)
            continue;           // dead

        if (!P_CheckSight (actor, player.mo))
            continue;           // out of sight
                        
        if (!allaround)
        {
            an = R_PointToAngle2 (actor.x,
                                  actor.y, 
                                  player.mo.x,
                                  player.mo.y)
                - actor.angle;
            
            if (an > ANG90 && an < ANG270)
            {
                dist = P_AproxDistance (player.mo.x - actor.x,
                                        player.mo.y - actor.y);
                // if real close, react anyway
                if (dist > MELEERANGE)
                    continue;   // behind back
            }
        }
                
        actor.target = player.mo;
        return true;
    }

    return false;
}

//
// A_KeenDie
// DOOM II special, map 32.
// Uses special tag 666.
//
export function A_KeenDie (mo)
{
    var th,
        mo2,
        junk = new JSWad.Linedef();

    A_Fall (mo);
    
    // scan the remaining thinkers
    // to see if all Keens are dead
    for (th = thinkercap.next ; th != thinkercap ; th=th.next)
    {
        if (th.function.acp1 !== P_MobjThinker)
            continue;

        mo2 = th;
        if (mo2 != mo
            && mo2.type == mo.type
            && mo2.health > 0)
        {
            // other Keen not dead
            return;             
        }
    }

    junk.tag = 666;
    EV_DoDoor(junk,open);
}

//
// ACTION ROUTINES
//

//
// A_Look
// Stay in state until a player is sighted.
//
export function A_Look (actor)
{
    console.log('Look around', actor);
    var targ;

    actor.threshold = 0; // any shot will wake up

      // TODO - neeed to implement sector-based sound tracking
    targ = false; //actor.subsector.sector.soundtarget;
    var heard = false,
        seen = false;
    if (targ && targ.hasFlag('MF_SHOOTABLE')) {
        actor.setTarget(targ);

        if (actor.hasFlag('MF_AMBUSH')) {
            if (P_CheckSight (actor, actor.target)) {
                heard = true;
            }
        } else {
            heard = true;
        }
    }


    if (!heard) {
        seen = P_LookForPlayers(actor, false);
    } 
  
    // go into chase state
    if (seen || heard) {
        if (actor.info.seesound) {
            var sound;
            switch (actor.info.seesound) {
                case 'sfx_posit1':
                case 'sfx_posit2':
                case 'sfx_posit3':
                    sound = 'sfx_posit' + P_Random() % 3;
                    break;

                case 'sfx_bgsit1':
                case 'sfx_bgsit2':
                    sound = 'sfx_bgsit' + P_Random() % 2;
                    break;

                default:
                    sound = actor.info.seesound;
                    break;
            }

            if (actor.type == 'MT_SPIDER' || actor.type == 'MT_CYBORG') {
                // full volume
                S_StartSound (null, sound);
            } else {
                S_StartSound (actor, sound);
            }
        }
        P_SetMobjState (actor, actor.info.seestate);
    }
}

//
// A_Chase
// Actor has a melee attack,
// so it tries to close as fast as possible
//
export function A_Chase (actor) {
    var delta;
console.log('CHASE HIM!', actor);

    if (actor.reactiontime)
        actor.reactiontime--;
                                

    // modify target threshold
    if (actor.threshold)
    {
        if (!actor.target
            || actor.target.health <= 0)
        {
            actor.threshold = 0;
        }
        else
            actor.threshold--;
    }
    
    // turn towards movement direction if not there yet
    if (actor.movedir < 8)
    {
        actor.angle &= (7<<29);
        delta = actor.angle - (actor.movedir << 29);
        
        if (delta > 0)
            actor.angle -= ANG90/2;
        else if (delta < 0)
            actor.angle += ANG90/2;
    }

    if (!actor.target
        || !(actor.target.hasFlag('MF_SHOOTABLE')))
    {
        // look for a new target
        if (P_LookForPlayers(actor,true))
            return;     // got a new target
        
        P_SetMobjState (actor, actor.info.spawnstate);
        return;
    }
    
    // do not attack twice in a row
    if (actor.hasFlag('MF_JUSTATTACKED'))
    {
        actor.removeFlag('MF_JUSTATTACKED');
        if (gameskill != sk_nightmare && !fastparm)
            P_NewChaseDir (actor);
        return;
    }
    
    // check for melee attack
    if (actor.info.meleestate
        && P_CheckMeleeRange (actor))
    {
        if (actor.info.attacksound)
            S_StartSound (actor, actor.info.attacksound);

        P_SetMobjState (actor, actor.info.meleestate);
        return;
    }

    var nomissile = false;
    
    // check for missile attack
    if (actor.info.missilestate)
    {
        if (gameskill < sk_nightmare
            && !fastparm && actor.movecount)
        {
            //goto nomissile;
            nomissile = true;
        } else if (!P_CheckMissileRange (actor)) {
            //goto nomissile;
            nomissile = true;
        } else {
            P_SetMobjState (actor, actor.info.missilestate);
            actor.addFlag('MF_JUSTATTACKED');
            return;
        }
    }

    // ?
    if (nomissile) {
        // possibly choose another target
        if (netgame
            && !actor.threshold
            && !P_CheckSight (actor, actor.target) )
        {
            if (P_LookForPlayers(actor,true))
                return;     // got a new target
        }
        
        // chase towards player
        if (--actor.movecount<0
            || !P_Move (actor))
        {
            P_NewChaseDir (actor);
        }
        
        // make active sound
        if (actor.info.activesound
            && P_Random () < 3)
        {
            S_StartSound (actor, actor.info.activesound);
        }
    }

}

//
// A_FaceTarget
//
export function A_FaceTarget (actor)
{       
    if (!actor.target)
        return;
    
    actor.removeFlag('MF_AMBUSH');
        
    actor.angle = R_PointToAngle2 (actor.x,
                                   actor.y,
                                   actor.target.x,
                                   actor.target.y);
    
    if (actor.target.hasFlag('MF_SHADOW'))
        actor.angle += (P_Random()-P_Random())<<21;
}

//
// A_PosAttack
//
export function A_PosAttack (actor) {
    var angle,
        damage,
        slope;

    if (!actor.target)
        return;
      
    A_FaceTarget (actor);
    angle = actor.angle;
    slope = P_AimLineAttack (actor, angle, MISSILERANGE);

    S_StartSound (actor, "sfx_pistol");
    angle += (P_Random()-P_Random())<<20;
    damage = ((P_Random()%5)+1)*3;
    P_LineAttack (actor, angle, MISSILERANGE, slope, damage);
}

export function A_SPosAttack (actor) {
  var i,
      angle,
      bangle,
      damage,
      slope;
  
  if (!actor.target)
    return;

  S_StartSound (actor, "sfx_shotgn");
  A_FaceTarget (actor);
  bangle = actor.angle;
  slope = P_AimLineAttack (actor, bangle, MISSILERANGE);

  for (i=0 ; i<3 ; i++)
  {
    angle = bangle + ((P_Random()-P_Random())<<20);
    damage = ((P_Random()%5)+1)*3;
    P_LineAttack (actor, angle, MISSILERANGE, slope, damage);
  }
}

export function A_CPosAttack (actor) {
  var angle,
      bangle,
      damage,
      slope;
  
  if (!actor.target)
    return;

  S_StartSound (actor, "sfx_shotgn");
  A_FaceTarget (actor);
  bangle = actor.angle;
  slope = P_AimLineAttack (actor, bangle, MISSILERANGE);

  angle = bangle + ((P_Random()-P_Random())<<20);
  damage = ((P_Random()%5)+1)*3;
  P_LineAttack (actor, angle, MISSILERANGE, slope, damage);
}

export function A_CPosRefire (actor) {
  // keep firing unless target got out of sight
  A_FaceTarget (actor);

  if (P_Random () < 40)
    return;

  if (!actor.target
      || actor.target.health <= 0
      || !P_CheckSight (actor, actor.target) )
  {
    P_SetMobjState (actor, actor.info.seestate);
  }
}

export function A_SpidRefire (actor) {
  // keep firing unless target got out of sight
  A_FaceTarget (actor);

  if (P_Random () < 10) return;

  if (!actor.target
      || actor.target.health <= 0
      || !P_CheckSight (actor, actor.target) )
    {
      P_SetMobjState (actor, actor.info.seestate);
    }
}

export function A_BspiAttack (actor) {
  console.log('TODO - function "A_BspiAttack" is a stub');
  if (!actor.target)
    return;
    
  A_FaceTarget (actor);

  // launch a missile
  P_SpawnMissile (actor, actor.target, "MT_ARACHPLAZ");
}

//
// A_TroopAttack
//
export function A_TroopAttack (actor) {
  var damage;
  
  if (!actor.target)
    return;
    
  A_FaceTarget (actor);
  if (P_CheckMeleeRange (actor))
  {
    S_StartSound (actor, "sfx_claw");
    damage = (P_Random()%8+1)*3;
    P_DamageMobj (actor.target, actor, actor, damage);
    return;
  }
    
  // launch a missile
  P_SpawnMissile (actor, actor.target, "MT_TROOPSHOT");
}

export function A_SargAttack (actor) {
  var damage;

  if (!actor.target)
    return;
    
  A_FaceTarget (actor);
  if (P_CheckMeleeRange (actor))
  {
    damage = ((P_Random()%10)+1)*4;
    P_DamageMobj (actor.target, actor, actor, damage);
  }
}

export function A_HeadAttack (actor) {
  var damage;
  
  if (!actor.target)
    return;
    
  A_FaceTarget (actor);
  if (P_CheckMeleeRange (actor))
  {
    damage = (P_Random()%6+1)*10;
    P_DamageMobj (actor.target, actor, actor, damage);
    return;
  }
    
  // launch a missile
  P_SpawnMissile (actor, actor.target, "MT_HEADSHOT");
}

export function A_CyberAttack (actor)
{       
    if (!actor.target)
        return;
                
    A_FaceTarget (actor);
    P_SpawnMissile (actor, actor.target, "MT_ROCKET");
}


export function A_BruisAttack (actor)
{
    var damage;
        
    if (!actor.target)
        return;
                
    if (P_CheckMeleeRange (actor))
    {
        S_StartSound (actor, "sfx_claw");
        damage = (P_Random()%8+1)*10;
        P_DamageMobj (actor.target, actor, actor, damage);
        return;
    }
    
    // launch a missile
    P_SpawnMissile (actor, actor.target, "MT_BRUISERSHOT");
}


//
// A_SkelMissile
//
export function A_SkelMissile (actor)
{       
    var mo;
        
    if (!actor.target)
        return;
                
    A_FaceTarget (actor);
    actor.z += 16*FRACUNIT;    // so missile spawns higher
    mo = P_SpawnMissile (actor, actor.target, "MT_TRACER");
    actor.z -= 16*FRACUNIT;    // back to normal

    mo.x += mo.momx;
    mo.y += mo.momy;
    mo.tracer = actor.target;
}

const TRACEANGLE = 0xc000000;

export function A_Tracer (actor)
{
    var exact,
        dist,
        slope,
        dest,
        th;
                
    if (gametic & 3)
        return;
    
    // spawn a puff of smoke behind the rocket          
    P_SpawnPuff (actor.x, actor.y, actor.z);
        
    th = P_SpawnMobj (actor.x-actor.momx,
                      actor.y-actor.momy,
                      actor.z, "MT_SMOKE");
    
    th.momz = FRACUNIT;
    th.tics -= P_Random()&3;
    if (th.tics < 1)
        th.tics = 1;
    
    // adjust direction
    dest = actor.tracer;
        
    if (!dest || dest.health <= 0)
        return;
    
    // change angle     
    exact = R_PointToAngle2 (actor.x,
                             actor.y,
                             dest.x,
                             dest.y);

    if (exact != actor.angle)
    {
        if (exact - actor.angle > 0x80000000)
        {
            actor.angle -= TRACEANGLE;
            if (exact - actor.angle < 0x80000000)
                actor.angle = exact;
        }
        else
        {
            actor.angle += TRACEANGLE;
            if (exact - actor.angle > 0x80000000)
                actor.angle = exact;
        }
    }
        
    exact = actor.angle>>ANGLETOFINESHIFT;
    actor.momx = FixedMul (actor.info.speed, finecosine[exact]);
    actor.momy = FixedMul (actor.info.speed, finesine[exact]);
    
    // change slope
    dist = P_AproxDistance (dest.x - actor.x,
                            dest.y - actor.y);
    
    dist = dist / actor.info.speed;

    if (dist < 1)
        dist = 1;
    slope = (dest.z+40*FRACUNIT - actor.z) / dist;

    if (slope < actor.momz)
        actor.momz -= FRACUNIT/8;
    else
        actor.momz += FRACUNIT/8;
}

export function A_SkelWhoosh (actor)
{
    if (!actor.target)
        return;
    A_FaceTarget (actor);
    S_StartSound (actor,"sfx_skeswg");
}

export function A_SkelFist (actor)
{
    var damage;

    if (!actor.target)
        return;
                
    A_FaceTarget (actor);
        
    if (P_CheckMeleeRange (actor))
    {
        damage = ((P_Random()%10)+1)*6;
        S_StartSound (actor, "sfx_skepch");
        P_DamageMobj (actor.target, actor, actor, damage);
    }
}

//
// PIT_VileCheck
// Detect a corpse that could be raised.
//
var corpsehit,
    vileobj,
    viletryx,
    viletryy;

export function PIT_VileCheck (thing)
{
    var maxdist,
        check;
        
    if (!(thing.hasFlag("MF_CORPSE")) )
        return true;    // not a monster
    
    if (thing.tics != -1)
        return true;    // not lying still yet
    
    if (thing.info.raisestate == S_NULL)
        return true;    // monster doesn't have a raise state
    
    maxdist = thing.info.radius + mobjinfo["MT_VILE"].radius;
        
    if ( abs(thing.x - viletryx) > maxdist
         || abs(thing.y - viletryy) > maxdist )
        return true;            // not actually touching
                
    corpsehit = thing;
    corpsehit.momx = corpsehit.momy = 0;
    corpsehit.height <<= 2;
    check = P_CheckPosition (corpsehit, corpsehit.x, corpsehit.y);
    corpsehit.height >>= 2;

    if (!check)
        return true;            // doesn't fit here
                
    return false;               // got one, so stop checking
}

//
// A_VileChase
// Check for ressurecting a body
//
export function A_VileChase (actor)
{
    var xl,
        xh,
        yl,
        yh,
        bx,
        by,
        info,
        temp;
        
    if (actor.movedir != DI_NODIR)
    {
        // check for corpses to raise
        viletryx =
            actor.x + actor.info.speed*xspeed[actor.movedir];
        viletryy =
            actor.y + actor.info.speed*yspeed[actor.movedir];

        xl = (viletryx - bmaporgx - MAXRADIUS*2)>>MAPBLOCKSHIFT;
        xh = (viletryx - bmaporgx + MAXRADIUS*2)>>MAPBLOCKSHIFT;
        yl = (viletryy - bmaporgy - MAXRADIUS*2)>>MAPBLOCKSHIFT;
        yh = (viletryy - bmaporgy + MAXRADIUS*2)>>MAPBLOCKSHIFT;
        
        vileobj = actor;
        for (bx=xl ; bx<=xh ; bx++)
        {
            for (by=yl ; by<=yh ; by++)
            {
                // Call PIT_VileCheck to check
                // whether object is a corpse
                // that canbe raised.
                if (!P_BlockThingsIterator(bx,by,PIT_VileCheck))
                {
                    // got one!
                    temp = actor.target;
                    actor.target = corpsehit;
                    A_FaceTarget (actor);
                    actor.target = temp;
                                        
                    P_SetMobjState (actor, "S_VILE_HEAL1");
                    S_StartSound (corpsehit, "sfx_slop");
                    info = corpsehit.info;
                    
                    P_SetMobjState (corpsehit,info.raisestate);
                    corpsehit.height <<= 2;
                    corpsehit.flags = info.flags;
                    corpsehit.health = info.spawnhealth;
                    corpsehit.target = NULL;

                    return;
                }
            }
        }
    }

    // Return to normal attack.
    A_Chase (actor);
}


//
// A_VileStart
//
export function A_VileStart (actor)
{
    S_StartSound (actor, "sfx_vilatk");
}


//
// A_Fire
// Keep fire in front of player unless out of sight
//
export function A_StartFire (actor)
{
    S_StartSound(actor,"sfx_flamst");
    A_Fire(actor);
}

export function A_FireCrackle (actor)
{
    S_StartSound(actor,"sfx_flame");
    A_Fire(actor);
}

export function A_Fire (actor)
{
    var dest,
        an;
                
    dest = actor.tracer;
    if (!dest)
        return;
                
    // don't move it if the vile lost sight
    if (!P_CheckSight (actor.target, dest) )
        return;

    an = dest.angle >> ANGLETOFINESHIFT;

    P_UnsetThingPosition (actor);
    actor.x = dest.x + FixedMul (24*FRACUNIT, finecosine[an]);
    actor.y = dest.y + FixedMul (24*FRACUNIT, finesine[an]);
    actor.z = dest.z;
    P_SetThingPosition (actor);
}

//
// A_VileTarget
// Spawn the hellfire
//
export function A_VileTarget (actor)
{
    var fog;
        
    if (!actor.target)
        return;

    A_FaceTarget (actor);

    fog = P_SpawnMobj (actor.target.x,
                       actor.target.x,
                       actor.target.z, "MT_FIRE");
    
    actor.tracer = fog;
    fog.target = actor;
    fog.tracer = actor.target;
    A_Fire (fog);
}

//
// A_VileAttack
//
export function A_VileAttack (actor)
{       
    var fire,
        an;
        
    if (!actor.target)
        return;
    
    A_FaceTarget (actor);

    if (!P_CheckSight (actor, actor.target) )
        return;

    S_StartSound (actor, "sfx_barexp");
    P_DamageMobj (actor.target, actor, actor, 20);
    actor.target.momz = 1000*FRACUNIT/actor.target.info.mass;
        
    an = actor.angle >> ANGLETOFINESHIFT;

    fire = actor.tracer;

    if (!fire)
        return;
                
    // move the fire between the vile and the player
    fire.x = actor.target.x - FixedMul (24*FRACUNIT, finecosine[an]);
    fire.y = actor.target.y - FixedMul (24*FRACUNIT, finesine[an]);  
    P_RadiusAttack (fire, actor, 70 );
}

//
// Mancubus attack,
// firing three missiles (bruisers)
// in three different directions?
// Doesn't look like it. 
//
var FATSPREAD = (ANG90/8)

export function A_FatRaise (actor)
{
    A_FaceTarget (actor);
    S_StartSound (actor, "sfx_manatk");
}


export function A_FatAttack1 (actor)
{
    var mo,
        an;
        
    A_FaceTarget (actor);
    // Change direction  to ...
    actor.angle += FATSPREAD;
    P_SpawnMissile (actor, actor.target, "MT_FATSHOT");

    mo = P_SpawnMissile (actor, actor.target, "MT_FATSHOT");
    mo.angle += FATSPREAD;
    an = mo.angle >> ANGLETOFINESHIFT;
    mo.momx = FixedMul (mo.info.speed, finecosine[an]);
    mo.momy = FixedMul (mo.info.speed, finesine[an]);
}

export function A_FatAttack2 (actor)
{
    var mo,
        an;

    A_FaceTarget (actor);
    // Now here choose opposite deviation.
    actor.angle -= FATSPREAD;
    P_SpawnMissile (actor, actor.target, "MT_FATSHOT");

    mo = P_SpawnMissile (actor, actor.target, "MT_FATSHOT");
    mo.angle -= FATSPREAD*2;
    an = mo.angle >> ANGLETOFINESHIFT;
    mo.momx = FixedMul (mo.info.speed, finecosine[an]);
    mo.momy = FixedMul (mo.info.speed, finesine[an]);
}

export function A_FatAttack3 (actor)
{
    var mo,
        an;

    A_FaceTarget (actor);
    
    mo = P_SpawnMissile (actor, actor.target, "MT_FATSHOT");
    mo.angle -= FATSPREAD/2;
    an = mo.angle >> ANGLETOFINESHIFT;
    mo.momx = FixedMul (mo.info.speed, finecosine[an]);
    mo.momy = FixedMul (mo.info.speed, finesine[an]);

    mo = P_SpawnMissile (actor, actor.target, "MT_FATSHOT");
    mo.angle += FATSPREAD/2;
    an = mo.angle >> ANGLETOFINESHIFT;
    mo.momx = FixedMul (mo.info.speed, finecosine[an]);
    mo.momy = FixedMul (mo.info.speed, finesine[an]);
}

//
// SkullAttack
// Fly at the player like a missile.
//
const SKULLSPEED = (20*FRACUNIT)

export function A_SkullAttack (actor)
{
    var dest,
        an,
        dist;

    if (!actor.target)
        return;
                
    dest = actor.target;       
    actor.addFlag('MF_SKULLFLY');

    S_StartSound (actor, actor.info.attacksound);
    A_FaceTarget (actor);
    an = actor.angle >> ANGLETOFINESHIFT;
    actor.momx = FixedMul (SKULLSPEED, finecosine[an]);
    actor.momy = FixedMul (SKULLSPEED, finesine[an]);
    dist = P_AproxDistance (dest.x - actor.x, dest.y - actor.y);
    dist = dist / SKULLSPEED;
    
    if (dist < 1)
        dist = 1;
    actor.momz = (dest.z+(dest.height>>1) - actor.z) / dist;
}


//
// A_PainShootSkull
// Spawn a lost soul and launch it at the target
//
export function A_PainShootSkull (actor, angle )
{
    var x,
        y,
        z;
    
    var newmobj,
        an,
        prestep,
        count,
        currentthinker;

    // count total number of skull currently on the level
    count = 0;

    currentthinker = thinkercap.next;
    while (currentthinker !== thinkercap)
    {
        if (   (currentthinker.function.acp1 === P_MobjThinker)
            && (currentthinker.type == "MT_SKULL") )
            count++;
        currentthinker = currentthinker.next;
    }

    // if there are allready 20 skulls on the level,
    // don't spit another one
    if (count > 20)
        return;


    // okay, there's playe for another one
    an = angle >> ANGLETOFINESHIFT;
    
    prestep =
        4*FRACUNIT
        + 3*(actor.info.radius + mobjinfo["MT_SKULL"].radius)/2;
    
    x = actor.x + FixedMul (prestep, finecosine[an]);
    y = actor.y + FixedMul (prestep, finesine[an]);
    z = actor.z + 8*FRACUNIT;
                
    newmobj = P_SpawnMobj (x , y, z, "MT_SKULL");

    // Check for movements.
    if (!P_TryMove (newmobj, newmobj.x, newmobj.y))
    {
        // kill it immediately
        P_DamageMobj (newmobj,actor,actor,10000);       
        return;
    }
                
    newmobj.target = actor.target;
    A_SkullAttack (newmobj);
}


//
// A_PainAttack
// Spawn a lost soul and launch it at the target
// 
export function A_PainAttack (actor)
{
    if (!actor.target)
        return;

    A_FaceTarget (actor);
    A_PainShootSkull (actor, actor.angle);
}


export function A_PainDie (actor)
{
    A_Fall (actor);
    A_PainShootSkull (actor, actor.angle+ANG90);
    A_PainShootSkull (actor, actor.angle+ANG180);
    A_PainShootSkull (actor, actor.angle+ANG270);
}

export function A_Scream (actor)
{
    var sound;
        
    switch (actor.info.deathsound)
    {
      case 0:
        return;
                
      case "sfx_podth1":
      case "sfx_podth2":
      case "sfx_podth3":
        sound = "sfx_podth" + P_Random ()%3;
        break;
                
      case "sfx_bgdth1":
      case "sfx_bgdth2":
        sound = "sfx_bgdth" + P_Random ()%2;
        break;
        
      default:
        sound = actor.info.deathsound;
        break;
    }

    // Check for bosses.
    if (actor.type=="MT_SPIDER"
        || actor.type == "MT_CYBORG")
    {
        // full volume
        S_StartSound (NULL, sound);
    }
    else
        S_StartSound (actor, sound);
}


export function A_XScream (actor)
{
    S_StartSound (actor, "sfx_slop");
}

export function A_Pain (actor)
{
    if (actor.info.painsound)
        S_StartSound (actor, actor.info.painsound);   
}



export function A_Fall (actor)
{
    // actor is on ground, it can be walked over
    actor.removeFlag("MF_SOLID");

    // So change this if corpse objects
    // are meant to be obstacles.
}


//
// A_Explode
//
export function A_Explode (thingy)
{
    P_RadiusAttack ( thingy, thingy.target, 128 );
}

//
// A_BossDeath
// Possibly trigger special effects
// if on first boss level
//
export function A_BossDeath (mo)
{
    var th,
        mo2,
        junk = new JSWad.Sidedef(),
        i;
                
    if ( gamemode == commercial)
    {
        if (gamemap != 7)
            return;
                
        if ((mo.type != "MT_FATSO")
            && (mo.type != "MT_BABY"))
            return;
    }
    else
    {
        switch(gameepisode)
        {
          case 1:
            if (gamemap != 8)
                return;

            if (mo.type != "MT_BRUISER")
                return;
            break;
            
          case 2:
            if (gamemap != 8)
                return;

            if (mo.type != "MT_CYBORG")
                return;
            break;
            
          case 3:
            if (gamemap != 8)
                return;
            
            if (mo.type != "MT_SPIDER")
                return;
            
            break;
            
          case 4:
            switch(gamemap)
            {
              case 6:
                if (mo.type != "MT_CYBORG")
                    return;
                break;
                
              case 8: 
                if (mo.type != "MT_SPIDER")
                    return;
                break;
                
              default:
                return;
                break;
            }
            break;
            
          default:
            if (gamemap != 8)
                return;
            break;
        }
                
    }

    
    // make sure there is a player alive for victory
    for (i=0 ; i<MAXPLAYERS ; i++)
        if (playeringame[i] && players[i].health > 0)
            break;
    
    if (i==MAXPLAYERS)
        return; // no one left alive, so do not end game
    
    // scan the remaining thinkers to see
    // if all bosses are dead
    for (th = thinkercap.next ; th !== thinkercap ; th=th.next)
    {
        if (th.function.acp1 !== P_MobjThinker)
            continue;
        
        mo2 = th;
        if (mo2 != mo
            && mo2.type == mo.type
            && mo2.health > 0)
        {
            // other boss not dead
            return;
        }
    }
        
    // victory!
    if ( gamemode == commercial)
    {
        if (gamemap == 7)
        {
            if (mo.type == MT_FATSO)
            {
                junk.tag = 666;
                EV_DoFloor(junk,'lowerFloorToLowest');
                return;
            }
            
            if (mo.type == MT_BABY)
            {
                junk.tag = 667;
                EV_DoFloor(junk,'raiseToTexture');
                return;
            }
        }
    }
    else
    {
        switch(gameepisode)
        {
          case 1:
            junk.tag = 666;
            EV_DoFloor (junk, 'lowerFloorToLowest');
            return;
            break;
            
          case 4:
            switch(gamemap)
            {
              case 6:
                junk.tag = 666;
                EV_DoDoor (junk, 'blazeOpen');
                return;
                break;
                
              case 8:
                junk.tag = 666;
                EV_DoFloor (junk, 'lowerFloorToLowest');
                return;
                break;
            }
        }
    }
        
    G_ExitLevel ();
}

export function A_Hoof (mo)
{
    S_StartSound (mo, "sfx_hoof");
    A_Chase (mo);
}

export function A_Metal (mo)
{
    S_StartSound (mo, "sfx_metal");
    A_Chase (mo);
}

export function A_BabyMetal (mo)
{
    S_StartSound (mo, "sfx_bspwlk");
    A_Chase (mo);
}

export function A_OpenShotgun2 (player, psp)
{
    S_StartSound (player.mo, "sfx_dbopn");
}
export function A_LoadShotgun2 (player, psp)
{
    S_StartSound (player.mo, "sfx_dbload");
}

export function A_CloseShotgun2 (player, psp)
{
    S_StartSound (player.mo, "sfx_dbcls");
    A_ReFire(player,psp);
}

var braintargets = new Array(32),
    numbraintargets,
    braintargeton;

export function A_BrainAwake (mo)
{
    var thinker,
        m;
        
    // find all the target spots
    numbraintargets = 0;
    braintargeton = 0;
        
    thinker = thinkercap.next;
    for (thinker = thinkercap.next ;
         thinker !== thinkercap ;
         thinker = thinker.next)
    {
        if (thinker.function.acp1 != P_MobjThinker)
            continue;   // not a mobj

        m = thinker;

        if (m.type == "MT_BOSSTARGET" )
        {
            braintargets[numbraintargets] = m;
            numbraintargets++;
        }
    }
        
    S_StartSound (NULL,"sfx_bossit");
}


export function A_BrainPain (mo)
{
    S_StartSound (NULL,"sfx_bospn");
}

export function A_BrainScream (mo)
{
    var x,
        y,
        z,
        th;
        
    for (x=mo.x - 196*FRACUNIT ; x< mo.x + 320*FRACUNIT ; x+= FRACUNIT*8)
    {
        y = mo.y - 320*FRACUNIT;
        z = 128 + P_Random()*2*FRACUNIT;
        th = P_SpawnMobj (x,y,z, "MT_ROCKET");
        th.momz = P_Random()*512;

        P_SetMobjState (th, "S_BRAINEXPLODE1");

        th.tics -= P_Random()&7;
        if (th.tics < 1)
            th.tics = 1;
    }
        
    S_StartSound (NULL,"sfx_bosdth");
}



export function A_BrainExplode (mo)
{
    var x,
        y,
        z,
        th;
        
    x = mo.x + (P_Random () - P_Random ())*2048;
    y = mo.y;
    z = 128 + P_Random()*2*FRACUNIT;
    th = P_SpawnMobj (x,y,z, "MT_ROCKET");
    th.momz = P_Random()*512;

    P_SetMobjState (th, "S_BRAINEXPLODE1");

    th.tics -= P_Random()&7;
    if (th.tics < 1)
        th.tics = 1;
}


export function A_BrainDie (mo)
{
    G_ExitLevel ();
}

var easy = 0;
export function A_BrainSpit (mo)
{
    var targ,
        newmobj;
    
    easy ^= 1;
    if (gameskill <= sk_easy && (!easy))
        return;
                
    // shoot a cube at current target
    targ = braintargets[braintargeton];
    braintargeton = (braintargeton+1)%numbraintargets;

    // spawn brain missile
    newmobj = P_SpawnMissile (mo, targ, "MT_SPAWNSHOT");
    newmobj.target = targ;
    newmobj.reactiontime =
        ((targ.y - mo.y)/newmobj.momy) / newmobj.state.tics;

    S_StartSound(NULL, "sfx_bospit");
}

// travelling cube sound
export function A_SpawnSound (mo)  
{
    S_StartSound (mo,"sfx_boscub");
    A_SpawnFly(mo);
}

export function A_SpawnFly (mo)
{
    var newmobj,
        fog,
        targ,
        r,
        type;
        
    if (--mo.reactiontime)
        return; // still flying
        
    targ = mo.target;

    // First spawn teleport fog.
    fog = P_SpawnMobj (targ.x, targ.y, targ.z, "MT_SPAWNFIRE");
    S_StartSound (fog, "sfx_telept");

    // Randomly select monster to spawn.
    r = P_Random ();

    // Probability distribution (kind of :),
    // decreasing likelihood.
    if ( r<50 )
        type = "MT_TROOP";
    else if (r<90)
        type = "MT_SERGEANT";
    else if (r<120)
        type = "MT_SHADOWS";
    else if (r<130)
        type = "MT_PAIN";
    else if (r<160)
        type = "MT_HEAD";
    else if (r<162)
        type = "MT_VILE";
    else if (r<172)
        type = "MT_UNDEAD";
    else if (r<192)
        type = "MT_BABY";
    else if (r<222)
        type = "MT_FATSO";
    else if (r<246)
        type = "MT_KNIGHT";
    else
        type = "MT_BRUISER";              

    newmobj     = P_SpawnMobj (targ.x, targ.y, targ.z, type);
    if (P_LookForPlayers (newmobj, true) )
        P_SetMobjState (newmobj, newmobj.info.seestate);
        
    // telefrag anything in this spot
    P_TeleportMove (newmobj, newmobj.x, newmobj.y);

    // remove self (i.e., cube).
    P_RemoveMobj (mo);
}


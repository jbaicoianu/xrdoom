import {globalize} from './utils.js'
import * as d_player from './d_player.js';

globalize(d_player);

export const MAXPLAYERS = 4

export var deathmatch;             // only if started as net death 
export var netgame;                // only true if packets are broadcast 
export var playeringame = [true, false, false, false];
export var players = [new player_t(), new player_t(), new player_t(), new player_t()];


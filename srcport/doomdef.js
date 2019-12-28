//import Enum from './enum.js'

/*
export const difficulties = Enum.define([
  'sk_baby',
  'sk_easy',
  'sk_medium',
  'sk_hard',
  'sk_nightmare'
]);
*/

export const FRACBITS = 16;
export const FRACUNIT = 1 << FRACBITS;

export const FINEANGLES = 8192
export const FINEMASK = (FINEANGLES-1)

// 0x100000000 to 0x2000
export const ANGLETOFINESHIFT = 19    

// Binary Angle Measument, BAM.
export const ANG45    = 0x20000000
export const ANG90    = 0x40000000
export const ANG180   = 0x80000000
export const ANG270   = 0xc0000000


export const SLOPERANGE = 2048
export const SLOPEBITS = 11
export const DBITS = (FRACBITS-SLOPEBITS)

export const RANGECHECK = true

export const ITEMQUESIZE = 128

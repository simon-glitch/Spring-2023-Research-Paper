/*
  All code here was written by Simon Willover
  This code contains a few main functions:
    random
      generates a sequence of random integers, using Math.random
      random is most efficient when generating long sequences of integers, because it also converts between bases, in order to ensure perfect precision
    shuffle
      shuffle an array;
      there is an equal probability to get each and every one of the n! permutations of the array
    srs (simple random sample)
      accepts array, map, or object
      if given an object, it will make a new object that only has some of the properties of the original
*/


/*
  In my testing, Math.random() * 2**53 always yieleded an integer
  v = 0.48924984841945 is between 0 and 1
  but Math.random can never yield v, because:
    0.48924984841945 * 2**53 = 4406770870065813.5
  In fact, many values below 0.5, when multiplied by 2**53, can yield non integer values. So, I know that Math.random only yields the following values
    = [any integer from 0 to (2**53 -1)] / (2**53)
  These look like this in IEEE-64 binary:
    0 0 1111 1 1 1 1 1 1    [0 0 0  000  000 000 000  000 000 000 000 000 000  000 000 000  000 000  0 0 1]
    0 0 1111 1 1 1 1 1[0     0 0 0  000  000 000 000  000 000 000 000 000 000  000 000 000  000 000  0 1]0
    0 0 1111 1 1 1 1[0]1    [0 0 0  000  000 000 000  000 000 000 000 000 000  000 000 000  000 000  1]0 0
    0 0 1111 1 1 1 1[0 0]   [0 0 0  000  000 000 000  000 000 000 000 000 000  000 000 000  000 001] 0 0 0
    ...
    0 0 1111[0 0]1 1[0]1    [0 0 1] 000  000 000 000  000 000 000 000 000 000  000 000 000  000 000  0 0 0
    0 0 1111[0 0]1 1[0 0]   [0 1]0  000  000 000 000  000 000 000 000 000 000  000 000 000  000 000  0 0 0
    0 0 1111[0 0]1[0]1 1    [1]0 0  000  000 000 000  000 000 000 000 000 000  000 000 000  000 000  0 0 0
    ^^^^
    The 1s and 0s [between the brackets] can be changed; changing any digit outside the brackets will yield a number that can NOT be returned by Math.random.
    
    Fun fact, the actual largest value supported by IEEE-64 is:
    ((2**53) -1) * (2**(1024 - 53))
    ----
    In binary:
    (((2n**53n) -1n) * (2n**(1024n - 53n))).toString(2)
    = "1111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" (as expected)
    ----
    In base 10:
    (((2n**53n) -1n) * (2n**(1024n - 53n))).toString(10)
    = "179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368"


*/

/*
  bincexp: 1, 2, 3, ... 31
  binc: 2, 4, 8, 16, 32, 64, ..., 2147483648 ..., 9007199254740992
  MAX_SAFE_INTEGER is set to 9007199254740991, but 9007199254740992 is safe for our purposes, since for i = 9007199254740991:
           i         < 9007199254740992 == true
    9007199254740991 < 9007199254740992 == true
  and thus, our for loop will increment up to MAX_SAFE_INTEGER +1, and do the comparison correctly.
  unfortunately, our for loops do slow down, tremendously, when we exceed 2147483647, because JavaScript has to swap all of its fast int32 arithmetic for IEEE-64 float arithmetic;
*/

// the following {lines of code} describe the values which are used to determine how {this float system} behaves
  /* keep in mind, this code assumes that {this float system} is set up under the IEEE-754 rules
   * * which means that the exponent is encoded using an offset binary representation (which is also known as an offset bias in IEEE-754)
   * * furthermore, 
  */
  const
  // number of bits used to represent a float
  FLOAT_LENGTH = 64,
  // number of bits used to represent the exponent part of a float
  EXP_LENGTH = 11,
  MAX_EXP = 2**(EXP_LENGTH -1) -1,
  // number of bits in the mantissa
  MAN_LENGTH = FLOAT_LENGTH - EXP_LENGTH - 1,

// the following constants are also relevant to {this float system}
  // the value of the largest integer which can be incremented UP TO (and can be represented)
  MAX_INT_EXP = MAN_LENGTH +1,
  MAX_INT = 2**MAX_INT_EXP,
  // MAX_SAFE_INT can be incremented, while MAX_INT can NOT; JavaScript actually has this stored at Number.MAX_SAFE_INTEGER
  MAX_SAFE_INT = MAX_INT -1,
  // the value of the smallest, positive, non-zero value (which can be represented)
  MIN_NON_ZERO_EXP = 1 - MAN_LENGTH - MAX_EXP,
  MIN_NON_ZERO = 2**MIN_NON_ZERO_EXP,
  // JavaScript actually has this stored at Number.MAX_VALUE
  MAX_NON_INFINITY = MAX_SAFE_INT * 2**(MAX_EXP - MAN_LENGTH),
  HALF_INFINITY = 2**MAX_EXP
;

// binc is used for the shuffle function
let bincexp = 2;
let binc = 2**bincexp;







var toStringIEEE64;


SCOPE_IEEE64: {
  // this code BARELY makes any sense!
  
  const HALF_INFINITY = 2**MAX_EXP;
  const SUB_MAX_1_EXP = MAX_INT_EXP -1;
  const SUB_MAX_2_EXP = MAX_INT_EXP -2;
  const SUB_MAX_2 = 2**(SUB_MAX_2_EXP);
  const SUB_MAX_1 = 2**(SUB_MAX_1_EXP);
  const NAN_MAX = (MAX_INT-1)/MAX_INT;
  const NAN_MAX2 = MAX_INT-1;
  
  var toString1 = function(n){
    var getSize1 = function(){
      if(n == 0) return 0;
      /*
        I wish this was implemented by default: {
          const myNaN    = isNaN   ;
          const myFinite = isFinite;
          Number.prototype.isNaN      = function(){
            return  myNaN   (this);
          };
          Number.prototype.isFinite   = function(){
            return  myFinite(this);
          };
          Number.prototype.isInfinite = function(){
            return !myFinite(this);
          };
          Number.prototype.isReal     = function(){
            return  myFinite(this) && !myNaN(this);
          };
        }
        window.isNaN = function(n){
          // there is no NaN BigInt (NaNn)
          if(typeof n == "bigint") return true;
          // don't return an error!
          if(typeof n != "number") return false;
          return myNaN(n);
        };
      */
      /*
        fun fact: this is the largest number supported by IEEE-64 floats
        Z = ((2n **53n -1n) * (2n **(1024n -53n)));
        Number(Z) => 1.7976931348623157e+308
        this is the actual value of Infinity (in IEEE-64)
        Z2 = ((2n **53n) * (2n **(1024n -53n)));
        Number(Z2) => Infinity
        So, let's define a threshold where BigInts become "Infinite"
        T = (Z + Z2) / 2
        T = ((2n **1024n) - (2n **(1024n -54n)));
        Number(T) => Infinity
        Number(T -1n) => 1.7976931348623157e+308
          (same as Number(Z))
        So,
        let T = ((2n **1024n) - (2n **(1024n -54n)));
        isFinite( Number(T -1n) )
          => true
      */
      if(!isFinite(n)){
      	n = 0;
      	return 2047;
      }
      if(isNaN(n)){
      	n = NAN_MAX;
      	return 
      }
      let i = MAX_EXP +1; /*(1024)*/
      for(i; n > 1; i++){
        n /= 2;
      }
      for(i; n < 1; i--){
        n *= 2;
      }
      return i;
    };
    
    let sign = Number(n < 0);
    n *= (-1) ** sign;
    
    let s;
    /* really small numbers have weird behavior */
    if(n < MIN_NON_ZERO){
      s = 0;
      n *= HALF_INFINITY;
      n += 1;
      n *= SUB_MAX_2;
    }
    else{
      s = getSize1();
      n *= MAX_INT;
      /* or
      s = getSize2(MAX_INT_EXP);
      */
    }
    
    return sign +" "+ (2048 + s).toString(2).slice(1) +" "+ n.toString(2).slice(1);
  };
  
  var toString2 = function(n){
    var getSize2 = function(){
      if(n == NaN){
      	n = NAN_MAX2;
      	return 2047;
      }
      let i = Math.floor(Math.log2(n));
      let k = i -MAX_INT_EXP +1;
      if(k < MAX_EXP +1){
        n /= 2**k;
      }
      else{
        n /= 2**i;
        n *= SUB_MAX_1;
      }
      i += MAX_EXP +1;
      return i;
    };
    
    let sign = Number(n < 0);
    n *= (-1) ** sign;
    
    let s;
    /* really small numbers have weird behavior */
    if(n < MIN_NON_ZERO){
      s = 0;
      n *= HALF_INFINITY;
      n += 1;
      n *= SUB_MAX_2;
    }
    else{
      s = getSize2();
    }
    
    return sign +" "+ (2048 + s).toString(2).slice(1) +" "+ n.toString(2).slice(1);
  };
  
  var random = function(min, max){
  	return Math.round((max-min) * Math.random() + min);
  };
  
  toStringIEEE64 = toString2;
  toStringIEEE64.name = "toStringIEEE64";
  Number.prototype["toStringIEEE64"] = toStringIEEE64;
}



/**
 * compute the digits (in base {max}) of 1/n
 4
 >> 3
 a b c d
 = a *4^3 + b *4^2 + c^4 + d
 = n
 rem1 = n1 %3
 n2 = (n1 -rem1) /3
 rem2 = n2 %3
 n3 = (n2 -rem2) /3
 rem3 = (n3) %3
 ...
 n i+1 = (n i -rem i) /3
 rem i+1 = n i+1 %3
 OR rem i = n i %3
 = rem BIG *3^(BIG-1) + ... + rem3 *3^2 + rem2 *3 + rem1
*/
var get_digits = function(max){
  let n = MAX_INT;
  let i = 0;
  let rem = n % max;
  let digits = [];
  // let repeating_conversion = [];
  let found = [];
  digits[i] = rem;
  // optimize by keeping track of which items have been found with an array that should have an extremely fast look up
  // we MIGHT be able to speed this up a TEENY TINY bit by using bitwise operations, buuut I don't need that .....
  for(i = 0; i < max; i++){
    found[i] = 0;
  }
  found[rem] = 1;
  for(i = 1; i < 40; i++){
    n -= rem;
    n /= max;
    rem = n % max;
    digits[i] = rem;
    
    // I think we are done!
    if(n < max && found[rem]){
      break;
      // console.log("probably done @"+ i);
    }
    // IMPORTANT: this goes after the `&& found...` if statement
    found[rem] = 1;
  }
  return digits;
};

var err = function(name, message){
  let e = new Error;
  e.name = name;
  e.message = message;
  return e;
};

/**
 * Generate a sequece of random integers; \\ the integers MUST each be less than max; \\ any 1 of the integers has an equal probability to be any of the values in [0 up to ... (max - 1)];
 * @param n the sample size OR the number of values to generate
 * @param max the maximum value that this function can generate
 * @param ur_list the list that the values will be stored in
 * @param log_max the multiplier for the largest value that Math.random can generate
 * @param use_bigints whether or not to use bigint arithmetic
 * @param ll whether or not to log to console
*/
var random = function random(n, max, ur_list, log_max, use_bigints, ll){
  if(n   > MAX_INT) return err("RangeError", "n   is too large!");
  if(max > MAX_INT) return err("RangeError", "max is too large!");
  
  log_max = log_max || Math.log2(max);
  
  const list = ur_list || [];
  let i, ii;
  let
    rem = 0,
    rand = 0,
    digits_to_use = 0
  ;
  const digits_per_rand = Math.floor(MAX_INT_EXP / log_max);
  
  for(i = 0; i < n; i){
    digit_offset = 0;
    // random int from 0 to MAX_INT -1 (inclusive)
    rand = MAX_INT * Math.random();
    
    if(ll) console.log("rand: "+BigInt(rand));

    // avoid producing too many numbers in list;
    // when max is very small, this is a bit more efficient than checking (i < n) on each loop iteration
    if(ll) console.log({i, n});
    
    digits_to_use = Math.min(digits_per_rand, n - i);
    
    if(ll) console.log("digits to use: "+ digits_to_use);
    if(ll) console.log("digits offset: "+ digits_per_rand - digits_to_use);
    
    // just in case
    if(i == n){
      if(ll) console.log("weird break!!!");
      break;
    }
    
    // now `break down` the random int into base {max}
    for(ii = 0; ii < digits_to_use; ii++){
      rem = rand % max;
      list[i] = rem;
      i++;
      rand -= rem;
      rand /= max;
    }
  }
  
  return list;
};

onclick = () => {
  console.log(random(10, 10, 0, false, false));
};

/**
 * works just like `random`, but returns a list of random numbers, from a simple sequence
 @param n = the length of the list to return; i.e. how many random numbers will be returned
 @param min = the minimum (or start) value of the sequence;
 @param max = the maximum (or end) value of the sequence;
 @param inc = the increment value of the sequence;

*/


/*
(() => {
  let max = 77n, n = 10_000n, mi = BigInt(MAX_INT), pow = 0n;
  let max_n = max ** n;
  let mi_pow = mi ** pow;
  for(pow; mi_pow < max_n; pow){
    pow += 1n;
    mi_pow = mi ** pow;
  };
  let print = function(bi, dc){
    dc = dc || 6;
    bi += "";
    if(bi.length < 1+ dc) return bi;
    return bi.slice(0, 1) +"."+ bi.slice(1, 1+ dc) +"e+"+ (bi.length -1);
  };
  let print_fraction = function(num, den, dc, base){
    let ns = num < 0n;
    let ds = den < 0n;
    if(ns) num = -num;
    if(ds) den = -den;
    let sign = ns ^ ds;
    
    if(!den) return "can't divide by zero (0)";
    dc = dc || 6;
    base = base || 10n;
    let mul = base ** BigInt(dc);
    let off = 0n;
    let num2 = num;
    while(num2 >= den *base){
      num2 /= base;
      off += 1n;
    }
    while(num2 < den){
      num2 *= base;
      off -= 1n;
    }
    
    let val = mul * num / den;
    let val_str = val.toString(Number(base));
    off += val_str.length -1n;
    let oval_str = val_str.slice(1);
    while(oval_str.length < dc){
      oval_str += "0";
    }
    
    return (
      (sign ?"-" :"") +
      val_str.slice(1) +
      "." +
      oval_str +
      "E+" +
      off.toString(Number(base))
    );
  };
  let o = {
    "max ^n": print(max_n),
    "mi ^pow": print(mi_pow),
    pow: pow,
    "approx pow": Number(n) * Math.log(Number(max)) / Math.log(Number(mi)),
    ".. rounded": Math.ceil(Number(n) * Math.log(Number(max)) / Math.log(Number(mi))),
    "ratio": print_fraction(mi_pow, max_n),
  };
  return o;
})()
*/


/*
console.log("====");
console.log(random(10, 6));
*/

var randomn = function randomn(n, min, max, inc){
  inc = inc || 1;
  if(!inc) return [new Error, "inc can not be zero"];
  n = Math.floor(n);
  if(n < 1) return [];
  let list = random(n, Math.ceil((max - min) /inc));
  for(let i = 0; i < list.length; i++){
    list[i] = min + list[i] *inc;
  }
  return list;
};

var sum = function(list){
  let s = 0;
  for(let i = 0; i < list.length; i++)
    s += list[i];
  return s;
};

/*
console.log("10 x 6: "+ sum(random(10, 6)));
*/

/**
 * shuffle will shuffle any list; there is a PERFECTLY equal probability for every possible permutation to be returned.
 @param {Object} list: can be any array-like object that you want to shuffle; you can also use a map or an object
 @param {Constructor Function} type: force the type of return to be Array, Map, Object, or any other array like object;
 @return {any} shuffled_list: returns an array is an array-like object is given; returns a map is a map is given; returns an object if any other object is given.
*/
var shuffle = function shuffle(list, treat_like_an_array_like_object){
  // just a helper function
  let index = function(srclist, ilist, setlist){
    if(setlist){
      for(let i = 0; i < ilist.length; i++){
        setlist[i] = srclist[ilist[i]];
      }
      return setlist;
    };
    let nlist = [];
    for(let i = 0; i < ilist.length; i++){
      nlist[i] = srclist[ilist[i]];
    }
    return nlist;
  };
  let sum = function(zlist){
    let z = 0;
    for(let i = 0; i < zlist.length; i++){
      z += zlist[i];
    }
    return z;
  };
  
  const OL = list.length;
  const max_depth = 1_000_000;
  let recursive_depth = 0;
  let call_count = 0;
  let highest_rd = 0;
  let zeros = [];
  let shuffle_in_place;
  
  // shuffle a list of 3 **in place
  const shufip3 = function(list, r){
    const c = list.constructor;
    const olist = new c(list.length);
    switch(r){
      case 0:
        return;
      case 1:
        olist[0] = list[0];
        olist[1] = list[2];
        olist[2] = list[1];
        break;
      case 2:
        olist[0] = list[1];
        olist[1] = list[0];
        olist[2] = list[2];
        break;
      case 3:
        olist[0] = list[1];
        olist[1] = list[2];
        olist[2] = list[0];
        break;
      case 4:
        olist[0] = list[2];
        olist[1] = list[0];
        olist[2] = list[1];
        break;
      case 5:
        olist[0] = list[2];
        olist[1] = list[1];
        olist[2] = list[0];
        break;
    }
    // then just unswap
    list[0] = olist[0];
    list[1] = olist[1];
    list[2] = olist[2];
  };
  // shuffle a list of 4 **in place
  const shufip4 = function(list, r){
    const c = list.constructor;
    const olist = new c(list.length);
    switch(r){
      case 0:
        return;
      case 1:
        olist[0] = list[0];
        olist[1] = list[3];
        olist[2] = list[1];
        olist[3] = list[2];
        break;
      case 2:
        olist[0] = list[0];
        olist[1] = list[2];
        olist[2] = list[3];
        olist[3] = list[1];
        break;
      case 3:
        olist[0] = list[0];
        olist[1] = list[2];
        olist[2] = list[1];
        olist[3] = list[3];
        break;
      case 4:
        olist[0] = list[0];
        olist[1] = list[1];
        olist[2] = list[3];
        olist[3] = list[2];
        break;
      case 5:
        olist[0] = list[0];
        olist[1] = list[1];
        olist[2] = list[2];
        olist[3] = list[3];
        break;
      case 6:
        olist[0] = list[1];
        olist[1] = list[0];
        olist[2] = list[2];
        olist[3] = list[3];
        break;
      case 7:
        olist[0] = list[1];
        olist[1] = list[0];
        olist[2] = list[3];
        olist[3] = list[2];
        break;
      case 8:
        olist[0] = list[1];
        olist[1] = list[2];
        olist[2] = list[0];
        olist[3] = list[3];
        break;
      case 9:
        olist[0] = list[1];
        olist[1] = list[2];
        olist[2] = list[3];
        olist[3] = list[0];
        break;
      case 10:
        olist[0] = list[1];
        olist[1] = list[3];
        olist[2] = list[0];
        olist[3] = list[2];
        break;
      case 11:
        olist[0] = list[1];
        olist[1] = list[3];
        olist[2] = list[2];
        olist[3] = list[0];
        break;
      case 12:
        olist[0] = list[2];
        olist[1] = list[0];
        olist[2] = list[3];
        olist[3] = list[2];
        break;
      case 13:
        olist[0] = list[2];
        olist[1] = list[0];
        olist[2] = list[3];
        olist[3] = list[1];
        break;
      case 14:
        olist[0] = list[2];
        olist[1] = list[1];
        olist[2] = list[0];
        olist[3] = list[3];
        break;
      case 15:
        olist[0] = list[2];
        olist[1] = list[1];
        olist[2] = list[3];
        olist[3] = list[0];
        break;
      case 16:
        olist[0] = list[2];
        olist[1] = list[3];
        olist[2] = list[0];
        olist[3] = list[1];
        break;
      case 17:
        olist[0] = list[2];
        olist[1] = list[3];
        olist[2] = list[1];
        olist[3] = list[0];
        break;
      case 18:
        olist[0] = list[3];
        olist[1] = list[0];
        olist[2] = list[1];
        olist[3] = list[2];
        break;
      case 19:
        olist[0] = list[3];
        olist[1] = list[0];
        olist[2] = list[2];
        olist[3] = list[1];
        break;
      case 20:
        olist[0] = list[3];
        olist[1] = list[1];
        olist[2] = list[0];
        olist[3] = list[2];
        break;
      case 21:
        olist[0] = list[3];
        olist[1] = list[1];
        olist[2] = list[2];
        olist[3] = list[0];
        break;
      case 22:
        olist[0] = list[3];
        olist[1] = list[2];
        olist[2] = list[0];
        olist[3] = list[1];
        break;
      case 23:
        olist[0] = list[3];
        olist[1] = list[2];
        olist[2] = list[1];
        olist[3] = list[0];
        break;
    }
    // then just unswap
    list[0] = olist[0];
    list[1] = olist[1];
    list[2] = olist[2];
    list[3] = olist[3];
  };
  
  // just a helper function; THAT ALSO makes 2 way recursion!!!
  const shuffle = function(list){
    const L = list.length;
    let arr;
    // pick the optimal array size
    if(false && L <= 2**8){
      arr = new Uint8Array(L);
    }
    else if(false && L <= 2**16){
      arr = new Uint16Array(L);
    }
    else{
      arr = new Uint32Array(L);
    }
    
    // just set up our values
    const indices = arr;
    for(let i = 0; i < L; i++){
      indices[i] = i;
    }
    
    // two way recursion!
    shuffle_in_place(indices);
    return indices;
  };
  
  // this functions suhffles a list of INDICES; this function can fail if any value is not a valid index within the list of indices itself; as the name says, this shuffles the original list, rather than making a copy; this makes it compatiable with Uint Arrays, and *some* other structures as well
  shuffle_in_place = function(list){
    recursive_depth ++;
    call_count ++;
    if(call_count < 20) console.log("start", call_count, ":", recursive_depth, "^", list +"");
    highest_rd = Math.max(highest_rd, recursive_depth);
    if(recursive_depth > max_depth){
      console.log("exceeded depth");
      console.log("err list:", list);
      let e = new InternalError;
      e.message = "Somehow had "+recursive_depth+" layers of recursion! (on a list with only "+OL+" items in it)";
      throw e;
    }
    
    
    // this code is made to be more compatible with other languages
    const L = list.length;
    
    let returnb = false;
    
    // edge cases!
    if(L < 2) returnb = true;
    if(L == 2){
      // simple swap
      let r = Math.random() < 0.5;
      if(r) returnb = true;
      else{
        // triangular swapping procedure
        let s = list[0];
        list[0] = list[1];
        list[1] = s;
        return;
      }
    }
    // this took 47000 iterations down to 31500;
    if(L == 3){
      let r = random(1, 6)[0];
      shufip3(list, r);
      returnb = true;
    }
    // this took 33000 iterations down to 24200;
    if(L == 4){
      let r = random(1, 24)[0];
      shufip4(list, r);
      returnb = true;
    }
    if(!returnb){

      // the 1st thing that we do, is we check the size of the list;
      // we want to use Uint8, Uint16, or Uint32, instead of Array if the list is small enough
      // current maximum Array length in JavaScript is 2**31, so we should always be able to use Uint32Array instead of Array.

      // comments explanation is provided on the final else statement
      if(false && L <= 2**8){
        let left_length = 0;
        const sides = new Array(L);
        const R = random(L +1, 2);
        for(let i = 0, r; i < L; i++){
          r = R[i] < 1;
          if(r) sides[i] = true, left_length ++;
          else sides[i] = false;
        }
        let right_length = L - left_length;
        let  left_side = new Uint8Array( left_length);
        let right_side = new Uint8Array(right_length);
        for(let i = 0, il = 0, ir = 0; i < L; i++){
          if(sides[i]) left_side[il] = i, il++;
          else right_side[ir] = i, ir++;
        }
         left_side = index( left_side, shuffle( left_side), new Uint8Array( left_length));
        right_side = index(right_side, shuffle(right_side), new Uint8Array(right_length));
        let r = R[L] < 1;
        if(r){
          let s = left_side;
          left_side = right_side;
          right_side = s;
          s = left_length;
          left_length = right_length;
          right_length = s;
        }
        for(let i = 0; i < left_length; i++){
          list[i] = left_side[i];
        }
        for(let i = 0, j = left_length; i < right_length; i++, j++){
          list[j] = right_side[i];
        }
      }
      else if(false && L <= 2**16){
        let left_length = 0;
        const sides = new Array(L);
        const R = random(L +1, 2);
        for(let i = 0, r; i < L; i++){
          r = R[i] < 1;
          if(r) sides[i] = true, left_length ++;
          else sides[i] = false;
        }
        let right_length = L - left_length;
        let  left_side = new Uint16Array( left_length);
        let right_side = new Uint16Array(right_length);
        for(let i = 0, il = 0, ir = 0; i < L; i++){
          if(sides[i]) left_side[il] = i, il++;
          else right_side[ir] = i, ir++;
        }
         left_side = index( left_side, shuffle( left_side), new Uint16Array( left_length));
        right_side = index(right_side, shuffle(right_side), new Uint16Array(right_length));
        let r = R[L] < 1;
        if(r){
          let s = left_side;
          left_side = right_side;
          right_side = s;
          s = left_length;
          left_length = right_length;
          right_length = s;
        }
        for(let i = 0; i < left_length; i++){
          list[i] = left_side[i];
        }
        for(let i = 0, j = left_length; i < right_length; i++, j++){
          list[j] = right_side[i];
        }
      }
      else{
        // split the list into 2 halves
        // and randomly assign 1 half of the indices to each half of the shuffle
        // we have each index have an independent 1/2 chance of going to either side
        // we then shuffle indices on each side, and merge the two sides
        let left_length = 0;

        // make sure we don't empty the array
        while(left_length == 0){
          // I think that there might be something wrong with my code...
          zeros.push(list.length);

          const sides = new Array(L);
          // the +1 is for the extra swap at the end!
          const R = random(L +1, 2);
          for(let i = 0, r; i < L; i++){
            // perfect 1/2 chance
            r = R[i] < 1;
            if(r) sides[i] = true, left_length ++;
            else sides[i] = false;
          }
          // we could actually use `Uint32Array`s instead of normal Arrays, since many computers can't handle a shuffle of more than 4 billion floats (that would be 32 GB of RAM + a lot of processing)

          // this shouldn't run too often on long lists
          if(left_length == 0) continue;

          let right_length = L - left_length;
          let  left_side = new Uint32Array( left_length);
          let right_side = new Uint32Array(right_length);
          for(let i = 0, il = 0, ir = 0; i < L; i++){
            if(sides[i]) left_side[il] = i, il++;
            else right_side[ir] = i, ir++;
          }
          //
          // keep in mind, JavaScript has some SUPER SHORT ways to do everything that yous see above
          // if you feel like it, come up with the shortest JS code that does the above code
          // somewhat expensive! we have to make a new list, and then do some indexing; this is just to optimize memory usage with the Uint Arrays
          // console.log("recursion time!");
          // console.log("sides", {left_side, right_side});
           left_side = index( left_side, shuffle( left_side), new Uint32Array( left_length));
          right_side = index(right_side, shuffle(right_side), new Uint32Array(right_length));
          // console.log("shuffled:", {left_side, right_side});

          // swap for the WHOLE LEFT & the WHOLE RIGHT
          let r = R[L] < 1;
          if(r){
            // triangle swap
            let s = left_side;
            left_side = right_side;
            right_side = s;
            // don't forget to swap the lengths!
            s = left_length;
            left_length = right_length;
            right_length = s;
          }
          // we can then just merge, and write directly into our list (it's really that simple!)
          for(let i = 0; i < left_length; i++){
            list[i] = left_side[i];
          }
          for(let i = 0, j = left_length; i < right_length; i++, j++){
            list[j] = right_side[i];
          }
        }
      }
    }
    
    recursive_depth --;
    if(call_count < 20) console.log("end", call_count, ":", recursive_depth, "^", list +"");
  };
  
  // start recursion; don't forget to slice ONCE;
  const indices = shuffle(list);
  // console.log({list, indices});
  // I feel like this is extremely
  let c = list.constructor;
  console.log("highest rd: ", highest_rd);
  // zeros.sort((a,b)=>(b-a));
  let zerosum = sum(zeros);
  let zeromean = zerosum / zeros.length;
  console.log({
    first: zeros[0],
    zerosum,
    zeromean
  });
  
  // time for some debugging!!!
  window.z = zeros;
  
  return index(list, indices, new c(OL));
};

/*
1st and 2nd person RegExp:
\b(ur?|ain'?t|y(e|a|'?all|ou('?(re|ll)|r)?)|we('re)?|us|ours?|I'?(m|ll)?)\b

to use the expression: copy the expression, press ctrl+h in Google Docs, check the "use regular expressions" box, and paste the expression into the "find" box.

Here is a link to the RegExp:
https://regexr.com/7d2a2
*/


const c = document.querySelector("canvas");
const ctx = c.getContext("2d");
let w = 16, h = 16;
c.width = w, c.height = h;
const D = ctx.getImageData(0,0, w,h);
// out Uint8Array with 4_194_304 values
const d = D.data;
console.log(d.length);

oncontextmenu = function(){
  navigator.clipboard.writeText(z.join(", ")), 3000
};

SCOPE_CONTROLS: {
  // d is RGBA, but p is only RGB; we combine R,G,& B into one number in p;
  // so p = 65536*r +256*g +b;
  const p = new Uint32Array(d.length /4);
  const d_to_p = function(){
    let L = d.length /4;
    if(window.CP) window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 8000;
    for(
      let i = 0, id = 0, r,g,b;
      i < L;
      i++, id += 4
    ){
      r = d[id   ];
      g = d[id +1];
      b = d[id +2];
      p[i] = 65536 *r + 256 *g + b;
    }
    if(window.CP) window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 2200;
  };
  const p_to_d = function(){
    let L = d.length /4;
    if(window.CP) window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 8000;
    for(
      let i = 0, id = 0, r,g,b,q;
      i < L;
      i++, id += 4
    ){
      q = p[i];
      b = q %256;
      q -= b;
      q /= 256;
      g = q %256;
      q -= g;
      q /= 256;
      r = q %256;
      d[id   ] = b;
      d[id +1] = g;
      d[id +2] = r;
      // not needed:
      d[id +3] = 255;
    }
    if(window.CP) window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 2200;
  };
  
  let update = function(){
    p_to_d();
    ctx.putImageData(D, 0,0);
  };
  
  let stated_generating = false;
  let generated = false;
  onkeyup = function(){
    if(stated_generating) return;
    stated_generating = true;
    random(p.length, 256**3, p);
    
    update();
    
    generated = true;
  };
  onclick = function(){
    if(!generated) return;
    let q = shuffle(p);
    for(let i = 0; i < q.length; i++){
      p[i] = q[i];
    }
    
    update();
    // console.log(shuffle(("abcdefghijklmnopqrstuvwxyz").split("")));
  };
  window.p = p;
}

if(0){
  let a = random(10**6, 10**8, new Uint32Array(10**6));
  let b = [];
  for(let i = 0; i < 10; i++){b[i]=a[i];}
  console.log(b)
}



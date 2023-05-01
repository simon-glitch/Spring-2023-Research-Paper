let myshuffle;
myshuffle = function(list){
  recursive_depth ++;
  if(recursive_depth > max_depth){
    console.log("ERROR: exceeded recursive depth!");
    throw new Error;
  }
  let L = list.length;
  /* EDGE case: lists of only 2 items only have 2 permutations:
    [a,b]
    => [a,b]
    => [b,a]
  */
  if(L == 2){
    // true EXACTLY 1/2 of the time
    let r = Math.random() < 0.5;
    if(r) return [list[0], list[1]];
    if(!r) return [list[1], list[0]];
  }
  // Math.random seems to go all the way up to {MAX_INT_EXP -1} (52) bits of precision!
  let L2 = Math.ceil(MAX_INT_EXP / bincexp);
  let bincs = [];
  let R,
      duped_R_places = [],
      duped_R_places2 = [],
      not_used_src_places = [],
      whether_used_src_places = [],
      shuffled_array = [],
      duped_R_places_keep = []
  ;
  let i, ii, R_at_i;
  bincs.length = binc;
  // give every place in list a random s index, from 0 to binc - 1
  // the place is now in the respective bin for its s index
  // I might combine the random generation with the bin sorting in the future

  R = random(L, L);
  /*
    set up bincs by filling the bins with 0s
  */
  for(i = 0; i < L; i++){
    bincs[i] = 0;
  }
  /*
    go through our random indices,
      and remove every 2nd instance of an index
    and save where the 2nd instance was, so we can be smart about tracking dupes
    
    this algorithm is significantly sped up by good CPU conditional prediction
    furthermore, it can be sped up A LOT by compiler and JIT optimizations
  */
  for(i = 0; i < L; i++){
    // using this variable in 3 ways at once!!!
    whether_used_src_places[i] = (bincs[R[i]] > 0);
    
    // have we seen this one before?
    if(whether_used_src_places[i]){
      // make sure to save this 2nd instance
      whether_used_src_places[i] = bincs[R[i]] == 1
      if(whether_used_src_places[i]){
        // saving the index within bincs might not be necessary
        duped_R_places_keep.push(R[i]);
      }
      // save the 1st instances, and all instances AFTER the 2nd instance, but not the 2nd instance itself. Efficiency!
      else{
        duped_R_places.push(i);
        // redundant: whether_duped_src_places[i] = 1;
      }
    }
    bincs[R[i]] ++;
  }
  // search for unused values
  for(i = 0; i < L; i++){
    if(!whether_used_src_places)
      not_used_src_places.push(i);
  }
  /* shuffle the dupes:
    the items in duped_R_places are all of the places where we had a dupe in R
    the items in 
    
    
  */
  
  // so did we have any dupes?
  // fun fact: duped_R_places never has 1 element!
  if(duped_R_places.length){
    // just use recursion!
    duped_R_places2 = myshuffle(duped_src_places[i]);
  }
  /* ^^^^
  on really short lists, like 3,4, or 5 elements, we might get lucky and get NO DUPES:
    length | chance for no dupes
        3  | 2/3/3             = 0.2222222222
        4  | 2*3/4/4/4         = 0.09375
        5  | 2*3*4/5/5/5/5     = 0.0384
        6  | 2*3*4*5/6/6/6/6/6 = 0.0154320988
        n  | ((n-1)!) / (n^(n-1))
  */
  
  // now, BECAUSE we used recursion, we can just use assume that duped_R_places2 has a perfect list of new indices for the src to put int the duped_R_places in R; so, that means we use the index function TWICE! What fun!!!!!
  index(R, duped_R_places2, duped_src_places);
  
  for(i = 0, ii = 0; i < L; i++){
    if(bincs[i]) continue;
    work[ii] = i;
    ii++;
  }
  
  recursive_depth --;
};

// start recursion
return myshuffle(list);

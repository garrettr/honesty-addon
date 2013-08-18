/*
 * Utility functions for conveniently generating cryptographic randomness Uses
 * nacl.random_bytes(), which simply wraps strong randomness from
 * window.crypto.getRandomValues
 *
 * TODO: review all of this with a biginteger library. Check for randomness
 * gotchas and precision problems.
 */

/*
 * TODO: put this in the right place, or replace with something more
 * full-featured
 */
assert = function(condition, message) {
  if (!condition) {
    throw message || "Assertion failed";
  }
}

/*
 * Returns the log base n of x
 * TODO: override built-in Math.log?
 */
log = function(x, n) {
  return Math.log(x) / Math.log(n);
}

/*
 * Returns a k-bit random number using nacl.random_bytes()
 */
secureRandomKBitNumber = function(k) {
  // TODO: for now, just support 31-bit numbers. Javascript's built-in Numbers
  // are 64-bit floats, but bitwise operations are performed as if on 32-bit
  // *signed* integers in two's complement. We keep things simple (and usable
  // for now) by limiting to 31 bits.
  assert(k < 31);
  var randomBytes = nacl.random_bytes(Math.ceil(k/8));
  /* Build an integer with the random bytes */
  var n = 0;
  for (var i = 0; i < randomBytes.length; i++) {
    n |= (randomBytes[i] << ((randomBytes.length-1-i)*8));
  }
  /* Right shift (zerofilled) to get a k bit number */
  n >>> (randomBytes.length*8 - k);
  return n;
}

/*
 * Chooses a random element from a set with n elements.
 * Returns an element in the set 0, 1, ..., n-1.
 * Algorithm described in Schneier and Ferguson's "Practical Cryptography",
 * 10.8, p. 183
 * TODO: implement the more efficient version of this algorithm.
 */
secureRandomChoiceFromNElements = function(n) {
  // Special cases
  assert(n > 0);
  if (n == 1)
    return 0;

  // Number of random bits needed
  var k = Math.ceil(log(n, 2));
  var choice;
  do {
    choice = secureRandomKBitNumber(k);
  } while (choice >= n);
  return choice;
}

/*
 * Choose an element uniformly at random from the given set
 */
secureRandomChoice = function(set) {
  return set[secureRandomChoiceFromNElements(set.length)];
}

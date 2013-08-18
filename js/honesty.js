if (typeof Honesty === 'undefined') {
  Honesty = function() {}
}

Honesty.version = '0.0.1'
Honesty.server = 'localhost:8080'

Honesty.checkCompatibility = function() {
  if (typeof window.crypto.getRandomValues === 'undefined') {
    // We cannot continue without a source of cryptographic randomness
    return false;
  }
  // TODO: check Tor-ified
  // How: check.torproject.org, or ping a .onion (slower)
  return true;
}

Honesty.generatePassphrase = function () {
  // Number of words in passphrase (official recommendation is 7+)
  // TODO: use Diceware, or subset of AWL?
  WORDS_IN_PASSPHRASE = 4;
  passphrase = [];
  for (var i=0; i < WORDS_IN_PASSPHRASE; i++) {
    passphrase.push(secureRandomChoice(wordlist));
  }
  return passphrase.join(" ");
}

if (typeof(window) !== 'undefined') { $(window).ready(function() {
  // Check that we have everything we need to function correctly and safely
  if (Honesty.checkCompatibility()) {
    console.log("Compatibility check passed");
  } else {
    console.log("Compatibility check failed!");
  }
  console.log(Honesty.generatePassphrase());
})};

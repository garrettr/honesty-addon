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

if (typeof(window) !== 'undefined') { $(window).ready(function() {
  // Check that we have everything we need to function correctly and safely
  if (Honesty.checkCompatibility()) {
    console.log("Compatibility check passed");
  } else {
    console.log("Compatibility check failed!");
  }
})};

#!/usr/bin/env python
"""
Generates wordlist.js, a javascript file containing a list of all the words in
the Diceware 8k wordlist.

Usage: ./gen_wordlist.py /path/to/d8k.txt > wordlist.js
"""

import sys
import os

if len(sys.argv) != 2:
    print __doc__
    sys.exit(1)

original_wordlist_path = sys.argv[1]

print 'wordlist = ['
with open(original_wordlist_path) as fp:
    for line in fp:
        print '  "' + line.strip() + '",'
print '];'

This website is intended to enable secure, anonymous communcation between journalists and confidential sources.

There are two fundamental pieces of software: clients, and a centralized server. The client is a web application delivered to users as a signed browser addon, and must be run with Tor (preferably with the Tor Browser Bundle). The server provides an authenticated RESTful API used by the client to obtain the necessary data, served as JSON, to render the web application and perform actions on behalf of the user. The server is a Tor Hidden Service, which

1. requires clients to use Tor
2. provides end-to-end transport encryption
3. server never learns client's IP's
4. server achieves some degree of anonymity - weakened due to the attacks described in [Trawling for Tor Hidden Services](http://www.ieee-security.org/TC/SP2013/papers/4977a080.pdf)


There are two types of clients, with different anonymity goals.


1. *Contacts* are parties interested in communicating with anonymous sources. They may be individual journalists, non-profit organizations, or something else. They are *not anonymous* and must verify their identity with the platform in order to create an account. Identity may be verified by:
	a. a confirmation email sent to an official/public email address controlled by the contact. It may be difficult to avoid some degree of manual review in this case.
	b. piggybacking on another system's verification process, such as Twitter verified accounts
2. *Sources* are confidential sources. They are *anonymous*. They do not provide any PII to the web application at any point, and have complete control over the information they provide to any contacts they choose to communicate with.


*(Note: "contact" might not be a good name, given it is widely used in a much more generic fashion in other software contexts)*

All cryptography is performed on the client side with local encryption keys. User's private keys are never sent to the server or stored anywhere besides their browser. Cryptographic functions are performed by a Javascript crypto library such as SJCL, crypto-js, or js-nacl. Cryptographic randomness is sourced from the now widely adopted window.crypto.getRandomValues.

Where possible, we try to avoid saving plaintext to disk. It is impossible to ensure this given the complexity and diversity of browsers and operating systems, which may cache, or save memory to disk when the machine hibernates, but we can do a best effort (and perhaps consider writing patches for TBB that can improve this situation).

Account Creation
================

When a user installs the addon, it opens a new tab with a welcome page that invites them to create an account. Their first choice will be whether they are a source or a contact.

*An instance of an installed addon can only support one user at a time.* This greatly simplifies the interface and reduces opportunities for accidental compromise. If users really want to act in multiple roles, they can use multiple copies of a browser, each with their own addon installation. If they are using the Tor Browser Bundle, they can simply download multiple copies of the bundle (taking care to rename them and not accidentally overwrite other bundles). If they are using Firefox, they can switch profiles.

Sources
-------

If they choose source, the following actions occur:


1. A new, random keypair is generated in memory
2. A random (4-7 words, need to balance security and usability) Diceware passphrase is generated and displayed to the user. It is explained that they need to memorize this passphrase, or write it down securely, and that they will need it to login in the future. It is made clear that if they forget this passphrase, their account and data will be unrecoverable.
3. The passphrase is used to create a symmetric encryption key via a key strengthing algorithm (scrypt), and this is used to encrypt the private key. The keypair, with private key encrypted, is saved in the client.
4. A new source account request is sent to the server. This contains the user's public key, and a hash of the decrypted private key, which will be used for authentication.
5. Once both these steps have succeeded, the user is presented with a login screen and asked to log in to their account with the passphrase they were just given.


Contacts
--------

Same basic procedure as above. They will also have to provide information identifying them, and go through a verification step. *TODO: verification mechanisms. *They will need to provide an email address at least for notifications of new messages.

Account Authentication
======================

When a user signs in, either immediately after creating their account or upon returning to the application at a later time, they are given a single field to enter their passphrase. Upon entering their passphrase,


1. The client attempts to use the passphrase to decrypt the private key.
	a. If decryption fails, the user is shown an "Invalid Passphrase" warning and asked to try again. It might be good to implement some kind of a timed lockout strategy here, perhaps with a forced delete if there are too many attempts.
2. If decryption succeeds, the decrypted private key is cached in memory. It is hashed and the hash is sent to the server. If the hash matches a known user, a random session token is generated and returned in a cookie (HttpOnly, Secure flag probably won't work and I think it is unnecessary for a hidden service anyway, *TODO examine further*).
3. All current state (previously received messages, etc.) stored encrypted in the browser is decrypted and rendered for the user
4. An /update request is made to the server for any additional communications sent to this user since the last time they logged in. If new information is received, it is saved to disk (encrypted from the server), then decrypted and cached in memory to be rendered for the user. A successful /update triggers the deletion of the stored update data on the server.
5. Using this new, updated local state, the web application renders its interface.


Contact Search
==============

Contacts can be searched (by name, who they work for, tags they are associated with), or browsed in a directory by sources. (In the future, we may allow contacts this feature as well, or even allow contacts to communicate with each other)

Messaging
=========

All conversations occur between sources and contacts, and are always initiated by sources reaching out to contacts. All messages between a unique (source, contact) pair are combined into a conversation thread.

For our initial implementation we will only support text messages, in a manner similar to a chat client. An immediate followup goal is to support encrypted file transfers (I imagine files being "attached" to conversations).

All messages are stored locally by all parties, encrypted with their public key. All messages sent to a party are naturally encrypted with their public key; they also encrypt copies of their own messages with their public key and store them locally. The messages are not stored permanently on the server, but are only stored by the parties to the conversation.

This is the flow of a conversation:

1. Source S selects Contact C and sends them a message M
	a. C's public key C_pk is retrieved from the server and cached in memory for the length of the session
		1. I initially thought this should be permanently cached by the client for performance, but now I am not sure. Could this be used to identify sources based on who they contacted? Might be better to cache it for the length of the session.
	b. M is encrypted with C
		1. For efficiency, we may later adopt a PGP-like scheme where we randomly generate a symmetric key K, encrypt M with K, encrypt K with C_pk, and send them together. For now, it is simplest just to use asymmetric cryptography directly.
	c. E(M, C_pk) is transferred to the server with a creation timestamp. The server saves it until C next requests an update.
	d. E(M, S_pk) is saved in localstorage.
2. The next time C requests an update from the server (either on logging in, or periodically during a session), it will received all encrypted messages that are queued for it.
	a. C receives these messages. On successful receipt, the server deletes its copy securely.
	b. C saves the encrypted messages locally. It may decrypt them with its public key to render the decrypted messages for the user.


The flow is identical for Contacts communicating with Sources, except they can only reply in a conversation initiated by a Source.

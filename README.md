This is the beginning of a web application to enable secure, anonymous
communication between journalists and confidential sources.

# Development

To test, just load `index.html` in your browser. Once the server is developed,
you will be able to run it locally for development.

At the moment, this is just a Javascript-based web application. Ultimately it
will be packaged and distributed as a Firefox/Chrome browser addon, to take
advantage of the code signing provided by addon architectures. This is the only
way to serve trusted Javascript at the moment. The addon code will be very
simple - it will pretty much just add a UI hook (toolbar button) to open
`index.html` in a new tab, and everything will proceed from there.

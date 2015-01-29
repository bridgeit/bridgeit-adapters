## BridgeIt Adapters Module

### Description

The bridgeit-adapters module is a Node.js module containing adapters for use within BridgeIt Services, allowing those
services to communicate with other internal or external services.

### Usage

To use bridgeit-adapters, you should add it as a requirement your package.json file:

    "dependencies": {
    ...
    "bridgeit-adapters": "latest",
    ...


Once the dependency has been set, you can use require to access it from your code:

    var bas = require('bridgeit-adapters');

then you can get a reference to the adapter you require.  For example:

    var adapter = new bas.BasicAdapter();


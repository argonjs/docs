---
layout: page
title: Quick Start
nav_order: 20
---

The argon.js framework is designed to make it easy to build AR-enabled web-applications that will run in any standard web-browser. Apps built with *argon.js* are normal web-apps which can be hosted with any standard server-side architecture. No proprietary server-side solution required! While argon.js apps will run in any standard web browser, we also envision a future in which browsers have additional AR-inspired capabiltiies. We are exploring these ideas within the [Argon Browser](http://argonjs.io/argon-app/) (which already allows multiple apps to run and be visible at the same time, for example), and these use-cases have informed the design of *argon.js*.

## Installing argon.js

To install the argon.js library manually, include this script in your html:

* [argon.umd.js](https://github.com/argonjs/argon/raw/master/argon.umd.js)

To install with npm:

```sh
npm install @argonjs/argon@^1.0
```

To install with jspm:

```sh
jspm install npm:@argonjs/argon@^1.0
```

## Usage

In your es6 modules, `import` the package `"@argonjs/argon"`:

```js
import * as Argon from '@argonjs/argon'
```

If you aren't using es6 modules, `require` the package `"@argonjs/argon"`:

```js
var Argon = require('@argonjs/argon');
```

If you aren't using modules at all, no worries! The `argon.umd.js` script creates a 
global `Argon` namespace that exposes the same API. 

## Typescript

If you are using Typescript 2.0 and would like to leverage 
*argon.js* typings (you should!), simply install *argon.js* using `npm` 
as described above (even if you are not using modules in your 
project). However, if you aren't using modules, just be sure
to include a triple-slash reference so that the typescript 
compiler knows you are using *argon.js* globally:

```ts
/// <reference types="@argonjs/argon" />
```

Finally, make sure your `tsconfig.json` contains the following 
compiler options:

```json
{
    "compilerOptions": {
        "moduleResolution": "node",
        "lib": [
            "dom",
            "es2015"
        ]
    }
}
```

After that, you can enjoy rich editing support for
*argon.js* in any editor that supports Typescript! We recommend 
[Visual Studio Code](https://code.visualstudio.com).

# Pre-render any SPA app

Pre-render any SPA app like react, vue, solid, preact, ect...

## Installation

Use the package manager npm to install start-pre-render.

```bash
npm install start-pre-render
```

## Usage

## Add configuration on package.json

```json
{
 "name": "start-pre-render",
 ... ,

 "scripts": {
    ... ,
    "build": "...",
    "postbuild": "start-pre-render"
  },

 "spr_config": { // default value of spr config
    "headless": true,
    "buildDir": "build",
    "allowedHost": [],
    "port": 4173,
    "appHost": "", // this ill run local express server to serve build file. add url to pre-render from external url
    "urls": [
      "",
    ],
    "blockedResourceType": [
      "image"
    ]
  }
}
```

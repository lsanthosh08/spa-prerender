> # Pre-render any SPA app

Pre-render any SPA app like react, vue, solid, preact, ect...

> ## Installation

Use the package manager npm to install start-pre-render.

```bash
npm install start-pre-render
```

> ## Usage

1. spr_config show the default value.
2. allowedHost is allows to connect to external services to allow all service remove allowedHost or use allowedHost: ["*"].
3. blockedResourceType is to to block network service request based on resource type like image, script, ect...
4. urls are list of url path to be pre-render like ["","about-us"] ill render index.html, about-us.html.
5. port of local server to serve for pre-render.

> ## Add configuration on package.json

```json

 "scripts": {
    "build": "vite build",
    "postbuild": "start-pre-render"
  },

 "spr_config": {
    "headless": true,
    "sourceDir": "build",
    "allowedHost": [],
    "port": 4173,
    "urls": [""],
    "blockedResourceType": []
  }

```

> ## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.[Github](https://github.com/lsanthosh08/react-prerender/issues)

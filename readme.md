> # SPA Pre-render

Pre-render any SPA app like react, vue, solid, preact, ect...

> ## Features

1. support query params.
2. support block service request to save time by reducing unwanted network calls and resources like image.

> ## Upcoming Features

1. Set cookie value before page load.
2. Auto crawling by feature flag.
3. Auto generate sitemap by feature flag.

> ## Installation

Use the package manager npm to install.

```bash
npm install prerender-spa-app
```

> ## Usage

To create config json on root dir

```bash
npx spr -init
```

Run pre-render script follow

```bash
npx spr -run
```

OR

```json

 "scripts": {
    "postbuild": "spr -run"
  },

```

> ## Configuration Detail

1. spr_config show the default value.
2. allowedHost is allows to connect to external services to allow all service remove allowedHost or use allowedHost: ["*"].
3. blockedResourceType is to to block network service request based on resource type like image, script, ect...
4. urls are list of url path to be pre-render like ["","about-us"] ill render index.html, about-us.html.
5. port of local server to serve for pre-render.

> ## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.[Github](https://github.com/lsanthosh08/react-prerender/issues)

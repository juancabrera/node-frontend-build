# Node front-end build sample
Minimal front-end build system using only node (no Gulp, Grunt, Webpack, etc)

## Usage
Install dependencies:  
```
yarn install
```

Run dev server:
```
yarn start
```

Run build:
```
yarn build
```

## Features
#### ES6 JavaScript using Babel
Currently using presets `es2015` and `stage-2`, if you want to use React just add `babel-preset-react`.

#### SCSS
Currently using `node-sass`, should be relativelly easy to switch to `postcss` or any other tool for styles.

#### Browser sync
Using `browser-sync` for development.


## License
MIT Copyright (c) [Juan Cabrera](http://juan.me)


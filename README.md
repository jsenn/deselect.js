# `deselect.js`

`deselect.js` provides an easy-to-use interface on top of existing HTML
`<select>` elements, primarily by allowing users to filter their options by
substring.

## Usage

TODO

## Development

You'll need to install [git](git-scm.com/downloads) and
[Node.js](https://nodejs.org/download/). Once you have those, run the following.

```bash
git clone git://github.com/jsenn/deselect.js.git # Clone this repository
cd deselect.js # Enter the repository's top directory
npm install # Tell Node.js to download and install the necessary dependencies
```

Source files are located in the src/ directory, and tests are in the spec/
directory. To test your changes, run `grunt test` in the deselect.js
directory. If the tests pass, you can run `grunt build`. This will place two
files in the `dist/` directory: deselect.js, which is a stand-alone JavaScript
file, and deselect.min.js, which is a
[minified](https://en.wikipedia.org/wiki/Minification_(programming)#Web_development)
version of deselect.js. Either can be included as-is in your HTML to use the
`deselect.js` library.


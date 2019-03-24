#!/usr/bin/env bash
set -e
# set -x

rm -rdf dist/
mkdir dist
cp src/index.html dist
cp src/shim.js dist

echo "source size       `stat -c%s src/index.js`"

# replace
cat ./src/index.js \
| sed 's|"lifting"|1|' \
| sed 's|"waiting"|2|' \
| sed 's|"slacking"|3|' \
| sed 's|"echanging"|1|' \
| sed 's|"traveling"|2|' \
> ./dist/tmp1.js

# minify
env BABEL_ENV=minify babel dist/tmp1.js > dist/tmp.js

echo "minified size     `stat -c%s dist/tmp.js`"

# crush
cat dist/tmp.js | jscrush 1> dist/index.js 2> /dev/null

echo "crushed size      `stat -c%s dist/index.js`"

# rm dist/tmp.js

echo file://$PWD/dist/index.html
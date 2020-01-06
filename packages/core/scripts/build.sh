#!/bin/bash

# Custom build to provide more control over the package structure.
#
# - build into dist with tsc
# - copy important files package.json & tsconfig.json
# - create a custom .npmignore

set -euo pipefail

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
root=$HERE/..

cd $root

dest=$root/dist
mkdir -p $dest

yarn exec tsc --outDir $dest

# rm -rf $dest/src/extern
# cp -a src/extern $dest/src/extern

cp ambient.d.ts dist/ambient.d.ts

# TODO readme etc

cp package.json $dest
cp tsconfig.json $dest
cat <<EOF > $dest/.npmignore
tmp
logs
*.tgz
EOF

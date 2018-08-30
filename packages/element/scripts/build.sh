#!/bin/bash

set -euo pipefail

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
root=$HERE/..

cd $root

dest=$root/dist
mkdir -p $dest

yarn exec tsc --project . --outDir $dest
rm -rf $dest/src/extern
cp -a src/extern $dest/src/extern

# TODO readme etc

cp package.json $dest
cp tsconfig.json $dest
cat <<EOF > lib/.npmignore
tmp
logs
*.tgz
EOF

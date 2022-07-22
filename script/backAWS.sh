#!/usr/bin/env sh
while getopts p:dmb flag
do
    case "${flag}" in
        p) port=${OPTARG};;
        d) exec="dev";;
        m) exec="migrate";;
        b) exec="build";;
    esac
done

dist="${npm_package_config_path_dist:-.}"
server="${npm_package_config_path_server:-source/server.js}"
file=$dist/$server

pwd=$(pwd)
cd $pwd;

if [ -f ".env" ]; then
    echo ".env exists."
    cat .env | grep -v '#' | grep PORT
    export $(cat .env | grep -v '#' | grep PORT)
fi

port="${PORT:=3000}"

echo "setted Port: ${port}"

case $exec in
  "dev")
    (cd $pwd ; ./node_modules/nodemon/bin/nodemon.js -e ts --exec "npm run build && npm run start")
    ;;

  "build")
    (cd $pwd; rm -rf dist/; backAWSBuild; webpack; cp ./package.json ./dist/package.json)
    ;;

  "full-build")
    (cd $pwd; rm -rf dist/; backAWSBuild; webpack; cp ./package.json ./dist/package.json; sam-build)
    ;;

  "migrate")
    if test -f "$file"; then
      (node $file -m)
    else
      (npm tsc & node ./node_modules/@backapirest/aws-lambda/script/migrate.mjs -f $pwd)
    fi;;

  "")
    sam local start-api -p $port
    ;;
esac
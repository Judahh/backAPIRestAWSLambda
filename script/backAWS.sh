#!/usr/bin/env sh
while getopts p:db flag; do
  case "$flag" in
    p) port=$OPTARG ;;
    d) exec="dev" ;;
    b) exec="build" ;;
  esac
done

pwd=$PWD
cd "$pwd"

if [ -f ".env" ]; then
  echo ".env exists."
  cat .env | grep -v '#' | grep PORT
  export "$(cat .env | grep -v '#' | grep PORT)"
fi

port="${PORT:=3000}"

echo "setted Port: $port"

case $exec in
  "dev")
    (
      cd "$pwd"
      ./node_modules/nodemon/bin/nodemon.js -e ts --exec "npm run build && npm run start"
    )
    ;;

  "build")
    (
      cd "$pwd"
      backBuild
      npm run --prefix "$pwd" webpack
    )
    ;;

  "")
    sam local start-api -p "$port"
    ;;
esac

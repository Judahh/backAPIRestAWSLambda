#!/usr/bin/env sh
while getopts p:db flag
do
    case "${flag}" in
        p) port=${OPTARG};;
        d) exec="dev";;
        b) exec="build";;
    esac
done

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
    node_modules/next/dist/bin/next -p $port;;

  "build")
    node_modules/next/dist/bin/next build;;

  "")
    node_modules/next/dist/bin/next start;;
esac
build:
	emcc -O3 -sFETCH -s FORCE_FILESYSTEM=1 -lwebsocket.js -sEXPORTED_FUNCTIONS=_qwallet,_main -sEXPORTED_RUNTIME_METHODS=ccall -pthread -sPROXY_TO_PTHREAD -s PTHREAD_POOL_SIZE=8 -s INITIAL_MEMORY=33554432 -s WASM_ASYNC_COMPILATION=0 -s SINGLE_FILE=1 -s -D_LARGEFILE64_SOURCE=1 -fPIC -Wno-implicit-function-declaration -msse2 -msse3 -msse4.1 -msimd128 -msse4.2 -mavx -sASYNCIFY wasm.c -lnodefs.js -lidbfs.js -o app/server/utils/a.out.js -s MODULARIZE=1 -s 'EXPORT_NAME="createModule"'

ccall:
	/root/.nvm/versions/node/v18.19.1/bin/node commander.js

deletekeys:
	find app/keys -type f ! -name '.gitkeep' -exec rm {} +

start:
	make build && cd app/client && npm run build && cd ../server && npm start

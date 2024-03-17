gcc qclient.c -o qclient
gcc qarchiver.c -o qarchiver
gcc qserver.c -o qserver
root@NLDW1-4-04-2:~/qwallet# emcc -O3 -s -sEXPORTED_FUNCTIONS=_qwallet,_main -sEXPORTED_RUNTIME_METHODS=ccall -pthread -s USE_PTHREADS=1 -s PTHREAD_POOL_SIZE=8 -s INITIAL_MEMORY=33554432 -s WASM_ASYNC_COMPILATION=0 -s SINGLE_FILE=1 -s -D_LARGEFILE64_SOURCE=1 -fPIC -Wno-implicit-function-declaration -msse2 -msse3 -msse4.1 -msimd128 -msse4.2 -mavx -sASYNCIFY wasm.c -lnodefs.js -lidbfs.js
mkfifo Qserver

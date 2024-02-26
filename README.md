# Qwallet for QUBIC
Easy to use end user wallet for Qubic

# Goals
The goal of Qwallet is to be an easy to use wallet for Qubic that enables the user to access all the major functions of the Qubic network, including most Smart Contracts (SC).

The main target OS for the UI is windows and osx, to achieve this a wasm based solution is used. Combined with webpages (and localhost webserver) all the major OS will be able to be supported. If we can also get mobile (android and iOS) support using this method, then it would be worth making some additional customizations to support mobile.


# Basic architecture
Due to the usage of tcp/ip connections of the Qubic nodes and the difficulty of wasm using tcp/ip, a bridge to websockets is needed. This allows wasm to directly do networking and something like websockify can interface to the Qubic nodes. websockify also has a web server functionality so it could remove the need to use nginx.

A simple to use installer will install files for the user so the Qwallet can easily be invoked and the main webpage opened in a browser. Would need to launch the web server and open browser to localhost page.

Qwallet functionality will be mostly implemented inside the C code that will generate the wasm using emcripten. There will be UI webpages that invoke the wasm code interface functions. Advanced mode pages will exist for expert users to see the console output and perform low level functions or simply to invoke new functionality that does not have a UI webpage yet. The console would simply allow to issue command line commands with arguments that will be passed to the main(argv,argc) of the wasm. The user experience for this would be similar to using the unix command line.

For functionality that has a UI webpage, the usage should be intuitive and be easy to understand, with utmost importance on the security of user funds.


# User accounts
All of the functionality associated with monetary value will be linked to a private key. There are several ways to get a private key and each method will be described below. Qubic uses SHA-3 K12 hash as its fundamental hashing and a field multiplication to get a public key from a private key. Addresses have checksums and error detection and single char error correction must be implemented so that simple user errors of trying to send to an address with one character wrong is corrected and two or more errors are at least detected. This allows the user to correct the destination address.

A seed is a string that generates one or more private keys, the first one directly generated and subsequent private keys are derived. This allows using a single seed to recover an arbitrary number of addresses. Each seed in a user account will have N sets of address data, each set of address data having the information to sign a transaction, the public key and associated address.

A user account will have a collection of seeds and their address data. The user account will have a user generated password that is specified when the user account is created. This password is used to encrypt the sensitive seed and private key info for all the seeds in the user account. It needs to be strong enough to prevent people with access to the local computer from cracking it, but does not need to be cryptographic strength. User specified seeds needs to be cryptographically strong, preferably 256 bits like 24 word bip 39, BTC wif format, Qubic 55 chars, etc. Qwallet can generate 55 char seeds or bip39 seeds.

Seeds are one of two types, either 55 lowercase alphabetic characters native to Qubic or an arbitrary string. Qubic seeds are converted to 55 chars of 0 to 25 and K12 hashed, all the other types of seeds are K12 hashed. Both of these K12 hashes are the subseed, which is used to sign transactions. The subseed is K12 hashed to make the private key and that is ecc_mult to make a public key. The public key is displayed as an upper case alphabetic 60 character string, with the last 4 being a checksum based on K12 hash of the public key.

Based on this the user account needs a set of seedinfo, each of which includes the original seed and each of the subseed, public key and address. The privatekey is only rare directly needed and can be calculated from the subseed. Both the original seed and the subseed must be encrypted before being stored and for this a pseudo-OTP is used based on the user supplied password. It really is not a OTP (one time pad) at all as it is reused many times, but the concept of how it is used is relevant. The user password is K12 hashed, multiple times if needed to generate the required number of bits. The seed and subseed are then XOR'ed with the pseudo-OTP bits and saved on disk. When retrieving from disk the XOR operation is done again to restore the seeds. The assumption is that the user files will not be accessible unless there is local access and without the user supplied password the K12 hash of the user supplied password will not be able to be determined to extract the seeds.

The user will only need to know the password they supplied and the UI will be able to display all information about all addresses for all seeds in the user account. Each different user supplied password will create (or log into) a different user account.


# Initial UI page
The first step is to log into a user account with a user supplied password. Since each password corresponds to a different user account, there is no need to specify which user account and the user can simply enter the appropriate password. In the event this is the first time a user account is being used a default bip39 seed will be created and this will be returned to the UI page. The user MUST make a backup of this offline, eg. writing down on paper for safe keeping.

Before displaying to the user the corresponding address to this bip39 seed, the user should "prove" that a backup of the seed was made. Confirmation screen that cannot be copied to the clipboard, button to press when user says they have made a paper copy. Then a confirmation screen where the user puts in the 24 words. If and only if the user is able to match the correct 24 words, to continue to the normal after login page. If need be, the user can go back to the page that displays the 24 words and to submit as many times as they need to. This is only done the first time a user account is created, or a new seed is created.

If it is not the first time, after user supplies password, it can directly go to the after login page. This page will show all the addresses for every seed in the user account. Since each seed can have an arbitrary number of derived addresses, each seed should be able to be collapsed down to the initial address or expanded to see all the derived addresses for that seed. For each address, it would show the QU balance along with the last updated tick (and any assets that it has by expand/collapse that appears)

The user will need to be able to add derived addresses and new seeds with appropriate functions. int32_t AddNewQseed(char seed55[55]) and int32_t AddNewBip39Seed(char *bip39seed). Each of these will create a new seed structure for the user account and return the 0 based index to be used for add derived addresses. 

char *AddDerivedAddress(int32_t seedindex,char *reference) where seedindex is the index retured from the Addseed function and the reference can be any string, eg. address of customer, name, or "" if just deriving based on the next derived index. The resulting derived address is returned. If the reference is a valid qubic address, the pubkey for that adddress will be used for derivation, otherwise it will be treated as a string.

Of course, if invalid inputs are sent, error will be returned. Now we are able to create an arbitrary number of seeds of both types and an arbitrary number of derived addresses of three types for each seed. All of these addresses combine to be the user account, each address being able to have QU and assets.


# Actions
Given that there are funded address(es) in the user account, various actions are possible:

Send QU with destination and amount

Sendmany (up to 15625 destinations) with csv file

Send Asset (Ownership and Possession) with asset name, destination and amount

RANDOM entropy submission (amount to stake)

QTRY and QX TBD

Some intuitive way to determine the source of funds (checkboxes for addresses?) and specifying the required inputs to these actions are needed.

During and after the action, an appropriate page should be displayed with the current status. For example, when sending QU, it will create a txid, send it, verify if it worked, if not it creates another txid, repeats. Status information about the pending Send QU will be in the console while it is progressing. Upon completion, updated balance of sender and receiver, completion tick and time, txid details should be displayed and the txid will be stored permanently for future retrieval.

For Sendmany, it will have a potentially large number of txids, probably best if a completeion csv file is created and returned.

Send Asset will work much like sending QU.

RANDOM entropy submission just requires and amount and number of times (defaults to 1) to be specified.

# Interface
The UI interface to the wasm code will be via int qwallet(char *args,char *result)

args would be the command line and result will be the completion result or error result.

In general qwallet will return integer status as follows:
negative number would indicate error.N occured, N being -result
0 means operation completed
positive number means operation was queued and the result is the queued task number.

for a queued task number the status command can be used to obtain status, which will be the same status number unless the command completed, in which case the result will be set

For now we can serialize the UI, so if a task number is returned, just poll the qwallet with status <tasknum> until it returns 0 or negative.

On any negative number display the error value and the results which will have some details about the error



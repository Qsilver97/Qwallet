# Qwallet for QUBIC
Easy to use end user wallet for Qubic

# Goals
The goal of Qwallet is to be an easy to use wallet for Qubic that enables the user to access all the major functions of the Qubic network, including most Smart Contracts (SC).

The main target OS for the UI is windows and osx, to achieve this a wasm based solution is used. Combined with webpages (and localhost webserver) all the major OS will be able to be supported. If we can also get mobile (android and iOS) support using this method, then it would be worth making some additional customizations to support mobile.


# User accounts
Qwallet manages user funds based on accounts. An account is simple a seed associated with a password. The seed is encrypted with the password and saved to a filename based on the hash of the password.

The user can have a seed generated for them automatically simply by trying to login with a password for the first time. If the password starts with a 'Q' the qubic 55 lowercase alphabetic seed is generated, if the password does not start with 'Q' then a 24 word bip39 seed is created. The actual seed is not saved on disk and all instances of seeds, subseeds, privatekeys are immediately scrubbed from memory after their use. The addseed command can be used to create a pre-existing seed and link it to a password, the Qpassword convention is not used for external seeds added.

login password to generate bip39 24 words

login Qpassword to generate qubic 55 chars seed

addseed password seed


After a seed is created, you can specify it simply with the password.

Once an account is created with a password, you can create derived privatekeys that combine the original seed for the password with the hash of the derivation string. This is automatically done on the first usage of the derivation index assuming a derivation string is provided.

login <password>,1,derived

Once you do that you can specify it with <password>,1

The user will only need to know the password and derivations they supplied and the UI will be able to display. Each different user supplied password will create (or log into) a different user account.


# Initial UI page
The first step is to log into a user account with a user supplied password. Since each password corresponds to a different user account, there is no need to specify which user account and the user can simply enter the appropriate password. In the event this is the first time a user account is being used a default bip39 seed will be created and this will be returned to the UI page. The user MUST make a backup of this offline, eg. writing down on paper for safe keeping.

Before displaying to the user the corresponding address to this bip39 seed, the user should "prove" that a backup of the seed was made. Confirmation screen that cannot be copied to the clipboard, button to press when user says they have made a paper copy. Then a confirmation screen where the user puts in the 24 words. If and only if the user is able to match the correct 24 words, to continue to the normal after login page. If need be, the user can go back to the page that displays the 24 words and to submit as many times as they need to. This is only done the first time a user account is created, or a new seed is created.

If it is not the first time, after user supplies password, it can directly go to the after login page. This page will show all the addresses for every seed in the user account. Since each seed can have an arbitrary number of derived addresses, each seed should be able to be collapsed down to the initial address or expanded to see all the derived addresses for that seed. For each address, it would show the QU balance along with the last updated tick (and any assets that it has by expand/collapse that appears)

The user will need to be able to add derived addresses and new seeds with appropriate functions.


# Actions
Given that there are funded address(es) in the user account, various actions are possible:

The address where funds are to come from is specified by login,index. Currently a simple send creates the rawhex for the tx, it needs to be manually broadcast to the network.

send <password>,index,dest,amount[,extradata]

Use index of 0 unless you want to use a derived address. extradata is an optional hexstring for data to be added to the transaction

Future commands:

Sendmany (up to 15625 destinations) with csv file

Send Asset (Ownership and Possession) with asset name, destination and amount

RANDOM entropy submission (amount to stake)

QTRY and QX TBD

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

# Feedback
Kavatak:

1. One notable feature is the process of the initial login with the repeated input of the seed bip39 (without the ability to copy). This is a valuable feature that emphasizes the importance of saving the seed. Some users might overlook this, leading to potential coin loss.

2. The console is a handy feature (though perhaps it should be toggleable in the settings to avoid clutter for regular users).

3. To become a top-1 wallet, you need to find a way to make a wallet for a mobile device.

4. Adding a convenient copy address option (with a single click) and a QR code for the address could enhance the user experience.

5. Implementing support channels (Discord/Telegram/email/FAQ) for feedback and issue resolution is essential.

6. Storing the complete transaction history, including previous epochs, is a great idea. It allows users to easily track their financial operations, a feature currently lacking in wallet.qubic.li.

7. Adding the ability to bookmark addresses for quick access and management could be beneficial.

8. Consideration should be given to transaction confirmation methods, such as two-factor authentication or password usage.




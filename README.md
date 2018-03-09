# MyPass
#### Self-hosted encrypted password manager

Host your own password manager and/or share a server with friends and family.
All data is encrypted and decrypted client-side, 
using a password separate from the login password.



##### Features:
* End-to-end encryption
* Strong encryption using AES-256 (using aes.js)
* BCrypt-hashed storage of login password


##### Requirements:
* MongoDB (tested on v. 3.6.2)
* Node.js (tested on v. 8.9.1)
* Yarn (tested on 1.5.1) or npm (tested on 5.5.1)
* NGiNX (optional; example config file is included)


##### Install:
1. Download latest release
2. Extract to folder 
3. Navigate to folder containing the files in terminal
4. Run `yarn install`
5. Then run `yarn start`



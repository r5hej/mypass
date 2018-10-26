# MyPass
#### Self-hosted encrypted password manager

Host your own password manager and/or share a server with friends and family.
All data is encrypted and decrypted client-side, 
using a master password separate from the login password.



##### Features:
* End-to-end encryption
* Strong encryption using AES-256 (using aes.js)
* BCrypt-hashed storage of login password


##### Requirements:
* MongoDB (tested on v. 3.6.2)
* Node.js (tested on v. 8.9.1)
* Yarn (tested on 1.5.1) or npm (tested on 5.5.1)
* NGiNX (optional; example config file is included)
* SSL/TLS certificate for HTTPS encryption. [Let’s Encrypt](https://letsencrypt.org/) offers them for free


##### Install:
1. Download latest release
2. Extract to folder 
3. Navigate to folder containing the files in terminal
4. Run `yarn install` (or `npm install`)
5. Then run `yarn start` (or `npm start`)

##### Why
Password managers are quite popular, 
which makes good sense since you want a new password for every site.

We didn't enjoy that we only had very limited control over our data 
using some of the existing solutions, and some are even closed-source(!).
So we thought a self-hosted password manager could be a solution for some.

#### Contribute
Contributions through pull-requests are welcome.
If you have an idea for a new feature that you would like to implement, 
please create an issue first, so we can discuss the best way to integrate the feature.

If you find a bug or problem with the security, please create an issue so we can look at it.

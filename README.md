# ETHDenverMVP

MVP for ETHDenver 2021

To start local blockchain:
npm install
npx hardhat node --hostname 0.0.0.0
npx hardhat run scripts/deploy.js --network localhost

To start ursulas:
cd server && python script_testing/init_fed_ursulas.py

To start server:
cd server && pip install -r requirements.txt && python run.py

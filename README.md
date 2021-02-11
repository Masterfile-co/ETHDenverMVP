# ETHDenverMVP

MVP for ETHDenver 2021

To start frontend:
cd client
yarn start

To start local blockchain:
brownie console --network development
run("deploy")

<!-- npm install
npx hardhat node --hostname 0.0.0.0
npx hardhat run scripts/deploy.js --network localhost -->

To start ursulas:
python scripts/init_fed_ursulas.py

To start server:
cd server && pip install -r requirements.txt && python run.py


To start graph
cd documents/github/qualla-demo
docker-compose -f graphnode-docker.yml down
rm -Recurse -Force graph-node/data/
docker-compose -f graphnode-docker.yml up --build -d

To clear keys
cd //home/ghard/.local/share/nucypher/keyring/private
rm *
cd ../public
rm *

Restart Checklist:
- Delete graph database
- Delete nucypher keypairs
- 


b'9934f053-32c1-404c-b723-7b4a2ae25692'
from web3 import Web3
import json

with open("./Masterfile.json") as f:
    info_json = json.load(f)
abi = info_json["abi"]

w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

masterfile = w3.eth.contract(address="0x3518632Ebb387D77Ff19De9Bd1EEE095f919D5A6", abi=abi)

masterfile.functions.RegisterUser(address="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC")
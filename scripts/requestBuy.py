from brownie import Masterfile, accounts

def main():
    masterfile = Masterfile[0]

    masterfile.requestBuy(0, {"value": 1500000000100000})

    print(masterfile.userKeys(accounts[0]))
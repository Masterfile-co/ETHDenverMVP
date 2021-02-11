from brownie import Masterfile, accounts

def main():
    masterfile = Masterfile[0]

    masterfile.MintNFT(accounts[1], "alice_uri", True, 10)

    print(masterfile.userKeys(accounts[0]))
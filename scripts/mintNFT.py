from brownie import Masterfile, accounts

def main():
    masterfile = Masterfile[0]

    masterfile.MintNFT(accounts[1], "302a57d1-6902-46c8-9935-d40be7283542", False, 0)

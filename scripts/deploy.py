from brownie import Masterfile, MockPolicyManager, accounts


def main():
    """ Simple deploy script for our two contracts. """
    # tx = accounts[0].deploy(MockPolicyManager)
    pm = MockPolicyManager.deploy({'from': accounts[0]})
    masterfile = Masterfile.deploy([accounts[0]], pm.address, {"from": accounts[0]})

    # masterfile.RegisterUser("0x0000000000000000000000000000000000000000", b"\x02\xdf\xa8\xb0\xb6\xc2a\xa0Wp\xb8\x07\xf2\xe9jJA\xedt\xd0\x1d\x99`\xa0S\xd5\xce\x1a\x15\x90\x9c!\xce", b"\x02\xc8\x9b\xd3\x06\x06\xa5'\x1b\xddH\x03\x95}\x94\x17 wh\xaa\xc8\xdd\x8eG\xd1\xef\x13}p\x11\x07@\xb2")

    # print(masterfile.userKeys(accounts[0]))

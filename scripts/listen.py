from web3 import Web3, HTTPProvider, eth
import json
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()
import maya
import os
import time
import asyncio


from nucypher.characters.lawful import Ursula, Alice, Bob
from nucypher.config.constants import TEMPORARY_DOMAIN
from nucypher.config.keyring import NucypherKeyring
from nucypher.utilities.logging import GlobalLoggerSettings
# GlobalLoggerSettings.set_log_level(log_level_name='debug')
# GlobalLoggerSettings.start_console_logging()

w3 = Web3(HTTPProvider("http://0.0.0.0:8545/"))

with open("./server/interfaces/Masterfile.json") as f:
    info_json = json.load(f)
abi = info_json["abi"]

masterfile_contract = w3.eth.contract(address="0x86f0c5Bd13925c55c591CB1a215Bee5bfd11d143", abi=abi)

# # "localhost:11500"


async def onRequestBuy(event):
    SEEDNODE_URI = os.getenv("SEEDNODE_URI") 
    ursula = Ursula.from_seed_and_stake_info(seed_uri="localhost:11500",
                                            federated_only=True,
                                            minimum_stake=0)

    NEW_PASSWORD="THIS_IS_A_TERRIBLE_PASSWORD"

    try:
        keyring = NucypherKeyring.generate(
            checksum_address='0xf61DBAbF5Ac0A3F99e91b663A590cF4cB58563D9',
            password=NEW_PASSWORD,  # used to encrypt nucypher private keys
            keyring_root= "//home/ghard/.local/share/nucypher/keyring"
        )
    except:
        # Restore an existing Alice keyring
        keyring = NucypherKeyring(account='0xf61DBAbF5Ac0A3F99e91b663A590cF4cB58563D9')
        

    keyring.unlock(password=NEW_PASSWORD)

    alice = Alice(
        keyring=keyring,
        known_nodes=[ursula],
        federated_only=True,
        learn_on_same_thread=True,
        domain=TEMPORARY_DOMAIN
    )
    user = event.args["buyer"]
    keys = masterfile_contract.functions.userKeys(user).call()
    print(user)
    print(keys)

    bob = Bob.from_public_keys(verifying_key=keys[0], encrypting_key=keys[1], federated_only=True)

    policy = alice.grant(
        bob,
        label=(str(event.args["tokenId"])+os.urandom(4).hex()).encode(),
        m=2,
        n=3,
        expiration = maya.now() + timedelta(days=5)
    )
    policy.treasure_map_publisher.block_until_complete()
    print("done")


async def log_loop(event_filter, poll_interval):
    print("Running Loop")
    while True:
        for event in event_filter.get_new_entries():
            await onRequestBuy(event)
        await asyncio.sleep(poll_interval)


def main():
    myFilter = masterfile_contract.events.RequestBuy.createFilter(fromBlock="latest", topics= [])
    loop = asyncio.get_event_loop()
    loop.run_until_complete(
        asyncio.gather(
        log_loop(myFilter, 2)
        )
    )

#     user = "0x72328D380Bd5cCBFa1074b00Ee16528B1FC1ffbF"
#     keys = masterfile_contract.functions.userKeys(user).call()
#     print(user)
#     print(keys)

#     # Call token transfer

#     # Distribute kfrags

#     bob = Bob.from_public_keys(verifying_key=keys[0], encrypting_key=keys[1], federated_only=True)
#     policy = alice.grant(
#         bob,
#         label=str(0).encode(),
#         m=2,
#         n=3,
#         expiration = maya.now() + timedelta(days=5)
#     )


#     pass


if __name__ == "__main__":
    main()



# from web3 import Web3, HTTPProvider, eth
# import json
# from datetime import timedelta
# w3 = Web3(HTTPProvider("http://0.0.0.0:8545/"))

# with open("./server/interfaces/Masterfile.json") as f:
#     info_json = json.load(f)
# abi = info_json["abi"]

# masterfile_contract = w3.eth.contract(address="0x86f0c5Bd13925c55c591CB1a215Bee5bfd11d143", abi=abi)
# user = "0x72328D380Bd5cCBFa1074b00Ee16528B1FC1ffbF"
# keys = masterfile_contract.functions.userKeys(user).call()

# print("Contract Connected")

# import maya
# from datetime import timedelta
# import os
# import io
# from nucypher.blockchain.eth.signers import Signer
# from nucypher.characters.lawful import Ursula, Alice, Bob
# from nucypher.config.constants import TEMPORARY_DOMAIN

# SEEDNODE_URI = "localhost:11500"
# ursula = Ursula.from_seed_and_stake_info(seed_uri=SEEDNODE_URI,
#                                          federated_only=True,
#                                          minimum_stake=0)

# from nucypher.config.keyring import NucypherKeyring

# NEW_PASSWORD="THIS_IS_A_TERRIBLE_PASSWORD"

# try:
#     keyring = NucypherKeyring.generate(
#         checksum_address='0xf61DBAbF5Ac0A3F99e91b663A590cF4cB58563D9',
#         password=NEW_PASSWORD,  # used to encrypt nucypher private keys
#         keyring_root= "//home/ghard/.local/share/nucypher/keyring"
#     )
# except:
#     # Restore an existing Alice keyring
#     keyring = NucypherKeyring(account='0xf61DBAbF5Ac0A3F99e91b663A590cF4cB58563D9')
    

# keyring.unlock(password=NEW_PASSWORD)
# alice = Alice(
#     keyring=keyring,
#     known_nodes=[ursula],
#     federated_only=True,
#     learn_on_same_thread=True,
#     domain=TEMPORARY_DOMAIN
# )

# print("Alice initiated")

# label = str(0)
# label = label.encode()

# bob = Bob.from_public_keys(verifying_key=keys[0], encrypting_key=keys[1], federated_only=True)

# policy = alice.grant(
#     bob,
#     label=label, 
#     m=2,
#     n=3,
#     expiration = maya.now() + timedelta(days=5)
# )

# policy.treasure_map_publisher.block_until_complete()
# print("Done!")
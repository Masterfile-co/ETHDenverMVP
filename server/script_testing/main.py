from dotenv import load_dotenv
load_dotenv()
from PIL import Image

import maya
from datetime import timedelta
import os
import io

SIGNER_PASSWWORD = os.getenv("SIGNER_PASSWORD")
INFURI_API_KEY = os.getenv("INFURI_API_KEY")

from nucypher.blockchain.eth.interfaces import BlockchainInterfaceFactory
BlockchainInterfaceFactory.initialize_interface(provider_uri="https://goerli.infura.io/v3/"+INFURI_API_KEY)

from nucypher.blockchain.eth.signers import Signer
from nucypher.characters.lawful import Ursula, Alice, Bob
from nucypher.config.constants import TEMPORARY_DOMAIN

# Keyfile Wallet
software_wallet = Signer.from_signer_uri('keystore:///home/ghard/testkeystore.json')
software_wallet.unlock_account("0xf61DBAbF5Ac0A3F99e91b663A590cF4cB58563D9", password=SIGNER_PASSWWORD)

# seed_uri = 'https://lynx.nucypher.network:9151'
SEEDNODE_URI = "localhost:11500"
ursula = Ursula.from_seed_and_stake_info(seed_uri=SEEDNODE_URI,
                                         federated_only=True,
                                         minimum_stake=0)

from nucypher.config.keyring import NucypherKeyring

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

# # Instantiate Alice
# alice = Alice(
#     keyring=keyring,              # NuCypher Keyring
#     known_nodes={ursula},         # Peers (Optional)
#     signer=software_wallet,                # Alice Wallet
#     # provider_uri="https://goerli.infura.io/v3/45b861ae09994ee585c2b7fafdeb8e70",  # Ethereum RPC endpoint
#     domain='lynx',                 # NuCypher network (mainnet, lynx, ibex)
#     client_password=NEW_PASSWORD,
#     federated_only=True
# )

keyring.unlock(password=NEW_PASSWORD)

alice = Alice(
    keyring=keyring,
    known_nodes=[ursula],
    federated_only=True,
    learn_on_same_thread=True,
    domain=TEMPORARY_DOMAIN
)

label = "nft-test"+os.urandom(4).hex()
label = label.encode()

policy_pubkey = alice.get_policy_encrypting_key_from_label(label)

from nucypher.characters.lawful import Enrico


with open("//home/ghard/testimg.jpg", "rb") as image:
  f = image.read()
  b = bytearray(f)

img = Image.open("//home/ghard/testimg.jpg", mode="r")


# b = b'This is a test'

enrico = Enrico(policy_encrypting_key=policy_pubkey)
ciphertext, signature = enrico.encrypt_message(plaintext=b)

BOB_PASSWORD = "THIS_IS_ANOTHER_TERRIBLE_PASSWORD"

data_source_public_key = bytes(enrico.stamp)

try:
    keyring = NucypherKeyring.generate(
        checksum_address='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        password=BOB_PASSWORD,  # used to encrypt nucypher private keys
        keyring_root= "//home/ghard/.local/share/nucypher/keyring"
    )
except:
    # Restore an existing Alice keyring
    keyring = NucypherKeyring(account='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')

keyring.unlock(password=BOB_PASSWORD)

bob = Bob(
    keyring=keyring,
    known_nodes=[ursula],
    federated_only=True,
    learn_on_same_thread=True,
    domain=TEMPORARY_DOMAIN
)

policy = alice.grant(
    bob,
    label=label, 
    m=2,
    n=3,
    expiration = maya.now() + timedelta(days=5)
)

policy.treasure_map_publisher.block_until_complete()
print("Done!")

alice_sig_pubkey = alice.stamp

# ----------------------------------------------------

bob.join_policy(label, alice_sig_pubkey)

enrico1 = Enrico.from_public_keys(
    verifying_key = data_source_public_key,
    policy_encrypting_key=policy_pubkey
)

decrypted_plaintext = bob.retrieve(
    ciphertext,
    label=label,
    enrico=enrico1,
    alice_verifying_key = alice_sig_pubkey
)

image = Image.open(io.BytesIO(decrypted_plaintext[0]))
image.save("/mnt/c/Users/ghard/Documents/test.jpg")
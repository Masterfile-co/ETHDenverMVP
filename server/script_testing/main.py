from dotenv import load_dotenv
load_dotenv()

import os

SIGNER_PASSWWORD = os.getenv("SIGNER_PASSWORD")
INFURI_API_KEY = os.getenv("INFURI_API_KEY")

from nucypher.blockchain.eth.interfaces import BlockchainInterfaceFactory
BlockchainInterfaceFactory.initialize_interface(provider_uri="https://goerli.infura.io/v3/"+INFURI_API_KEY)

from nucypher.blockchain.eth.signers import Signer
from nucypher.characters.lawful import Ursula, Alice

# Keyfile Wallet
software_wallet = Signer.from_signer_uri('keystore:///home/ghard/testkeystore.json')
software_wallet.unlock_account("0xf61DBAbF5Ac0A3F99e91b663A590cF4cB58563D9", password=SIGNER_PASSWWORD)

seed_uri = 'https://lynx.nucypher.network:9151'
ursula = Ursula.from_seed_and_stake_info(seed_uri=seed_uri)

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
print(keyring.checksum_address)

# Instantiate Alice
alice = Alice(
    keyring=keyring,              # NuCypher Keyring
    known_nodes=[ursula],         # Peers (Optional)
    signer=software_wallet,                # Alice Wallet
    # provider_uri="https://goerli.infura.io/v3/45b861ae09994ee585c2b7fafdeb8e70",  # Ethereum RPC endpoint
    domain='lynx',                 # NuCypher network (mainnet, lynx, ibex)
    client_password=NEW_PASSWORD,
    federated_only=True
)

label = "nft-test"+os.urandom(4).hex()
label = label.encode()

policy_pubkey = alice.get_policy_encrypting_key_from_label(label)

from nucypher.characters.lawful import Enrico


with open("//home/ghard/testimg.jpg", "rb") as image:
  f = image.read()
  b = bytearray(f)


enrico = Enrico(policy_encrypting_key=policy_pubkey)
ciphertext, signature = enrico.encrypt_message(plaintext=b)

print(ciphertext)
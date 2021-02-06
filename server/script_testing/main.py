# This is for testing the nucypher library

import datetime
import sys
import json
import os
import shutil

import maya

from nucypher.characters.lawful import Bob, Ursula
from nucypher.config.characters import AliceConfiguration
from nucypher.config.constants import TEMPORARY_DOMAIN
from nucypher.utilities.logging import GlobalLoggerSettings
from nucypher.config.keyring import NucypherKeyring

PASSWORD = "THIS_IS_A_SHITTY_TEST_PASSWORD"

# keyring = NucypherKeyring.generate(
#     checksum_address="0x6A9da1eA8829ed7BE2250f3C562D897203920F94",
#     password=PASSWORD
# )


######################
# Boring setup stuff #
######################


# Twisted Logger

GlobalLoggerSettings.start_console_logging()

TEMP_ALICE_DIR = os.path.join('/', 'tmp', 'heartbeat-demo-alice')


# if your ursulas are NOT running on your current host,
# run like this: python alicia.py 172.28.1.3:11500
# otherwise the default will be fine.

try:
    SEEDNODE_URI = sys.argv[1]
except IndexError:
    SEEDNODE_URI = "localhost:11500"

POLICY_FILENAME = "policy-metadata.json"


#######################################
# Alicia, the Authority of the Policy #
#######################################


# We get a persistent Alice.
# If we had an existing Alicia in disk, let's get it from there

passphrase = "TEST_ALICIA_INSECURE_DEVELOPMENT_PASSWORD"
# If anything fails, let's create Alicia from scratch
# Remove previous demo files and create new ones

shutil.rmtree(TEMP_ALICE_DIR, ignore_errors=True)

ursula = Ursula.from_seed_and_stake_info(seed_uri=SEEDNODE_URI,
                                         federated_only=True,
                                         minimum_stake=0)

alice_config = AliceConfiguration(
    config_root=os.path.join(TEMP_ALICE_DIR),
    domain=TEMPORARY_DOMAIN,
    known_nodes={ursula},
    start_learning_now=False,
    federated_only=True,
    learn_on_same_thread=True,
)

alice_config.initialize(password=passphrase)

alice_config.keyring.unlock(password=passphrase)
alicia = alice_config.produce()

# We will save Alicia's config to a file for later use
alice_config_file = alice_config.to_configuration_file()

# Let's get to learn about the NuCypher network
alicia.start_learning_loop(now=True)

# At this point, Alicia is fully operational and can create policies.
# The Policy Label is a bytestring that categorizes the data that Alicia wants to share.
# Note: we add some random chars to create different policies, only for demonstration purposes
label = "nft-1-"+os.urandom(4).hex()
label = label.encode()

# Alicia can create the public key associated to the policy label,
# even before creating any associated policy.
policy_pubkey = alicia.get_policy_encrypting_key_from_label(label)

print("The policy public key for "
      "label '{}' is {}".format(label.decode("utf-8"), policy_pubkey.to_bytes().hex()))

# Encrypting Data:

from nucypher.characters.lawful import Enrico

enrico = Enrico(policy_encrypting_key=policy_pubkey)

enrico_public_key = bytes(enrico.stamp)

plaintext = b'This is plain text!'

ciphertext, signature = enrico.encrypt_message(plaintext)

print(ciphertext)
from . import encrypt_blueprint

from flask.views import MethodView
from flask import make_response, request, jsonify

from dotenv import load_dotenv
load_dotenv()

from PIL import Image
from datetime import timedelta
import io
import maya
import os
from uuid import uuid4
import json
import sys
import time
from threading import Thread
from eth_abi import encode_abi
from Crypto import Random

# NuCypher initiation ---------------------------------

from nucypher.characters.lawful import Ursula, Alice, Bob
from nucypher.config.constants import TEMPORARY_DOMAIN
from nucypher.config.keyring import NucypherKeyring

SESSION_ID = os.getenv("SESSION_ID")
BUCKET_ID = os.getenv("BUCKET_ID")

# "localhost:11500"
SEEDNODE_URI = os.getenv("SEEDNODE_URI") 
ursula = Ursula.from_seed_and_stake_info(seed_uri=SEEDNODE_URI,
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

size = 128, 128

formats = {"JPEG": ".jpg", "PNG": ".png", "GIF": ".gif"}

base_uri = "https://hub.textile.io/ipns/" + BUCKET_ID + "/"


# Web 3 initiation

from web3 import Web3, HTTPProvider, eth

w3 = Web3(HTTPProvider("http://0.0.0.0:8545/"))
w3.eth.default_account = w3.eth.accounts[0]

print(os.getcwd())

with open("./interfaces/Masterfile.json") as f:
    info_json = json.load(f)
abi = info_json["abi"]

masterfile_contract = w3.eth.contract(address="0x86f0c5Bd13925c55c591CB1a215Bee5bfd11d143", abi=abi)

# Listen for Sale Offer events

def onRequestBuy(event):
    # print(event)
    user = event.args["buyer"]
    keys = masterfile_contract.functions.userKeys(user).call()
    tokenId = event.args["tokenId"]
    token = masterfile_contract.functions.tokenData(tokenId).call()
    print(user)
    print(token)

    # Call token transfer

    label = str(tokenId)+os.urandom(4).hex()

    # using fake policy id
    compiled_data = encode_abi(
        ['bytes16', 'uint256', 'string', 'address[]'],
        [Random.new().read(16), 432000, label,
        ["0x9920328f8D239613cDfFea4578e37d843772738F", "0xf71C4fbb1D0a85ded90c58fF347a026E6b8146AC", "0xC11F4fAa477b1634369153c8654eEF581425AD15"]
        ])

    masterfile_contract.functions.safeTransferFrom(token[0], user, tokenId, 1, compiled_data).transact({'from': w3.eth.accounts[0]})

    # Distribute kfrags

    bob = Bob.from_public_keys(verifying_key=keys[0], encrypting_key=keys[1], federated_only=True)
    policy = alice.grant(
        bob,
        label=label.encode(),
        m=2,
        n=3,
        expiration = maya.now() + timedelta(days=5)
    )
    policy.treasure_map_publisher.block_until_complete()
    print("Policy {} was created".format(label))

loggedEvents = []

def log_loop(event_filter, poll_interval):
    print("Running Loop")
    
    while True:
        events_duplicated = event_filter.get_new_entries()
        events=[]
        for event in events_duplicated:
            if event.transactionHash not in loggedEvents:
                events.append(event)
                loggedEvents.append(event.transactionHash)
        for event in events:
            onRequestBuy(event)
        time.sleep(poll_interval)

print("Starting filter")

myFilter = masterfile_contract.events.RequestBuy.createFilter(fromBlock="latest", topics= [])
worker = Thread(target=log_loop, args=(myFilter, 2), daemon=True)
worker.start()

class LoginView(MethodView):

    def post(self):

        if not request.data["account"] or not request.data["password"]:

            response = {
                    'message': "User data missing"
                }

            return make_response(jsonify(response)), 404

        user = request.data["account"]

        password = request.data["password"]

        try:
            keyring = NucypherKeyring.generate(
                checksum_address=user,
                password=password,  # used to encrypt nucypher private keys
                keyring_root= "//home/ghard/.local/share/nucypher/keyring"
            )
            keyring.unlock(password=password)

            masterfile_contract.functions.RegisterUser(user, keyring.signing_public_key.to_bytes(), keyring.encrypting_public_key.to_bytes()).transact({"from": w3.eth.accounts[0]})
        
            response = {
                        'message': "Registration Accepted"
                    }

            keyring.lock()

            return make_response(jsonify(response)), 200
            
        except:
            
            try: 
                keyring = NucypherKeyring(account=user)
                keyring.unlock(password=password)

                # Double check user has keys

                keys = masterfile_contract.functions.userKeys(user).call()

                print(keys)

                response = {
                        'message': "Login Successful"
                    }
                keyring.lock()

                return make_response(jsonify(response)), 200

            except:

                response = {
                        'message': "Invalid Login"
                    }

                return make_response(jsonify(response)), 404

class EncryptView(MethodView):

    def post(self):
        "User should post file and encryption keys for Enrico to encrypt. This should upload encrypted file and metadat to textile"

 

        try: 
            image = request.files["artwork"]
        
        except: 

            print("no image")
            response = {
                    'message': "No File Attached"
                }

            return make_response(jsonify(response)), 404
                

        if not request.data["name"] or not request.data["description"] or not request.data["creator"]:
            
            response = {
                    'message': "Insufficient data attached"
                }

            return make_response(jsonify(response)), 404

        filename = str(uuid4())

        # generate thumbnail

        img = Image.open(image.stream)

        frmt = img.format
        

        thmnl = img.copy()
        thmnl.thumbnail(size)
        thmnl.save("./app/encrypt/bucket/"+filename+"_thumbnail"+formats[frmt], format=frmt)
        #Save to textile

        # create policy from title of artwork

        label = request.data["name"].encode()

        policy_pubkey = alice.get_policy_encrypting_key_from_label(label)

        # encrypt file

        from nucypher.characters.lawful import Enrico

        enrico = Enrico(policy_encrypting_key=policy_pubkey)

        buf = io.BytesIO()
        img.save(buf, format=frmt)

        ciphertext, signature = enrico.encrypt_message(plaintext=buf.getvalue())
        # upload file and metadata to textile

        f = open("./app/encrypt/bucket/"+filename+formats[frmt], "wb")
        f.write(ciphertext.to_bytes())
        f.close()

        # generate metadata from inputs and file

        metadata = {
            "name": request.data["name"],
            "creator": request.data["creator"],
            "description": request.data["description"],
            "timestamp": time.time() ,
            "properties": {
                "masterfile": base_uri+filename+formats[frmt],
                "thumbnail":  base_uri+filename+"_thumbnail"+formats[frmt],
                "file": {
                    "format": frmt,
                    "size": os.path.getsize("./app/encrypt/bucket/"+filename+formats[frmt]),
                    "resolution": img.size
                }
            }
        }

        with open("./app/encrypt/bucket/"+filename+"_metadata.json", "w") as outfile:
            json.dump(metadata, outfile)


        os.system("cd app/encrypt/bucket; hub buck push -y --session "+ SESSION_ID)

        # return metadata uri

        response = {
                'message': "Upload Complete",
                'uri': filename
            }

        return make_response(jsonify(response)), 200

    def get(self):
        "User should send Bob password to decrypt files"

        response = {
                'message': "Hello World"
            }

        return make_response(jsonify(response)), 200


encrypt_view = EncryptView.as_view("encrypt_view")
login_view = LoginView.as_view("register_view")

encrypt_blueprint.add_url_rule('/', view_func=encrypt_view, methods=['GET', 'POST'])
encrypt_blueprint.add_url_rule('/login', view_func=login_view, methods=['POST'])
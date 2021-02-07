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

from nucypher.characters.lawful import Ursula, Alice, Bob
from nucypher.config.constants import TEMPORARY_DOMAIN
from nucypher.config.keyring import NucypherKeyring

SESSION_ID = os.getenv("SESSION_ID")

SEEDNODE_URI = "localhost:11500"
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


class EncryptView(MethodView):

    def post(self):
        "User should post file and encryption keys for Enrico to encrypt. This should upload encrypted file and metadat to textile"
        
        if request.files:
            image = request.files["artwork"]
            if not image:

                response = {
                    'message': "No File Attached"
                }

                make_response(jsonify(response)), 404

        # generate metadata from inputs and file

        filename = str(uuid4())

        # generate thumbnail

        img = Image.open(image.stream)

        thmnl = img.copy()
        thmnl.thumbnail(size)
        #Save to textile

        # create policy from title of artwork

        label = request.data["title"].encode()

        policy_pubkey = alice.get_policy_encrypting_key_from_label(label)

        # encrypt file

        from nucypher.characters.lawful import Enrico

        enrico = Enrico(policy_encrypting_key=policy_pubkey)

        buf = io.BytesIO()
        img.save(buf, format='JPEG')

        ciphertext, signature = enrico.encrypt_message(plaintext=buf.getvalue())
        # upload file and metadata to textile

        f = open("./app/encrypt/bucket/"+filename, "wb")
        f.write(ciphertext.to_bytes())
        f.close()

        os.system("cd app/encrypt/bucket; hub buck push -y --session "+ SESSION_ID)

        # return metadata uri

        response = {
                'message': "Hello World",
                'uri': ''
            }

        return make_response(jsonify(response)), 200

    def get(self):
        "User should send Bob password to decrypt files"

        response = {
                'message': "Hello World"
            }

        return make_response(jsonify(response)), 200


encrypt_view = EncryptView.as_view("encrypt_view")

encrypt_blueprint.add_url_rule('/', view_func=encrypt_view, methods=['GET', 'POST'])
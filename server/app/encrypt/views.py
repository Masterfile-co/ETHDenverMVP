from . import encrypt_blueprint

from flask.views import MethodView
from flask import make_response, request, jsonify

class EncryptView(MethodView):

    def post(self):
        "User should post file and encryption keys for Enrico to encrypt"
        if request.files:
            image = request.files["artwork"]
            print(image.filename)
        
        response = {
                'message': "Hello World"
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
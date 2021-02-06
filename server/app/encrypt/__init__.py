from flask import Blueprint

# This instance of a Blueprint that represents the authentication blueprint
encrypt_blueprint = Blueprint('encrypt', __name__)

from . import views
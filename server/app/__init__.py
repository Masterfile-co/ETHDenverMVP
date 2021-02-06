from flask_api import FlaskAPI

from flask_cors import CORS
from instance.config import app_config

import os

def create_app(config_name):
    app = FlaskAPI(__name__, instance_relative_config=True)
    CORS(app)
    app.config.from_object(app_config[config_name])

    from .encrypt import encrypt_blueprint
    app.register_blueprint(encrypt_blueprint)

    return app
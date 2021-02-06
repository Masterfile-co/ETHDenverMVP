from dotenv import load_dotenv
load_dotenv()

import os

from app import create_app
# from flask_script import Manager

config_name = os.getenv('APP_SETTINGS')
app = create_app(config_name)

if __name__ == '__main__':
    app.run(host="0.0.0.0")
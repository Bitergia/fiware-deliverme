from flask import Flask, request, Response
import json
from os import path, listdir, getcwd

app = Flask(__name__)

@app.route("/api/login/<userpass>",methods = ['GET'])
def login(userpass):
    """ Check login for the user """
    # Not sure if we should return a token so the server could check always auth
    # If not modifying the client could be enough to get access to the service
    token = "fooltokentesting" 
    return token

@app.route("/api/deliverables/<dashboard>",methods = ['GET'])
def create_deliverable(deliverable):
    """ Create the deliverable and return a URL to access it """
    deliverable_url = ""
    return deliverable_url

@app.route("/api/deliverables",methods = ['GET'])
def get_dashboards():
    """Return a list with the deliverables available"""
    deliverables_path = '.'
    deliverables = [f for f in listdir(deliverables_path) if path.isfile(f) and f.endswith('.zip')]
    return json.dumps(deliverables)

if __name__ == "__main__":
    app.debug = True
    app.run()

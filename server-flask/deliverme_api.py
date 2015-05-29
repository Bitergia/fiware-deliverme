# Copyright (C) 2015 Bitergia
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
#
# Implementation of FIWARE deliverME REST API
#
# Authors:
#   Alvaro del Castillo <acs@bitergia.com>

import crypt, json, logging, subprocess, sys, traceback
from os import environ, path, listdir, getcwd, makedirs, rmdir

from flask import Flask, request, Response, abort

app = Flask(__name__)

def check_login(user, passwd):
    check = False
    authfile = "auth.conf"
    try:
        with open(authfile) as f:
            content = f.readlines()
        for login in content:
            if len(login.split(":")) != 2: continue # Not a user line
            if login.split(":")[0] == user:
                userpw = login.split(":")[1][:-1] # remove \n
                print passwd, userpw, crypt.crypt(passwd, userpw)
                if crypt.crypt(passwd, userpw) == userpw:
                    check = True
                    break
    except:
        logging.error("Auth file %s not readable: " + authfile)
        traceback.print_exc(file=sys.stdout)
    return check

def write_log(project, page, time, user):
    import json
    json_file = "./static/log/log.json"
    mydict = {"project":project, "page": page, "time": time, "user":user}

    with open(json_file) as f:
        data = json.load(f)
    data["entries"].append(mydict)

    with open(json_file, 'w') as f:
        json.dump(data, f)

def generate_deliverable(project, page, date):
    # deliverme_dir = "/home/acs/devel/fiware-deliverme"
    deliverme_dir = "../"
    # Move to apache later
    deliverables_dir = deliverme_dir + "/server-flask/static/deliverables"
    #deliverables_dir = "/var/www/deliverme/deliverables"
    tool_dir = deliverme_dir + "/wikitool"
    tool = tool_dir + "/bin/wikitool"

    # Check output dir exists
    if not path.isdir(deliverables_dir):
        makedirs(deliverables_dir)

    try:
        # Get WP name from deliverable name
        # D.X.Y -> WPX.Y
        aux = page.split(".")
        wp_name = "WP"+aux[1]+"."+aux[2]
        wp_dir = deliverables_dir+"/"+wp_name
    except:
        raise PackageNameError("foobar")

    #date_dir = date.replace('/','_').replace(':','_').replace(' ','__')
    wp_dir = wp_dir + '/' + date
    if not path.isdir(wp_dir):
        makedirs(wp_dir)

    cmd = "%s -d \"%s\" %s %s -z" % (tool, wp_dir, project, page)
    print("\n")
    print(cmd)
    print("\n")

    print cmd
    p = subprocess.Popen([cmd], stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                     shell = True, env=dict(environ, PYTHONPATH=tool_dir))

    out, err = p.communicate()

    if (str(err).rfind("No article page found") >= 0):
        rmdir(wp_dir)
        raise NoArticleFound("foobar")

    write_log(project, page, date, "anonymous")

    return out + "\n" + err

@app.route("/api/login",methods = ['GET'])
def login():
    """ Check login for the user """
    # Not sure if we should return a token so the server could check always auth
    # If not modifying the client could be enough to get access to the service
    user = request.args.get('username')
    passwd = request.args.get('password')

    if check_login(user, passwd):
        return ""
    else:
        abort(401)

@app.route("/api/deliverable",methods = ['GET'])
def create_deliverable():
    """ Create the deliverable and return a URL to access it """
    res = ""
    project = request.args.get('project')
    page = request.args.get('page')
    date = request.args.get('date')
    logging.info("Generating deliverable for %s in page %s at %s" % (project, page, date))

    try:
        res = generate_deliverable(project, page, date)
    except PackageNameError:
        res = Response("\n Wrong page name. \n It should be similar to D.6.1.3_FI-WARE_GE_Open_Specifications_front_page", status=502)
    except NoArticleFound:
        res = Response("\n There is currently no text in the wiki page you included. Are you sure that wiki page exists?", status=502)

    #if res == 1: # probs exit code 1
    #    res = Response("Problems generating the deliverable ", status=502)

    return res

@app.route("/api/deliverables",methods = ['GET'])
def get_dashboards():
    """Return a list with the deliverables available"""
    deliverables_path = '.'
    deliverables = [f for f in listdir(deliverables_path) if path.isfile(f) and f.endswith('.zip')]
    return json.dumps(deliverables)

class PackageNameError(Exception):
     def __init__(self, value):
         self.value = value
     def __str__(self):
         return repr(self.value)

class NoArticleFound(Exception):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)

if __name__ == "__main__":
    app.debug = True
    logging.basicConfig(level=logging.INFO,format='%(asctime)s %(message)s')
    app.run()

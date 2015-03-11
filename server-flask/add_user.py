#!/usr/bin/env python

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
# Simple tool to add user and password to a file
#
# Authors:
#   Alvaro del Castillo <acs@bitergia.com>


import crypt, getpass, os

auth_file = "auth.conf"

username = raw_input('login:')
cleartext = getpass.getpass()
salt = os.urandom(16).encode('base_64')
with open(auth_file, "a") as myfile:
    myfile.write(username+":"+crypt.crypt(cleartext,salt)+"\n")

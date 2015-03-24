# -*- coding: utf-8 -*-
#
# Copyright (C) 2014-2015 Bitergia
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
# Authors:
#     Luis Cañas-Díaz <lcanas@bitergia.com>
#

#http://docs.python-requests.org/en/latest/user/advanced/
from BeautifulSoup import BeautifulSoup
import requests
import tempfile
import os
import zipfile

#http://forge.fiware.org/plugins/mediawiki/wiki/fi-ware-private/index.php?title=D.6.1.3_FI-WARE_GE_Open_Specifications_front_page
class PackDeliverable(object):
    def __init__(self, args):
        self.root_url = self._composeRootURL(args.wiki_name, args.page_name)
        self.page_name = args.page_name
        self.user = args.wiki_user #useless
        self.password = args.wiki_password #useless
        self.dest_dir = args.dest_dir
        self.html_file_name = args.page_name + '.html'
        self.html_img_dir = args.page_name + '_images'
        self.compress = args.compress
        self.login_url = 'https://forge.fiware.org/account/login.php'
        self.soup = None
        self.html = ''

    def connect(self):
        headers = {'User-Agent': 'Mozilla/5.0'}
        payload = {'form_loginname': self.user, 'form_pw': self.password,
                'form_key':'c0da499ee5b0a7ea07d29fb3ee14ffdb',
                'login':'Login with SSL'}

        mysession = requests.Session()
        mysession.post(self.login_url,headers=headers,data=payload,verify=False)
        return mysession

    def _composeRootURL(self, wikiname, page_name):
        return 'https://forge.fiware.org/plugins/mediawiki/wiki/' + \
                wikiname + \
                '/index.php'

    def create_dir(self):
        if not os.path.exists(self.dest_dir):
            os.makedirs(self.dest_dir)
        img_path = '/'.join(['.',self.dest_dir,self.html_img_dir])
        if not os.path.exists(img_path):
            os.makedirs(img_path)

    def zipdir(self, path, zip):
        for root, dirs, files in os.walk(path):
            for file in files:
                zip.write(os.path.join(root, file))

    def handle_images(self, session):
        self.create_dir()
        images = self.soup.findAll('img')
        #download them
        if len(images) > 0: print("Downloading images ..")
        for img in images:
            img_src = 'https://forge.fiware.org' + img.get('src')
            img_name = img_src[img_src.rfind('/')+1:]
            aux = session.get(img_src)
            img_path = '/'.join(['.', self.dest_dir, self.html_img_dir, img_name])
            with open(img_path, "wb") as code:
                code.write(aux.content)

        #rename its path
        for img in images:
            #get directory path for each image
            aux_path = img.get('src') #/plugins/mediawiki/wiki/fi-ware-private/skins/common/images/
            path_img = aux_path[:aux_path.rfind('/')]
            img['src'] = img['src'].replace(path_img, self.html_img_dir)

    def filter_out(self):
        filter_this = [{'id':'column-one'},{'id':'footer'},{'id':'jump-to-nav'}]
        for f in filter_this:
            for div in self.soup.findAll('div', f):
                div.extract()

        filter_table = [{'id':'toc'}]
        for f in filter_table:
            for t in self.soup.findAll('table', f):
                t.extract()

    def dump_content(self):
        path = '/'.join(['.',self.dest_dir,self.html_file_name])
        fd = open(path, 'w')
        fd.write(self.soup.prettify())
        fd.close()

    def get_linked_pages(self):
        page_names = []

        tag_from = None
        for hs in self.soup.findAll('h1'):
            if (hs.getText().rfind('Structure of this Doc') >= 0):
                tag_from = hs
                break
        tag_to = tag_from.findNext('h1')

        cur = tag_from
        while (cur != tag_to):
            res = cur.find('a')
            #print cur
            if (res!=None and res !=-1):
                res2 = cur.findAll('a')
                for r in res2:
                    href = r['href']
                    aux_pname = href[href.rfind('/')+1:]
                    if (len(aux_pname)>0):
                        page_names.append(aux_pname)
            cur = cur.nextSibling

        return page_names

    def compose(self):
        session = self.connect()
        payload = {'title':self.page_name, 'printable':'yes'}
        r = session.get(self.root_url, params=payload, verify=False) #useless
        print("Main page being parsed ... ")
        self.html = r.content
        self.soup = BeautifulSoup(self.html)

        lpages = self.get_linked_pages()
        for lp in lpages:
            payload = {'title':lp, 'printable':'yes'}
            print("Including page: %s" % lp)
            r = session.get(self.root_url, params=payload)
            self.html = self.html + r.content

        self.soup = BeautifulSoup(self.html) #we overwrite the soup

        self.handle_images(session)
        self.filter_out()
        self.dump_content()
        if (self.compress):

            zip_file_name = self.page_name + '.zip'
            zip_file_path = '/'.join(['.',self.dest_dir, zip_file_name])
            html_file_path = '/'.join(['.',self.dest_dir,self.html_file_name])
            img_dir_path = '/'.join(['.', self.dest_dir, self.html_img_dir])

            zipf = zipfile.ZipFile(zip_file_path, 'w')
            zipf.write(html_file_path)
            self.zipdir(img_dir_path, zipf)
            zipf.close()
            print("Zip file generated with name %s" % (zip_file_path))

        print("-> Done!")

        session.close()

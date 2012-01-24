import random, string
from os import path

from google.appengine.ext import webapp, db
from google.appengine.ext.webapp import util, template
from django.utils import simplejson as json

from database import Abbrev

def render_template(s, file, context={}):
	s.response.out.write(template.render(path.join(path.dirname(__file__), 'templates', file), context))
	
def render_json(s, context):
	s.response.headers['Content-Type'] = 'application/json'
	s.response.out.write(json.dumps(context))
	
def generate_random_of_length(output_length):
	return ''.join(random.choice(string.ascii_uppercase + string.digits) for i in range(output_length))

class BaseHandler(webapp.RequestHandler):
	pass
		
class MainHandler(BaseHandler):
	def get(self):
		render_template(self, 'main_handler.html')
		
	def post(self):
		url = self.request.get('url')
		if url:
			abb = Abbrev.gql('WHERE user_link = :1', url).get()
			if abb:
				self._render_success(abb.user_link, abb.gen_str)
			else:
				try:
					gengen = self._make_unique_string()
					Abbrev(user_link=url, gen_str=gengen).put()
					self._render_success(url, gengen)
				except:
					self._render_error('Datastore Error')
		else:
			self._render_error('No Query')
			
	def _make_unique_string(self):
		jenny = generate_random_of_length(10)
		testy = Abbrev.gql('WHERE gen_str = :1', jenny).get()
		if testy:
			self._make_unique_string()
		else:
			return jenny
	
	def _render_success(self, req_url, res_url):
		render_json(self, {
			'status': 'success',
			'reqUrl': req_url,
			'resUrl': res_url
		})
	
	def _render_error(self, msg):
		render_json(self, {
			'status': 'error',
			'msg'   : msg + ' , try again!'
		})
			
class RedirectHandler(BaseHandler):
	def get(self, generated_string):
		go_url = '/'
		if generated_string:
			abb = Abbrev.gql('WHERE gen_str = :1', generated_string.upper()).get()
			if abb:
				go_url = abb.user_link
		self.redirect(go_url)

def main():
	util.run_wsgi_app(webapp.WSGIApplication([
		('/', MainHandler),
		('/l/(.*)', RedirectHandler),
	], debug = True))

if __name__ == "__main__":
	main()
from google.appengine.ext import db

class Abbrev(db.Model):
	user_link = db.LinkProperty(required=True)
	gen_str   = db.StringProperty(required=True)
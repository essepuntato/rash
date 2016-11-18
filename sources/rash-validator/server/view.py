"""Web.py's views."""
import web
import config

t_globals = dict(
    datestr=web.datestr,
)
render = web.template.render('templates/', cache=config.cache,
                             globals=t_globals)
render._keywords['globals']['render'] = render


def index():
    """Index page."""
    return render.index()

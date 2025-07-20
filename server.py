import flask
import flask_cors
import requests
from bs4 import BeautifulSoup

# 初始化Flask
app = flask.Flask(__name__)

# 爬虫API
class WebScraperAPI:
    def __init__(self):
        pass

    def url_with(self, vocab):
        """生成网页链接"""
        return f'https://dict.youdao.com/result?word={vocab}&lang=en'
    
    def fetch_translation(self, vocab):
        """爬取单词释义"""
        # 获取网页结构
        res = self.get_html(vocab)
        if res['ok']:
            return self.analyze(res['response'], vocab)
        else:
            # 返回了错误回应
            return res['response']

    def get_html(self, vocab):
        """获取网页结构"""
        url = self.url_with(vocab)
        try:
            res = requests.get(url=url)
            return {
                'response': res.text,
                'ok': True
            }
        except requests.exceptions.RequestException:
            # requests出现问题
            response = flask.jsonify({'error': '网络连接出现问题'})
            response.status_code = 503
            print(type(response))
            print(type(response) == flask.wrappers.Response)
            return {
                'response': response,
                'ok': False,
            }

    def analyze(self, html, vocab):
        """解析网页结构"""
        soup = BeautifulSoup(html, 'html.parser')
        # 尝试爬取释义部分
        try:
            ul = soup.find(class_ = 'basic').find_all(class_ = 'word-exp')
        except AttributeError:
            response = flask.jsonify({'error': f'未找到{vocab}'})
            response.status_code = 404
            return response
        # 遍历获取释义文字
        translation = ''
        for li in ul:
            translation += f'{li.get_text()}\n'
        return translation.removesuffix('\n') # 移除最末尾的换行

# 初始化爬虫API
app.web_scraper_api = WebScraperAPI()
flask_cors.CORS(app)

@app.route('/vocab/<vocab>')
def get_translation(vocab):
    translation = app.web_scraper_api.fetch_translation(vocab)
    return translation

@app.route('/input')
def home():
    return flask.render_template('input.html')

@app.route('/passageinput')
def passage_input():
    return flask.render_template('passage_input.html')

@app.route('/parent')
def parent():
    return flask.render_template('parent.html')

@app.route('/children')
def children():
    return flask.render_template('children.html')

app.run(host='0.0.0.0', port=50907, debug=True)

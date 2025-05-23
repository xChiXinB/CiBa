import flask
import flask_cors
import requests
from bs4 import BeautifulSoup

app = flask.Flask(__name__)
flask_cors.CORS(app)

@app.route('/vocab/<vocab>')
def get_translation(vocab):
    # 合成网站
    url = (f'https://dictionary.cambridge.org/zhs'
           f'/%E8%AF%8D%E5%85%B8/%E8%8B%B1%E8%AF%AD-%E6%B1%89%E8%AF%AD-%E7%AE%80%E4%BD%93/{vocab}')

    # Header
    header = {
        "User-Agent": "Mozilla / 5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 80.0.3987.122  Safari / 537.36"
    }

    # 爬取网站信息
    response = requests.get(url, headers=header)

    # 提取单词释义
    bs = BeautifulSoup(response.text, 'html.parser')
    translation = bs.find('meta', attrs={'itemprop': 'headline'}).attrs['content'][len(vocab) + 3 : -5]

    return translation

@app.route('/home')
def home():
    return flask.render_template("main.html")

app.run(debug=True, host='localhost', port=50907)
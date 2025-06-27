import flask
import flask_cors
from bs4 import BeautifulSoup
import time
import selenium.webdriver
from selenium.webdriver.edge.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

app = flask.Flask(__name__)

class WebScraperAPI:
    def __init__(self):
        # 初始化Edge浏览器
        self.options = Options()
        self.options.add_argument('--user-agent=Mozilla/...Edge/136...')
        self.edge_driver = selenium.webdriver.Edge()
        self.edge_driver.minimize_window()

        # 打开浏览器，准备输入词汇
        self.edge_driver.get(url='https://cn.bing.com/dict/')
        self.find_search_box()

        # 繁忙状态
        self.isBusy = False

    def find_search_box(self):
        # 重新定位搜索框
        self.search_box = WebDriverWait(self.edge_driver, 5).until(
            expected_conditions.visibility_of_element_located((By.NAME, 'q'))
        )

    def search(self, vocab):
        # 输入单词
        self.isBusy = True
        self.search_box.clear()
        self.search_box.send_keys(vocab)
        self.search_box.send_keys(Keys.RETURN)

        # 等待释义出现
        res = WebDriverWait(self.edge_driver, 5).until(
            expected_conditions.any_of(
                # 单词释义
                expected_conditions.visibility_of_element_located((By.CLASS_NAME, 'pos')),
                # 未找到单词释义
                expected_conditions.visibility_of_element_located((By.CLASS_NAME, 'no_results'))
            )
        )

        # 根据找到的元素进行相应处理
        if res.get_attribute('class') == 'pos':
            # 解析释义
            bs = BeautifulSoup(self.edge_driver.page_source, 'html.parser')
            ul = bs.find_all('ul')
            li = ul[2].find_all('li')
            response = ''
            for _ in li:
                text = _.get_text()
                if text[0:2] != '网络': # 剔除网络释义
                    response += f'{text}\n'
            response = response[0:-1]
        elif res.get_attribute('class') == 'no_results':
            response = '没有搜索结果'
        self.find_search_box()
        self.isBusy = False
        return response

# 初始化爬虫API
app.web_scraper_api = WebScraperAPI()
flask_cors.CORS(app)

@app.route('/vocab/<vocab>')
def get_translation(vocab):
    if app.web_scraper_api.isBusy:
        # Service Unavailable
        flask.abort(503)
    else:
        try:
            response = app.web_scraper_api.search(vocab)
        except Exception as e:
            print('出现了一个报错')
            print('------------------------------')
            print(e)
            print('------------------------------')
            flask.abort(500)
    return response

@app.route('/input')
def home():
    return flask.render_template("input.html")

app.run(host='0.0.0.0', port=50907, debug=False)

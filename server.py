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
flask_cors.CORS(app)

@app.route('/vocab/<vocab>')
def get_translation(vocab):
    """# 合成网站
    url = (f'https://www.bing.com/dict/{vocab}')

    # Header
    header = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
                  " Chrome/114.0.0.0 Safari/537.36",
    }

    # 爬取网站信息
    response = requests.get(url, headers=header)

    # 提取单词释义
    bs = BeautifulSoup(response.text, 'html.parser')
    # 处理no results
    no_res = bs.find_all('div', class_ = 'no_results')

    return translation"""
    # 初始化浏览器
    options = Options()
    options.add_argument('--user-agent=Mozilla/...Edge/136...')
    edge_driver = selenium.webdriver.Edge()

    # 操作浏览器
    edge_driver.get(url='https://cn.bing.com/dict/')
    searchbox = WebDriverWait(edge_driver, 5).until(
        expected_conditions.visibility_of_element_located((By.NAME, 'q'))
    )
    searchbox.clear()
    searchbox.send_keys(vocab)
    searchbox.send_keys(Keys.RETURN)

    # 抓取有用信息
    WebDriverWait(edge_driver, 5).until(
        expected_conditions.visibility_of_element_located((By.CLASS_NAME, 'pos'))
    )
    time.sleep(0.5) # 保险起见
    bs = BeautifulSoup(edge_driver.page_source, 'html.parser')
    ul = bs.find_all('ul')
    li = ul[2].find_all('li')
    response = ''
    for _ in li:
        text = _.get_text()
        if text[0:2] != '网络':
            response += f'{text}\n'
    response = response[0:-1]

    edge_driver.quit()
    return response

@app.route('/home')
def home():
    return flask.render_template("main.html")

app.run(debug=True, host='0.0.0.0', port=50907)
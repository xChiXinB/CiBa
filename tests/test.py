import requests
from bs4 import BeautifulSoup

class WebScraperAPI:
    def __init__(self):
        pass

    def url_with(self, vocab):
        """生成网页链接"""
        return f'https://dict.youdao.com/result?word={vocab}&lang=en'
    
    def fetch_translation(self, vocab):
        """爬取单词释义"""
        return self.analyze(self.get_html(vocab))

    def get_html(self, vocab):
        """获取网页结构"""
        url = self.url_with(vocab)
        try:
            res = requests.get(url=url)
        except:
            return 'Network errors'
        return res.text

    def analyze(self, html):
        """解析网页结构"""
        soup = BeautifulSoup(html, 'html.parser')
        # 尝试爬取释义部分
        try:
            ul = soup.find(class_ = 'basic').find_all(class_ = 'word-exp')
        except AttributeError:
            return 'No such vocab'
        # 遍历获取释义文字
        translation = ''
        for li in ul:
            translation += f'{li.get_text()}\n'
        return translation

print(WebScraperAPI().fetch_translation('set'))

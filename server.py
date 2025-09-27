import flask
import flask_cors
# 第三方库
from ECDICT_resources.stardict import DictCsv

# 初始化Flask
app = flask.Flask(__name__)
flask_cors.CORS(app)

# ECDICT库
ecdict = DictCsv(r'ECDICT_resources\ecdict.csv')

# API
@app.route('/vocab/<vocab>')
def get_translation(vocab):
    result = ecdict.query(vocab)
    if (result is None):
        response = flask.jsonify({'error': f'没有找到单词{vocab}'})
        response.status_code = 404
        return response
    return result['translation']

# 页面
@app.route('/input')
def home():
    return flask.render_template('input.html')

@app.route('/passageinput')
def passage_input():
    return flask.render_template('passage_input.html')

if __name__ == "__main__":
    # 写入文件，为了让cmd检查到程序启动
    with open("ok.txt", "w", encoding="utf-8") as signal_file:
        signal_file.write("_")

    app.run(host='0.0.0.0', port=50907, debug=False)

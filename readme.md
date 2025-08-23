# 词霸

欢迎使用词霸！这是一个旨在辅助学生整理生词并生成表格的本地网页。

---

# 主要功能
- [x] `Ctrl + C`和`Ctrl + V`一键整理单词
- [x] 从文章内一键摘抄生词
- [x] 随时随地删除单词、修改释义
- [x] 一键输出为Excel表格，轻松交作业

---

# 使用方法

## 环境配置
- Python 3
- Python依赖库：`pip install flask flask_cors requests bs4`

## 运行操作

### 第一步：下载项目

使用Github手动下载，或使用`git`来clone或fork仓库。

### 第二步：运行`server.py`文件

进入项目根目录，在终端内执行`python server.py`
该操作会在`localhost:50907`开放一个本地服务器；你也可以根据自己的喜好更改端口号。

### 第三步：访问本地服务器

浏览器输入`localhost:50907/input`（或你自己设置的端口号）即可使用！

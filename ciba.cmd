start python server.py

REM 轮询文件，判断服务器是否初始化完毕
:check
if not exist "ok.txt" (
    timeout /t 1
    goto check
)

del "ok.txt"

start http://localhost:50907/input
exit
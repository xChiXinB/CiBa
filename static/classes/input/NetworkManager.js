class NetworkManager {
    constructor() {
        
    }

    async fetchTranslation(word) {
        // 获取单词释义
        try {
            const res = await fetch(`http://${location.host}/vocab/${word}`, {
                headers: {
                    "Authorization": "Bearer abc123",
                },
            });
            if (!res.ok) {
                // 服务器返回错误信息
                const json_data = await res.json();
                console.log(json_data);
                throw new Error(json_data.error);
            } else {
                return res.text();
            }
        } catch (err) {
            console.log(err.message)
            throw new Error(err.message)
            // 将所有的报错统一转移到UserEventHandler处理
        }
    }
}

export {NetworkManager};

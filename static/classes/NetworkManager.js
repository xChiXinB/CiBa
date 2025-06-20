class NetworkManager {
    constructor() {
        
    }

    async fetchTranslation(word) {
        // 获取单词释义
        const res = await fetch(`http://${location.host}/vocab/${word}`, {
            headers: {
                "Authorization": "Bearer abc123",
            },
        });
        if (!res.ok) {
            throw new Error(`服务器返回${res.status} ${res.statusText}`);
        } else {
            return res.text();
        }
    }
}

export {NetworkManager};

// 通知系统测试文件
class NotificationTester {
    constructor() {
        this.renderer = null;
        this.testResults = [];
    }
    
    async runTests() {
        console.log('开始通知系统测试...');
        
        // 测试1：基本通知功能
        await this.testBasicNotification();
        
        // 测试2：多个通知的层级管理
        await this.testMultipleNotifications();
        
        // 测试3：通知自动清理
        await this.testAutoCleanup();
        
        // 测试4：错误处理
        await this.testErrorHandling();
        
        // 输出测试结果
        this.printResults();
    }
    
    async testBasicNotification() {
        try {
            this.renderer.notify('测试通知1');
            await this.wait(100);
            
            const notifications = document.querySelectorAll('.notification');
            if (notifications.length > 0) {
                this.testResults.push({ test: '基本通知', status: 'PASS' });
            } else {
                this.testResults.push({ test: '基本通知', status: 'FAIL' });
            }
        } catch (error) {
            this.testResults.push({ test: '基本通知', status: 'ERROR', error: error.message });
        }
    }
    
    async testMultipleNotifications() {
        try {
            // 快速发送多个通知
            for (let i = 0; i < 3; i++) {
                this.renderer.notify(`测试通知${i + 1}`);
                await this.wait(50);
            }
            
            await this.wait(200);
            
            const notificationElements = document.querySelectorAll('.notification-and-gap');
            if (notificationElements.length === 3) {
                this.testResults.push({ test: '多通知管理', status: 'PASS' });
            } else {
                this.testResults.push({ test: '多通知管理', status: 'FAIL' });
            }
        } catch (error) {
            this.testResults.push({ test: '多通知管理', status: 'ERROR', error: error.message });
        }
    }
    
    async testAutoCleanup() {
        try {
            // 等待通知自动清理
            await this.wait(6000);
            
            const notifications = document.querySelectorAll('.notification-and-gap');
            if (notifications.length === 0) {
                this.testResults.push({ test: '自动清理', status: 'PASS' });
            } else {
                this.testResults.push({ test: '自动清理', status: 'FAIL' });
            }
        } catch (error) {
            this.testResults.push({ test: '自动清理', status: 'ERROR', error: error.message });
        }
    }
    
    async testErrorHandling() {
        try {
            // 测试无效输入
            this.renderer.notify(null);
            this.renderer.notify(undefined);
            this.renderer.notify(123);
            
            // 如果程序没有崩溃，说明错误处理有效
            this.testResults.push({ test: '错误处理', status: 'PASS' });
        } catch (error) {
            this.testResults.push({ test: '错误处理', status: 'ERROR', error: error.message });
        }
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    printResults() {
        console.log('\n=== 通知系统测试结果 ===');
        this.testResults.forEach(result => {
            const status = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
            console.log(`${status} ${result.test}: ${result.status}`);
            if (result.error) {
                console.log(`   错误: ${result.error}`);
            }
        });
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const total = this.testResults.length;
        console.log(`\n总计: ${passed}/${total} 测试通过`);
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationTester;
} 
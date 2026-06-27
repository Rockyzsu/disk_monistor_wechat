# 项目介绍

### 监控linux系统磁盘剩余空间, 低于阈值发送微信提醒

### 使用
node.js > 16.x

把.env.example 改名为.env

里面填你的企业微信的API key,id

```json
WECHAT_CORPID=your-corpid-here
WECHAT_CORPSECRET=your-corpsecret-here
WECHAT_AGENTID=your-agentid-here
WECHAT_USERID=your-userid-here
HOSTNAME=your-hostname-here
```

env里修改阈值 : THRESHOLD_GB = 2 

初始化

```bash
npm i
```



运行

```bash
node src/index.js
```
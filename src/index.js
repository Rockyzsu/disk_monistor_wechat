const { exec } = require('child_process');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const THRESHOLD_GB = process.env.THRESHOLD_GB || 2;
const MOUNT_POINT = '/';

function getDiskFree(callback) {
  exec(`df -BG ${MOUNT_POINT}`, (error, stdout, stderr) => {
    if (error) {
      console.error('获取磁盘信息失败:', stderr || error.message);
      process.exit(1);
    }
    const lines = stdout.trim().split('\n');
    const dataLine = lines[1];
    if (!dataLine) {
      console.error('无法解析 df 输出');
      process.exit(1);
    }
    const parts = dataLine.split(/\s+/);
    const available = parseFloat(parts[3]);
    if (isNaN(available)) {
      console.error('解析磁盘可用空间失败');
      process.exit(1);
    }
    callback(available);
  });
}

function sendWeChatNotification(message) {
  const corpid = process.env.WECHAT_CORPID;
  const corpsecret = process.env.WECHAT_CORPSECRET;
  const agentid = process.env.WECHAT_AGENTID;
  const userid = process.env.WECHAT_USERID;

  if (!corpid || !corpsecret || !agentid || !userid) {
    console.error('请先配置 .env 文件中的 WECHAT_CORPID、WECHAT_CORPSECRET、WECHAT_AGENTID、WECHAT_USERID');
    process.exit(1);
  }


  axios.get(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`)
    .then(response => {
      const access_token = response.data.access_token;
      const json_dict = {
        touser: userid,
        msgtype: 'text',
        agentid: parseInt(agentid),
        text: { content: message },
        safe: 0,
        enable_id_trans: 0,
        enable_duplicate_check: 0,
        duplicate_check_interval: 1800
      };
      return axios.post(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`, json_dict);
    })
    .then(response => {
      if (response.data.errcode === 0) {
        console.log('消息发送成功');
      } else {
        console.error('消息发送失败:', response.data.errmsg);
      }
    })
    .catch(error => {
      console.error('请求出错:', error.message);
    });
}

getDiskFree((freeGB) => {
  console.log(`磁盘剩余空间: ${freeGB}GB`);
  if (freeGB < THRESHOLD_GB) {
    const message = `${process.env.HOSTNAME} 空间告警\n剩余空间: ${freeGB}GB\n`;
    sendWeChatNotification(message);
  } else {
    console.log('磁盘空间充足，无需通知');
  }
});

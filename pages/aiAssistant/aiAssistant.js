// pages/aiAssistant/aiAssistant.js
Page({
  data: {
    messages: [],
    inputValue: '',
    scrollTop: 0
  },

  onLoad: function (options) {
    // 初始化聊天记录
    this.initChat()
  },

  initChat: function () {
    // 添加欢迎消息
    const welcomeMessage = {
      id: Date.now(),
      content: '你好呀！我是你的AI智能助手，有什么可以帮你的吗？',
      sender: 'ai'
    }
    this.setData({
      messages: [welcomeMessage]
    })
  },

  onInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  sendMessage: function () {
    if (!this.data.inputValue.trim()) return

    // 添加用户消息到聊天记录
    const userMessage = {
      id: Date.now(),
      content: this.data.inputValue.trim(),
      sender: 'user'
    }

    const newMessages = this.data.messages.concat(userMessage)
    this.setData({
      messages: newMessages,
      inputValue: '',
      scrollTop: newMessages.length * 1000 // 滚动到底部
    })

    // 调用AI接口获取回复
    this.getAIResponse(userMessage.content)
  },

  getAIResponse: function (question) {
    // 这里可以替换为真实的AI API调用
    // 目前使用模拟回复
    setTimeout(() => {
      let response = ''
      
      // 根据问题类型生成不同的回复
      if (question.includes('天气')) {
        response = '今天天气晴朗，适合出去约会哦！'
      } else if (question.includes('电影')) {
        response = '最近上映的《恋爱日记》很适合情侣观看呢！'
      } else if (question.includes('美食')) {
        response = '推荐你们去尝试一下附近的意大利餐厅，那里的提拉米苏超好吃！'
      } else if (question.includes('纪念日')) {
        response = '纪念日记得准备一份特别的礼物，或者一起做一件有意义的事情哦！'
      } else {
        response = '谢谢你的提问，我正在学习中，会尽快给你更准确的答案！'
      }

      // 添加AI回复到聊天记录
      const aiMessage = {
        id: Date.now(),
        content: response,
        sender: 'ai'
      }

      const newMessages = this.data.messages.concat(aiMessage)
      this.setData({
        messages: newMessages,
        scrollTop: newMessages.length * 1000 // 滚动到底部
      })
    }, 1000) // 模拟网络延迟
  }
})
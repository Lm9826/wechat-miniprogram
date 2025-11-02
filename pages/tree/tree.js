// pages/tree/tree.js
Page({
  data: {
    currentEnergy: 0, // 当前能量值
    treeStage: 1, // 树木阶段（1: 小树苗, 2: 成长期, 3: 成熟期）
    growthProgress: 0, // 生长进度（0-100%）
    canCollect: true, // 是否可以收集能量
    nextCollectTime: '', // 下次收集时间
    growthLogs: [], // 生长日志
    stageRequirements: [0, 100, 300, 500] // 各阶段所需能量（索引0为初始阶段）
  },

  // 页面加载时执行
  onLoad() {
    this.loadTreeData()
    this.updateNextCollectTime()
    this.addGrowthLog('欢迎来到我们的爱情小树！', '刚刚')
  },

  // 页面显示时执行
  onShow() {
    this.checkCollectStatus()
  },

  // 加载本地存储的树木数据
  loadTreeData() {
    const treeData = wx.getStorageSync('loveTreeData')
    if (treeData) {
      this.setData({
        currentEnergy: treeData.currentEnergy || 0,
        treeStage: treeData.treeStage || 1,
        growthProgress: treeData.growthProgress || 0,
        growthLogs: treeData.growthLogs || []
      })
    }
  },

  // 保存树木数据到本地存储
  saveTreeData() {
    const { currentEnergy, treeStage, growthProgress, growthLogs } = this.data
    wx.setStorageSync('loveTreeData', {
      currentEnergy,
      treeStage,
      growthProgress,
      growthLogs
    })
  },

  // 检查是否可以收集能量
  checkCollectStatus() {
    const lastCollectTime = wx.getStorageSync('loveTreeLastCollectTime')
    const now = new Date().getTime()
    const oneDay = 24 * 60 * 60 * 1000

    if (lastCollectTime && now - lastCollectTime < oneDay) {
      this.setData({
        canCollect: false
      })
      this.updateNextCollectTime(lastCollectTime + oneDay)
    } else {
      this.setData({
        canCollect: true
      })
    }
  },

  // 更新下次收集时间显示
  updateNextCollectTime(nextTime = null) {
    if (!nextTime) {
      nextTime = new Date().getTime() + 24 * 60 * 60 * 1000
    }

    const time = new Date(nextTime)
    const hours = time.getHours().toString().padStart(2, '0')
    const minutes = time.getMinutes().toString().padStart(2, '0')
    this.setData({
      nextCollectTime: `${hours}:${minutes}`
    })
  },

  // 收集能量
  collectEnergy() {
    if (!this.data.canCollect) return

    // 随机获得5-20g能量
    const energyGained = Math.floor(Math.random() * 16) + 5
    const newEnergy = this.data.currentEnergy + energyGained

    this.setData({
      currentEnergy: newEnergy,
      canCollect: false
    })

    // 保存收集时间
    wx.setStorageSync('loveTreeLastCollectTime', new Date().getTime())
    this.updateNextCollectTime()

    // 添加生长日志
    this.addGrowthLog(`收集到${energyGained}g能量！`, '刚刚')

    // 触发收集动画
    this.triggerCollectAnimation()

    // 检查是否可以升级
    this.checkTreeUpgrade()

    // 保存数据
    this.saveTreeData()

    // 显示收集成功提示
    wx.showToast({
      title: `获得${energyGained}g能量`,
      icon: 'success',
      duration: 2000
    })
  },

  // 浇水
  waterTree() {
    if (this.data.currentEnergy < 10) {
      wx.showToast({
        title: '能量不足',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 消耗10g能量，增加5%生长进度
    const newEnergy = this.data.currentEnergy - 10
    let newProgress = this.data.growthProgress + 5

    // 确保进度不超过100%
    if (newProgress > 100) {
      newProgress = 100
    }

    this.setData({
      currentEnergy: newEnergy,
      growthProgress: newProgress
    })

    // 添加生长日志
    this.addGrowthLog('给小树浇了水，小树长大了一点！', '刚刚')

    // 触发浇水动画
    this.triggerWaterAnimation()

    // 检查是否可以升级
    this.checkTreeUpgrade()

    // 保存数据
    this.saveTreeData()

    // 显示浇水成功提示
    wx.showToast({
      title: '浇水成功',
      icon: 'success',
      duration: 2000
    })
  },

  // 检查是否可以升级树木
  checkTreeUpgrade() {
    const { treeStage, growthProgress, stageRequirements } = this.data

    // 如果当前阶段不是最高阶段，且进度达到100%
    if (treeStage < 3 && growthProgress >= 100) {
      const newStage = treeStage + 1
      this.setData({
        treeStage: newStage,
        growthProgress: 0 // 重置进度
      })

      // 添加生长日志
      const stageNames = ['', '小树苗', '成长期', '成熟期']
      this.addGrowthLog(`小树进入${stageNames[newStage]}啦！`, '刚刚')

      // 显示升级提示
      wx.showToast({
        title: `小树升级啦！现在是${stageNames[newStage]}`,
        icon: 'success',
        duration: 3000
      })

      // 保存数据
      this.saveTreeData()
    }
  },

  // 添加生长日志
  addGrowthLog(content, time = null) {
    if (!time) {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      time = `${hours}:${minutes}`
    }

    const newLog = {
      id: Date.now(),
      content,
      time
    }

    const newLogs = [newLog, ...this.data.growthLogs]
    // 只保留最近20条日志
    if (newLogs.length > 20) {
      newLogs.pop()
    }

    this.setData({
      growthLogs: newLogs
    })
  },

  // 触发收集能量动画
  triggerCollectAnimation() {
    const animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })

    animation.scale(1.3).step().scale(1).step()

    this.setData({
      animationData: animation.export()
    })
  },

  // 触发浇水动画
  triggerWaterAnimation() {
    const animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease-in-out',
    })

    animation.opacity(1).translateY(-50).opacity(0).step()

    this.setData({
      waterAnimation: animation.export()
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '我们的爱情小树',
      desc: '和TA一起种树，见证爱情的成长！',
      path: '/pages/tree/tree'
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadTreeData()
    this.checkCollectStatus()
    wx.stopPullDownRefresh()
  }
})
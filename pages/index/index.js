// index.js
// 使用本地默认头像，避免网络问题
const defaultAvatarUrl = '/images/avater.png'
const { pushService } = require('../../utils/pushService.js')
const WeatherService = require('../../utils/weatherService.js')

Page({
  data: {
    // 恋爱天数
    loveDays: 1314,
    // 用户头像
    userAvatars: [
      defaultAvatarUrl, // 用户1头像（当前登录用户）
      defaultAvatarUrl  // 用户2头像（伴侣）
    ],
    // 用户信息
    userInfo1: {
      avatarUrl: defaultAvatarUrl,
      nickName: '我'
    },
    userInfo2: {
      avatarUrl: defaultAvatarUrl,
      nickName: 'TA'
    },
    // 功能卡片
    features: [
      {
        id: 1,
        title: '我们的\n爱情小树',
        subtitle: '每天收集能量，\n见证在一起的\n每一天',
        icon: '🌳',
        bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        route: '/pages/tree/tree'
      },
      {
        id: 2,
        title: '写日记',
        subtitle: '用照片记录美好瞬间',
        icon: '📝',
        bgColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        route: '/pages/diary/diary'
      },
      {
        id: 3,
        title: '倒数日',
        subtitle: '不再错过重要的日子',
        icon: '📅',
        bgColor: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
        route: '/pages/countdown/countdown'
      },
      {
        id: 4,
        title: '珍藏册',
        subtitle: '记忆都在这里',
        icon: '📸',
        bgColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        route: '/pages/album/album'
      },
      {
        id: 5,
        title: '礼物柜',
        subtitle: '收到的礼物记录一下',
        icon: '🎁',
        bgColor: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        route: '/pages/gifts/gifts'
      }
    ],
    // 推送设置
    dailyPushSubscribed: false,
    sendKey: '',
    showSendKeyInput: false,
    // 位置信息
    userLocation: {
      city: '获取中...',
      district: '',
      province: '',
      latitude: null,
      longitude: null
    },
    locationLoading: false,
    // 天气信息
    weatherInfo: {
      temperature: '',
      condition: '',
      humidity: '',
      windSpeed: '',
      windDir: '',
      icon: ''
    },
    weatherLoading: false
  },

  onLoad() {
    this.calculateLoveDays()
    this.loadUserAvatars()
    this.checkSubscribeStatus()

    // 检查是否在电脑端，如果是则使用默认位置
    const systemInfo = wx.getSystemInfoSync()
    if (systemInfo.platform === 'devtools' || systemInfo.platform === 'windows') {
      console.log('检测到电脑端环境，使用默认位置')
      this.setData({
        userLocation: {
          city: '北京',
          district: '朝阳区',
          province: '北京市',
          latitude: 39.9042,
          longitude: 116.4074
        }
      })

      // 保存位置信息到本地存储
      wx.setStorageSync('userLocation', {
        city: '北京',
        district: '朝阳区',
        province: '北京市',
        latitude: 39.9042,
        longitude: 116.4074,
        timestamp: Date.now()
      })

      // 获取天气信息
      this.getWeatherInfo()
    } else {
      this.getUserLocation()
    }
  },

  // 返回按钮点击事件
  goBack() {
    // 由于这是首页，可以选择不同的处理方式
    wx.showModal({
      title: '提示',
      content: '确定要退出恋爱日记吗？',
      success: (res) => {
        if (res.confirm) {
          // 可以选择关闭小程序或者其他操作
          wx.showToast({
            title: '感谢使用',
            icon: 'none'
          })
        }
      }
    })
  },

  // 加载用户头像和昵称
  loadUserAvatars() {
    // 从本地存储获取用户信息
    const user1Avatar = wx.getStorageSync('user1Avatar')
    const user2Avatar = wx.getStorageSync('user2Avatar')
    const user1NickName = wx.getStorageSync('user1NickName')
    const user2NickName = wx.getStorageSync('user2NickName')

    this.setData({
      'userAvatars[0]': user1Avatar || defaultAvatarUrl,
      'userAvatars[1]': user2Avatar || defaultAvatarUrl,
      'userInfo1.avatarUrl': user1Avatar || defaultAvatarUrl,
      'userInfo2.avatarUrl': user2Avatar || defaultAvatarUrl,
      'userInfo1.nickName': user1NickName || '我',
      'userInfo2.nickName': user2NickName || 'TA'
    })
  },

  // 选择用户1头像
  chooseUser1Avatar() {
    this.chooseAvatar(0, 'user1Avatar', 'userInfo1.avatarUrl')
  },

  // 选择用户2头像
  chooseUser2Avatar() {
    this.chooseAvatar(1, 'user2Avatar', 'userInfo2.avatarUrl')
  },

  // 通用选择头像方法
  chooseAvatar(index, storageKey, dataKey) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath

        // 保存到本地存储
        wx.setStorageSync(storageKey, tempFilePath)

        // 更新页面数据
        this.setData({
          [`userAvatars[${index}]`]: tempFilePath,
          [dataKey]: tempFilePath
        })

        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('选择头像失败:', err)
        wx.showToast({
          title: '选择头像失败',
          icon: 'none'
        })
      }
    })
  },

  // 用户1选择头像（使用新的微信头像选择接口）
  onChooseUser1Avatar(e) {
    const { avatarUrl } = e.detail

    // 保存头像
    wx.setStorageSync('user1Avatar', avatarUrl)

    this.setData({
      'userAvatars[0]': avatarUrl,
      'userInfo1.avatarUrl': avatarUrl
    })

    wx.showToast({
      title: '头像更新成功',
      icon: 'success'
    })
  },

  // 获取微信用户信息（用于用户1）
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo

        // 保存用户信息
        wx.setStorageSync('user1Avatar', userInfo.avatarUrl)
        wx.setStorageSync('user1NickName', userInfo.nickName)

        this.setData({
          'userAvatars[0]': userInfo.avatarUrl,
          'userInfo1.avatarUrl': userInfo.avatarUrl,
          'userInfo1.nickName': userInfo.nickName
        })

        wx.showToast({
          title: '获取信息成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        wx.showToast({
          title: '获取信息失败',
          icon: 'none'
        })
      }
    })
  },

  // 用户1昵称输入
  onUser1NickNameChange(e) {
    const nickName = e.detail.value

    // 保存昵称
    wx.setStorageSync('user1NickName', nickName)

    this.setData({
      'userInfo1.nickName': nickName
    })
  },

  // 用户2昵称输入
  onUser2NickNameChange(e) {
    const nickName = e.detail.value

    // 保存昵称
    wx.setStorageSync('user2NickName', nickName)

    this.setData({
      'userInfo2.nickName': nickName
    })
  },

  // 计算恋爱天数
  calculateLoveDays() {
    // 这里可以设置恋爱开始的日期
    const startDate = new Date('2022-12-10')
    const today = new Date()

    // 只比较日期部分，不考虑具体时间
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const timeDiff = todayOnly.getTime() - startDateOnly.getTime()
    const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24)) // 使用round四舍五入，避免精度问题

    this.setData({
      loveDays: daysDiff
    })
  },

  // 点击功能卡片
  onFeatureClick(e) {
    const featureId = e.currentTarget.dataset.id
    const feature = this.data.features.find(f => f.id === featureId)

    if (feature) {
      if (feature.route === '/pages/diary/diary') {
        wx.switchTab({
          url: '/pages/diary/diary'
        })
      } else if (feature.route === '/pages/countdown/countdown') {
        wx.navigateTo({
          url: '/pages/countdown/countdown'
        })
      } else {
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        })
      }
    }
  },

  // 显示SendKey输入框
  showSendKeyInput() {
    this.setData({
      showSendKeyInput: true
    })
  },

  // 隐藏SendKey输入框
  hideSendKeyInput() {
    this.setData({
      showSendKeyInput: false
    })
  },

  // SendKey输入变化
  onSendKeyInput(e) {
    this.setData({
      sendKey: e.detail.value
    })
  },

  // 保存SendKey
  saveSendKey() {
    const { sendKey } = this.data
    if (!sendKey.trim()) {
      wx.showToast({
        title: '请输入SendKey',
        icon: 'none'
      })
      return
    }

    pushService.setSendKey(sendKey.trim())
    this.setData({
      showSendKeyInput: false,
      dailyPushSubscribed: true
    })

    wx.showToast({
      title: '设置成功',
      icon: 'success'
    })
  },

  // 测试推送
  async testPush() {
    try {
      const result = await pushService.sendDailyReminder()
      if (result.success) {
        wx.showToast({
          title: '推送成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('推送错误:', error)
      wx.showToast({
        title: error.message || '推送失败',
        icon: 'none'
      })
    }
  },

  // 取消订阅
  unsubscribeDailyPush() {
    pushService.setSendKey('')
    this.setData({
      dailyPushSubscribed: false
    })
    wx.showToast({
      title: '已取消订阅',
      icon: 'success'
    })
  },

  // 检查订阅状态
  checkSubscribeStatus() {
    const sendKey = pushService.getSendKey()
    this.setData({
      dailyPushSubscribed: !!sendKey
    })

    // 如果已经有SendKey，自动设置为已订阅状态
    if (sendKey) {
      this.setData({
        dailyPushSubscribed: true
      })
    }
  },

  // 获取用户位置
  async getUserLocation() {
    console.log('开始获取用户位置...')
    this.setData({
      locationLoading: true
    })

    try {
      // 检查当前运行环境
      const systemInfo = wx.getSystemInfoSync()
      console.log('系统信息:', systemInfo)

      // 如果是电脑端，提供特殊处理
      if (systemInfo.platform === 'devtools' || systemInfo.platform === 'windows') {
        console.log('检测到电脑端环境，使用默认位置')
        this.setData({
          userLocation: {
            city: '北京',
            district: '朝阳区',
            province: '北京市',
            latitude: 39.9042,
            longitude: 116.4074
          },
          locationLoading: false
        })

        // 保存位置信息到本地存储
        wx.setStorageSync('userLocation', {
          city: '北京',
          district: '朝阳区',
          province: '北京市',
          latitude: 39.9042,
          longitude: 116.4074,
          timestamp: Date.now()
        })

        // 获取天气信息
        await this.getWeatherInfo()

        wx.showToast({
          title: '使用默认位置（北京）',
          icon: 'success'
        })
        return
      }

      // 检查定位权限
      const setting = await wx.getSetting()
      console.log('当前权限设置:', setting)

      if (setting.authSetting['scope.userLocation'] === false) {
        // 用户之前拒绝了定位权限
        console.log('用户之前拒绝了定位权限')
        this.setData({
          userLocation: {
            city: '定位权限被拒绝',
            district: '',
            province: '',
            latitude: null,
            longitude: null
          },
          locationLoading: false
        })

        wx.showModal({
          title: '需要定位权限',
          content: '为了获取准确的天气信息，需要获取您的位置信息。请在设置中开启定位权限。',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
        return
      }

      // 请求定位权限
      if (!setting.authSetting['scope.userLocation']) {
        console.log('请求定位权限...')
        const authResult = await wx.authorize({
          scope: 'scope.userLocation'
        })
        console.log('定位权限授权结果:', authResult)
      }

      // 获取位置信息
      console.log('开始获取位置...')
      const location = await wx.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        highAccuracyExpireTime: 5000
      })

      console.log('获取位置成功:', location)

      // 检查位置数据是否有效
      if (!location || typeof location.latitude === 'undefined' || typeof location.longitude === 'undefined') {
        throw new Error('获取位置数据失败，位置信息不完整')
      }

      // 根据经纬度获取城市信息
      const cityInfo = await this.getCityByLocation(location.latitude, location.longitude)

      this.setData({
        userLocation: {
          city: cityInfo.city || '未知城市',
          district: cityInfo.district || '',
          province: cityInfo.province || '',
          latitude: location.latitude,
          longitude: location.longitude
        },
        locationLoading: false
      })

      // 保存位置信息到本地存储
      wx.setStorageSync('userLocation', {
        city: cityInfo.city || '未知城市',
        district: cityInfo.district || '',
        province: cityInfo.province || '',
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now()
      })

      // 获取天气信息
      await this.getWeatherInfo()

      wx.showToast({
        title: '位置获取成功',
        icon: 'success'
      })

    } catch (error) {
      console.error('获取位置失败:', error)

      let errorMsg = '获取位置失败'
      if (error.message) {
        if (error.message.includes('位置信息不完整')) {
          errorMsg = '位置信息获取不完整，请重试'
        } else if (error.message.includes('auth deny')) {
          errorMsg = '定位权限被拒绝'
        } else if (error.message.includes('timeout')) {
          errorMsg = '定位超时，请检查GPS'
        } else if (error.message.includes('network')) {
          errorMsg = '网络连接失败'
        }
      } else if (error.errMsg) {
        if (error.errMsg.includes('auth deny')) {
          errorMsg = '定位权限被拒绝'
        } else if (error.errMsg.includes('timeout')) {
          errorMsg = '定位超时，请检查GPS'
        } else if (error.errMsg.includes('network')) {
          errorMsg = '网络连接失败'
        }
      }

      // 如果是电脑端，提供默认位置作为备选
      const systemInfo = wx.getSystemInfoSync()
      if (systemInfo.platform === 'devtools' || systemInfo.platform === 'windows') {
        console.log('电脑端定位失败，使用默认位置')
        this.setData({
          userLocation: {
            city: '北京',
            district: '朝阳区',
            province: '北京市',
            latitude: 39.9042,
            longitude: 116.4074
          },
          locationLoading: false
        })

        wx.showToast({
          title: '使用默认位置（北京）',
          icon: 'success'
        })

        // 获取天气信息
        await this.getWeatherInfo()
        return
      }

      this.setData({
        userLocation: {
          city: errorMsg,
          district: '',
          province: '',
          latitude: null,
          longitude: null
        },
        locationLoading: false
      })

      wx.showToast({
        title: errorMsg,
        icon: 'none'
      })
    }
  },

  // 根据经纬度获取城市信息
  async getCityByLocation(latitude, longitude) {
    try {
      return await WeatherService.getCityByLocation(latitude, longitude)
    } catch (error) {
      console.error('获取城市信息失败:', error)
      return {
        city: '未知城市',
        district: '',
        province: ''
      }
    }
  },

  // 手动刷新位置
  refreshLocation() {
    console.log('手动刷新位置')
    this.getUserLocation()
  },

  // 获取天气信息
  async getWeatherInfo(forceRefresh = false) {
    console.log('开始获取天气信息...', forceRefresh ? '(强制刷新)' : '')
    this.setData({
      weatherLoading: true
    })

    try {
      const { userLocation } = this.data

      if (userLocation.latitude && userLocation.longitude) {
        const weatherData = await WeatherService.getCompleteWeatherInfo(
          userLocation.latitude,
          userLocation.longitude,
          forceRefresh
        )

        console.log('天气信息获取成功:', weatherData)

        this.setData({
          weatherInfo: {
            temperature: weatherData.weather.temperature,
            condition: weatherData.weather.condition,
            humidity: weatherData.weather.humidity,
            windSpeed: weatherData.weather.windSpeed,
            windDir: weatherData.weather.windDir,
            icon: this.getWeatherIcon(weatherData.weather.condition),
            feelsLike: weatherData.weather.feelsLike,
            pressure: weatherData.weather.pressure,
            visibility: weatherData.weather.visibility,
            cloudCover: weatherData.weather.cloudCover,
            dewPoint: weatherData.weather.dewPoint,
            precipitation: weatherData.weather.precipitation,
            windScale: weatherData.weather.windScale
          },
          weatherLoading: false
        })

        // 检查是否使用了备用数据
        if (WeatherService.weatherCache.data && WeatherService.weatherCache.city === userLocation.city) {
          wx.showToast({
            title: '天气获取成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: '使用备用天气数据',
            icon: 'none'
          })
        }
      } else {
        console.log('没有位置信息，无法获取天气')
        this.setData({
          weatherLoading: false
        })

        wx.showToast({
          title: '请先获取位置信息',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取天气信息失败:', error)
      this.setData({
        weatherLoading: false
      })

      let errorMessage = '天气获取失败'
      if (error.message) {
        if (error.message.includes('API错误')) {
          errorMessage = '天气服务暂时不可用'
        } else if (error.message.includes('网络')) {
          errorMessage = '网络连接失败'
        }
      }

      wx.showToast({
        title: errorMessage,
        icon: 'none'
      })
    }
  },

  // 根据天气状况获取图标
  getWeatherIcon(condition) {
    const iconMap = {
      '晴天': '☀️',
      '多云': '⛅',
      '阴天': '☁️',
      '小雨': '🌧️',
      '中雨': '🌧️',
      '大雨': '⛈️',
      '雪': '❄️',
      '雾': '🌫️',
      '晴': '☀️',
      '多云': '⛅',
      '阴': '☁️',
      '雨': '🌧️',
      '雪': '❄️'
    }
    return iconMap[condition] || '🌤️'
  },

  // 刷新天气信息
  refreshWeather() {
    console.log('手动刷新天气')
    this.getWeatherInfo(true) // 强制刷新
  },

  // 测试天气API
  async testWeatherAPI() {
    try {
      // 先检查网络状态
      const networkType = await this.getNetworkType()
      console.log('当前网络类型:', networkType)

      const result = await WeatherService.testWeatherAPI('北京')
      console.log('API测试结果:', result)

      if (result.success) {
        wx.showToast({
          title: 'API连接正常',
          icon: 'success'
        })
      } else {
        let errorContent = 'API连接失败'
        if (result.error) {
          if (result.error.message) {
            errorContent = result.error.message
          } else if (typeof result.error === 'string') {
            errorContent = result.error
          } else {
            errorContent = JSON.stringify(result.error)
          }
        }

        // 添加网络状态信息
        if (networkType !== 'wifi' && networkType !== 'unknown') {
          errorContent += `\n\n当前网络: ${networkType}`
        }

        // 添加域名配置提示
        if (result.error && result.error.code === '403') {
          errorContent += '\n\n可能的解决方案：\n1. 检查API密钥是否正确\n2. 确认小程序已配置域名白名单\n3. 检查API密钥是否已激活'
        }

        wx.showModal({
          title: 'API测试结果',
          content: errorContent,
          showCancel: false
        })
      }
    } catch (error) {
      console.error('API测试失败:', error)
      wx.showToast({
        title: 'API测试失败',
        icon: 'none'
      })
    }
  },

  // 诊断API密钥
  async diagnoseAPI() {
    try {
      wx.showLoading({
        title: '诊断中...'
      })

      // 检查网络权限
      const networkType = await this.getNetworkType()

      const diagnosis = await WeatherService.diagnoseAPIKey()
      console.log('API诊断结果:', diagnosis)

      wx.hideLoading()

      let content = `API密钥诊断结果：\n\n`
      content += `密钥长度: ${diagnosis.keyLength}位\n`
      content += `密钥格式: ${diagnosis.keyFormat}\n\n`

      content += `网络状态：\n`
      content += `类型: ${networkType}\n\n`

      if (diagnosis.networkTest) {
        content += `网络连接测试：\n`
        content += `结果: ${diagnosis.networkTest.success ? '成功' : '失败'}\n`
        if (diagnosis.networkTest.statusCode) {
          content += `状态码: ${diagnosis.networkTest.statusCode}\n`
        }
        if (diagnosis.networkTest.error) {
          content += `错误: ${diagnosis.networkTest.error}\n`
        }
        content += `\n`
      }

      if (diagnosis.testResults) {
        content += `API测试结果：\n`
        diagnosis.testResults.forEach((result, index) => {
          content += `${index + 1}. ${result.endpoint}\n`
          content += `   状态码: ${result.statusCode}\n`
          content += `   结果: ${result.success ? '成功' : '失败'}`
          if (result.error) {
            content += `\n   错误: ${result.error}`
          }
          if (result.data && result.data.code) {
            content += `\n   返回码: ${result.data.code}`
            if (result.data.message) {
              content += `\n   消息: ${result.data.message}`
            }
          }
          content += `\n\n`
        })
      }

      // 添加建议
      if (diagnosis.networkTest && !diagnosis.networkTest.success) {
        content += `\n建议：\n`
        content += `1. 检查网络连接\n`
        content += `2. 确认小程序有网络权限\n`
        content += `3. 检查域名白名单配置\n`
      } else if (diagnosis.testResults && diagnosis.testResults.every(r => !r.success)) {
        content += `\n建议：\n`
        content += `1. 检查API密钥是否正确\n`
        content += `2. 确认API密钥已激活\n`
        content += `3. 检查API调用权限\n`
        content += `4. 联系和风天气客服\n`
      }

      wx.showModal({
        title: 'API诊断结果',
        content: content,
        showCancel: false
      })
    } catch (error) {
      wx.hideLoading()
      console.error('API诊断失败:', error)
      wx.showToast({
        title: '诊断失败',
        icon: 'none'
      })
    }
  },

  // 获取网络类型
  async getNetworkType() {
    try {
      const networkType = await wx.getNetworkType()
      return networkType.networkType
    } catch (error) {
      console.error('获取网络类型失败:', error)
      return 'unknown'
    }
  },

  // 选择城市（电脑端使用）
  selectCity() {
    const cities = [
      { name: '北京', latitude: 39.9042, longitude: 116.4074, district: '朝阳区', province: '北京市' },
      { name: '上海', latitude: 31.2304, longitude: 121.4737, district: '浦东新区', province: '上海市' },
      { name: '广州', latitude: 23.1291, longitude: 113.2644, district: '天河区', province: '广东省' },
      { name: '深圳', latitude: 22.5431, longitude: 114.0579, district: '南山区', province: '广东省' },
      { name: '杭州', latitude: 30.2741, longitude: 120.1551, district: '西湖区', province: '浙江省' }
    ]

    wx.showActionSheet({
      itemList: cities.map(city => city.name),
      success: (res) => {
        const selectedCity = cities[res.tapIndex]
        this.setData({
          userLocation: {
            city: selectedCity.name,
            district: selectedCity.district,
            province: selectedCity.province,
            latitude: selectedCity.latitude,
            longitude: selectedCity.longitude
          }
        })

        // 保存位置信息到本地存储
        wx.setStorageSync('userLocation', {
          city: selectedCity.name,
          district: selectedCity.district,
          province: selectedCity.province,
          latitude: selectedCity.latitude,
          longitude: selectedCity.longitude,
          timestamp: Date.now()
        })

        // 获取天气信息
        this.getWeatherInfo(true)

        wx.showToast({
          title: `已选择${selectedCity.name}`,
          icon: 'success'
        })
      }
    })
  },


})

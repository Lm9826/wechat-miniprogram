// weatherService.js
// 天气服务

const WeatherService = {
    // 缓存天气数据
    weatherCache: {
        data: null,
        timestamp: 0,
        city: ''
    },

    // 根据经纬度获取城市信息
    async getCityByLocation(latitude, longitude) {
        try {
            console.log('获取城市信息:', latitude, longitude)

            // 使用和风天气的地理编码API获取真实城市信息
            const apiKey = '97abae6c60f04c23849c7018851a6b93' // 您的和风天气API密钥
            const baseUrl = 'https://geoapi.qweather.com/v2'

            const response = await wx.request({
                url: `${baseUrl}/city/lookup?location=${encodeURIComponent(`${latitude},${longitude}`)}&key=${apiKey}`,
                method: 'GET',
                timeout: 10000 // 10秒超时
            })

            console.log('地理编码API响应:', response)

            if (response.statusCode === 200 && response.data && response.data.code === '200') {
                const locationData = response.data.location[0]
                return {
                    city: locationData.name,
                    district: locationData.adm2, // 区县
                    province: locationData.adm1, // 省份
                    country: locationData.country,
                    id: locationData.id
                }
            } else {
                console.error('地理编码API返回错误:', response.statusCode, response.data)
                // 如果API调用失败，使用备用方案
                return await this.getCityByLocationFallback(latitude, longitude)
            }
        } catch (error) {
            console.error('获取城市信息失败:', error)
            // 如果网络请求失败，使用备用方案
            return await this.getCityByLocationFallback(latitude, longitude)
        }
    },

    // 备用方案：使用其他地理编码服务
    async getCityByLocationFallback(latitude, longitude) {
        try {
            console.log('使用备用地理编码服务:', latitude, longitude)

            // 使用高德地图API作为备用方案
            const response = await wx.request({
                url: 'https://restapi.amap.com/v3/geocode/regeo',
                method: 'GET',
                data: {
                    key: 'your_amap_key', // 需要申请高德地图API密钥
                    location: `${longitude},${latitude}`,
                    output: 'json'
                }
            })

            if (response.statusCode === 200 && response.data.status === '1') {
                const addressComponent = response.data.regeocode.addressComponent
                return {
                    city: addressComponent.city || addressComponent.district,
                    district: addressComponent.district,
                    province: addressComponent.province,
                    country: '中国'
                }
            }
        } catch (error) {
            console.error('备用地理编码服务失败:', error)
        }

        // 如果所有API都失败，返回基于经纬度的估算
        return this.estimateCityByCoordinates(latitude, longitude)
    },

    // 基于经纬度估算城市（最后的备用方案）
    estimateCityByCoordinates(latitude, longitude) {
        console.log('使用经纬度估算城市:', latitude, longitude)

        // 中国主要城市的经纬度范围
        const cityRanges = [
            { name: '北京', latRange: [39.4, 40.4], lngRange: [115.7, 117.4], district: '朝阳区', province: '北京市' },
            { name: '上海', latRange: [30.7, 31.9], lngRange: [120.9, 122.2], district: '浦东新区', province: '上海市' },
            { name: '广州', latRange: [22.5, 23.6], lngRange: [113.0, 114.5], district: '天河区', province: '广东省' },
            { name: '深圳', latRange: [22.3, 22.8], lngRange: [113.7, 114.6], district: '南山区', province: '广东省' },
            { name: '杭州', latRange: [29.9, 30.5], lngRange: [119.9, 120.5], district: '西湖区', province: '浙江省' },
            { name: '南京', latRange: [31.9, 32.3], lngRange: [118.6, 119.2], district: '鼓楼区', province: '江苏省' },
            { name: '武汉', latRange: [30.3, 30.8], lngRange: [114.0, 114.6], district: '武昌区', province: '湖北省' },
            { name: '成都', latRange: [30.4, 30.9], lngRange: [103.8, 104.3], district: '锦江区', province: '四川省' },
            { name: '西安', latRange: [34.1, 34.5], lngRange: [108.7, 109.2], district: '雁塔区', province: '陕西省' },
            { name: '重庆', latRange: [29.3, 30.2], lngRange: [106.2, 107.0], district: '渝中区', province: '重庆市' }
        ]

        // 找到最匹配的城市
        for (const city of cityRanges) {
            if (latitude >= city.latRange[0] && latitude <= city.latRange[1] &&
                longitude >= city.lngRange[0] && longitude <= city.lngRange[1]) {
                return {
                    city: city.name,
                    district: city.district,
                    province: city.province,
                    country: '中国'
                }
            }
        }

        // 如果没有匹配的城市，返回最近的
        let nearestCity = cityRanges[0]
        let minDistance = Infinity

        for (const city of cityRanges) {
            const cityLat = (city.latRange[0] + city.latRange[1]) / 2
            const cityLng = (city.lngRange[0] + city.lngRange[1]) / 2
            const distance = Math.sqrt(Math.pow(latitude - cityLat, 2) + Math.pow(longitude - cityLng, 2))

            if (distance < minDistance) {
                minDistance = distance
                nearestCity = city
            }
        }

        return {
            city: nearestCity.name,
            district: nearestCity.district,
            province: nearestCity.province,
            country: '中国'
        }
    },

    // 根据城市获取天气信息
    async getWeatherByCity(city) {
        try {
            console.log('获取天气信息:', city)

            // 检查缓存，如果缓存时间在30分钟内且是同一个城市，直接返回缓存数据
            const now = Date.now()
            const cacheValid = (now - this.weatherCache.timestamp) < 30 * 60 * 1000 // 30分钟
            if (this.weatherCache.data && cacheValid && this.weatherCache.city === city) {
                console.log('使用缓存的天气数据:', this.weatherCache.data)
                return this.weatherCache.data
            }

            // 使用和风天气API获取真实天气信息
            const apiKey = '97abae6c60f04c23849c7018851a6b93'
            const baseUrl = 'https://devapi.qweather.com/v7'

            const response = await wx.request({
                url: `${baseUrl}/weather/now?location=${encodeURIComponent(city)}&key=${apiKey}&unit=m`,
                method: 'GET',
                timeout: 10000 // 10秒超时
            })

            console.log('天气API响应:', response)

            if (response.statusCode === 200 && response.data && response.data.code === '200') {
                const weatherData = response.data.now
                const result = {
                    temperature: weatherData.temp,
                    condition: weatherData.text,
                    humidity: weatherData.humidity,
                    windSpeed: weatherData.windSpeed,
                    windDir: weatherData.windDir,
                    icon: weatherData.icon,
                    feelsLike: weatherData.feelsLike,
                    pressure: weatherData.pressure,
                    visibility: weatherData.vis,
                    cloudCover: weatherData.cloud,
                    dewPoint: weatherData.dew,
                    precipitation: weatherData.precip,
                    windScale: weatherData.windScale,
                    wind360: weatherData.wind360
                }

                // 缓存真实天气数据
                this.weatherCache = {
                    data: result,
                    timestamp: now,
                    city: city
                }

                console.log('获取到真实天气数据:', result)
                return result
            } else {
                console.error('天气API返回错误:', response.statusCode, response.data)
                // 如果API调用失败，使用备用方案
                return this.getFallbackWeatherData(city)
            }
        } catch (error) {
            console.error('获取天气信息失败:', error)
            // 如果网络请求失败，使用备用方案
            return this.getFallbackWeatherData(city)
        }
    },

    // 备用天气数据（当API不可用时使用）
    getFallbackWeatherData(city) {
        console.log('使用备用天气数据:', city)

        // 基于城市和当前时间生成相对稳定的天气数据
        const now = new Date()
        const hour = now.getHours()
        const month = now.getMonth() + 1

        // 根据季节和城市调整温度范围
        let tempRange = [15, 25] // 默认15-25度
        if (month >= 3 && month <= 5) { // 春季
            tempRange = [10, 20]
        } else if (month >= 6 && month <= 8) { // 夏季
            tempRange = [25, 35]
        } else if (month >= 9 && month <= 11) { // 秋季
            tempRange = [15, 25]
        } else { // 冬季
            tempRange = [0, 10]
        }

        // 使用城市名称和当前时间作为种子
        const seed = city.charCodeAt(0) + hour + month
        const tempSeed = Math.sin(seed) * 10000
        const conditionSeed = Math.sin(seed + 1) * 10000
        const humiditySeed = Math.sin(seed + 2) * 10000
        const windSeed = Math.sin(seed + 3) * 10000

        const conditions = ['晴天', '多云', '阴天', '小雨', '中雨']
        const windDirs = ['东北风', '东南风', '西南风', '西北风']

        const fallbackWeather = {
            temperature: Math.floor((tempSeed % 1) * (tempRange[1] - tempRange[0])) + tempRange[0],
            condition: conditions[Math.floor((conditionSeed % 1) * conditions.length)],
            humidity: Math.floor((humiditySeed % 1) * 40) + 40, // 40-80%
            windSpeed: Math.floor((windSeed % 1) * 20) + 5, // 5-25km/h
            windDir: windDirs[Math.floor((windSeed % 1) * windDirs.length)]
        }

        console.log('生成备用天气数据:', fallbackWeather)
        return fallbackWeather
    },



    // 清除天气缓存
    clearWeatherCache() {
        this.weatherCache = {
            data: null,
            timestamp: 0,
            city: ''
        }
        console.log('天气缓存已清除')
    },

    // 检查API密钥是否有效
    checkAPIKey() {
        const apiKey = '97abae6c60f04c23849c7018851a6b93'
        if (!apiKey || apiKey.length < 10) {
            return { valid: false, message: 'API密钥格式不正确' }
        }

        // 检查API密钥格式
        if (apiKey.length !== 32) {
            return { valid: false, message: 'API密钥长度不正确，应该是32位字符' }
        }

        // 检查是否包含非法字符
        if (!/^[a-zA-Z0-9]+$/.test(apiKey)) {
            return { valid: false, message: 'API密钥包含非法字符，只能包含字母和数字' }
        }

        return { valid: true, message: 'API密钥格式正确' }
    },

    // 诊断API密钥问题
    async diagnoseAPIKey() {
        const apiKey = '97abae6c60f04c23849c7018851a6b93'
        const baseUrl = 'https://devapi.qweather.com/v7'

        try {
            // 先测试网络连接
            console.log('测试网络连接...')
            let networkTest = { success: false, error: '未测试' }

            try {
                const networkResponse = await wx.request({
                    url: 'https://www.baidu.com',
                    method: 'GET',
                    timeout: 5000
                })
                networkTest = {
                    success: networkResponse.statusCode === 200,
                    statusCode: networkResponse.statusCode,
                    error: null
                }
            } catch (networkError) {
                networkTest = {
                    success: false,
                    error: networkError.message || networkError.errMsg || '网络连接失败'
                }
            }

            // 测试不同的API端点
            const endpoints = [
                '/weather/now?location=101010100',
                '/weather/3d?location=101010100',
                '/air/now?location=101010100'
            ]

            const results = []

            for (const endpoint of endpoints) {
                try {
                    console.log(`测试端点: ${endpoint}`)
                    const response = await wx.request({
                        url: `${baseUrl}${endpoint}&key=${apiKey}`,
                        method: 'GET',
                        timeout: 5000
                    })

                    console.log(`端点 ${endpoint} 响应:`, response)

                    results.push({
                        endpoint: endpoint,
                        statusCode: response.statusCode || 'undefined',
                        success: response.statusCode === 200,
                        data: response.data,
                        error: null
                    })
                } catch (error) {
                    console.error(`端点 ${endpoint} 错误:`, error)
                    results.push({
                        endpoint: endpoint,
                        statusCode: 'ERROR',
                        success: false,
                        error: error.message || error.errMsg || '未知错误',
                        data: null
                    })
                }
            }

            return {
                apiKey: apiKey,
                keyLength: apiKey.length,
                keyFormat: /^[a-zA-Z0-9]+$/.test(apiKey) ? '正确' : '错误',
                networkTest: networkTest,
                testResults: results
            }
        } catch (error) {
            return {
                error: error.message,
                apiKey: apiKey,
                keyLength: apiKey.length
            }
        }
    },

    // 检查域名配置
    checkDomainConfig() {
        const domains = [
            'https://devapi.qweather.com',
            'https://geoapi.qweather.com'
        ]
        return {
            domains: domains,
            message: '请确保在小程序管理后台的"开发管理-开发设置-服务器域名"中添加以下域名：\n' + domains.join('\n')
        }
    },

    // 测试天气API连接
    async testWeatherAPI(city = '北京') {
        try {
            console.log('测试天气API连接:', city)

            // 先检查API密钥
            const keyCheck = this.checkAPIKey()
            if (!keyCheck.valid) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_KEY',
                        message: keyCheck.message
                    }
                }
            }

            // 检查域名配置
            const domainCheck = this.checkDomainConfig()
            console.log('域名配置检查:', domainCheck)

            // 直接测试API调用
            const apiKey = '97abae6c60f04c23849c7018851a6b93'
            const baseUrl = 'https://devapi.qweather.com/v7'

            // 先测试一个简单的API调用
            const testResponse = await wx.request({
                url: `${baseUrl}/weather/now?location=101010100&key=${apiKey}&unit=m`,
                method: 'GET',
                timeout: 10000 // 10秒超时
            })

            console.log('API测试响应:', testResponse)

            if (testResponse.statusCode === 200 && testResponse.data && testResponse.data.code === '200') {
                console.log('API测试成功')
                return { success: true, data: testResponse.data }
            } else if (testResponse.statusCode === 403) {
                console.log('API密钥可能无效或已过期')
                return {
                    success: false,
                    error: {
                        code: '403',
                        message: 'API密钥可能无效或已过期，请检查密钥配置。\n\n可能的解决方案：\n1. 检查API密钥是否正确\n2. 确认API密钥已激活\n3. 检查API密钥的权限范围\n4. 确认API密钥未过期\n5. 检查API调用次数是否超限'
                    }
                }
            } else if (testResponse.statusCode === 404) {
                console.log('API接口不存在')
                return {
                    success: false,
                    error: {
                        code: '404',
                        message: 'API接口不存在'
                    }
                }
            } else {
                console.log('API测试失败:', testResponse.statusCode, testResponse.data)
                return {
                    success: false,
                    error: testResponse.data || {
                        code: testResponse.statusCode,
                        message: '未知错误'
                    }
                }
            }
        } catch (error) {
            console.error('API测试失败:', error)
            let errorMessage = '网络连接失败'
            if (error.errMsg) {
                if (error.errMsg.includes('timeout')) {
                    errorMessage = '请求超时，请检查网络连接'
                } else if (error.errMsg.includes('fail')) {
                    errorMessage = '网络请求失败'
                }
            }
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: errorMessage
                }
            }
        }
    },

    // 获取完整的天气信息
    async getCompleteWeatherInfo(latitude, longitude, forceRefresh = false) {
        try {
            // 如果需要强制刷新，清除缓存
            if (forceRefresh) {
                this.clearWeatherCache()
            }

            // 获取城市信息
            const cityInfo = await this.getCityByLocation(latitude, longitude)

            // 获取天气信息
            const weatherInfo = await this.getWeatherByCity(cityInfo.city)

            return {
                location: cityInfo,
                weather: weatherInfo
            }
        } catch (error) {
            console.error('获取完整天气信息失败:', error)
            throw error
        }
    }
}

module.exports = WeatherService

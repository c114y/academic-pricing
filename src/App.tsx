import { useState, useEffect } from 'react'

// 类型定义
type EducationLevel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
type MajorType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
type EmpiricalRequirement = 'A' | 'B' | 'C'

interface FormData {
  educationLevel: EducationLevel
  majorType: MajorType
  empiricalRequirement: EmpiricalRequirement
  wordCount: number
  plagiarismRate: number
  aiRate: number
}

const App = () => {
  // 表单状态
  const [formData, setFormData] = useState<FormData>({
    educationLevel: 'B',
    majorType: 'A',
    empiricalRequirement: 'A',
    wordCount: 8000,
    plagiarismRate: 20,
    aiRate: 20
  })

  // 计算结果
  const [price, setPrice] = useState<number | null>(null)
  const [showConsult, setShowConsult] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>('')

  // 学历选项
  const educationOptions = [
    { value: 'A' as EducationLevel, label: '专科' },
    { value: 'B' as EducationLevel, label: '本科（二本/普通院校）' },
    { value: 'C' as EducationLevel, label: '本科（一本院校）' },
    { value: 'D' as EducationLevel, label: '本科（985/211/双一流）' },
    { value: 'E' as EducationLevel, label: '函授/自考（需学位）' },
    { value: 'F' as EducationLevel, label: '函授/自考（不需学位）' },
    { value: 'G' as EducationLevel, label: '硕士及以上' },
  ]

  // 专业选项
  const majorOptions = [
    { value: 'A' as MajorType, label: '汉语言/法学/教育/社科' },
    { value: 'B' as MajorType, label: '经管/商科/财会（文商类）' },
    { value: 'C' as MajorType, label: '经济/金融/统计' },
    { value: 'D' as MajorType, label: '音乐/舞蹈/艺术' },
    { value: 'E' as MajorType, label: '计算机/软件/大数据' },
    { value: 'F' as MajorType, label: '护理类' },
    { value: 'G' as MajorType, label: '理工/医学/农学/其他' },
  ]

  // 实证要求选项
  const empiricalOptions = [
    { value: 'A' as EmpiricalRequirement, label: '纯文字/综述/案例/现状对策（无复杂数据）' },
    { value: 'B' as EmpiricalRequirement, label: '数据分析/实证分析（需SPSS/Stata等）' },
    { value: 'C' as EmpiricalRequirement, label: '系统开发/代码/建模仿真' },
  ]

  // 字数选项（以千字为单位）
  const wordCountOptions = Array.from({ length: 48 }, (_, i) => {
    const thousands = i + 3 // 从3千字开始
    return {
      value: thousands * 1000,
      label: `${thousands}千字`
    }
  })

  // 显示弹窗
  const showAlert = (message: string) => {
    setAlertMessage(message)
    setTimeout(() => setAlertMessage(''), 3000)
  }

  // 更新表单数据
  const updateForm = (field: keyof FormData, value: any) => {
    let newValue = value

    // 联动逻辑：学历限制
    if (field === 'educationLevel') {
      const restrictedEducation = ['A', 'E', 'F'] as EducationLevel[]
      if (restrictedEducation.includes(value as EducationLevel)) {
        newValue = { ...formData, [field]: value, empiricalRequirement: 'A' as EmpiricalRequirement }
        setFormData(newValue)
        return
      }
    }

    // 联动逻辑：专业限制 - 计算机必须选C
    if (field === 'majorType' && value === 'E') {
      setFormData({ ...formData, majorType: 'E', empiricalRequirement: 'C' })
      return
    }

    // 联动逻辑：实证要求 - 计算机专业必须选C
    if (field === 'empiricalRequirement') {
      // 计算机专业
      if (formData.majorType === 'E' && value !== 'C') {
        showAlert('计算机类默认仅提供系统开发/代码/建模仿真服务，特殊需求请咨询售前顾问')
        return
      }
      // 专科或函授必须选A
      const restrictedEducation = ['A', 'E', 'F'] as EducationLevel[]
      if (restrictedEducation.includes(formData.educationLevel) && value !== 'A') {
        showAlert('专科/函授默认仅提供非实证服务，特殊需求请咨询售前顾问')
        setFormData({ ...formData, empiricalRequirement: 'A' })
        return
      }
    }

    setFormData({ ...formData, [field]: value })
  }

  // 计算价格
  const calculatePrice = () => {
    const { educationLevel, majorType, empiricalRequirement, wordCount, plagiarismRate, aiRate } = formData

    // 逻辑1：人工客服拦截
    if (educationLevel === 'G') { // 硕士及以上
      setShowConsult(true)
      setPrice(null)
      return
    }
    if (majorType === 'G') { // 理工/农学/其他
      setShowConsult(true)
      setPrice(null)
      return
    }
    if (plagiarismRate < 15 || aiRate < 15) { // 查重率或AI率 < 15%
      setShowConsult(true)
      setPrice(null)
      return
    }

    // 通过拦截，计算价格
    let basePrice = 0

    // 逻辑2：确定基准价
    if (majorType === 'E' && empiricalRequirement === 'C') {
      // 组合4：计算机类
      basePrice = 2380
    } else if (majorType === 'F' && empiricalRequirement === 'B') {
      // 组合3：护理实证类
      basePrice = 1680
    } else if (empiricalRequirement === 'B' && ['A', 'B', 'C'].includes(majorType)) {
      // 组合2：实证类（专业 A/B/C + 实证 B）
      basePrice = 2180
    } else if (empiricalRequirement === 'A' && ['A', 'B', 'C', 'D', 'F'].includes(majorType)) {
      // 组合1：非实证类
      basePrice = 1280
    } else {
      // 默认情况
      basePrice = 1280
    }

    // 学历系数调整
    let educationAdjustment = 0
    switch (educationLevel) {
      case 'A': // 专科：减800
        educationAdjustment = -800
        break
      case 'C': // 一本：加100
        educationAdjustment = 100
        break
      case 'D': // 985/211：加300
        educationAdjustment = 300
        break
      case 'E': // 函授需学位：减500
        educationAdjustment = -500
        break
      case 'F': // 函授不需学位：减630
        educationAdjustment = -630
        break
      default: // B（二本）不加不减
        educationAdjustment = 0
    }

    let totalPrice = basePrice + educationAdjustment

    // 字数加价
    let wordCountAdjustment = 0
    if (majorType === 'E') {
      // 计算机专业：20000字以下不加价
      if (wordCount > 20000) {
        const extraWords = wordCount - 20000
        const extraThousands = Math.ceil(extraWords / 1000)
        wordCountAdjustment = extraThousands * 50
      }
    } else {
      // 其他专业：10000字以下不加价
      if (wordCount > 10000) {
        const extraWords = wordCount - 10000
        const extraThousands = Math.ceil(extraWords / 1000)
        wordCountAdjustment = extraThousands * 50
      }
    }

    totalPrice += wordCountAdjustment

    // 确保价格不小于0
    if (totalPrice < 0) totalPrice = 0

    setShowConsult(false)
    setPrice(totalPrice)
  }

  // 自动计算价格
  useEffect(() => {
    calculatePrice()
  }, [formData])

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* 背景纹理层 */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <img
          src="/bg-texture.png"
          alt="background texture"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>

      {/* 弹窗提示 */}
      {alertMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-sm border-l-4 border-amber-500 shadow-2xl rounded-xl px-6 py-4 max-w-md animate-slideDown">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium text-gray-800">{alertMessage}</p>
          </div>
        </div>
      )}

      {/* 顶部品牌栏 */}
      <header className="relative z-10 bg-gradient-to-r from-white via-white/90 to-white backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-center space-x-3">
            <img
              src="/logo.png"
              alt="未来变革学术"
              className="h-10 sm:h-12 w-auto"
            />
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">未来变革学术</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 tracking-wider font-medium">FUTURE CHANGE ACADEMIC</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-6xl">
        {/* 页面标题 */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">学术论文服务报价查询</h2>
          <p className="text-gray-600 text-base sm:text-lg">智能评估 · 精准报价 · 透明定价</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* 左侧表单区 */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {/* 1. 学历层次 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-5 sm:p-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-3">1</span>
                学历层次
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {educationOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${formData.educationLevel === option.value
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="educationLevel"
                      value={option.value}
                      checked={formData.educationLevel === option.value}
                      onChange={(e) => updateForm('educationLevel', e.target.value as EducationLevel)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 text-xs sm:text-sm font-medium text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. 专业类型 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-5 sm:p-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-3">2</span>
                专业类型
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {majorOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${formData.majorType === option.value
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="majorType"
                      value={option.value}
                      checked={formData.majorType === option.value}
                      onChange={(e) => updateForm('majorType', e.target.value as MajorType)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 text-xs sm:text-sm font-medium text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. 数据/实证要求 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-5 sm:p-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-3">3</span>
                数据/实证要求
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {empiricalOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${formData.empiricalRequirement === option.value
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="empiricalRequirement"
                      value={option.value}
                      checked={formData.empiricalRequirement === option.value}
                      onChange={(e) => updateForm('empiricalRequirement', e.target.value as EmpiricalRequirement)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 text-xs sm:text-sm font-medium text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. 详细要求 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-5 sm:p-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-3">4</span>
                详细要求
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                {/* 计划字数 */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">计划字数</label>
                  <select
                    value={formData.wordCount}
                    onChange={(e) => updateForm('wordCount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white cursor-pointer"
                  >
                    {wordCountOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] sm:text-xs text-gray-500">以千字为单位选择</span>
                </div>

                {/* 查重率要求 */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">查重率要求</label>
                  <input
                    type="number"
                    value={formData.plagiarismRate}
                    onChange={(e) => updateForm('plagiarismRate', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${formData.plagiarismRate < 15 ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'}`}
                    placeholder="20"
                  />
                  <span className="text-[10px] sm:text-xs text-gray-500">单位：%</span>
                </div>

                {/* AI率要求 */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">AI率要求</label>
                  <input
                    type="number"
                    value={formData.aiRate}
                    onChange={(e) => updateForm('aiRate', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${formData.aiRate < 15 ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'}`}
                    placeholder="20"
                  />
                  <span className="text-[10px] sm:text-xs text-gray-500">单位：%</span>
                </div>
              </div>
              {(formData.plagiarismRate < 15 || formData.aiRate < 15) && (
                <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <p className="text-xs sm:text-sm text-amber-700">⚠️ 查重率或AI率低于15%需咨询售前顾问</p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧价格展示区 */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-4 sm:space-y-6">
              {/* 学术插画 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <img
                  src="/academic-illustration.png"
                  alt="Academic Writing"
                  className="w-full h-32 sm:h-40 object-cover"
                />
              </div>

              {/* 价格卡片 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-5 sm:p-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">报价结果</h3>

                {showConsult ? (
                  <div className="text-center py-6 sm:py-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-amber-800 mb-2">请咨询售前顾问</div>
                    <p className="text-xs sm:text-sm text-amber-700 px-2">您的需求较为特殊，请联系客服获取详细报价</p>
                  </div>
                ) : price !== null ? (
                  <div className="text-center">
                    <div className="mb-4 sm:mb-6">
                      <span className="text-xs sm:text-sm text-gray-600 mb-2 block">预估价格</span>
                      <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                        ¥{price.toLocaleString()}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 sm:pt-4 space-y-2 text-left">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">学历层次</span>
                        <span className="text-gray-900 font-medium text-right">
                          {educationOptions.find(e => e.value === formData.educationLevel)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">专业类型</span>
                        <span className="text-gray-900 font-medium text-right">
                          {majorOptions.find(m => m.value === formData.majorType)?.label.split('/')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">字数</span>
                        <span className="text-gray-900 font-medium text-right">{Math.round(formData.wordCount / 1000)}千字</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* 联系提示 */}
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border border-teal-100 p-4 sm:p-5">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">需要帮助吗？</h4>
                    <p className="text-[10px] sm:text-xs text-gray-600">如需咨询或有特殊需求，请联系我们的售前顾问</p>
                  </div>
                </div>
              </div>

              {/* 底部提示 */}
              <div className="text-center text-[10px] sm:text-xs text-gray-500">
                <p>💡 实际价格以客服确认为准</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="relative z-10 bg-gradient-to-r from-white/90 via-white/95 to-white/90 backdrop-blur-md border-t border-gray-200/50 mt-12 sm:mt-16">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src="/logo.png"
                alt="未来变革学术"
                className="h-7 sm:h-8 w-auto"
              />
              <span className="text-gray-600 text-xs sm:text-sm">未来变革学术</span>
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs">© 2025 Future Change Academic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

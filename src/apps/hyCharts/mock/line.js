/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-21 10:01:04
 * @Description: 折线图mock
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-21 10:01:04
 */
export default {
  url: '/line',
  mock: {
    'code': 1,
    'msg': 'success',
    'result|5-10': [
      {
        'name': '@cname', // 中文名称
        'tongbi|1-100': 1, // 同比数据
        'huanbi|1-100': 1, // 环比数据
        'value|1-100': 1 // 数值
      }
    ]
  }
}

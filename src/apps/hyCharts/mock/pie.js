/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-17 21:46:46
 * @Description: 饼图mock数据
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-17 21:46:46
 */
export default {
  url: '/pie',
  mock: {
    'code': 1,
    'msg': 'success',
    'result|2-5': [
      {
        'name|+1': ['苹果', 'OPPO', '三星', '华为', '小米'],
        'value|10-100': 1,
        'child|2-5': [
          {
            'name': '@cname',
            'value|10-100': 1
          }
        ]
      }
    ]
  }
}

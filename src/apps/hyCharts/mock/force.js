/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-25 09:32:24
 * @Description: 力导向图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-25 09:32:24
 */
export default {
  url: '/force',
  mock: {
    'code': 1,
    'msg': 'success',
    'result': {
      'sourceNode|+1': ['13800138000', '12345610'],
      'edges|5-10': [
        {
          'source': '12345610',
          'target': '1234561'
        }, 
        {
          'source': '13800138000',
          'target': '1234562'
        },
        {
          'source': '12345610',
          'target': '1234563'
        },
        {
          'source': '13800138000',
          'target': '1234564'
        },
        {
          'source': '13800138000',
          'target': '1234565'
        },
        {
          'source': '12345610',
          'target': '1234566'
        },
        {
          'source': '1234561',
          'target': '1234567'
        },
        {
          'source': '13800138000',
          'target': '1234568'
        },
        {
          'source': '13800138000',
          'target': '1234569'
        },
        {
          'source': '13800138000',
          'target': '12345610'
        },
        {
          'source': '12345610',
          'target': '12345611'
        }
      ]
    }
  }
}

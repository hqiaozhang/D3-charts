export default {
  url: '/bar',
  mock: {
    'code': 1,
    'msg': 'success',
    'result|5-10': [{
      'name': '@cname', // 中文名称
      'value|10-100000': 1 // 100以内随机整数
    }]
  }
}

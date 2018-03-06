export default {
  url: '/submap',
  mock: {
    'code': 1,
    'msg': 'success',
    'result|5-10': [{
      'name': '@cname', // 中文名称
      'value|1-100': 100, // 100以内随机整数
      'areaId|+1': ['500229750000', '500229860000',
        '500229760000', '500229670000', '500229650000'
      ]
    }]
  }
}

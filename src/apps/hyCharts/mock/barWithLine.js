const month = ['一月', '二月', '三月', '四月', '五月']

export default {
  'url': '/barWithLine',
  'mock': {
    'code': 1,
    'msg': 'success',
    'result': [
      {
        'name': '重庆市区',
        'type': 'bar',
        'data|5': [
          {
            'name|+1': month,
            'value|-50-100': -50
          }
        ]
      },
      {
        'name': '成都熊猫基地',
        'type': 'bar',
        'data|5': [
          {
            'name|+1': month,
            'value|-50-100': -50
          }
        ]
      },
      {
        'name': '四川省',
        'type': 'bar',
        'data|5': [
          {
            'name|+1': month,
            'value|-50-100': -50
          }
        ]
      },
      {
        'name': '北京',
        'type': 'line',
        'data|5': [
          {
            'name|+1': month,
            'value|-50-100': -50
          }
        ]
      }
    ]
  }
}

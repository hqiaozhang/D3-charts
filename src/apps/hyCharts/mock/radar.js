/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-30 13:50:00
 * @Description: 雷达图数据
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-30 13:50:00
 */

export default {
  url: '/radar',
  mock: {
    'code': 1,
    'msg': 'success',
    'result': [
      {
        'name': '前端基础',
        'value1': 100,
        'value2': 50
      },
      {
        'name': '前端框架',
        'value1': 100,
        'value2': 25
      },
      {
        'name': 'D3.js',
        'value1': 100,
        'value2': 65
      },
      {
        'name': 'Openlayer',
        'value1': 100,
        'value2': 30
      },
      {
        'name': 'Canvas',
        'value1': 100,
        'value2': 20
      },{
        'name': 'zrender',
        'value1': 100,
        'value2': 10
      },{
        'name': 'heatmap',
        'value1': 100,
        'value2': 10
      },{
        'name': 'three.js',
        'value1': 100,
        'value2': 10
      },{
        'name': 'SVG',
        'value1': 100,
        'value2': 65
      },{
        'name': '职业素养',
        'value1': 100,
        'value2': 60
      },
    ]
    // 'result|4-6': [
    //   {
    //     'name': '@province',
    //     'value1|10-100': 1,
    //     'value2|10-100': 1
    //   }
    // ]
  }
}

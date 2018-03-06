/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-08 15:43:59
 * @Description: 三根柱子数据
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-08 15:43:59
 */

const array = [
  [6145, 746, 103],
  [945, 646, 23],
  [4045, 446, 203],
  [5780, 1346, 187],
  [5849, 1208, 128],
  [2542, 1870, 798],
  [542, 270, 98],
  [1542, 470, 208],
  [1902, 1203, 456]
]
 
export default {
  url: '/polygonBar',
  mock: {
    'code': '0',
    'msg': 'success',
    'result|5-7': [
      {
        'name|+1':['09-01', '09-02', '09-03', '09-04', '09-05', '09-06', '09-07', '09-08'],
        'value': function(){
          var a = []
          for(let i = 0; i < 3;i++){
            let index = parseInt(Math.random() * array.length, 10)
            a = array[index]
          }
          return a                         
        }
      }
    ]
  }
}

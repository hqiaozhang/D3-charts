import Mock from 'mockjs'

const extent = [13034588.195446936, 4743787.187560575, 
  13060615.003578058, 4733162.440628944]

const Random = Mock.Random

function genGeo() {
  const geo = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
          name: 'EPSG:4326'
      }
    },
    features: []
  }
  const features = geo.features
  let count = Random.integer(2, 5)
  while(count--) {
    features.push({
      type: 'Feature',
      properties: Mock.mock({
        'portrait': '@image("40x59")',
        'name': '@cname',
        'gender': Math.random() > 0.5 ? '男' : '女',
        'nation': '@cword(2)族',
        'age|20-50': 1,
        'time': '@date("yyyy-MM-dd HH:mm")',
        'location': '@county(true)',
        'reason': '@csentence',
        'type': '@cword(2, 3)'
      }),
      geometry:{
        type: 'Point',
        coordinates: [
          Random.float(extent[0], extent[2]),
          Random.float(extent[1], extent[3])
        ]
      }
    })
  }
  return geo
}

export default {
  url: '/realHeader',
  mock: {
    code: 1,
    msg: 'success',
    result() {
      return genGeo()
    }
  }
}
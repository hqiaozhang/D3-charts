import Mock from 'mockjs'
const Random = Mock.Random

/**
 * 根据给定的经纬度范围和数量生成一组地理信息
 * 
 * @export function
 * @param {any} range 经纬度范围
 * @param {any} count 数量
 * @returns {object} 地理信息
 */
export function genGeoJSON(range, count) {
  let localCount = count
  const geo = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG: 4326'
      }
    },
    features: []
  }

  const features = geo.features
  while(localCount--) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          Random.float(range[0], range[2]),
          Random.float(range[1], range[3])
        ]
      },
      properties: {
        name: Random.cname(),
        type: [Random.pick(['涉恐', '涉毒'])],
        gender: Random.pick('男', '女'),
        age: Random.integer(30, 100),
        nation: Random.cword(2) + '族',
        nativePlace: Random.city(),
        idCard: Random.id(),
        portrait: Random.image('51x75')
      }
    })
  }
  return geo
}

const extent = [13034588.195446936, 4743787.187560575, 
  13060615.003578058, 4733162.440628944]
const geoJson = genGeoJSON(extent, Math.floor(Math.random() * 100))

export default {
  url: '/points',
  mock: {
    code: 1,
    msg: 'success',
    result: geoJson
  }
}
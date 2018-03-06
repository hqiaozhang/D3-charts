## ES6框架+node 使用方式

##### [官方配置项手册](http://echarts.baidu.com/option-gl.html#globe)

### 1. 安装echarts

```npm
npm install echarts --save
npm install echarts-gl --save
```
    
### 2. import

```javascript
import Earth from '@/charts/echarts-gl-globe/index'
```

### 3. DOM结构

```html
<div class='earth'></div>
```

### 4. 初始化（推荐写在构造函数内）

```javascript
const option = {
  backgroundColor: '', // 背景颜色
  width: 1920, // 可见区域的宽
  height: 1080, // 可见区域的高
  globe: { // 地球组件
    width: 1920, // 地球组件的宽
    height: 1080, // 地球组件的高
    baseTexture: baseTexture, // 基础贴图
    heightTexture: heightTexture, // 高度贴图
    displacementScale: 0.15, // 地球顶点位移的大小
    displacementQuality: 'ultra', // 地球顶点位移的质量
    shading: 'realistic', // 地球中三维图形的着色效果
    globeRadius: 60, // 地球半径
    environment: environment, // 地球的背景贴图
    light: { // 光照
      ambient: { // 全局的环境光设置
        intensity: 0.1 // 环境光的强度
      },
      main: { // 场景主光源的设置，在 globe 组件中就是太阳光
        intensity: 1.5
      }
    },
    layers: [ // 地球表面层的配置，使用该配置项加入云层，或者对 baseTexture 进行补充绘制出国家的轮廓等等
      {
        type: 'blend', // 层的类型
        blendTo: 'emission',
        texture: texture1 // 贴图路径
      },
      {
        type: 'overlay',
        texture: texture2,
        shading: 'lambert',
        distance: 5
      }
    ],
    viewControl: {
      center: [5, 0, 70], // 中心点坐标
      autoRotateSpeed: 10, // 自转速度，默认10，表现为36s/圈
      autoRotateDirection: 'ccw' // 自转方向（ccw自西向东，cw自东向西）
    }
  }
}

const earth = new Earth('.earth', option)
```

### 5. 渲染

```javascript
earth.render()
```

>
> 更多详细配置请参考
> [官方配置项手册](http://echarts.baidu.com/option-gl.html#globe)
>
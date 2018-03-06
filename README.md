## 组件添加说明
- 组件统一放在src/charts/目录下

- 在charts/index.js import 添加的组件，export 对外暴露


``` javascript
import SliderBar from './bar/sliderBar'
export {
  SliderBar
}
```

- 组件在首页展示：

  - 在根目录static/charts.json里面找到对应的组件类型(如果没有对应的类型，在static/leftNav.json增加一类型)添加该组件的名称，如：需添加一个柱状图

  ```josn
  {
          "typeName": "柱状图",
          "key": "bar",
          "child": [
              {
                  "name": "滑块柱状图",
                  "key": "sliderBar",
                  "imgUrl": "static/images/bar/sliderBar.png",
                  "author": "张红桥"
              }
   }
  ```

  >  注意：child 里面的 key值要与该组件的class名相同
  >
  >  如：sliderBar.js 组件
  >
  >  ``` javascript
  >  export default class SliderBar {
  >   constructor(selector, opt) {
  >      // ....
  >   }
  >   render() {
  >      // ...
  >   }
  >  } 
  >  ```

  ​

### 组件使用说明
- 拷贝src/charts/里面的需要的组件，在拷贝组件的同时要拷贝util文件夹及index.js，index.js里面的没有用到的组件要删除，否则找不到组件
- 调用组件

```javascript
import { SliderBar } from '@/charts/index'  // 引入组件
const sliderBar = new SliderBar('.sliderBar') // 组件实例化
sliderBar.render(data) // 组件调用（数据渲染）
```

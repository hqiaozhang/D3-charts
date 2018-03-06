#### 组件添加说明

##### 1.组件添加位置

- 组件统一放在src/charts/目录下

  > 每个组件新件一个文件夹放在对应的组件类型目录，如: src/charts/bar/sliderBar

- 在charts/index.js 文件引入新增的组件

  ```javascript
  import SliderBar from './bar/sliderBar'
  export {
    SliderBar
  }
  ```

##### 2.组件数据

- 默认数据结构

  ```json
  'result|5-10': [{
    'name': '@cname', // 中文名称
    'value|10-100000': 1 // 100以内随机整数
  }]
  ```

- 所有模拟数据放在src/hyCharts/mock

  > 新建mock数据后，在index.js定义的url配置 在static/charts.json的dataUrl字段 

  ```javascript
  import fetchBar from './bar'
  export default {
      fetchBar
  }
  ```

##### 3.组件配置文档

所有配置文档以markdown的格式编写放在static/document

##### 4.首页组件展示

- 根目录static/charts.json

  > 找到对应的组件类型(如果没有对应的类型，在static/leftNav.json增加一类型)添加该组件的名称

```json
 {
	"typeName": "柱状图",
	 "key": "bar",
	  "child": [
			{
                  "name": "滑块柱状图", // 图表名称
                  "key": "sliderBar",  // key值，与组件的Class同名
                  "imgUrl": "static/images/bar/sliderBar.png",  // 图片路径
                  "author": "张红桥"  // 开发者
                  "dataUrl": "fetchBar" // 数据url(默认为fetchBar) 
              }
   }
```

- child 里面的 key值要与该组件的class名相同

  ``` javascript
  export default class SliderBar {
    constructor(selector, opt) {
       // ....
    }
    render() {
       // ...
    }
   } 
  ```

##### 4.首页组件展示的图片

- 图片目录：static/images  

  >  /static/images/bar/sliderBar.png

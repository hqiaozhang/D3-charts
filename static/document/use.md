#### 组件使用说明

##### 组件拷贝

- 按需拷贝src/charts里面的组件
- 拷贝src/charts/util文件夹（该文件夹里面定义了一些共用方法）
- 拷贝src/charts/index.js文件，该文件是集合了所有组件的对外暴露主文件

##### html文件

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>柱状图</title>
</head>
<body>
 <!--创建一个DOM元素-->
<div class="sliderBar"></div>
</body>
</html>
```

##### css文件 样式为所有组件的X、Y轴轴线的公用样式

```css
/*轴线*/
.axis path,
.axis line {
  fill: none;
  stroke: none;
}
.axis text {
  font-size: 14px;
  stroke: none;
  fill: #8cffff;
}
/* 网格线 */
.grid-line path,
.grid-line line {
  fill: none;
  stroke: #285c81;
  opacity: 0.5;
}
.axis-x path,
.axis-y path {
  stroke: #285c81;
  shape-rendering: optimizeSpeed;
}
/*组件提示框*/
div.charts-tooltip {
  position: absolute;
  color: #fff;
  background: rgba(0, 22, 74, 0.6);
  border-radius: 5px;
  padding: 5px;
  line-height: 24px;
  border: 0;
}
```

##### js文件(接口调用)

```javascript
/*
* 1.引入柱状图组件
*/
import { SliderBar } from '@/charts/index'  

/*
* 2.实例化组件
* 传参：容器元素选择器(必要参数)、组件配置项(可省略，如省略则使用默认配置项)
*/
const sliderBar = new SliderBar('.sliderBar')  

/*
* 3.调用组件数据渲染方法
*/
let data = [] // data为发送请求获取图表数据
sliderBar.render(data) // 调用render方法
```

##### 图表效果

![](static/images/bar/sliderBar.png)

##### 不启动项目查找组件的方式

根目录: static/images/

根据图表类型进入到相应的文件夹，图表名称即charts目录下的组件名称


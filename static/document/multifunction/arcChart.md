
## 饼、环系多功能图配置表
暂支持圆环图、扇形图和圆环层叠图

```javascript
config = {
  /**
   * 图表主体配置
   */
  chartBody: {
    /**
     * 图表的宽（包含padding值）
     */
    width: 680,
    /**
     * 图表的高（包含padding值）
     */
    height: 400,
    /**
     * 图表的内边距
     */
    padding: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    }
  },
  /**
   * 坐标轴（这是一个预留属性）
   */
  axes: {
    /**
     * 是否显示坐标轴
     */
    isShow: false,
    /**
     * X轴配置
     */
    axisX: {
      isShow: false
    },
    /**
     * Y轴配置
     */
    axisY: {
      isShow: false
    }
  }
}
```
> 未完待续！！
> 因为这里字符多了编译通不过，所以要看详细的配置注释请移步 charts/nultifunction/arcChart/index.js

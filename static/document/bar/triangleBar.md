

```json
      width: 700, // svg的宽
      height: 300, // svg的高
      dur: 750, // 动画过渡时间
      itemStyle: { // 图形样式
        width: 15, // 三角底边长
        margin: { // 图形距离svg容器的边框
          top: 20, // 上边距
          right: 40, // 右边距
          bottom: 40, // 下边距
          left: 20 // 左边距
        },
        fill: '#008eff', // 填充色
        hover: { // hover事件样式
          fill: '#00ffa2' // 填充色
        }
      },
      tooltip: { //  提示框配置
        show: true // 是否显示提示框
      },
      topText: { // 顶部文字配置
        fontSize: 16, // 字体大小
        fill: '#fff', // 字体颜色
        textAnchor: 'middle' // 字体对齐方向
      },
      yAxis: { // y轴配置项
        show: false, // 是否显示y轴
        axisLine: { // 轴线配置
          show: true // 是否显示轴线
        },
        gridLine: { // 网格线配置 
          show: true // 是否显示网格线
        },
        ticks: 5 // 刻度  
      },
      xText: { // x轴文字配置
        fontSize: 16, // 字体大小
        fill: '#fff', // 字体颜色
        textAnchor: 'middle' // 字体对齐方向
      }
```


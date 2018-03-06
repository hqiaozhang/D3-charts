

```json
      width: 700, // svg的宽
      height: 300, // svg的高
      dur: 750, // 动画过渡时间
      tooltip: { // 提示框配置
        show: true // 是否显示提示框
      },
      itemStyle: { // 图形样式
        margin: { // 图形距离svg容器的边框
          top: 20, // 上边距
          right: 40, // 右边距
          bottom: 40, // 下边距
          left: 20 // 左边距
        },
        min: 1, // 图形填充最小值
        strokeWidth: 1, // 图形边框线宽
        stroke: 'none', // 边框色
        zoom: 14, // 决定了六边形的大小
        color: ['#846ffb', '#fce76e'], // 图形填充色(渐变色)
        rectBg: { // 背景矩形条配置
          fill: '#191e32' // 填充色
        }, 
        hover: { // hover事件配置
          color: ['#008efc', '#1f75ff'] // 图形填充色(渐变色)
        }
      },
      topText: { // 顶部文字配置
        fontSize: 16, // 字体大小
        fill: '#fff', // 字体颜色
        textAnchor: 'middle' // 字体对齐方向
      }
      yAxis: { // y轴配置项
        axisLine: { // 轴线配置
          show: true // 是否显示轴线
        },
        gridLine: { // 网格张配置
          show: true // 是滞显示网格线
        },
        ticks: 5 // 刻度  
      }, 
      xText: { // x轴文字配置
        fontSize: 16, // 字体大小
        fill: '#fff', // 字体颜色
        textAnchor: 'middle' // 字体对齐方向
      }
```


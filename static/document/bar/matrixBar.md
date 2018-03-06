

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
          right: 60, // 右边距
          bottom: 40, // 下边距
          left: 20 // 左边距
        },
        width: 3, // 小矩形宽
        spacing: 2, // 每个矩形的间距
        fillBg: ['#2c75e1', '#2c75e1'], //图形背景填充色(渐变填充)
        fill: ['#2c75e1', '#e953ff'], // 图形（数据）填充色（渐变填充）
        hover: { // hover事件配置
          fill: ['#feef00', '#88c6f6'] // 图形（数据）填充色(渐变填充)
        }
      },
      yAxis: { // y轴配置项
        show: false, // 是否显示y轴
        axisLine: { // 轴线配置
          show: false // 是否显示轴线
        },
        gridLine: { // 网格线配置 
          show: false // 是否显示网格线
        },
        pow: 0.5, //指数设置
        ticks: 5 // 刻度  
      },
      xText: { // x轴文字配置
        fontSize: 16, // 字体大小
        fill: '#fff', // 字体颜色
        textAnchor: 'middle' // 字体对齐方向
      },
      topText: { // 顶部文字配置
        fontSize: 16, // 字体大小
        fill: '#fff', // 字体颜色
        textAnchor: 'middle' // 字体对齐方向
      }
    }
```


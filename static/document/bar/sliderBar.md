


``` json
      width: 700, // svg宽度
      height: 300, // svg高度
      dur: 750, // 动画过渡时间
      itemStyle: { // 图形样式
        width: 8,  // 矩形宽度
        radius: 5,   // 矩形圆角半径
        bgColor: '#4d788a',  // 背景填充色
        color: ['#00d2ff', '#0048ff'], // 矩形（数据）填充色
        gradient: { // 渐变配置项
          x1: '0%', // 渐变X轴开始位置 
          y1: '0%', // 渐变Y轴开始位置
          x2: '0%', // 渐变X轴结束位置
          y2: '100%', // 渐变Y轴结束位置
          offset1: '20%', // 渐变色开始位置（<stop>标签使用）
          offset2: '100%', // 渐变色结束位置（<stop>标签使用）
          opacity1: 1, // 渐变色开始位置透明度
          opacity2: 0.2 // 渐变色结束位置透明度
        }, 
        topMark: {  // 矩形顶部的小滑块矩形配置
          width: 15,  // 宽度
          height: 8, // 高度
          fill: '#fff', //  填充色
          stroke: 'none' // 边框色
        }, // 图表离svg容器的的边距
        margin: { // 图形距离svg容器的边框
          top: 20, // 上边距
          right: 40, // 右边距
          bottom: 30, // 下边距
          left: 70 // 左边距
        },
        hover: { // hover事件的配置
          bgColor: '#4d6670', // 背景填充色
          color: ['#00fff6', '#59ffd6'] // 数据图形填充色
        }
      },
      tooltip: { // 图表提示框配置
        show: true // 是否显示提示框
      },
      isxAxis: true, // 是否显示x轴
      yAxis: { // y轴配置项
        show: true, // 是否显示y轴
        axisLine: { // 轴线配置项
          show: true // 是否显示轴线
        },
        gridLine: {  // 网格线配置项
          show: true // 是滞显示网格线
        },
        ticks: 5 // 刻度  
      },
      xText: { // x轴文字配置项
        fontSize: 16, // 字体大小
        fill: '#fff' // 字体颜色
      },
      topText: { // 顶部文字配置项
        fontSize: 16, // 字体大小
        fill: '#8cffff' // 字体颜色
      }
```


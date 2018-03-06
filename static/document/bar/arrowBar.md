

```json
      width: 700, // svg容器宽度
      height: 300, // svg容器高度
      dur: 750, // 动画过度时间
      tooltip: { // 提示框配置
        show: true // 是否显示提示框
      },
      itemStyle: { // 图形样式
        margin: { // 图形距离svg容器的边框
          top: 20, // 上边距
          right: 60, // 右边距
          bottom: 40, // 下边距
          left: 60 // 左边距
        },
        width: 8, // 图形的宽度
        radius: 5, // 背景图形的圆角半径
        bgFill: '#bdbfc5', //背景图形填充色
        color: ['#00d2ff', '#0048ff'], // 数据图形填充色（渐变填充）
        gradient: { // 渐变配置项
          x1: '0%', // 渐变X轴开始位置 
          y1: '0%', // 渐变Y轴开始位置
          x2: '0%', // 渐变X轴结束位置
          y2: '100%', // 渐变Y轴结束位置
          offset1: '20%', // 渐变色开始位置（<stop>标签使用）
          offset2: '100%', // 渐变色结束位置（<stop>标签使用）
          opacity1: 1, // 渐变色开始位置透明度
          opacity2: 1 // 渐变色结束位置透明度
        }, 
        hover: { // hover事件样式
          color: ['#03a9ff', '#4c11c4'] // 渐变填充色
        }
      }, 
      topMark: { // 顶部小三角样式
        fill: '#ebeef1' // 填充色
      },
      yAxis: { // y轴配置项
        axisLine: { // 轴线配置
          show: true // 是否显示轴线
        },
        gridLine: { // 网格张配置
          show: true // 是否显示网格线
        },
        pow: 0.5, // 指数设置(Y轴比例尺为指数比例尺)
        ticks: 5 // 刻度  
      }, 
      xText: { // X轴文字配置
        fontSize: 16, //字体大小
        fill: '#000', // 字体填充色
        textAnchor: 'middle' // 字体对齐方向
      },
      xItemStyle: { //X轴图形(小矩形)配置
        width: 50, // 矩形宽度
        height: 18, // 矩形高度
        fill: '#ebeef1' // 矩形填充色
      },
      topText: { // top文字配置项
        fontSize: 16, // 字体大小 
        fill: '#8cffff' // 字体样式
      }
```
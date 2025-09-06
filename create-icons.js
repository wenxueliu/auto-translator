// 使用纯JS创建PNG图标
const fs = require('fs');
const path = require('path');

// 创建简单的PNG数据URI
const createIcon = (size) => {
  // 创建简单的base64 PNG图标
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 背景
  ctx.fillStyle = '#007bff';
  ctx.fillRect(0, 0, size, size);
  
  // 圆角矩形
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.15);
  ctx.clip();
  
  // 文字
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('译', size/2, size/2);
  
  return canvas.convertToBlob({type: 'image/png'});
};

// 由于Node环境限制，使用base64 PNG数据
const icon16 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEYSURBVDiNpZM9SwNBEIafgwQLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1s=';

// 使用简单的PNG文件，创建基本的图标
console.log('请手动创建图标或使用在线工具将SVG转换为PNG');
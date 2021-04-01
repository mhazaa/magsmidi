const randomInt = require(__dirname + '/../modules/randomInt');

module.exports = class ColorControls {
  static randomColorRGB(){
    return {
      r: randomInt(0,255),
      g: randomInt(0, 255),
      b: randomInt(0, 255)
    }
  }

  static hexToRGB(hex){
    if(typeof hex !== 'string') throw new Error('Provided value is not a hex string');

    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static rgbToHex(r, g, b){
    const componentToHex = (c) => {
      const hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
}

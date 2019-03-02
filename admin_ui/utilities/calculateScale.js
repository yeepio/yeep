/**
 * Calculates the scale of an SVG icon (given the default width and height)
 * to allow correct resizing at any dimension
 * @param {number} width - the width we want to display the icon at
 * @param {number} height - the height we want to display the icon at
 * @param defaultWidth - the original / default width of the icon
 * @param defaultHeight - the original / default height of the icon
 * @returns {number} - the scale we can transform() the icon by to resize correctly
 */
function calculateScale({ width, height, defaultWidth, defaultHeight }) {
  if (width !== defaultWidth) {
    return width / defaultWidth;
  }

  if (height !== defaultHeight) {
    return height / defaultHeight;
  }

  return 1;
}

export default calculateScale;

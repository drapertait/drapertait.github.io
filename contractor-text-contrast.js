function setOppositeTextColor() {
    const style = window.getComputedStyle(document.body);
    const bgColor = style.backgroundColor.trim();
    // parse rgb/rgba or hex
    let r, g, b;
    if (bgColor.startsWith('#')) {
        const hex = bgColor.slice(1);
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.slice(0,2), 16);
            g = parseInt(hex.slice(2,4), 16);
            b = parseInt(hex.slice(4,6), 16);
        }
    } else {
        const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            r = parseInt(match[1], 10);
            g = parseInt(match[2], 10);
            b = parseInt(match[3], 10);
        }
    }
    if (r === undefined) return;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const textColor = brightness > 125 ? '#000000' : '#ffffff';
    document.body.style.color = textColor;
}

if (document.body.classList.contains('contractor-page')) {
    document.addEventListener('DOMContentLoaded', setOppositeTextColor);
}

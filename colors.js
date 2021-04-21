function normalizeColor(x) {
    if (x < 0)
        return 0;
    if (x > 255)
        return 255;
    return x;
}

function getColors(x, y) {
    var colors = {
        x0y0:[64, 64, 128], x1y0:[300, 16, 16],
        x0y1:[16, 300, 16], x1y1:[270, 270, 0]
    };
    var scale, delta1, delta2, result = [255, 255, 255];
    if (x > y)
    {
        scale = y;
    }
    else
    {
        scale = x;
    }
    x += scale;
    y += scale;
    for (var i = 0; i < 3; i++)
    {
        delta1 = x * (colors.x1y0[i] - colors.x0y0[i]) + colors.x0y0[i];
        delta2 = x * (colors.x1y1[i] - colors.x0y1[i]) + colors.x0y1[i];
        result[i] = normalizeColor(Math.floor(y * (delta2 - delta1) + delta1)); 
    }
    return "rgb(" + result[0] + ", " + result[1] + ", " + result[2] + ")";
}

function getColor(x) {
    var colors = [
        {x: 0.0, c:[192, 192, 255]},
        {x: 0.25, c:[0, 255, 255]},
        {x: 0.5, c:[255, 255, 0]},
        {x: 0.75, c:[255, 0, 0]},
        {x: 1.0, c:[0, 0, 0]}
    ];
    var delta, red = 255, green = 255, blue = 255;
    for (var i = 0; i < colors.length - 1; i++)
    {
        if (x >= colors[i].x && x <= colors[i + 1].x)
        {
            delta = (x - colors[i].x) / (colors[i + 1].x - colors[i].x);
            red = Math.floor(delta * (colors[i + 1].c[0] - colors[i].c[0]) + colors[i].c[0]);
            green = Math.floor(delta * (colors[i + 1].c[1] - colors[i].c[1]) + colors[i].c[1]);
            blue = Math.floor(delta * (colors[i + 1].c[2] - colors[i].c[2]) + colors[i].c[2]);
            break;
        }
    }
    return "rgb(" + red + ", " + green + ", " + blue + ")";
}

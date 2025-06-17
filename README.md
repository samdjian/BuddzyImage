# remove BG:

```bash
node --env-file=.env .\removebg.js
```

this will generate an `outputs/no_bg.png` file with a transparent background.

## Preparing an avatar:

```bash
node .\invoke_avatar.mjs
```

This will generate an `outputs/output-avatar.png` file with a transparent background, 1024x1024px, nicely positioned.

## Running the lambda function:

```bash
node .\invoke.mjs
```

This will invoke the lambda function locally and generate an `outputs/output-generic.png` file.



## Generators functionnalities

*   Generators should be able to be called with a single function call.
*   If no background is provided, the generator should use a white background.
*   Generators receive a JSON object as parameter, with the following properties:
    *   `imageWidth`: The width of the image to generate. (optional, default is 800)
    *   `imageHeight`: The height of the image to generate. (optional, default is 1422)
    *   `background`: The path to the background image. (optional, default is null)
    *   `elements`: An array of elements to include in the image. They can be images or text.
        *   `id`: The id of the element. Unique string.
        *   `x`: The x position of the element. Can be a number or null, meaning the element will be centered horizontally relative to the origin.
        *   `y`: The y position of the element. Can be a number or null, meaning the element will be centered vertically relative to the origin.
        *   `origin`: The origin of the element. Can be `center` or another element id. If null, the element will be positioned relative to the top left corner of the image.
        *   `width`: The width of the element. Can be a number or null, meaning the element will keep its aspect ratio relative to the height. One of width or height must be provided.
        *   `height`: The height of the element. Can be a number or null, meaning the element will keep its aspect ratio relative to the width. One of width or height must be provided.
        *   `rotation`: The rotation of the element. Can be a number or null, meaning the element will not be rotated.
        *   `type`: The type of element. Can be `image` or `text`.
            If type is `image`, the element will be an image and have the following properties:
            *   `src`: The path to the image file. Can be a relative path to the assets folder, an absolute path or a URL. Required.
            *   `mask`: Optional. Use `'circle'` to crop the image to a circular profile photo.
            *   `borderWidth`: Optional. Thickness of a border to draw around the image (in pixels).
            *   `borderColor`: Optional. Color of the border (defaults to black).
            *   `backgroundColor`: Optional. Fill color used if the image has transparency.
            If type is `text`, the element will be a text and have the following properties:
            *   `text`: The text to display.
            *   `fontFamily`: The font family of the text.
            *   `fontStyle`: The style of the font.
            *   `fontWeight`: The weight of the font.
            *   `fontSize`: The size of the font.
            *   `color`: The color of the text.
            *   `rotation`: The rotation of the text.
            *   `strokeColor`: Optional. Outline color of the text.
            *   `strokeWidth`: Optional. Outline width in pixels.
            *   `shadow`: Optional. Apply a shadow behind the text. It is an object with:
                *   `color`: Shadow color.
                *   `offsetX`: Horizontal offset relative to the text.
                *   `offsetY`: Vertical offset relative to the text.
                *   `blur`: Blur radius for the shadow.
            *   `curve`: Optional. Render the text along an arc. It should be an object `{ radius, startAngle, endAngle }` where angles are in degrees around the element's position (0° is to the right).
